import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.isSuperAdmin) {
      return NextResponse.json(
        { error: "Non autorizzato" },
        { status: 403 }
      );
    }

    const organizations = await prisma.organization.findMany({
      select: {
        id: true,
        name: true,
        createdAt: true,
        _count: {
          select: {
            users: true,
            deadlineInstances: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    const formattedOrganizations = organizations.map((org) => ({
      id: org.id,
      name: org.name,
      usersCount: org._count.users,
      deadlinesCount: org._count.deadlineInstances,
      createdAt: org.createdAt.toISOString(),
    }));

    return NextResponse.json(formattedOrganizations);
  } catch (error) {
    console.error("Errore nel recupero delle organizzazioni:", error);
    return NextResponse.json(
      { error: "Errore nel recupero delle organizzazioni" },
      { status: 500 }
    );
  }
}
