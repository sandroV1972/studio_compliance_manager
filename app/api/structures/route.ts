import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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

    const structure = await prisma.structure.create({
      data: {
        organizationId: orgUser.organizationId,
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
        active: true,
      },
    });

    return NextResponse.json(structure);
  } catch (error) {
    console.error("Errore creazione struttura:", error);
    return NextResponse.json(
      { error: "Errore nella creazione della struttura" },
      { status: 500 },
    );
  }
}
