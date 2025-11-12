/**
 * DocumentService
 *
 * Service per la gestione dei documenti
 * Gestisce upload, download, validazione e eliminazione documenti
 */

import type { PrismaClient } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { createLogger } from "@/lib/logger";
import {
  ValidationError,
  NotFoundError,
  BusinessLogicError,
} from "@/lib/errors";
import type {
  DocumentWithRelations,
  UploadDocumentInput,
  UpdateDocumentInput,
  GetDocumentsInput,
  DownloadDocumentInput,
  DownloadDocumentOutput,
  DeleteDocumentInput,
} from "@/lib/dto/document.dto";
import { writeFile, mkdir, unlink, readFile } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

export class DocumentService {
  private logger = createLogger({ context: "DocumentService" });

  constructor(private db: PrismaClient = prisma) {}

  /**
   * Upload di un nuovo documento
   */
  async uploadDocument(
    input: UploadDocumentInput,
  ): Promise<DocumentWithRelations> {
    this.logger.info({
      msg: "Uploading document",
      organizationId: input.organizationId,
      userId: input.userId,
      ownerType: input.ownerType,
      ownerId: input.ownerId,
    });

    // Validazione file
    if (!input.file || !input.file.buffer || input.file.buffer.length === 0) {
      throw new ValidationError("File è obbligatorio");
    }

    if (!input.file.name || input.file.name.trim().length === 0) {
      throw new ValidationError("Nome file è obbligatorio");
    }

    // Verifica template se fornito
    if (input.templateId) {
      await this.verifyDocumentTemplate(
        input.templateId,
        input.file.name,
        input.file.size,
      );
    }

    // Crea directory se non esiste
    const uploadDir = this.getUploadDirectory(
      input.organizationId,
      input.ownerType,
      input.ownerId,
    );

    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Genera nome file univoco
    const timestamp = Date.now();
    const sanitizedFileName = input.file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const fileName = `${timestamp}_${sanitizedFileName}`;
    const filePath = join(uploadDir, fileName);

    // Salva il file
    try {
      await writeFile(filePath, input.file.buffer);
    } catch (error) {
      this.logger.error({
        msg: "Failed to write file to disk",
        error: error instanceof Error ? error.message : String(error),
        filePath,
      });
      throw new BusinessLogicError("Impossibile salvare il file sul disco");
    }

    // Calcola se il documento è scaduto
    const isExpired = input.expiryDate
      ? new Date(input.expiryDate) < new Date()
      : false;

    // Salva nel database
    const document = await this.db.document.create({
      data: {
        organizationId: input.organizationId,
        templateId: input.templateId || null,
        ownerType: input.ownerType,
        ownerId: input.ownerId,
        deadlineId: input.deadlineId || null,
        fileName: input.file.name,
        fileType: input.file.type || null,
        fileSize: input.file.size,
        storagePath: filePath,
        uploadedById: input.userId,
        expiryDate: input.expiryDate ? new Date(input.expiryDate) : null,
        isExpired: isExpired,
        notes: input.notes?.trim() || null,
      },
      include: {
        documentTemplate: true,
        uploadedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Crea audit log
    await this.createAuditLog(
      input.organizationId,
      input.userId,
      "UPLOAD_DOCUMENT",
      document.id,
      {
        fileName: input.file.name,
        ownerType: input.ownerType,
        ownerId: input.ownerId,
        templateId: input.templateId,
      },
    );

    this.logger.info({
      msg: "Document uploaded successfully",
      documentId: document.id,
      fileName: input.file.name,
      fileSize: input.file.size,
    });

    return document;
  }

  /**
   * Recupera lista documenti
   */
  async getDocuments(
    input: GetDocumentsInput,
  ): Promise<DocumentWithRelations[]> {
    this.logger.debug({
      msg: "Fetching documents",
      organizationId: input.organizationId,
      ownerType: input.ownerType,
      ownerId: input.ownerId,
    });

    const documents = await this.db.document.findMany({
      where: {
        organizationId: input.organizationId,
        ownerType: input.ownerType,
        ownerId: input.ownerId,
      },
      include: {
        documentTemplate: true,
        uploadedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    this.logger.debug({
      msg: "Documents fetched successfully",
      count: documents.length,
    });

    return documents;
  }

  /**
   * Download di un documento
   */
  async downloadDocument(
    input: DownloadDocumentInput,
  ): Promise<DownloadDocumentOutput> {
    this.logger.info({
      msg: "Downloading document",
      documentId: input.documentId,
      organizationId: input.organizationId,
    });

    // Recupera il documento
    const document = await this.db.document.findFirst({
      where: {
        id: input.documentId,
        organizationId: input.organizationId,
      },
    });

    if (!document) {
      throw new NotFoundError("Documento non trovato", "Document");
    }

    // Leggi il file dal disco
    try {
      const buffer = await readFile(document.storagePath);

      this.logger.info({
        msg: "Document downloaded successfully",
        documentId: document.id,
        fileName: document.fileName,
      });

      return {
        buffer,
        fileName: document.fileName,
        fileType: document.fileType,
      };
    } catch (error) {
      this.logger.error({
        msg: "Failed to read file from disk",
        error: error instanceof Error ? error.message : String(error),
        storagePath: document.storagePath,
      });
      throw new NotFoundError("File non trovato sul disco", "File");
    }
  }

  /**
   * Aggiorna un documento (metadata)
   */
  async updateDocument(
    input: UpdateDocumentInput,
  ): Promise<DocumentWithRelations> {
    this.logger.info({
      msg: "Updating document",
      documentId: input.documentId,
      userId: input.userId,
    });

    // Verifica che il documento esista
    const existingDocument = await this.db.document.findFirst({
      where: {
        id: input.documentId,
        organizationId: input.organizationId,
      },
    });

    if (!existingDocument) {
      throw new NotFoundError("Documento non trovato", "Document");
    }

    // Calcola se il documento è scaduto
    const isExpired = input.data.expiryDate
      ? new Date(input.data.expiryDate) < new Date()
      : false;

    // Aggiorna il documento
    const updatedDocument = await this.db.document.update({
      where: {
        id: input.documentId,
      },
      data: {
        expiryDate: input.data.expiryDate
          ? new Date(input.data.expiryDate)
          : null,
        isExpired: isExpired,
        notes: input.data.notes?.trim() || null,
      },
      include: {
        documentTemplate: true,
        uploadedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Crea audit log
    await this.createAuditLog(
      input.organizationId,
      input.userId,
      "UPDATE_DOCUMENT",
      input.documentId,
      {
        fileName: existingDocument.fileName,
        changes: input.data,
      },
    );

    this.logger.info({
      msg: "Document updated successfully",
      documentId: updatedDocument.id,
    });

    return updatedDocument;
  }

  /**
   * Elimina un documento
   */
  async deleteDocument(input: DeleteDocumentInput): Promise<void> {
    this.logger.info({
      msg: "Deleting document",
      documentId: input.documentId,
      userId: input.userId,
    });

    // Verifica che il documento esista
    const existingDocument = await this.db.document.findFirst({
      where: {
        id: input.documentId,
        organizationId: input.organizationId,
      },
    });

    if (!existingDocument) {
      throw new NotFoundError("Documento non trovato", "Document");
    }

    // Elimina il file dal disco
    try {
      await unlink(existingDocument.storagePath);
      this.logger.debug({
        msg: "File deleted from disk",
        storagePath: existingDocument.storagePath,
      });
    } catch (error) {
      this.logger.warn({
        msg: "Failed to delete file from disk, continuing with database deletion",
        error: error instanceof Error ? error.message : String(error),
        storagePath: existingDocument.storagePath,
      });
      // Continua comunque con l'eliminazione dal database
    }

    // Elimina il documento dal database
    await this.db.document.delete({
      where: {
        id: input.documentId,
      },
    });

    // Crea audit log
    await this.createAuditLog(
      input.organizationId,
      input.userId,
      "DELETE_DOCUMENT",
      input.documentId,
      {
        fileName: existingDocument.fileName,
        ownerType: existingDocument.ownerType,
        ownerId: existingDocument.ownerId,
      },
    );

    this.logger.info({
      msg: "Document deleted successfully",
      documentId: input.documentId,
    });
  }

  // ========== PRIVATE HELPER METHODS ==========

  /**
   * Verifica che un document template esista e validi il file
   */
  private async verifyDocumentTemplate(
    templateId: string,
    fileName: string,
    fileSize: number,
  ): Promise<void> {
    const template = await this.db.documentTemplate.findUnique({
      where: { id: templateId },
    });

    if (!template) {
      throw new NotFoundError("Template non trovato", "DocumentTemplate");
    }

    // Verifica formato file se specificato nel template
    if (template.fileFormats) {
      const allowedFormats = template.fileFormats
        .split(",")
        .map((f) => f.trim().toLowerCase());
      const fileExtension = fileName.split(".").pop()?.toLowerCase();
      if (fileExtension && !allowedFormats.includes(fileExtension)) {
        throw new ValidationError(
          `Formato file non valido. Formati accettati: ${template.fileFormats}`,
        );
      }
    }

    // Verifica dimensione file se specificato nel template
    if (template.maxSizeKB && fileSize > template.maxSizeKB * 1024) {
      throw new ValidationError(
        `File troppo grande. Dimensione massima: ${template.maxSizeKB}KB`,
      );
    }
  }

  /**
   * Genera il percorso della directory di upload
   */
  private getUploadDirectory(
    organizationId: string,
    ownerType: string,
    ownerId: string,
  ): string {
    const ownerTypeDir = ownerType.toLowerCase() + "s"; // "deadline" -> "deadlines"
    return join(
      process.cwd(),
      "uploads",
      organizationId,
      ownerTypeDir,
      ownerId,
    );
  }

  /**
   * Crea un audit log
   */
  private async createAuditLog(
    organizationId: string,
    userId: string,
    action: string,
    entityId: string,
    metadata?: any,
  ): Promise<void> {
    await this.db.auditLog.create({
      data: {
        organizationId,
        userId,
        action,
        entity: "Document",
        entityId,
        metadata: metadata || {},
      },
    });
  }
}

// Export singleton instance
export const documentService = new DocumentService();
