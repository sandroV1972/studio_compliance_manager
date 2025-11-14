import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateFromTemplateSchema } from "@/lib/validation/deadline";
import { validateRequest } from "@/lib/validation/validate";

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

    // Log dei dati ricevuti per debug
    console.log(
      "[Generate from template] Body ricevuto:",
      JSON.stringify(body, null, 2),
    );

    // Validazione con Zod
    const validation = validateRequest(generateFromTemplateSchema, body);
    if (!validation.success || !validation.data) {
      console.error(
        "[Generate from template] Validazione fallita:",
        JSON.stringify(validation.errorDetails, null, 2),
      );
      return validation.error;
    }

    console.log(
      "[Generate from template] Validazione OK, dati:",
      validation.data,
    );

    const { templateId, targetType, targetId, startDate, recurrenceEndDate } =
      validation.data;

    // Carica il template
    const template = await prisma.deadlineTemplate.findUnique({
      where: { id: templateId },
    });

    if (!template) {
      return NextResponse.json(
        { error: "Template non trovato" },
        { status: 404 },
      );
    }

    // Verifica che il template appartenga all'organizzazione o sia globale
    if (
      template.ownerType === "ORG" &&
      template.organizationId !== organizationId
    ) {
      return NextResponse.json(
        { error: "Template non accessibile" },
        { status: 403 },
      );
    }

    const baseDate = new Date(startDate);
    const endDate = recurrenceEndDate ? new Date(recurrenceEndDate) : null;
    const createdDeadlines = [];

    // Genera un ID univoco per raggruppare tutte le scadenze di questa ricorrenza
    const recurrenceGroupId = `recur_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Logica ibrida: genera sempre le prossime 3 occorrenze (o meno se c'è un endDate vicino)
    const INITIAL_OCCURRENCES = 3;

    // Determina i target
    let targets: Array<{ type: "PERSON" | "STRUCTURE"; id: string }> = [];

    if (targetType === "PERSON" && targetId) {
      targets = [{ type: "PERSON", id: targetId }];
    } else if (targetType === "STRUCTURE" && targetId) {
      targets = [{ type: "STRUCTURE", id: targetId }];
    } else if (targetType === "ALL_PEOPLE") {
      const people = await prisma.person.findMany({
        where: { organizationId },
        select: { id: true },
      });
      targets = people.map((p) => ({ type: "PERSON" as const, id: p.id }));
    } else if (targetType === "ALL_STRUCTURES") {
      const structures = await prisma.structure.findMany({
        where: { organizationId },
        select: { id: true },
      });
      targets = structures.map((s) => ({
        type: "STRUCTURE" as const,
        id: s.id,
      }));
    }

    if (targets.length === 0) {
      return NextResponse.json(
        { error: "Nessun target trovato" },
        { status: 400 },
      );
    }

    // Funzione per calcolare la data di scadenza
    const calculateDueDate = (base: Date, iteration: number): Date => {
      const dueDate = new Date(base);

      // Applica l'offset iniziale
      const offsetDays = template.firstDueOffsetDays ?? 0;
      dueDate.setDate(dueDate.getDate() + offsetDays);

      // Applica la ricorrenza
      const recurrenceEvery = template.recurrenceEvery ?? 1;
      const totalUnits = recurrenceEvery * iteration;

      switch (template.recurrenceUnit) {
        case "DAY":
          dueDate.setDate(dueDate.getDate() + totalUnits);
          break;
        case "MONTH":
          dueDate.setMonth(dueDate.getMonth() + totalUnits);
          break;
        case "YEAR":
          dueDate.setFullYear(dueDate.getFullYear() + totalUnits);
          break;
      }

      return dueDate;
    };

    // Genera le scadenze per ogni target
    for (const target of targets) {
      let occurrencesToGenerate = INITIAL_OCCURRENCES;

      // Se c'è un endDate, calcola quante occorrenze rientrano nel limite
      if (endDate) {
        let count = 0;
        for (let i = 0; i < INITIAL_OCCURRENCES; i++) {
          const dueDate = calculateDueDate(baseDate, i);
          if (dueDate <= endDate) {
            count++;
          } else {
            break;
          }
        }
        occurrencesToGenerate = count;
      }

      for (let i = 0; i < occurrencesToGenerate; i++) {
        const dueDate = calculateDueDate(baseDate, i);

        const deadline = await prisma.deadlineInstance.create({
          data: {
            organizationId: organizationId,
            templateId: template.id,
            title: template.title,
            dueDate: dueDate,
            status: "PENDING",
            personId: target.type === "PERSON" ? target.id : null,
            structureId: target.type === "STRUCTURE" ? target.id : null,
            notes: template.description || null,
            isRecurring: true,
            recurrenceActive: true,
            recurrenceEndDate: endDate,
            recurrenceGroupId: recurrenceGroupId,
          },
          include: {
            person: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
            structure: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        });

        createdDeadlines.push(deadline);
      }
    }

    // Log audit
    await prisma.auditLog.create({
      data: {
        organizationId: organizationId,
        userId: session.user.id,
        action: "GENERATE_DEADLINES_FROM_TEMPLATE",
        entity: "DeadlineInstance",
        entityId: templateId,
        metadata: {
          templateId,
          targetType,
          targetId,
          count: createdDeadlines.length,
        },
      },
    });

    return NextResponse.json({
      success: true,
      count: createdDeadlines.length,
      deadlines: createdDeadlines,
    });
  } catch (error) {
    console.error("Errore generazione scadenze da template:", error);
    return NextResponse.json(
      { error: "Errore nella generazione delle scadenze" },
      { status: 500 },
    );
  }
}
