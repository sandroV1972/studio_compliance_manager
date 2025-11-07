import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST - Crea nuovo personale
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
    }

    // Trova l'organizzazione dell'utente
    const orgUser = await prisma.organizationUser.findUnique({
      where: {
        userId: session.user.id,
      },
    });

    if (!orgUser) {
      return NextResponse.json(
        { error: "Devi prima creare un'organizzazione" },
        { status: 400 },
      );
    }

    const data = await request.json();

    // Valida che il codice fiscale sia presente
    if (!data.fiscalCode) {
      return NextResponse.json(
        { error: "Il codice fiscale è obbligatorio" },
        { status: 400 },
      );
    }

    // Normalizza il codice fiscale
    const normalizedFiscalCode = data.fiscalCode.toUpperCase().trim();

    // Verifica che il codice fiscale non esista già nell'organizzazione
    const existingPerson = await prisma.person.findFirst({
      where: {
        organizationId: orgUser.organizationId,
        fiscalCode: normalizedFiscalCode,
      },
    });

    if (existingPerson) {
      return NextResponse.json(
        {
          error: `Il codice fiscale è già associato a ${existingPerson.firstName} ${existingPerson.lastName}`,
        },
        { status: 400 },
      );
    }

    // Crea la persona e opzionalmente assegnala a una struttura
    const person = await prisma.person.create({
      data: {
        organizationId: orgUser.organizationId,
        firstName: data.firstName,
        lastName: data.lastName,
        fiscalCode: normalizedFiscalCode,
        email: data.email,
        phone: data.phone,
        hireDate: data.hireDate ? new Date(data.hireDate) : null,
        birthDate: data.birthDate ? new Date(data.birthDate) : null,
        notes: data.notes,
        active: data.active ?? true,
        // Se viene fornito un structureId, crea subito l'assegnazione
        ...(data.structureId && {
          structures: {
            create: {
              structureId: data.structureId,
              isPrimary: data.isPrimary ?? true,
              startDate: data.startDate ? new Date(data.startDate) : new Date(),
            },
          },
        }),
      },
      include: {
        structures: true,
      },
    });

    return NextResponse.json(person);
  } catch (error) {
    console.error("Errore creazione personale:", error);
    return NextResponse.json(
      { error: "Errore nella creazione del personale" },
      { status: 500 },
    );
  }
}

// GET - Lista tutto il personale dell'organizzazione
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
    }

    // Trova l'organizzazione dell'utente
    const orgUser = await prisma.organizationUser.findUnique({
      where: {
        userId: session.user.id,
      },
    });

    if (!orgUser) {
      return NextResponse.json([]);
    }

    const people = await prisma.person.findMany({
      where: {
        organizationId: orgUser.organizationId,
      },
      include: {
        structures: {
          include: {
            structure: {
              select: {
                id: true,
                name: true,
              },
            },
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
