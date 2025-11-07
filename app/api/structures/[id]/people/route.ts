import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - Lista personale assegnato alla struttura
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
    }

    const { id: structureId } = await params;

    // Trova tutte le persone assegnate a questa struttura
    const people = await prisma.person.findMany({
      where: {
        structures: {
          some: {
            structureId,
          },
        },
      },
      include: {
        structures: {
          where: {
            structureId,
          },
          select: {
            structureId: true,
            isPrimary: true,
            startDate: true,
            endDate: true,
          },
        },
      },
      orderBy: {
        lastName: "asc",
      },
    });

    return NextResponse.json(people);
  } catch (error) {
    console.error("Errore recupero personale:", error);
    return NextResponse.json(
      { error: "Errore nel recupero del personale" },
      { status: 500 },
    );
  }
}

// POST - Assegna personale esistente alla struttura
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
    }

    const { id: structureId } = await params;
    const data = await request.json();

    // Verifica che la persona esista e appartenga all'organizzazione corretta
    const person = await prisma.person.findUnique({
      where: { id: data.personId },
      include: {
        organization: {
          include: {
            structures: {
              where: { id: structureId },
            },
          },
        },
      },
    });

    if (!person) {
      return NextResponse.json(
        { error: "Persona non trovata" },
        { status: 404 },
      );
    }

    // Verifica che la struttura appartenga alla stessa organizzazione
    if (person.organization.structures.length === 0) {
      return NextResponse.json(
        {
          error: "La struttura non appartiene all'organizzazione della persona",
        },
        { status: 400 },
      );
    }

    // Crea l'assegnazione (o aggiorna se esiste già)
    const assignment = await prisma.personStructure.upsert({
      where: {
        personId_structureId: {
          personId: data.personId,
          structureId,
        },
      },
      update: {
        isPrimary: data.isPrimary ?? false,
        startDate: data.startDate ? new Date(data.startDate) : null,
      },
      create: {
        personId: data.personId,
        structureId,
        isPrimary: data.isPrimary ?? false,
        startDate: data.startDate ? new Date(data.startDate) : null,
      },
    });

    return NextResponse.json(assignment);
  } catch (error) {
    console.error("Errore assegnazione personale:", error);
    return NextResponse.json(
      { error: "Errore nell'assegnazione del personale" },
      { status: 500 },
    );
  }
}
