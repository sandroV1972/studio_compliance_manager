/**
 * Structure Validation Schemas
 */

import { z } from "zod";
import {
  nameSchema,
  provinceCodeSchema,
  phoneSchema,
  uuidSchema,
} from "./common";

// Create Structure
export const createStructureSchema = z.object({
  name: nameSchema,
  province: provinceCodeSchema,
  address: z.string().min(5, "Indirizzo troppo corto").max(500).optional(),
  phone: phoneSchema,
  active: z.boolean().default(true),
});

export type CreateStructureInput = z.infer<typeof createStructureSchema>;

// Update Structure
export const updateStructureSchema = createStructureSchema.partial();

export type UpdateStructureInput = z.infer<typeof updateStructureSchema>;
