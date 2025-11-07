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

    const structure = await prisma.structure.create({
      data: {
        organizationId: orgUser.organizationId,
        name: data.name,
        code: data.code,
        address: data.address,
        city: data.city,
        province: data.province,
        postalCode: data.postalCode,
        phone: data.phone,
        email: data.email,
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
