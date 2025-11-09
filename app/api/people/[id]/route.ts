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

    // Verifica che l'utente appartenga a un'organizzazione
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

    // Recupera la persona con tutte le relazioni
    const person = await prisma.person.findUnique({
      where: { id },
      include: {
        structures: {
          include: {
            structure: {
              select: {
                id: true,
                name: true,
                city: true,
              },
            },
          },
        },
        roleAssignments: {
          include: {
            roleTemplate: {
              select: {
                id: true,
                key: true,
                label: true,
              },
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

    // Verifica che la persona appartenga all'organizzazione dell'utente
    if (person.organizationId !== orgUser.organizationId) {
      return NextResponse.json(
        { error: "Non hai il permesso di visualizzare questa persona" },
        { status: 403 },
      );
    }

    return NextResponse.json(person);
  } catch (error) {
    console.error("Errore recupero persona:", error);
    return NextResponse.json(
      { error: "Errore nel recupero della persona" },
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

    // Verifica che l'utente appartenga a un'organizzazione
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

    // Verifica che la persona appartenga all'organizzazione dell'utente
    const existingPerson = await prisma.person.findUnique({
      where: { id },
    });

    if (!existingPerson) {
      return NextResponse.json(
        { error: "Persona non trovata" },
        { status: 404 },
      );
    }

    if (existingPerson.organizationId !== orgUser.organizationId) {
      return NextResponse.json(
        { error: "Non hai il permesso di modificare questa persona" },
        { status: 403 },
      );
    }

    // Aggiorna la persona
    const person = await prisma.person.update({
      where: { id },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        fiscalCode: data.fiscalCode || null,
        email: data.email || null,
        phone: data.phone || null,
        hireDate: data.hireDate ? new Date(data.hireDate) : null,
        birthDate: data.birthDate ? new Date(data.birthDate) : null,
        notes: data.notes || null,
        active: data.active ?? true,
      },
    });

    return NextResponse.json(person);
  } catch (error) {
    console.error("Errore aggiornamento persona:", error);
    return NextResponse.json(
      { error: "Errore nell'aggiornamento della persona" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
    }

    const { id } = await params;

    // Verifica che l'utente appartenga a un'organizzazione
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

    // Verifica che la persona appartenga all'organizzazione dell'utente
    const existingPerson = await prisma.person.findUnique({
      where: { id },
    });

    if (!existingPerson) {
      return NextResponse.json(
        { error: "Persona non trovata" },
        { status: 404 },
      );
    }

    if (existingPerson.organizationId !== orgUser.organizationId) {
      return NextResponse.json(
        { error: "Non hai il permesso di eliminare questa persona" },
        { status: 403 },
      );
    }

    // Elimina la persona (le relazioni verranno eliminate in cascata)
    await prisma.person.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Errore eliminazione persona:", error);
    return NextResponse.json(
      { error: "Errore nell'eliminazione della persona" },
      { status: 500 },
    );
  }
}
