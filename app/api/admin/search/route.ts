import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.isSuperAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("q");

  if (!query || query.length < 2) {
    return NextResponse.json({ results: [] });
  }

  const searchQuery = query.toLowerCase();

  const [users, organizations, people, structures] = await Promise.all([
    prisma.user.findMany({
      where: {
        OR: [
          { email: { contains: searchQuery } },
          { name: { contains: searchQuery } },
        ],
      },
      take: 10,
      include: {
        organizationUsers: {
          include: {
            organization: true,
          },
        },
      },
    }),
    prisma.organization.findMany({
      where: {
        name: { contains: searchQuery },
      },
      take: 10,
      include: {
        _count: {
          select: {
            users: true,
            people: true,
            structures: true,
          },
        },
      },
    }),
    prisma.person.findMany({
      where: {
        OR: [
          { firstName: { contains: searchQuery } },
          { lastName: { contains: searchQuery } },
          { email: { contains: searchQuery } },
          { fiscalCode: { contains: searchQuery } },
        ],
      },
      take: 10,
      include: {
        organization: true,
      },
    }),
    prisma.structure.findMany({
      where: {
        OR: [
          { name: { contains: searchQuery } },
          { address: { contains: searchQuery } },
          { city: { contains: searchQuery } },
        ],
      },
      take: 10,
      include: {
        organization: true,
      },
    }),
  ]);

  const results = [
    ...users.map((user) => ({
      type: "user" as const,
      id: user.id,
      title: user.name || user.email,
      subtitle: `${user.email} • ${user.organizationUsers.length} organizzazioni`,
      link: `/admin/users/${user.id}`,
    })),
    ...organizations.map((org) => ({
      type: "organization" as const,
      id: org.id,
      title: org.name,
      subtitle: `${org._count.users} utenti • ${org._count.people} persone • ${org._count.structures} strutture`,
      link: `/admin/organizations/${org.id}`,
    })),
    ...people.map((person) => ({
      type: "person" as const,
      id: person.id,
      title: `${person.firstName} ${person.lastName}`,
      subtitle: `${person.organization.name} • CF: ${person.fiscalCode || "N/A"}`,
      link: `/admin/organizations/${person.organizationId}`,
    })),
    ...structures.map((structure) => ({
      type: "structure" as const,
      id: structure.id,
      title: structure.name,
      subtitle: `${structure.organization.name} • ${structure.city || "N/A"}`,
      link: `/admin/organizations/${structure.organizationId}`,
    })),
  ];

  return NextResponse.json({ results });
}
