import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getCurrentUserWithRole } from "@/lib/auth-utils";
import { hasAccessToOrganization } from "@/lib/permissions";
import { createApiLogger } from "@/lib/logger";
import { structureService } from "@/lib/services/structure-service";
import { handleServiceError } from "@/lib/api/handle-service-error";

/**
 * GET /api/organizations/[id]/structures
 * Recupera strutture di un'organizzazione
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: organizationId } = await params;
  const session = await auth();

  const logger = createApiLogger(
    "GET",
    `/api/organizations/${organizationId}/structures`,
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
      msg: "Fetching structures",
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

    // ========== BUSINESS LOGIC (delegata al service) ==========
    const structures = await structureService.getStructures({
      organizationId,
      userId: session.user.id,
      filters: {
        active: true,
      },
    });

    // ========== RESPONSE ==========
    logger.info({
      msg: "Structures retrieved successfully",
      count: structures.length,
    });
    return NextResponse.json({ structures });
  } catch (error) {
    return handleServiceError(error, logger);
  }
}
