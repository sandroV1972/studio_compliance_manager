/**
 * Template DTO Types
 */

import { DeadlineTemplate } from "@prisma/client";

export type TemplateWithRelations = DeadlineTemplate;

// Create Template Input
export interface CreateTemplateInput {
  organizationId: string;
  userId: string;
  data: {
    title: string;
    scope: "ROLE" | "STRUCTURE" | "PERSON";
    complianceType: string;
    description?: string | null;
    recurrenceUnit: "DAY" | "MONTH" | "YEAR";
    recurrenceEvery: number;
    firstDueOffsetDays?: number;
    anchor: "ASSIGNMENT_START" | "HIRE_DATE" | "LAST_COMPLETION" | "CUSTOM";
    requiredDocumentName?: string | null;
    regions?: string[] | null;
  };
}

// Update Template Input
export interface UpdateTemplateInput {
  templateId: string;
  organizationId: string;
  userId: string;
  data: {
    title?: string;
    scope?: "ROLE" | "STRUCTURE" | "PERSON";
    complianceType?: string;
    description?: string | null;
    recurrenceUnit?: "DAY" | "MONTH" | "YEAR";
    recurrenceEvery?: number;
    firstDueOffsetDays?: number;
    anchor?: "ASSIGNMENT_START" | "HIRE_DATE" | "LAST_COMPLETION" | "CUSTOM";
    requiredDocumentName?: string | null;
    regions?: string[] | null;
    active?: boolean;
  };
}

// Get Templates Input
export interface GetTemplatesInput {
  organizationId: string;
  userId: string;
  filters?: {
    complianceType?: string;
    regions?: string[]; // User's regions for filtering GLOBAL templates
  };
}

// Delete Template Input
export interface DeleteTemplateInput {
  templateId: string;
  organizationId: string;
  userId: string;
}
