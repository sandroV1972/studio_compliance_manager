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

    const organization = await prisma.organization.create({
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

    return NextResponse.json(organization);
  } catch (error) {
    console.error("Errore creazione organizzazione:", error);
    return NextResponse.json(
      { error: "Errore nella creazione dell'organizzazione" },
      { status: 500 }
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
        members: {
          some: {
            userId: session.user.id,
          },
        },
      },
      include: {
        members: {
          where: {
            userId: session.user.id,
          },
        },
      },
    });

    return NextResponse.json(organizations);
  } catch (error) {
    console.error("Errore recupero organizzazioni:", error);
    return NextResponse.json(
      { error: "Errore nel recupero delle organizzazioni" },
      { status: 500 }
    );
  }
}
