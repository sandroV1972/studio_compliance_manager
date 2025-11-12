import { auth } from "@/lib/auth";
import { createApiLogger } from "@/lib/logger";
import { userService } from "@/lib/services/user-service";
import { handleServiceError } from "@/lib/api/handle-service-error";
import {
  createSuccessResponse,
  createErrorResponse,
  ErrorCodes,
} from "@/lib/api/response-envelope";

/**
 * POST /api/admin/users/approve
 * Approva un utente in attesa
 */
export async function POST(request: Request) {
  const session = await auth();

  const logger = createApiLogger(
    "POST",
    "/api/admin/users/approve",
    session?.user?.id,
  );

  try {
    // ========== AUTENTICAZIONE ==========
    if (!session?.user?.id) {
      logger.warn({ msg: "Unauthorized approve attempt" });
      return createErrorResponse(
        ErrorCodes.UNAUTHORIZED,
        "Non autorizzato",
        401,
      );
    }

    logger.info({
      msg: "Approving user",
      userId: session.user.id,
    });

    // ========== AUTORIZZAZIONE ==========
    if (!session.user.isSuperAdmin) {
      logger.warn({
        msg: "Permission denied - Super Admin only",
        userId: session.user.id,
      });
      return createErrorResponse(ErrorCodes.FORBIDDEN, "Non autorizzato", 403);
    }

    // ========== PARSING INPUT ==========
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return createErrorResponse(
        ErrorCodes.MISSING_REQUIRED_FIELD,
        "ID utente mancante",
        400,
        { field: "userId" },
      );
    }

    // ========== BUSINESS LOGIC (delegata al service) ==========
    const user = await userService.approveUser({
      userId,
      adminUserId: session.user.id,
    });

    // ========== RESPONSE ==========
    logger.info({
      msg: "User approved successfully",
      approvedUserId: user.id,
      email: user.email,
      needsOnboarding: user.needsOnboarding,
    });

    return createSuccessResponse({
      message:
        "Utente approvato con successo. Dovrà creare un'organizzazione al primo accesso.",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        needsOnboarding: user.needsOnboarding,
      },
    });
  } catch (error) {
    return handleServiceError(error, logger);
  }
}
