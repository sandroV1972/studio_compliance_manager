/**
 * Deadline Validation Schemas
 */

import { z } from "zod";
import {
  nameSchema,
  descriptionSchema,
  dateISOSchema,
  prioritySchema,
  deadlineStatusSchema,
  uuidSchema,
  complianceTypeSchema,
} from "./common";

// Reminder schema
export const reminderSchema = z.object({
  daysBefore: z.coerce.number().int().positive(),
  message: z.string().max(500).optional(),
});

// Create Deadline (manual)
export const createDeadlineSchema = z.object({
  title: nameSchema,
  dueDate: z.string().min(1, "Data di scadenza obbligatoria"), // Accetta formato data semplice
  personId: uuidSchema.optional().nullable(),
  structureId: uuidSchema.optional().nullable(),
  notes: z.string().max(1000).optional().nullable(),
  complianceType: complianceTypeSchema.optional(),
  reminders: z.array(reminderSchema).optional(),
});

export type CreateDeadlineInput = z.infer<typeof createDeadlineSchema>;

// Update Deadline
export const updateDeadlineSchema = z.object({
  title: nameSchema.optional(),
  dueDate: dateISOSchema.optional(),
  personId: uuidSchema.optional().nullable(),
  structureId: uuidSchema.optional().nullable(),
  notes: z.string().max(1000).optional().nullable(),
  status: deadlineStatusSchema.optional(),
  reminders: z.array(reminderSchema).optional(),
});

export type UpdateDeadlineInput = z.infer<typeof updateDeadlineSchema>;

// Generate from Template
export const generateFromTemplateSchema = z.object({
  templateId: uuidSchema,
  targetType: z.enum(["PERSON", "STRUCTURE", "ALL_PEOPLE", "ALL_STRUCTURES"]),
  targetId: uuidSchema.nullish(), // Può essere undefined, null, o un UUID valido
  startDate: dateISOSchema,
  recurrenceEndDate: dateISOSchema.nullish(), // Può essere undefined, null, o una data valida
});

export type GenerateFromTemplateInput = z.infer<
  typeof generateFromTemplateSchema
>;
