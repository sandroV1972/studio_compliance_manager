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
 * GET /api/user/permissions
 * Recupera permessi dell'utente corrente
 */
export async function GET() {
  const session = await auth();

  const logger = createApiLogger(
    "GET",
    "/api/user/permissions",
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
      msg: "Fetching user permissions",
      userId: session.user.id,
    });

    // ========== BUSINESS LOGIC (delegata al service) ==========
    const permissions = await userService.getUserPermissions({
      userId: session.user.id,
    });

    // ========== RESPONSE ==========
    logger.info({
      msg: "User permissions retrieved successfully",
      role: permissions.role,
      isSuperAdmin: permissions.isSuperAdmin,
    });

    return createSuccessResponse(permissions);
  } catch (error) {
    return handleServiceError(error, logger);
  }
}
