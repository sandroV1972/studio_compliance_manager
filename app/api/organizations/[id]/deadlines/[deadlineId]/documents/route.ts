import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getCurrentUserWithRole } from "@/lib/auth-utils";
import {
  canViewDocuments,
  canUploadDocuments,
  hasAccessToOrganization,
} from "@/lib/permissions";
import { withCSRFProtection } from "@/lib/csrf";
import { createApiLogger } from "@/lib/logger";
import { documentService } from "@/lib/services/document-service";
import { deadlineService } from "@/lib/services/deadline-service";
import { handleServiceError } from "@/lib/api/handle-service-error";

/**
 * GET /api/organizations/[id]/deadlines/[deadlineId]/documents
 * Recupera i documenti di una deadline
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string; deadlineId: string }> },
) {
  const { id: organizationId, deadlineId } = await params;
  const session = await auth();

  const logger = createApiLogger(
    "GET",
    `/api/organizations/${organizationId}/deadlines/${deadlineId}/documents`,
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
      msg: "Fetching deadline documents",
      userId: session.user.id,
      deadlineId,
    });

    // ========== AUTORIZZAZIONE ==========
    const user = await getCurrentUserWithRole();
    if (!user) {
      logger.warn({ msg: "User not found", userId: session.user.id });
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

    // Verifica che la scadenza appartenga all'organizzazione e permission check
    const deadline = await deadlineService.getDeadline(
      deadlineId,
      organizationId,
    );

    if (!canViewDocuments(user, deadline.structureId)) {
      logger.warn({
        msg: "Permission denied to view documents",
        userId: session.user.id,
        structureId: deadline.structureId,
      });
      return NextResponse.json(
        {
          error:
            "Non hai i permessi per visualizzare i documenti di questa scadenza.",
        },
        { status: 403 },
      );
    }

    // ========== BUSINESS LOGIC (delegata al service) ==========
    const documents = await documentService.getDocuments({
      organizationId,
      ownerType: "DEADLINE",
      ownerId: deadlineId,
    });

    // ========== RESPONSE ==========
    logger.info({
      msg: "Documents retrieved successfully",
      count: documents.length,
    });
    return NextResponse.json({ documents });
  } catch (error) {
    return handleServiceError(error, logger);
  }
}

/**
 * POST /api/organizations/[id]/deadlines/[deadlineId]/documents
 * Upload di un documento per una deadline
 */
export const POST = withCSRFProtection(
  async (
    request: Request,
    { params }: { params: Promise<{ id: string; deadlineId: string }> },
  ) => {
    const { id: organizationId, deadlineId } = await params;
    const session = await auth();

    const logger = createApiLogger(
      "POST",
      `/api/organizations/${organizationId}/deadlines/${deadlineId}/documents`,
      session?.user?.id,
      organizationId,
    );

    try {
      // ========== AUTENTICAZIONE ==========
      if (!session?.user?.id) {
        logger.warn({ msg: "Unauthorized upload attempt" });
        return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
      }

      logger.info({
        msg: "Uploading document to deadline",
        userId: session.user.id,
        deadlineId,
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

      // Verifica che la scadenza appartenga all'organizzazione
      const deadline = await deadlineService.getDeadline(
        deadlineId,
        organizationId,
      );

      // Verifica permesso di caricamento documenti
      if (!canUploadDocuments(user, deadline.structureId)) {
        logger.warn({
          msg: "Permission denied to upload documents",
          userId: session.user.id,
          structureId: deadline.structureId,
        });
        return NextResponse.json(
          {
            error:
              "Non hai i permessi per caricare documenti in questa scadenza. Puoi caricare documenti solo nella tua struttura assegnata.",
          },
          { status: 403 },
        );
      }

      // ========== PARSING INPUT ==========
      const formData = await request.formData();
      const file = formData.get("file") as File;
      const templateId = (formData.get("templateId") as string | null) || null;
      const expiryDate = (formData.get("expiryDate") as string | null) || null;
      const notes = (formData.get("notes") as string | null) || null;

      if (!file) {
        return NextResponse.json(
          { error: "File è obbligatorio" },
          { status: 400 },
        );
      }

      // Converti File in Buffer
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // ========== BUSINESS LOGIC (delegata al service) ==========
      const document = await documentService.uploadDocument({
        organizationId,
        userId: session.user.id,
        ownerType: "DEADLINE",
        ownerId: deadlineId,
        deadlineId: deadlineId, // Campo esplicito per la relazione
        file: {
          name: file.name,
          type: file.type || null,
          size: file.size,
          buffer,
        },
        templateId,
        expiryDate,
        notes,
      });

      // ========== RESPONSE ==========
      logger.info({
        msg: "Document uploaded successfully",
        documentId: document.id,
        fileName: file.name,
        fileSize: file.size,
      });

      return NextResponse.json({ document });
    } catch (error) {
      return handleServiceError(error, logger);
    }
  },
);
