import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCurrentUserWithRole } from "@/lib/auth-utils";
import { hasAccessToOrganization } from "@/lib/permissions";
import { createApiLogger } from "@/lib/logger";
import { structureService } from "@/lib/services/structure-service";
import { handleServiceError } from "@/lib/api/handle-service-error";

/**
 * GET /api/structures/[id]
 * Recupera una singola struttura
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: structureId } = await params;
  const session = await auth();

  const logger = createApiLogger(
    "GET",
    `/api/structures/${structureId}`,
    session?.user?.id,
  );

  try {
    // ========== AUTENTICAZIONE ==========
    if (!session?.user?.id) {
      logger.warn({ msg: "Unauthorized access attempt" });
      return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
    }

    logger.info({
      msg: "Fetching structure",
      userId: session.user.id,
      structureId,
    });

    // ========== AUTORIZZAZIONE ==========
    // Prima recuperiamo la struttura per verificare l'organizzazione
    const tempStructure = await prisma.structure.findUnique({
      where: { id: structureId },
      select: { organizationId: true },
    });

    if (!tempStructure) {
      logger.warn({
        msg: "Structure not found",
        structureId,
      });
      return NextResponse.json(
        { error: "Struttura non trovata" },
        { status: 404 },
      );
    }

    const user = await getCurrentUserWithRole();
    if (!user) {
      return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
    }

    if (!hasAccessToOrganization(user, tempStructure.organizationId)) {
      logger.warn({
        msg: "Access denied to organization",
        userId: session.user.id,
        organizationId: tempStructure.organizationId,
      });
      return NextResponse.json({ error: "Accesso negato" }, { status: 403 });
    }

    // ========== BUSINESS LOGIC (delegata al service) ==========
    const structure = await structureService.getStructure({
      structureId,
      organizationId: tempStructure.organizationId,
      userId: session.user.id,
      includeCount: true,
    });

    // ========== RESPONSE ==========
    logger.info({
      msg: "Structure retrieved successfully",
      structureId: structure.id,
    });
    return NextResponse.json(structure);
  } catch (error) {
    return handleServiceError(error, logger);
  }
}

/**
 * PATCH /api/structures/[id]
 * Aggiorna una struttura
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: structureId } = await params;
  const session = await auth();

  const logger = createApiLogger(
    "PATCH",
    `/api/structures/${structureId}`,
    session?.user?.id,
  );

  try {
    // ========== AUTENTICAZIONE ==========
    if (!session?.user?.id) {
      logger.warn({ msg: "Unauthorized update attempt" });
      return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
    }

    logger.info({
      msg: "Updating structure",
      userId: session.user.id,
      structureId,
    });

    // ========== AUTORIZZAZIONE ==========
    // Trova l'organizzazione dell'utente
    const orgUser = await prisma.organizationUser.findUnique({
      where: {
        userId: session.user.id,
      },
    });

    if (!orgUser) {
      logger.warn({
        msg: "User not associated with any organization",
        userId: session.user.id,
      });
      return NextResponse.json(
        { error: "Utente non associato a nessuna organizzazione" },
        { status: 403 },
      );
    }

    // Verifica che la struttura appartenga all'organizzazione dell'utente
    const existingStructure = await prisma.structure.findUnique({
      where: { id: structureId },
      select: { organizationId: true },
    });

    if (!existingStructure) {
      logger.warn({
        msg: "Structure not found",
        structureId,
      });
      return NextResponse.json(
        { error: "Struttura non trovata" },
        { status: 404 },
      );
    }

    if (existingStructure.organizationId !== orgUser.organizationId) {
      logger.warn({
        msg: "Permission denied to update structure",
        userId: session.user.id,
        structureId,
        userOrg: orgUser.organizationId,
        structureOrg: existingStructure.organizationId,
      });
      return NextResponse.json(
        { error: "Non hai il permesso di modificare questa struttura" },
        { status: 403 },
      );
    }

    // ========== PARSING INPUT ==========
    const body = await request.json();

    // ========== BUSINESS LOGIC (delegata al service) ==========
    const structure = await structureService.updateStructure({
      structureId,
      organizationId: orgUser.organizationId,
      userId: session.user.id,
      data: body,
    });

    // ========== RESPONSE ==========
    logger.info({
      msg: "Structure updated successfully",
      structureId: structure.id,
    });
    return NextResponse.json(structure);
  } catch (error) {
    return handleServiceError(error, logger);
  }
}
