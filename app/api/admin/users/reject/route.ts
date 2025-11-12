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
 * POST /api/admin/users/reject
 * Rifiuta un utente in attesa
 */
export async function POST(request: Request) {
  const session = await auth();

  const logger = createApiLogger(
    "POST",
    "/api/admin/users/reject",
    session?.user?.id,
  );

  try {
    // ========== AUTENTICAZIONE ==========
    if (!session?.user?.id) {
      logger.warn({ msg: "Unauthorized reject attempt" });
      return createErrorResponse(
        ErrorCodes.UNAUTHORIZED,
        "Non autorizzato",
        401,
      );
    }

    logger.info({
      msg: "Rejecting user",
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
    const user = await userService.rejectUser({
      userId,
      adminUserId: session.user.id,
    });

    // ========== RESPONSE ==========
    logger.info({
      msg: "User rejected successfully",
      rejectedUserId: user.id,
      email: user.email,
    });

    return createSuccessResponse({
      message: "Utente rifiutato",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    return handleServiceError(error, logger);
  }
}
