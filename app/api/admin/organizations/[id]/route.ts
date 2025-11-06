import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;

  try {
    const session = await auth();

    if (!session?.user?.isSuperAdmin) {
      return NextResponse.json(
        { error: "Non autorizzato" },
        { status: 403 }
      );
    }

    const organization = await prisma.organization.findUnique({
      where: { id: params.id },
      include: {
        users: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true,
                createdAt: true,
              },
            },
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

    if (!organization) {
      return NextResponse.json(
        { error: "Organizzazione non trovata" },
        { status: 404 }
      );
    }

    return NextResponse.json(organization);
  } catch (error) {
    console.error("Errore nel recupero dell'organizzazione:", error);
    return NextResponse.json(
      { error: "Errore nel recupero dell'organizzazione" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;

  try {
    const session = await auth();

    if (!session?.user?.isSuperAdmin) {
      return NextResponse.json(
        { error: "Non autorizzato" },
        { status: 403 }
      );
    }

    const body = await request.json();

    const organization = await prisma.organization.update({
      where: { id: params.id },
      data: {
        name: body.name,
        type: body.type,
        vatNumber: body.vatNumber,
        fiscalCode: body.fiscalCode,
        address: body.address,
        city: body.city,
        province: body.province,
        postalCode: body.postalCode,
        country: body.country,
        phone: body.phone,
        email: body.email,
        pec: body.pec,
        website: body.website,
        timezone: body.timezone,
        notificationsEnabled: body.notificationsEnabled,
      },
      include: {
        users: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true,
                createdAt: true,
              },
            },
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

    return NextResponse.json(organization);
  } catch (error) {
    console.error("Errore nell'aggiornamento dell'organizzazione:", error);
    return NextResponse.json(
      { error: "Errore nell'aggiornamento dell'organizzazione" },
      { status: 500 }
    );
  }
}
