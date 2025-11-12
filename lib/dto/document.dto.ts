/**
 * Data Transfer Objects per DocumentService
 */

import type { Document, DocumentTemplate, User } from "@prisma/client";

/**
 * Documenti con relazioni caricate
 */
export interface DocumentWithRelations extends Document {
  documentTemplate?: DocumentTemplate | null;
  uploadedBy?: {
    id: string;
    name: string | null;
    email: string | null;
  } | null;
}

/**
 * Input per upload documento
 */
export interface UploadDocumentInput {
  organizationId: string;
  userId: string;
  ownerType: "DEADLINE" | "PERSON" | "STRUCTURE";
  ownerId: string;
  deadlineId?: string | null; // Campo esplicito per la relazione con deadline
  file: {
    name: string;
    type: string | null;
    size: number;
    buffer: Buffer;
  };
  templateId?: string | null;
  expiryDate?: string | Date | null;
  notes?: string | null;
}

/**
 * Input per aggiornamento documento
 */
export interface UpdateDocumentInput {
  documentId: string;
  organizationId: string;
  userId: string;
  data: {
    expiryDate?: string | Date | null;
    notes?: string | null;
  };
}

/**
 * Input per recupero lista documenti
 */
export interface GetDocumentsInput {
  organizationId: string;
  ownerType: "DEADLINE" | "PERSON" | "STRUCTURE";
  ownerId: string;
}

/**
 * Input per download documento
 */
export interface DownloadDocumentInput {
  documentId: string;
  organizationId: string;
}

/**
 * Output per download documento
 */
export interface DownloadDocumentOutput {
  buffer: Buffer;
  fileName: string;
  fileType: string | null;
}

/**
 * Input per eliminazione documento
 */
export interface DeleteDocumentInput {
  documentId: string;
  organizationId: string;
  userId: string;
}
