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
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();

    const template = await prisma.deadlineTemplate.update({
      where: { id },
      data: {
        scope: body.scope,
        complianceType: body.complianceType,
        title: body.title,
        description: body.description || null,
        recurrenceUnit: body.recurrenceUnit,
        recurrenceEvery: body.recurrenceEvery,
        firstDueOffsetDays: body.firstDueOffsetDays || 0,
        anchor: body.anchor,
        legalReference: body.legalReference || null,
        sourceUrl: body.sourceUrl || null,
        effectiveFrom: body.effectiveFrom || null,
        effectiveTo: body.effectiveTo || null,
        country: body.country || "IT",
        notes: body.notes || null,
        active: body.active ?? true,
      },
    });

    return NextResponse.json(template);
  } catch (error) {
    console.error("Error updating global template:", error);
    return NextResponse.json(
      { error: "Errore durante l'aggiornamento del template" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.isSuperAdmin) {
      return NextResponse.json(
        { error: "Non autorizzato" },
        { status: 401 }
      );
    }

    const { id } = await params;

    await prisma.deadlineTemplate.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting global template:", error);
    return NextResponse.json(
      { error: "Errore durante l'eliminazione del template" },
      { status: 500 }
    );
  }
}
