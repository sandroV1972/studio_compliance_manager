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
 * GET /api/user/organization
 * Recupera organizzazione dell'utente
 */
export async function GET() {
  const session = await auth();

  const logger = createApiLogger(
    "GET",
    "/api/user/organization",
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
      msg: "Fetching user organization",
      userId: session.user.id,
    });

    // ========== BUSINESS LOGIC (delegata al service) ==========
    const orgUser = await userService.getUserOrganization({
      userId: session.user.id,
    });

    if (!orgUser) {
      logger.info({
        msg: "User has no organization",
        userId: session.user.id,
      });
      return createSuccessResponse(null);
    }

    // ========== RESPONSE ==========
    logger.info({
      msg: "User organization retrieved successfully",
      organizationId: orgUser.organization.id,
      structureCount: orgUser.organization.structures.length,
    });

    return createSuccessResponse({
      id: orgUser.organization.id,
      name: orgUser.organization.name,
      type: orgUser.organization.type,
      vatNumber: orgUser.organization.vatNumber,
      fiscalCode: orgUser.organization.fiscalCode,
      address: orgUser.organization.address,
      city: orgUser.organization.city,
      province: orgUser.organization.province,
      postalCode: orgUser.organization.postalCode,
      country: orgUser.organization.country,
      phone: orgUser.organization.phone,
      email: orgUser.organization.email,
      pec: orgUser.organization.pec,
      website: orgUser.organization.website,
      structures: orgUser.organization.structures,
    });
  } catch (error) {
    return handleServiceError(error, logger);
  }
}
