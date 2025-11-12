import { auth } from "@/lib/auth";
import { withCSRFProtection } from "@/lib/csrf";
import { createApiLogger } from "@/lib/logger";
import { userService } from "@/lib/services/user-service";
import { handleServiceError } from "@/lib/api/handle-service-error";
import {
  createSuccessResponse,
  createErrorResponse,
  ErrorCodes,
} from "@/lib/api/response-envelope";

/**
 * PATCH /api/admin/users/[id]
 * Aggiorna un utente (admin)
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  const { id: userId } = await params;

  const logger = createApiLogger(
    "PATCH",
    `/api/admin/users/${userId}`,
    session?.user?.id,
  );

  try {
    // ========== AUTENTICAZIONE ==========
    if (!session?.user?.id) {
      logger.warn({ msg: "Unauthorized update attempt" });
      return createErrorResponse(
        ErrorCodes.UNAUTHORIZED,
        "Non autorizzato",
        401,
      );
    }

    logger.info({
      msg: "Updating user",
      userId: session.user.id,
      targetUserId: userId,
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
    const { name, email, isSuperAdmin } = body;

    // ========== BUSINESS LOGIC (delegata al service) ==========
    const user = await userService.updateUser({
      userId,
      adminUserId: session.user.id,
      data: {
        name,
        email,
        isSuperAdmin,
      },
    });

    // ========== RESPONSE ==========
    logger.info({
      msg: "User updated successfully",
      updatedUserId: user.id,
    });
    return createSuccessResponse(user);
  } catch (error) {
    return handleServiceError(error, logger);
  }
}

/**
 * DELETE /api/admin/users/[id]
 * Elimina un utente (admin)
 */
export const DELETE = withCSRFProtection(
  async (
    _request: Request,
    { params }: { params: Promise<{ id: string }> },
  ) => {
    const session = await auth();
    const { id: userId } = await params;

    const logger = createApiLogger(
      "DELETE",
      `/api/admin/users/${userId}`,
      session?.user?.id,
    );

    try {
      // ========== AUTENTICAZIONE ==========
      if (!session?.user?.id) {
        logger.warn({ msg: "Unauthorized delete attempt" });
        return createErrorResponse(
          ErrorCodes.UNAUTHORIZED,
          "Non autorizzato",
          401,
        );
      }

      logger.info({
        msg: "Deleting user",
        userId: session.user.id,
        targetUserId: userId,
      });

      // ========== AUTORIZZAZIONE ==========
      if (!session.user.isSuperAdmin) {
        logger.warn({
          msg: "Permission denied - Super Admin only",
          userId: session.user.id,
        });
        return createErrorResponse(
          ErrorCodes.FORBIDDEN,
          "Non autorizzato",
          403,
        );
      }

      // ========== BUSINESS LOGIC (delegata al service) ==========
      await userService.deleteUser({
        userId,
        adminUserId: session.user.id,
      });

      // ========== RESPONSE ==========
      logger.info({
        msg: "User deleted successfully",
        deletedUserId: userId,
      });
      return createSuccessResponse({ success: true });
    } catch (error) {
      return handleServiceError(error, logger);
    }
  },
);
