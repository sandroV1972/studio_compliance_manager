/**
 * Template Validation Schemas
 */

import { z } from "zod";
import {
  nameSchema,
  descriptionSchema,
  complianceTypeSchema,
  scopeSchema,
  recurrenceUnitSchema,
  anchorSchema,
  regionNameSchema,
  ownerTypeSchema,
} from "./common";

// Create Template
export const createTemplateSchema = z.object({
  title: nameSchema,
  description: descriptionSchema,
  complianceType: complianceTypeSchema,
  scope: scopeSchema,
  recurrenceUnit: recurrenceUnitSchema,
  recurrenceEvery: z.coerce.number().int().positive().default(1),
  firstDueOffsetDays: z.coerce.number().int().default(0),
  anchor: anchorSchema,
  requiredDocumentName: nameSchema.optional(),
  regions: z.array(regionNameSchema).optional(),
});

export type CreateTemplateInput = z.infer<typeof createTemplateSchema>;

// Update Template
export const updateTemplateSchema = createTemplateSchema.partial().extend({
  active: z.boolean().optional(),
});

export type UpdateTemplateInput = z.infer<typeof updateTemplateSchema>;
