import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
    }

    const data = await request.json();

    // Crea organizzazione e aggiorna utente in una transazione
    const organization = await prisma.$transaction(async (tx) => {
      // Crea l'organizzazione con l'utente come OWNER
      const org = await tx.organization.create({
        data: {
          name: data.name,
          address: data.address,
          city: data.city,
          province: data.province,
          postalCode: data.postalCode,
          country: data.country || "Italia",
          phone: data.phone,
          email: data.email,
          vatNumber: data.vatNumber,
          fiscalCode: data.fiscalCode,
          users: {
            create: {
              userId: session.user.id,
              role: "OWNER",
            },
          },
        },
      });

      // Aggiorna l'utente per completare l'onboarding
      await tx.user.update({
        where: { id: session.user.id },
        data: { needsOnboarding: false },
      });

      return org;
    });

    return NextResponse.json(organization);
  } catch (error) {
    console.error("Errore creazione organizzazione:", error);
    // Log dettagliato dell'errore
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    return NextResponse.json(
      {
        error: "Errore nella creazione dell'organizzazione",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
    }

    const organizations = await prisma.organization.findMany({
      where: {
        users: {
          some: {
            userId: session.user.id,
          },
        },
      },
      include: {
        users: {
          where: {
            userId: session.user.id,
          },
        },
        _count: {
          select: {
            people: true,
            structures: true,
            deadlineInstances: true,
          },
        },
      },
    });

    return NextResponse.json(organizations);
  } catch (error) {
    console.error("Errore recupero organizzazioni:", error);
    return NextResponse.json(
      { error: "Errore nel recupero delle organizzazioni" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
    }

    const data = await request.json();

    // Trova l'organizzazione dell'utente
    const orgUser = await prisma.organizationUser.findUnique({
      where: {
        userId: session.user.id,
      },
    });

    if (!orgUser) {
      return NextResponse.json(
        { error: "Utente non associato a nessuna organizzazione" },
        { status: 403 },
      );
    }

    // Solo OWNER e ADMIN possono modificare i dati dell'organizzazione
    if (orgUser.role !== "OWNER" && orgUser.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Non hai i permessi per modificare l'organizzazione" },
        { status: 403 },
      );
    }

    // Aggiorna l'organizzazione
    const organization = await prisma.organization.update({
      where: {
        id: orgUser.organizationId,
      },
      data: {
        name: data.name,
        vatNumber: data.vatNumber || null,
        fiscalCode: data.fiscalCode || null,
        address: data.address || null,
        city: data.city || null,
        province: data.province || null,
        postalCode: data.postalCode || null,
        country: data.country || "IT",
        phone: data.phone || null,
        email: data.email || null,
        pec: data.pec || null,
        website: data.website || null,
      },
    });

    return NextResponse.json(organization);
  } catch (error) {
    console.error("Errore aggiornamento organizzazione:", error);
    return NextResponse.json(
      { error: "Errore nell'aggiornamento dell'organizzazione" },
      { status: 500 },
    );
  }
}
