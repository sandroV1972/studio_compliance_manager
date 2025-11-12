import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCurrentUserWithRole } from "@/lib/auth-utils";
import { canCreateStructures } from "@/lib/permissions";
import { createApiLogger } from "@/lib/logger";
import { structureService } from "@/lib/services/structure-service";
import { handleServiceError } from "@/lib/api/handle-service-error";

/**
 * POST /api/structures
 * Crea una nuova struttura
 */
export async function POST(request: Request) {
  const session = await auth();

  const logger = createApiLogger("POST", "/api/structures", session?.user?.id);

  try {
    // ========== AUTENTICAZIONE ==========
    if (!session?.user?.id) {
      logger.warn({ msg: "Unauthorized create structure attempt" });
      return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
    }

    logger.info({
      msg: "Creating structure",
      userId: session.user.id,
    });

    // ========== AUTORIZZAZIONE ==========
    const userWithRole = await getCurrentUserWithRole();
    if (!userWithRole || !canCreateStructures(userWithRole)) {
      logger.warn({
        msg: "Permission denied to create structures",
        userId: session.user.id,
      });
      return NextResponse.json(
        { error: "Non hai i permessi per creare strutture" },
        { status: 403 },
      );
    }

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
        { error: "Devi prima creare un'organizzazione" },
        { status: 400 },
      );
    }

    // ========== PARSING INPUT ==========
    const body = await request.json();

    // ========== BUSINESS LOGIC (delegata al service) ==========
    const structure = await structureService.createStructure({
      organizationId: orgUser.organizationId,
      userId: session.user.id,
      data: body,
    });

    // ========== RESPONSE ==========
    logger.info({
      msg: "Structure created successfully",
      structureId: structure.id,
      organizationId: orgUser.organizationId,
    });
    return NextResponse.json(structure);
  } catch (error) {
    return handleServiceError(error, logger);
  }
}
