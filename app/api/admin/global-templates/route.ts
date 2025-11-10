import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET - Ottieni tutti i template GLOBAL (solo SuperAdmin)
export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.isSuperAdmin) {
      return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const includeArchived = searchParams.get("includeArchived") === "true";

    const templates = await prisma.deadlineTemplate.findMany({
      where: {
        ownerType: "GLOBAL",
        ...(includeArchived ? {} : { active: true }),
      },
      orderBy: [{ complianceType: "asc" }, { title: "asc" }],
    });

    return NextResponse.json({ templates });
  } catch (error) {
    console.error("Error loading global templates:", error);
    return NextResponse.json(
      { error: "Errore durante il caricamento dei template" },
      { status: 500 },
    );
  }
}

// POST - Crea nuovo template GLOBAL (solo SuperAdmin)
export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.isSuperAdmin) {
      return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
    }

    const body = await request.json();

    // Converti array di regioni in stringa JSON per il database
    const regionsJson =
      body.regions && Array.isArray(body.regions) && body.regions.length > 0
        ? JSON.stringify(body.regions)
        : null;

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
        requiredDocumentName: body.requiredDocumentName || null,
        legalReference: body.legalReference || null,
        sourceUrl: body.sourceUrl || null,
        effectiveFrom: body.effectiveFrom || null,
        effectiveTo: body.effectiveTo || null,
        country: body.country || "IT",
        regions: regionsJson,
        notes: body.notes || null,
        active: body.active ?? true,
      },
    });

    return NextResponse.json(template);
  } catch (error) {
    console.error("Error creating global template:", error);
    return NextResponse.json(
      { error: "Errore durante la creazione del template" },
      { status: 500 },
    );
  }
}
