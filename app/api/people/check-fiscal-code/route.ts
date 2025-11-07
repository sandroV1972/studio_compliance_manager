import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST - Verifica se un codice fiscale esiste già nell'organizzazione
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

    const { fiscalCode } = await request.json();

    if (!fiscalCode) {
      return NextResponse.json(
        { error: "Codice fiscale richiesto" },
        { status: 400 },
      );
    }

    // Normalizza il codice fiscale (maiuscolo e trim)
    const normalizedFiscalCode = fiscalCode.toUpperCase().trim();

    // Cerca una persona con lo stesso codice fiscale nella stessa organizzazione
    const existingPerson = await prisma.person.findFirst({
      where: {
        organizationId: orgUser.organizationId,
        fiscalCode: normalizedFiscalCode,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
      },
    });

    if (existingPerson) {
      return NextResponse.json(
        {
          exists: true,
          person: existingPerson,
          message: `Il codice fiscale è già associato a ${existingPerson.firstName} ${existingPerson.lastName}`,
        },
        { status: 200 },
      );
    }

    return NextResponse.json(
      {
        exists: false,
        message: "Codice fiscale disponibile",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Errore verifica codice fiscale:", error);
    return NextResponse.json(
      { error: "Errore nella verifica del codice fiscale" },
      { status: 500 },
    );
  }
}
