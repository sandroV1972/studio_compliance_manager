import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createDeadlineSchema } from "@/lib/validation/deadline";
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

    // Validazione con Zod
    const validation = validateRequest(createDeadlineSchema, body);
    if (!validation.success || !validation.data) {
      return validation.error;
    }

    const { title, dueDate, personId, structureId, notes, reminders } =
      validation.data;

    // Almeno uno tra personId e structureId deve essere specificato
    if (!personId && !structureId) {
      return NextResponse.json(
        { error: "Specifica almeno una persona o una struttura" },
        { status: 400 },
      );
    }

    // Se personId è specificato, verifica che appartenga all'organizzazione
    if (personId) {
      const person = await prisma.person.findFirst({
        where: {
          id: personId,
          organizationId: organizationId,
        },
      });

      if (!person) {
        return NextResponse.json(
          {
            error:
              "Persona non trovata o non appartiene a questa organizzazione",
          },
          { status: 404 },
        );
      }
    }

    // Se structureId è specificato, verifica che appartenga all'organizzazione
    if (structureId) {
      const structure = await prisma.structure.findFirst({
        where: {
          id: structureId,
          organizationId: organizationId,
        },
      });

      if (!structure) {
        return NextResponse.json(
          {
            error:
              "Struttura non trovata o non appartiene a questa organizzazione",
          },
          { status: 404 },
        );
      }
    }

    // Crea la deadline instance con i reminders
    const deadline = await prisma.deadlineInstance.create({
      data: {
        organizationId: organizationId,
        title: title.trim(),
        dueDate: new Date(dueDate),
        status: "PENDING",
        personId: personId || null,
        structureId: structureId || null,
        notes: notes?.trim() || null,
        // templateId è null per scadenze manuali
        // Crea i reminders se presenti
        reminders: {
          create:
            reminders?.map(
              (reminder: { daysBefore: number; message?: string }) => ({
                daysBefore: reminder.daysBefore,
                message: reminder.message?.trim() || null,
              }),
            ) || [],
        },
      },
      include: {
        person: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        structure: {
          select: {
            id: true,
            name: true,
          },
        },
        reminders: true,
      },
    });

    // Log audit
    await prisma.auditLog.create({
      data: {
        organizationId: organizationId,
        userId: session.user.id,
        action: "CREATE_DEADLINE",
        entity: "DeadlineInstance",
        entityId: deadline.id,
        metadata: {
          title: deadline.title,
          dueDate: deadline.dueDate,
          personId: deadline.personId,
          structureId: deadline.structureId,
        },
      },
    });

    return NextResponse.json({ deadline }, { status: 201 });
  } catch (error) {
    console.error("Errore creazione scadenza:", error);
    return NextResponse.json(
      { error: "Errore nella creazione della scadenza" },
      { status: 500 },
    );
  }
}

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
    const { searchParams } = new URL(request.url);
    const month = searchParams.get("month");
    const year = searchParams.get("year");
    const structureId = searchParams.get("structureId");
    const requiresDocument = searchParams.get("requiresDocument");
    const nextOccurrenceOnly = searchParams.get("nextOccurrenceOnly");

    // Verifica che l'utente abbia accesso a questa organizzazione
    const orgUser = await prisma.organizationUser.findFirst({
      where: {
        organizationId: id,
        userId: session.user.id,
      },
    });

    if (!orgUser && !session.user.isSuperAdmin) {
      return NextResponse.json({ error: "Accesso negato" }, { status: 403 });
    }

    // Costruisci i filtri per data se specificati
    let dateFilter = {};
    if (month && year) {
      const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
      const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59);
      dateFilter = {
        dueDate: {
          gte: startDate,
          lte: endDate,
        },
      };
    }

    // Filtro per struttura
    let structureFilter = {};
    if (structureId) {
      structureFilter = { structureId };
    }

    // Filtro per scadenze che richiedono documenti
    let documentFilter = {};
    if (requiresDocument === "true") {
      documentFilter = {
        template: {
          requiredDocumentName: {
            not: null,
          },
        },
      };
    }

    // Recupera le scadenze dell'organizzazione
    const deadlines = await prisma.deadlineInstance.findMany({
      where: {
        organizationId: id,
        ...dateFilter,
        ...structureFilter,
        ...documentFilter,
      },
      include: {
        person: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        structure: {
          select: {
            id: true,
            name: true,
          },
        },
        template: {
          select: {
            id: true,
            title: true,
            complianceType: true,
            requiredDocumentName: true,
          },
        },
        _count: {
          select: {
            documents: true,
          },
        },
      },
      orderBy: {
        dueDate: "asc",
      },
    });

    // Se richiesto, filtra per mostrare solo la prossima occorrenza di ogni gruppo ricorrente
    let filteredDeadlines = deadlines;
    if (nextOccurrenceOnly === "true") {
      const now = new Date();
      const seenGroups = new Set<string>();

      filteredDeadlines = deadlines.filter((deadline) => {
        // Se non è ricorrente o non ha un gruppo, la includiamo sempre
        if (!deadline.isRecurring || !deadline.recurrenceGroupId) {
          return true;
        }

        // Se abbiamo già visto questo gruppo, skippiamo
        if (seenGroups.has(deadline.recurrenceGroupId)) {
          return false;
        }

        // Questa è la prima occorrenza del gruppo (sono ordinate per dueDate asc)
        // La includiamo solo se è futura o in corso
        seenGroups.add(deadline.recurrenceGroupId);
        return true;
      });
    }

    // Calcola statistiche
    const now = new Date();
    const stats = {
      total: filteredDeadlines.length,
      pending: filteredDeadlines.filter((d) => d.status === "PENDING").length,
      overdue: filteredDeadlines.filter(
        (d) => d.status === "PENDING" && new Date(d.dueDate) < now,
      ).length,
      completed: filteredDeadlines.filter((d) => d.status === "DONE").length,
      upcoming: filteredDeadlines.filter(
        (d) =>
          d.status === "PENDING" &&
          new Date(d.dueDate) >= now &&
          new Date(d.dueDate) <=
            new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
      ).length,
    };

    return NextResponse.json({
      deadlines: filteredDeadlines,
      stats,
    });
  } catch (error) {
    console.error("Errore recupero scadenze:", error);
    return NextResponse.json(
      { error: "Errore nel recupero delle scadenze" },
      { status: 500 },
    );
  }
}
