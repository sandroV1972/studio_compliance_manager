/**
 * Person Validation Schemas
 */

import { z } from "zod";
import {
  nameSchema,
  emailSchema,
  phoneSchema,
  codiceFiscaleSchema,
  uuidSchema,
} from "./common";

// Create Person
export const createPersonSchema = z.object({
  name: nameSchema,
  email: emailSchema.optional(),
  phone: phoneSchema,
  role: z.string().max(100, "Ruolo troppo lungo").optional(),
  codiceFiscale: codiceFiscaleSchema,
});

export type CreatePersonInput = z.infer<typeof createPersonSchema>;

// Update Person
export const updatePersonSchema = createPersonSchema.partial();

export type UpdatePersonInput = z.infer<typeof updatePersonSchema>;
