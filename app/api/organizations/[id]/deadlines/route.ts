import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  getPaginationParams,
  getPrismaSkipTake,
  getPrismaOrderBy,
  createPaginatedResponse,
} from "@/lib/pagination";
import { getCurrentUserWithRole } from "@/lib/auth-utils";
import {
  canCreateDeadlines,
  hasAccessToOrganization,
  hasAccessToStructure,
  isStructureManager,
  isOperator,
} from "@/lib/permissions";
import { deadlineService } from "@/lib/services/deadline-service";
import { handleServiceError } from "@/lib/api/handle-service-error";
import { createApiLogger } from "@/lib/logger";

/**
 * POST /api/organizations/[id]/deadlines
 * Crea una nuova deadline
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: organizationId } = await params;
  const logger = createApiLogger(
    "POST",
    `/api/organizations/${organizationId}/deadlines`,
  );

  try {
    // ========== AUTENTICAZIONE ==========
    const session = await auth();
    if (!session?.user?.id) {
      logger.warn({ msg: "Unauthorized create deadline attempt" });
      return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
    }

    logger.info({
      msg: "Creating deadline",
      userId: session.user.id,
      organizationId,
    });

    // ========== AUTORIZZAZIONE ==========
    const user = await getCurrentUserWithRole();
    if (!user) {
      return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
    }

    // Verifica accesso all'organizzazione
    if (!hasAccessToOrganization(user, organizationId)) {
      logger.warn({
        msg: "Access denied to organization",
        userId: session.user.id,
        organizationId,
      });
      return NextResponse.json({ error: "Accesso negato" }, { status: 403 });
    }

    // Verifica permesso di creazione scadenze
    if (!canCreateDeadlines(user)) {
      logger.warn({
        msg: "Permission denied to create deadlines",
        userId: session.user.id,
      });
      return NextResponse.json(
        {
          error:
            "Non hai i permessi per creare scadenze. Solo amministratori e responsabili possono creare scadenze.",
        },
        { status: 403 },
      );
    }

    // ========== PARSING INPUT ==========
    const body = await request.json();

    // ========== AUTHORIZATION: MANAGER/OPERATOR structure check ==========
    // Questo è un controllo di autorizzazione, non business logic, quindi resta nella route
    if (body.structureId && (isStructureManager(user) || isOperator(user))) {
      if (!hasAccessToStructure(user, body.structureId)) {
        logger.warn({
          msg: "Structure access denied for MANAGER/OPERATOR",
          userId: session.user.id,
          structureId: body.structureId,
        });
        return NextResponse.json(
          {
            error:
              "Non hai i permessi per creare scadenze in questa struttura. Puoi creare scadenze solo per la tua struttura assegnata.",
          },
          { status: 403 },
        );
      }
    }

    // ========== BUSINESS LOGIC (delegata al service) ==========
    const deadline = await deadlineService.createDeadline({
      organizationId,
      userId: session.user.id,
      data: body,
    });

    // ========== RESPONSE ==========
    logger.info({
      msg: "Deadline created successfully",
      deadlineId: deadline.id,
    });

    return NextResponse.json({ deadline }, { status: 201 });
  } catch (error) {
    // ========== ERROR HANDLING ==========
    return handleServiceError(error, logger);
  }
}

/**
 * GET /api/organizations/[id]/deadlines
 * Ottiene lista di deadlines con filtri avanzati
 *
 * NOTA: Questo endpoint ha logica complessa per filtri speciali (calendario, documenti, ricorrenze)
 * che al momento non è nel service. Per ora mantiene la logica inline.
 * TODO: Espandere deadlineService.getDeadlines() per supportare questi filtri
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: organizationId } = await params;
  const session = await auth();

  const logger = createApiLogger(
    "GET",
    `/api/organizations/${organizationId}/deadlines`,
    session?.user?.id,
    organizationId,
  );

  try {
    // ========== AUTENTICAZIONE ==========
    if (!session?.user?.id) {
      logger.warn({ msg: "Unauthorized list deadlines attempt" });
      return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
    }

    logger.info({
      msg: "Fetching deadlines list",
      userId: session.user.id,
      organizationId,
    });

    // ========== AUTORIZZAZIONE ==========
    const user = await getCurrentUserWithRole();
    if (!user) {
      return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
    }

    if (!hasAccessToOrganization(user, organizationId)) {
      logger.warn({
        msg: "Access denied to organization",
        userId: session.user.id,
        organizationId,
      });
      return NextResponse.json({ error: "Accesso negato" }, { status: 403 });
    }

    // ========== PARSING QUERY PARAMS ==========
    const { searchParams } = new URL(request.url);
    const month = searchParams.get("month");
    const year = searchParams.get("year");
    const structureId = searchParams.get("structureId");
    const requiresDocument = searchParams.get("requiresDocument");
    const nextOccurrenceOnly = searchParams.get("nextOccurrenceOnly");

    const paginationParams = getPaginationParams(searchParams);
    const { skip, take } = getPrismaSkipTake(paginationParams);

    // ========== BUSINESS LOGIC (parzialmente custom per filtri avanzati) ==========

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

    // Filtro per struttura + MANAGER/OPERATOR access control
    let structureFilter = {};
    if (structureId) {
      structureFilter = { structureId };
    } else if (isStructureManager(user) || isOperator(user)) {
      // MANAGER/OPERATOR vedono solo scadenze della propria struttura
      if (user.organizationUser?.structureId) {
        structureFilter = { structureId: user.organizationUser.structureId };
      }
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

    // Build the where clause
    const whereClause = {
      organizationId,
      ...dateFilter,
      ...structureFilter,
      ...documentFilter,
    };

    // Get total count for pagination
    const totalCount = await prisma.deadlineInstance.count({
      where: whereClause,
    });

    // Get orderBy object (default to dueDate ascending)
    const orderBy = paginationParams.sort
      ? getPrismaOrderBy(paginationParams, "dueDate")
      : { dueDate: "asc" as const };

    // Recupera le scadenze dell'organizzazione with pagination
    const deadlines = await prisma.deadlineInstance.findMany({
      where: whereClause,
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
      orderBy,
      skip,
      take,
    });

    // Se richiesto, filtra per mostrare solo la prossima occorrenza di ogni gruppo ricorrente
    let filteredDeadlines = deadlines;
    if (nextOccurrenceOnly === "true") {
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
        seenGroups.add(deadline.recurrenceGroupId);
        return true;
      });
    }

    // Calcola statistiche (on filtered deadlines, not paginated)
    const now = new Date();
    const stats = {
      total: filteredDeadlines.length,
      pending: filteredDeadlines.filter((d) => d.status === "PENDING").length,
      overdue: filteredDeadlines.filter(
        (d) => d.status === "PENDING" && new Date(d.dueDate) < now,
      ).length,
      completed: filteredDeadlines.filter((d) => d.status === "COMPLETED")
        .length,
      upcoming: filteredDeadlines.filter(
        (d) =>
          d.status === "PENDING" &&
          new Date(d.dueDate) >= now &&
          new Date(d.dueDate) <=
            new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
      ).length,
    };

    // Create paginated response
    const paginatedResponse = createPaginatedResponse(
      filteredDeadlines,
      totalCount,
      paginationParams,
    );

    // ========== RESPONSE ==========
    logger.info({
      msg: "Deadlines list retrieved successfully",
      count: filteredDeadlines.length,
      total: totalCount,
    });

    return NextResponse.json({
      ...paginatedResponse,
      stats,
    });
  } catch (error) {
    return handleServiceError(error, logger);
  }
}
