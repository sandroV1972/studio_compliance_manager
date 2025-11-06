import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.isSuperAdmin) {
      return NextResponse.json(
        { error: "Non autorizzato" },
        { status: 401 }
      );
    }

    const body = await request.json();

    const template = await prisma.deadlineTemplate.create({
      data: {
        ownerType: "GLOBAL",
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
    console.error("Error creating global template:", error);
    return NextResponse.json(
      { error: "Errore durante la creazione del template" },
      { status: 500 }
    );
  }
}
