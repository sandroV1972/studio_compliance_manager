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

    const structure = await prisma.structure.findUnique({
      where: {
        id,
      },
      include: {
        _count: {
          select: {
            personStructures: true,
            deadlineInstances: true,
          },
        },
      },
    });

    if (!structure) {
      return NextResponse.json(
        { error: "Struttura non trovata" },
        { status: 404 },
      );
    }

    return NextResponse.json(structure);
  } catch (error) {
    console.error("Errore recupero struttura:", error);
    return NextResponse.json(
      { error: "Errore nel recupero della struttura" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
    }

    const { id } = await params;
    const data = await request.json();

    // Verifica che la struttura appartenga all'organizzazione dell'utente
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

    const existingStructure = await prisma.structure.findUnique({
      where: { id },
    });

    if (!existingStructure) {
      return NextResponse.json(
        { error: "Struttura non trovata" },
        { status: 404 },
      );
    }

    if (existingStructure.organizationId !== orgUser.organizationId) {
      return NextResponse.json(
        { error: "Non hai il permesso di modificare questa struttura" },
        { status: 403 },
      );
    }

    // Convert date strings from Italian format (dd/mm/yyyy) to ISO format
    const convertDateToISO = (dateStr: string): Date | null => {
      if (!dateStr) return null;
      const parts = dateStr.split("/");
      if (parts.length !== 3) return null;
      const [day, month, year] = parts;
      if (!day || !month || !year) return null;
      return new Date(
        `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`,
      );
    };

    const structure = await prisma.structure.update({
      where: { id },
      data: {
        name: data.name,
        code: data.code || null,
        address: data.address || null,
        city: data.city || null,
        province: data.province || null,
        postalCode: data.postalCode || null,
        phone: data.phone || null,
        email: data.email || null,
        pec: data.pec || null,
        website: data.website || null,
        vatNumber: data.vatNumber || null,
        fiscalCode: data.fiscalCode || null,
        responsiblePersonId: data.responsiblePersonId || null,
        legalRepName: data.legalRepName || null,
        licenseNumber: data.licenseNumber || null,
        licenseExpiry: data.licenseExpiry
          ? convertDateToISO(data.licenseExpiry)
          : null,
        insurancePolicy: data.insurancePolicy || null,
        insuranceExpiry: data.insuranceExpiry
          ? convertDateToISO(data.insuranceExpiry)
          : null,
        notes: data.notes || null,
      },
    });

    return NextResponse.json(structure);
  } catch (error) {
    console.error("Errore aggiornamento struttura:", error);
    return NextResponse.json(
      { error: "Errore nell'aggiornamento della struttura" },
      { status: 500 },
    );
  }
}
