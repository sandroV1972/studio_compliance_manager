import { auth } from "@/lib/auth";
import { createApiLogger } from "@/lib/logger";
import {
  createSuccessResponse,
  createErrorResponse,
  ErrorCodes,
} from "@/lib/api/response-envelope";

/**
 * GET /api/user/me
 * Recupera informazioni utente corrente
 */
export async function GET() {
  const session = await auth();

  const logger = createApiLogger("GET", "/api/user/me", session?.user?.id);

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
      msg: "Fetching current user info",
      userId: session.user.id,
    });

    // ========== RESPONSE ==========
    return createSuccessResponse({
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
    });
  } catch (error) {
    logger.error({ msg: "Error fetching user info", error });
    return createErrorResponse(
      ErrorCodes.INTERNAL_ERROR,
      "Errore nel recupero delle informazioni utente",
      500,
    );
  }
}
