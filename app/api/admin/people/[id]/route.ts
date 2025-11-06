import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.isSuperAdmin) {
      return NextResponse.json(
        { error: "Non autorizzato" },
        { status: 403 }
      );
    }

    const resolvedParams = await params;
    const body = await request.json();
    const { firstName, lastName, fiscalCode, email, phone, hireDate, birthDate, notes, active } = body;

    const person = await prisma.person.update({
      where: { id: resolvedParams.id },
      data: {
        firstName,
        lastName,
        fiscalCode,
        email,
        phone,
        hireDate: hireDate ? new Date(hireDate) : null,
        birthDate: birthDate ? new Date(birthDate) : null,
        notes,
        active,
      },
    });

    return NextResponse.json(person);
  } catch (error) {
    console.error("Error updating person:", error);
    return NextResponse.json(
      { error: "Errore durante l'aggiornamento della persona" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.isSuperAdmin) {
      return NextResponse.json(
        { error: "Non autorizzato" },
        { status: 403 }
      );
    }

    const resolvedParams = await params;

    await prisma.person.delete({
      where: { id: resolvedParams.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting person:", error);
    return NextResponse.json(
      { error: "Errore durante l'eliminazione della persona" },
      { status: 500 }
    );
  }
}
