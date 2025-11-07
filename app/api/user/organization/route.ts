import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
    }

    // Trova l'organizzazione dell'utente (1 user = 1 org)
    const orgUser = await prisma.organizationUser.findUnique({
      where: {
        userId: session.user.id,
      },
      include: {
        organization: {
          include: {
            structures: {
              where: {
                active: true,
              },
              include: {
                _count: {
                  select: {
                    personStructures: true,
                    deadlineInstances: true,
                  },
                },
              },
              orderBy: {
                name: "asc",
              },
            },
          },
        },
      },
    });

    if (!orgUser) {
      return NextResponse.json(null);
    }

    return NextResponse.json({
      id: orgUser.organization.id,
      name: orgUser.organization.name,
      structures: orgUser.organization.structures,
    });
  } catch (error) {
    console.error("Errore recupero organizzazione:", error);
    return NextResponse.json(
      { error: "Errore nel recupero dell'organizzazione" },
      { status: 500 },
    );
  }
}
