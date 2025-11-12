import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { withCSRFProtection } from "@/lib/csrf";
import { createApiLogger } from "@/lib/logger";

// GET - Ottieni singolo template GLOBAL
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();

    if (!session?.user?.isSuperAdmin) {
      return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
    }

    const { id } = await params;

    const logger = createApiLogger(
      "GET",
      `/api/admin/global-templates/${id}`,
      session.user.id,
    );

    const template = await prisma.deadlineTemplate.findUnique({
      where: { id, ownerType: "GLOBAL" },
    });

    if (!template) {
      return NextResponse.json(
        { error: "Template non trovato" },
        { status: 404 },
      );
    }

    logger.info({
      msg: "Global template retrieved successfully",
      templateId: template.id,
    });
    return NextResponse.json({ template });
  } catch (error) {
    const logger = createApiLogger("GET", "/api/admin/global-templates/[id]");
    logger.error({
      msg: "Error loading global template",
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      { error: "Errore durante il caricamento del template" },
      { status: 500 },
    );
  }
}

// PATCH - Aggiorna template GLOBAL
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();

    if (!session?.user?.isSuperAdmin) {
      return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    const logger = createApiLogger(
      "PATCH",
      `/api/admin/global-templates/${id}`,
      session.user.id,
    );

    // Gestisci regions: può arrivare come stringa JSON o come array
    let regionsJson = null;
    if (body.regions) {
      if (typeof body.regions === "string") {
        // Già in formato JSON
        regionsJson = body.regions;
      } else if (Array.isArray(body.regions) && body.regions.length > 0) {
        // Array da convertire in JSON
        regionsJson = JSON.stringify(body.regions);
      }
    }

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

    logger.info({
      msg: "Global template updated successfully",
      templateId: template.id,
    });
    return NextResponse.json(template);
  } catch (error) {
    const logger = createApiLogger("PATCH", "/api/admin/global-templates/[id]");
    logger.error({
      msg: "Error updating global template",
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      { error: "Errore durante l'aggiornamento del template" },
      { status: 500 },
    );
  }
}

export const DELETE = withCSRFProtection(
  async (
    _request: Request,
    { params }: { params: Promise<{ id: string }> },
  ) => {
    try {
      const session = await auth();

      if (!session?.user?.isSuperAdmin) {
        return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
      }

      const { id } = await params;

      const logger = createApiLogger(
        "DELETE",
        `/api/admin/global-templates/${id}`,
        session.user.id,
      );

      await prisma.deadlineTemplate.delete({
        where: { id },
      });

      logger.info({
        msg: "Global template deleted successfully",
        templateId: id,
      });
      return NextResponse.json({ success: true });
    } catch (error) {
      const logger = createApiLogger(
        "DELETE",
        "/api/admin/global-templates/[id]",
      );
      logger.error({
        msg: "Error deleting global template",
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      return NextResponse.json(
        { error: "Errore durante l'eliminazione del template" },
        { status: 500 },
      );
    }
  },
);
