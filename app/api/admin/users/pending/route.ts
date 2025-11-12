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
 * GET /api/admin/users/pending
 * Recupera utenti in attesa di approvazione
 */
export async function GET() {
  const session = await auth();

  const logger = createApiLogger(
    "GET",
    "/api/admin/users/pending",
    session?.user?.id,
  );

  try {
    // ========== AUTENTICAZIONE ==========
    if (!session?.user?.id) {
      logger.warn({ msg: "Unauthorized access attempt" });
      return createErrorResponse(
        ErrorCodes.UNAUTHORIZED,
        "Non autorizzato",
        401,
      );
    }

    logger.info({
      msg: "Fetching pending users",
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

    // ========== BUSINESS LOGIC (delegata al service) ==========
    const users = await userService.getPendingUsers();

    // ========== RESPONSE ==========
    logger.info({
      msg: "Pending users retrieved successfully",
      count: users.length,
    });
    return createSuccessResponse(users);
  } catch (error) {
    return handleServiceError(error, logger);
  }
}
