import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCurrentUserWithRole } from "@/lib/auth-utils";
import {
  canViewTemplates,
  canManageOrgTemplates,
  hasAccessToOrganization,
} from "@/lib/permissions";
import { createApiLogger } from "@/lib/logger";
import { templateService } from "@/lib/services/template-service";
import { handleServiceError } from "@/lib/api/handle-service-error";

/**
 * GET /api/organizations/[id]/deadline-templates
 * Recupera template con filtro regionale
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: organizationId } = await params;
  const session = await auth();

  const logger = createApiLogger(
    "GET",
    `/api/organizations/${organizationId}/deadline-templates`,
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
      msg: "Fetching templates",
      userId: session.user.id,
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

    // ========== REGIONAL FILTERING LOGIC ==========
    // Ottieni le regioni delle strutture dell'organizzazione tramite provincia
    const structures = await prisma.structure.findMany({
      where: { organizationId, active: true },
      select: { province: true },
    });

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

    // ========== BUSINESS LOGIC (delegata al service) ==========
    const templates = await templateService.getTemplates({
      organizationId,
      userId: session.user.id,
      filters: {
        regions: userRegions,
      },
    });

    // ========== RESPONSE ==========
    logger.info({
      msg: "Templates retrieved successfully",
      count: templates.length,
    });
    return NextResponse.json({ templates });
  } catch (error) {
    return handleServiceError(error, logger);
  }
}

/**
 * POST /api/organizations/[id]/deadline-templates
 * Crea un nuovo template ORG
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: organizationId } = await params;
  const session = await auth();

  const logger = createApiLogger(
    "POST",
    `/api/organizations/${organizationId}/deadline-templates`,
    session?.user?.id,
    organizationId,
  );

  try {
    // ========== AUTENTICAZIONE ==========
    if (!session?.user?.id) {
      logger.warn({ msg: "Unauthorized create template attempt" });
      return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
    }

    logger.info({
      msg: "Creating template",
      userId: session.user.id,
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

    if (!canManageOrgTemplates(user)) {
      logger.warn({
        msg: "Permission denied to create templates",
        userId: session.user.id,
      });
      return NextResponse.json(
        {
          error:
            "Non hai i permessi per creare template. Solo gli amministratori possono creare template per l'organizzazione.",
        },
        { status: 403 },
      );
    }

    // ========== PARSING INPUT ==========
    const body = await request.json();

    // ========== BUSINESS LOGIC (delegata al service) ==========
    const template = await templateService.createTemplate({
      organizationId,
      userId: session.user.id,
      data: body,
    });

    // ========== RESPONSE ==========
    logger.info({
      msg: "Template created successfully",
      templateId: template.id,
    });
    return NextResponse.json({ template }, { status: 201 });
  } catch (error) {
    return handleServiceError(error, logger);
  }
}
