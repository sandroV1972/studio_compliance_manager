import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
    }

    const { id } = await params;

    // Verifica che l'utente abbia accesso a questa organizzazione
    const orgUser = await prisma.organizationUser.findFirst({
      where: {
        organizationId: id,
        userId: session.user.id,
      },
    });

    if (!orgUser && !session.user.isSuperAdmin) {
      return NextResponse.json({ error: "Accesso negato" }, { status: 403 });
    }

    // Recupera i dati dell'organizzazione con statistiche complete
    const organization = await prisma.organization.findUnique({
      where: { id },
      include: {
        users: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
          },
        },
        structures: {
          where: { active: true },
          select: {
            id: true,
            name: true,
            city: true,
            active: true,
          },
        },
        people: {
          where: { active: true },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            active: true,
          },
        },
        _count: {
          select: {
            structures: true,
            people: true,
            deadlineInstances: true,
          },
        },
      },
    });

    if (!organization) {
      return NextResponse.json(
        { error: "Organizzazione non trovata" },
        { status: 404 },
      );
    }

    return NextResponse.json(organization);
  } catch (error) {
    console.error("Errore recupero organizzazione:", error);
    return NextResponse.json(
      { error: "Errore nel recupero dell'organizzazione" },
      { status: 500 },
    );
  }
}
