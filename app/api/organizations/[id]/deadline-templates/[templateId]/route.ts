import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getCurrentUserWithRole } from "@/lib/auth-utils";
import {
  canViewTemplates,
  canManageOrgTemplates,
  canManageGlobalTemplates,
  hasAccessToOrganization,
} from "@/lib/permissions";
import { withCSRFProtection } from "@/lib/csrf";
import { createApiLogger } from "@/lib/logger";
import { templateService } from "@/lib/services/template-service";
import { handleServiceError } from "@/lib/api/handle-service-error";

/**
 * GET /api/organizations/[id]/deadline-templates/[templateId]
 * Recupera un singolo template
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string; templateId: string }> },
) {
  const { id: organizationId, templateId } = await params;
  const session = await auth();

  const logger = createApiLogger(
    "GET",
    `/api/organizations/${organizationId}/deadline-templates/${templateId}`,
    session?.user?.id,
    organizationId,
  );

  try {
    // ========== AUTENTICAZIONE ==========
    if (!session?.user?.id) {
      logger.warn({ msg: "Unauthorized access attempt" });
      return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
    }

    logger.info({
      msg: "Fetching template",
      userId: session.user.id,
      templateId,
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

    if (!canViewTemplates(user)) {
      logger.warn({
        msg: "Permission denied to view templates",
        userId: session.user.id,
      });
      return NextResponse.json(
        { error: "Non hai i permessi per visualizzare i template" },
        { status: 403 },
      );
    }

    // ========== BUSINESS LOGIC (delegata al service) ==========
    const template = await templateService.getTemplate(
      templateId,
      organizationId,
    );

    // ========== RESPONSE ==========
    logger.info({
      msg: "Template retrieved successfully",
      templateId: template.id,
      ownerType: template.ownerType,
    });
    return NextResponse.json({ template });
  } catch (error) {
    return handleServiceError(error, logger);
  }
}

/**
 * PATCH /api/organizations/[id]/deadline-templates/[templateId]
 * Aggiorna un template
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; templateId: string }> },
) {
  const { id: organizationId, templateId } = await params;
  const session = await auth();

  const logger = createApiLogger(
    "PATCH",
    `/api/organizations/${organizationId}/deadline-templates/${templateId}`,
    session?.user?.id,
    organizationId,
  );

  try {
    // ========== AUTENTICAZIONE ==========
    if (!session?.user?.id) {
      logger.warn({ msg: "Unauthorized update attempt" });
      return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
    }

    logger.info({
      msg: "Updating template",
      userId: session.user.id,
      templateId,
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
    // Prima verifica che il template esista per controllare i permessi
    const existingTemplate = await templateService.getTemplate(
      templateId,
      organizationId,
    );

    // Verifica permessi in base al tipo di template
    if (existingTemplate.ownerType === "GLOBAL") {
      if (!canManageGlobalTemplates(user)) {
        logger.warn({
          msg: "Permission denied to manage global templates",
          userId: session.user.id,
          templateId,
        });
        return NextResponse.json(
          {
            error:
              "Solo l'amministratore del sito può modificare i template globali. Per adempimenti personalizzati, crea una scadenza personalizzata.",
          },
          { status: 403 },
        );
      }
    } else if (existingTemplate.ownerType === "ORG") {
      if (!canManageOrgTemplates(user)) {
        logger.warn({
          msg: "Permission denied to manage org templates",
          userId: session.user.id,
          templateId,
        });
        return NextResponse.json(
          {
            error:
              "Non hai i permessi per modificare i template. Solo gli amministratori dell'organizzazione possono modificare i template.",
          },
          { status: 403 },
        );
      }
    }

    // ========== PARSING INPUT ==========
    const body = await request.json();

    // ========== BUSINESS LOGIC (delegata al service) ==========
    const updatedTemplate = await templateService.updateTemplate({
      templateId,
      organizationId,
      userId: session.user.id,
      data: body,
    });

    // ========== RESPONSE ==========
    logger.info({
      msg: "Template updated successfully",
      templateId,
      ownerType: existingTemplate.ownerType,
    });
    return NextResponse.json({ template: updatedTemplate });
  } catch (error) {
    return handleServiceError(error, logger);
  }
}

/**
 * DELETE /api/organizations/[id]/deadline-templates/[templateId]
 * Elimina un template (soft delete)
 */
export const DELETE = withCSRFProtection(
  async (
    _request: Request,
    { params }: { params: Promise<{ id: string; templateId: string }> },
  ) => {
    const { id: organizationId, templateId } = await params;
    const session = await auth();

    const logger = createApiLogger(
      "DELETE",
      `/api/organizations/${organizationId}/deadline-templates/${templateId}`,
      session?.user?.id,
      organizationId,
    );

    try {
      // ========== AUTENTICAZIONE ==========
      if (!session?.user?.id) {
        logger.warn({ msg: "Unauthorized delete attempt" });
        return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
      }

      logger.info({
        msg: "Deleting template",
        userId: session.user.id,
        templateId,
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
      // Prima verifica che il template esista per controllare i permessi
      const existingTemplate = await templateService.getTemplate(
        templateId,
        organizationId,
      );

      // Verifica permessi in base al tipo di template
      if (existingTemplate.ownerType === "GLOBAL") {
        if (!canManageGlobalTemplates(user)) {
          logger.warn({
            msg: "Permission denied to delete global templates",
            userId: session.user.id,
            templateId,
          });
          return NextResponse.json(
            {
              error:
                "Solo l'amministratore del sito può eliminare i template globali.",
            },
            { status: 403 },
          );
        }
      } else if (existingTemplate.ownerType === "ORG") {
        if (!canManageOrgTemplates(user)) {
          logger.warn({
            msg: "Permission denied to delete org templates",
            userId: session.user.id,
            templateId,
          });
          return NextResponse.json(
            {
              error:
                "Non hai i permessi per eliminare i template. Solo gli amministratori dell'organizzazione possono eliminare i template.",
            },
            { status: 403 },
          );
        }
      }

      // ========== BUSINESS LOGIC (delegata al service) ==========
      await templateService.deleteTemplate({
        templateId,
        organizationId,
        userId: session.user.id,
      });

      // ========== RESPONSE ==========
      logger.info({
        msg: "Template soft deleted successfully",
        templateId,
      });
      return NextResponse.json({ success: true });
    } catch (error) {
      return handleServiceError(error, logger);
    }
  },
);
