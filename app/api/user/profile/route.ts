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
 * PATCH /api/user/profile
 * Aggiorna profilo utente
 */
export async function PATCH(request: Request) {
  const session = await auth();

  const logger = createApiLogger(
    "PATCH",
    "/api/user/profile",
    session?.user?.id,
  );

  try {
    // ========== AUTENTICAZIONE ==========
    if (!session?.user?.id) {
      logger.warn({ msg: "Unauthorized profile update attempt" });
      return createErrorResponse(
        ErrorCodes.UNAUTHORIZED,
        "Non autorizzato",
        401,
      );
    }

    logger.info({
      msg: "Updating user profile",
      userId: session.user.id,
    });

    // ========== PARSING INPUT ==========
    const data = await request.json();

    // ========== BUSINESS LOGIC (delegata al service) ==========
    const updatedUser = await userService.updateUserProfile({
      userId: session.user.id,
      data: {
        name: data.name,
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      },
    });

    // ========== RESPONSE ==========
    logger.info({
      msg: "User profile updated successfully",
      userId: updatedUser.id,
      nameUpdated: data.name !== undefined,
      passwordUpdated: data.newPassword !== undefined,
    });

    return createSuccessResponse({
      id: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
      isSuperAdmin: updatedUser.isSuperAdmin,
    });
  } catch (error) {
    return handleServiceError(error, logger);
  }
}
