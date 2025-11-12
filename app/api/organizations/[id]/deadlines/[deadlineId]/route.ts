import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getCurrentUserWithRole } from "@/lib/auth-utils";
import {
  canEditDeadline,
  canUpdateDeadlineStatus,
  canDeleteDeadline,
  hasAccessToOrganization,
} from "@/lib/permissions";
import { withCSRFProtection } from "@/lib/csrf";
import { createApiLogger } from "@/lib/logger";
import { deadlineService } from "@/lib/services/deadline-service";
import { handleServiceError } from "@/lib/api/handle-service-error";

/**
 * GET /api/organizations/[id]/deadlines/[deadlineId]
 * Ottiene una deadline specifica
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string; deadlineId: string }> },
) {
  const { id: organizationId, deadlineId } = await params;
  const session = await auth();

  const logger = createApiLogger(
    "GET",
    `/api/organizations/${organizationId}/deadlines/${deadlineId}`,
    session?.user?.id,
    organizationId,
  );

  try {
    logger.info({ msg: "Starting deadline retrieval request" });

    // ========== AUTENTICAZIONE ==========
    if (!session?.user?.id) {
      logger.warn({ msg: "Unauthorized access attempt - no session" });
      return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
    }

    // ========== AUTORIZZAZIONE ==========
    const user = await getCurrentUserWithRole();
    if (!user) {
      return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
    }

    if (!hasAccessToOrganization(user, organizationId)) {
      logger.warn({
        msg: "Access denied - user not in organization",
        userId: session.user.id,
        organizationId,
      });
      return NextResponse.json({ error: "Accesso negato" }, { status: 403 });
    }

    // ========== BUSINESS LOGIC (delegata al service) ==========
    const deadline = await deadlineService.getDeadline(
      deadlineId,
      organizationId,
    );

    // ========== RESPONSE ==========
    logger.info({
      msg: "Deadline retrieved successfully",
      deadlineId: deadline.id,
    });
    return NextResponse.json({ deadline });
  } catch (error) {
    return handleServiceError(error, logger);
  }
}

/**
 * PATCH /api/organizations/[id]/deadlines/[deadlineId]
 * Aggiorna una deadline esistente
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; deadlineId: string }> },
) {
  const { id: organizationId, deadlineId } = await params;
  const session = await auth();

  const logger = createApiLogger(
    "PATCH",
    `/api/organizations/${organizationId}/deadlines/${deadlineId}`,
    session?.user?.id,
    organizationId,
  );

  try {
    // ========== AUTENTICAZIONE ==========
    if (!session?.user?.id) {
      logger.warn({ msg: "Unauthorized update deadline attempt" });
      return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
    }

    logger.info({
      msg: "Updating deadline",
      userId: session.user.id,
      deadlineId,
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

    // ========== PARSING INPUT ==========
    const body = await request.json();

    // ========== AUTHORIZATION: Permission check based on operation type ==========
    // Prima verifica che la deadline esista per controllare i permessi
    const existingDeadline = await deadlineService.getDeadline(
      deadlineId,
      organizationId,
    );

    const { status } = body;
    const isStatusUpdateOnly =
      status !== undefined && Object.keys(body).length === 1;

    // Controllo permessi in base al tipo di operazione
    if (isStatusUpdateOnly) {
      // Cambio status: anche OPERATOR può farlo nella propria struttura
      if (!canUpdateDeadlineStatus(user, existingDeadline.structureId)) {
        logger.warn({
          msg: "Permission denied to update deadline status",
          userId: session.user.id,
          deadlineId,
        });
        return NextResponse.json(
          {
            error:
              "Non hai i permessi per aggiornare lo stato di questa scadenza.",
          },
          { status: 403 },
        );
      }
    } else {
      // Modifica completa: solo ADMIN/MANAGER
      if (!canEditDeadline(user, existingDeadline.structureId)) {
        logger.warn({
          msg: "Permission denied to edit deadline",
          userId: session.user.id,
          deadlineId,
        });
        return NextResponse.json(
          {
            error:
              "Non hai i permessi per modificare questa scadenza. Solo amministratori e responsabili possono modificare le scadenze.",
          },
          { status: 403 },
        );
      }
    }

    // ========== BUSINESS LOGIC (delegata al service) ==========
    const updatedDeadline = await deadlineService.updateDeadline({
      deadlineId,
      organizationId,
      userId: session.user.id,
      data: body,
    });

    // ========== RESPONSE ==========
    logger.info({
      msg: "Deadline updated successfully",
      deadlineId,
      isStatusUpdateOnly,
    });
    return NextResponse.json({ deadline: updatedDeadline });
  } catch (error) {
    return handleServiceError(error, logger);
  }
}

/**
 * DELETE /api/organizations/[id]/deadlines/[deadlineId]
 * Elimina una deadline
 */
export const DELETE = withCSRFProtection(
  async (
    _request: Request,
    { params }: { params: Promise<{ id: string; deadlineId: string }> },
  ) => {
    const { id: organizationId, deadlineId } = await params;
    const session = await auth();

    const logger = createApiLogger(
      "DELETE",
      `/api/organizations/${organizationId}/deadlines/${deadlineId}`,
      session?.user?.id,
      organizationId,
    );

    try {
      // ========== AUTENTICAZIONE ==========
      if (!session?.user?.id) {
        logger.warn({ msg: "Unauthorized delete deadline attempt" });
        return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
      }

      logger.info({
        msg: "Deleting deadline",
        userId: session.user.id,
        deadlineId,
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

      // ========== AUTHORIZATION: Permission check ==========
      // Prima verifica che la deadline esista per controllare i permessi
      const existingDeadline = await deadlineService.getDeadline(
        deadlineId,
        organizationId,
      );

      if (!canDeleteDeadline(user, existingDeadline.structureId)) {
        logger.warn({
          msg: "Permission denied to delete deadline",
          userId: session.user.id,
          deadlineId,
        });
        return NextResponse.json(
          {
            error:
              "Non hai i permessi per eliminare questa scadenza. Solo amministratori e responsabili possono eliminare le scadenze.",
          },
          { status: 403 },
        );
      }

      // ========== BUSINESS LOGIC (delegata al service) ==========
      await deadlineService.deleteDeadline(
        deadlineId,
        organizationId,
        session.user.id,
      );

      // ========== RESPONSE ==========
      logger.info({
        msg: "Deadline deleted successfully",
        deadlineId,
      });
      return NextResponse.json({ success: true });
    } catch (error) {
      return handleServiceError(error, logger);
    }
  },
);
