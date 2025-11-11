/**
 * Common Validation Schemas
 * Schema riutilizzabili per tipi comuni
 */

import { z } from "zod";

// Email validation
export const emailSchema = z
  .string()
  .email("Email non valida")
  .toLowerCase()
  .trim();

// Password validation
export const passwordSchema = z
  .string()
  .min(8, "La password deve contenere almeno 8 caratteri")
  .max(100, "La password è troppo lunga");

// UUID/CUID validation (Prisma usa CUID per default)
// CUID format: c[timestamp][counter][fingerprint][random]
export const uuidSchema = z
  .string()
  .min(1, "ID è obbligatorio")
  .refine(
    (val) => {
      // Accetta sia UUID standard che CUID
      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      const cuidRegex = /^c[a-z0-9]{24,25}$/i;
      return uuidRegex.test(val) || cuidRegex.test(val);
    },
    { message: "ID non valido" },
  );

// Nome/Titolo validation
export const nameSchema = z
  .string()
  .min(1, "Il nome è obbligatorio")
  .max(255, "Il nome è troppo lungo")
  .trim();

// Descrizione opzionale
export const descriptionSchema = z
  .string()
  .max(2000, "La descrizione è troppo lunga")
  .trim()
  .optional();

// Date ISO string
export const dateISOSchema = z
  .string()
  .datetime({ message: "Data non valida" });

// Enum per AccountStatus
export const accountStatusSchema = z.enum([
  "PENDING_VERIFICATION",
  "PENDING_APPROVAL",
  "APPROVED",
  "REJECTED",
]);

// Enum per ComplianceType
export const complianceTypeSchema = z.enum([
  "PRIVACY",
  "SAFETY",
  "QUALITY",
  "ENVIRONMENT",
  "OTHER",
]);

// Enum per Priority
export const prioritySchema = z.enum(["HIGH", "MEDIUM", "LOW"]);

// Enum per DeadlineStatus
export const deadlineStatusSchema = z.enum([
  "PENDING",
  "IN_PROGRESS",
  "COMPLETED",
  "OVERDUE",
]);

// Enum per RecurrenceUnit
export const recurrenceUnitSchema = z.enum([
  "DAYS",
  "WEEKS",
  "MONTHS",
  "YEARS",
]);

// Enum per Anchor
export const anchorSchema = z.enum([
  "STRUCTURE_OPENING",
  "FIXED_DATE",
  "PREVIOUS_COMPLETION",
]);

// Enum per Scope
export const scopeSchema = z.enum(["ALL", "PROVINCE", "REGION"]);

// Enum per OwnerType
export const ownerTypeSchema = z.enum(["GLOBAL", "ORG"]);

// Pagination
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

// Query booleani
export const booleanQuerySchema = z
  .string()
  .transform((val) => val === "true")
  .or(z.boolean());

// Array di stringhe da query (es: ids=1,2,3)
export const arrayQuerySchema = z
  .string()
  .transform((val) => val.split(",").filter(Boolean))
  .or(z.array(z.string()));

// Provincia italiana (sigla)
export const provinceCodeSchema = z
  .string()
  .length(2, "Codice provincia non valido")
  .toUpperCase();

// Regione italiana
export const regionNameSchema = z
  .string()
  .min(3, "Nome regione non valido")
  .max(50, "Nome regione troppo lungo");

// Telefono (formato flessibile)
export const phoneSchema = z
  .string()
  .regex(
    /^[\d\s+()-]+$/,
    "Numero di telefono non valido. Usa solo numeri, spazi e (+, -, )",
  )
  .min(8, "Numero di telefono troppo corto")
  .max(20, "Numero di telefono troppo lungo")
  .trim()
  .optional();

// Codice fiscale italiano
export const codiceFiscaleSchema = z
  .string()
  .regex(
    /^[A-Z]{6}\d{2}[A-Z]\d{2}[A-Z]\d{3}[A-Z]$/i,
    "Codice fiscale non valido",
  )
  .toUpperCase()
  .optional();

// Partita IVA italiana
export const partitaIVASchema = z
  .string()
  .regex(/^\d{11}$/, "Partita IVA non valida (deve essere 11 cifre)")
  .optional();

// URL validation
export const urlSchema = z.string().url("URL non valido").optional();
