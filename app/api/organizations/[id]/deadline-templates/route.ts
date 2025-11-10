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

    const { id: organizationId } = await params;

    // Verifica che l'utente abbia accesso a questa organizzazione
    const orgUser = await prisma.organizationUser.findFirst({
      where: {
        organizationId: organizationId,
        userId: session.user.id,
      },
    });

    if (!orgUser && !session.user.isSuperAdmin) {
      return NextResponse.json({ error: "Accesso negato" }, { status: 403 });
    }

    // Ottieni le regioni delle strutture dell'organizzazione tramite provincia
    const structures = await prisma.structure.findMany({
      where: { organizationId, active: true },
      select: { province: true },
    });

    // Estrai province uniche e trova le regioni corrispondenti
    const provinces = [
      ...new Set(structures.map((s) => s.province).filter(Boolean)),
    ] as string[];

    let userRegions: string[] = [];
    if (provinces.length > 0) {
      const regionMappings = await prisma.provinceRegionMapping.findMany({
        where: { provinceCode: { in: provinces } },
        select: { regionName: true },
      });
      userRegions = [...new Set(regionMappings.map((m) => m.regionName))];
    }

    // Recupera TUTTI i template GLOBAL e ORG
    const allTemplates = await prisma.deadlineTemplate.findMany({
      where: {
        OR: [
          // Template globali attivi
          { ownerType: "GLOBAL", active: true },
          // Template dell'organizzazione
          { ownerType: "ORG", organizationId: organizationId, active: true },
        ],
      },
      orderBy: [{ complianceType: "asc" }, { title: "asc" }],
    });

    // Filtra i template in base alle regioni (solo per GLOBAL)
    const templates = allTemplates.filter((template) => {
      // Template ORG: sempre inclusi
      if (template.ownerType === "ORG") {
        return true;
      }

      // Template GLOBAL senza regioni specifiche: validi per tutta Italia
      if (!template.regions) {
        return true;
      }

      // Template GLOBAL con regioni specifiche: verifica se almeno una regione corrisponde
      try {
        const templateRegions = JSON.parse(template.regions) as string[];
        if (!Array.isArray(templateRegions) || templateRegions.length === 0) {
          // Se regions è vuoto o non valido, consideriamolo nazionale
          return true;
        }
        // Verifica se c'è almeno una regione in comune
        return userRegions.some((userRegion) =>
          templateRegions.includes(userRegion),
        );
      } catch (error) {
        // Se il parsing fallisce, consideriamo il template nazionale
        console.warn(
          `Errore parsing regions per template ${template.id}:`,
          error,
        );
        return true;
      }
    });

    return NextResponse.json({ templates });
  } catch (error) {
    console.error("Errore recupero template:", error);
    return NextResponse.json(
      { error: "Errore nel recupero dei template" },
      { status: 500 },
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
    }

    const { id: organizationId } = await params;

    // Verifica che l'utente abbia accesso a questa organizzazione
    const orgUser = await prisma.organizationUser.findFirst({
      where: {
        organizationId: organizationId,
        userId: session.user.id,
      },
    });

    if (!orgUser && !session.user.isSuperAdmin) {
      return NextResponse.json({ error: "Accesso negato" }, { status: 403 });
    }

    const body = await request.json();
    const {
      title,
      complianceType,
      description,
      scope,
      recurrenceUnit,
      recurrenceEvery,
      firstDueOffsetDays,
      anchor,
      requiredDocumentName,
    } = body;

    // Validazione
    if (!title || !complianceType || !scope || !recurrenceUnit || !anchor) {
      return NextResponse.json(
        { error: "Campi obbligatori mancanti" },
        { status: 400 },
      );
    }

    // Crea il nuovo template
    const template = await prisma.deadlineTemplate.create({
      data: {
        title,
        complianceType,
        description: description || null,
        scope,
        ownerType: "ORG",
        organizationId,
        recurrenceUnit,
        recurrenceEvery: parseInt(recurrenceEvery) || 1,
        firstDueOffsetDays: parseInt(firstDueOffsetDays) || 0,
        anchor,
        requiredDocumentName: requiredDocumentName || null,
        active: true,
      },
    });

    return NextResponse.json({ template }, { status: 201 });
  } catch (error) {
    console.error("Errore creazione template:", error);
    return NextResponse.json(
      { error: "Errore nella creazione del template" },
      { status: 500 },
    );
  }
}
