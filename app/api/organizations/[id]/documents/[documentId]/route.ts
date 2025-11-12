import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getCurrentUserWithRole } from "@/lib/auth-utils";
import { hasAccessToOrganization } from "@/lib/permissions";
import { withCSRFProtection } from "@/lib/csrf";
import { createApiLogger } from "@/lib/logger";
import { documentService } from "@/lib/services/document-service";
import { handleServiceError } from "@/lib/api/handle-service-error";

/**
 * GET /api/organizations/[id]/documents/[documentId]
 * Download di un documento
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string; documentId: string }> },
) {
  const { id: organizationId, documentId } = await params;
  const session = await auth();

  const logger = createApiLogger(
    "GET",
    `/api/organizations/${organizationId}/documents/${documentId}`,
    session?.user?.id,
    organizationId,
  );

  try {
    // ========== AUTENTICAZIONE ==========
    if (!session?.user?.id) {
      logger.warn({ msg: "Unauthorized download attempt" });
      return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
    }

    logger.info({
      msg: "Downloading document",
      userId: session.user.id,
      documentId,
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
    const { buffer, fileName, fileType } =
      await documentService.downloadDocument({
        documentId,
        organizationId,
      });

    // ========== RESPONSE ==========
    logger.info({
      msg: "Document downloaded successfully",
      documentId,
      fileName,
    });

    return new NextResponse(buffer as any, {
      headers: {
        "Content-Type": fileType || "application/octet-stream",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    });
  } catch (error) {
    return handleServiceError(error, logger);
  }
}

/**
 * PATCH /api/organizations/[id]/documents/[documentId]
 * Aggiorna metadata di un documento
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; documentId: string }> },
) {
  const { id: organizationId, documentId } = await params;
  const session = await auth();

  const logger = createApiLogger(
    "PATCH",
    `/api/organizations/${organizationId}/documents/${documentId}`,
    session?.user?.id,
    organizationId,
  );

  try {
    // ========== AUTENTICAZIONE ==========
    if (!session?.user?.id) {
      logger.warn({ msg: "Unauthorized update attempt" });
      return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
    }

    logger.info({
      msg: "Updating document",
      userId: session.user.id,
      documentId,
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

    // ========== PARSING INPUT ==========
    const body = await request.json();

    // ========== BUSINESS LOGIC (delegata al service) ==========
    const updatedDocument = await documentService.updateDocument({
      documentId,
      organizationId,
      userId: session.user.id,
      data: body,
    });

    // ========== RESPONSE ==========
    logger.info({
      msg: "Document updated successfully",
      documentId,
    });

    return NextResponse.json({ document: updatedDocument });
  } catch (error) {
    return handleServiceError(error, logger);
  }
}

/**
 * DELETE /api/organizations/[id]/documents/[documentId]
 * Elimina un documento
 */
export const DELETE = withCSRFProtection(
  async (
    _request: Request,
    { params }: { params: Promise<{ id: string; documentId: string }> },
  ) => {
    const { id: organizationId, documentId } = await params;
    const session = await auth();

    const logger = createApiLogger(
      "DELETE",
      `/api/organizations/${organizationId}/documents/${documentId}`,
      session?.user?.id,
      organizationId,
    );

    try {
      // ========== AUTENTICAZIONE ==========
      if (!session?.user?.id) {
        logger.warn({ msg: "Unauthorized delete attempt" });
        return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
      }

      logger.info({
        msg: "Deleting document",
        userId: session.user.id,
        documentId,
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
      await documentService.deleteDocument({
        documentId,
        organizationId,
        userId: session.user.id,
      });

      // ========== RESPONSE ==========
      logger.info({
        msg: "Document deleted successfully",
        documentId,
      });

      return NextResponse.json({ success: true });
    } catch (error) {
      return handleServiceError(error, logger);
    }
  },
);
