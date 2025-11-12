/**
 * Structure DTO Types
 */

import { Structure } from "@prisma/client";

export type StructureWithRelations = Structure & {
  _count?: {
    personStructures: number;
    deadlineInstances: number;
  };
};

// Create Structure Input
export interface CreateStructureInput {
  organizationId: string;
  userId: string;
  data: {
    name: string;
    code?: string | null;
    address?: string | null;
    city?: string | null;
    province?: string | null;
    postalCode?: string | null;
    phone?: string | null;
    email?: string | null;
    pec?: string | null;
    website?: string | null;
    vatNumber?: string | null;
    fiscalCode?: string | null;
    responsiblePersonId?: string | null;
    legalRepName?: string | null;
    licenseNumber?: string | null;
    licenseExpiry?: string | Date | null;
    insurancePolicy?: string | null;
    insuranceExpiry?: string | Date | null;
    notes?: string | null;
  };
}

// Update Structure Input
export interface UpdateStructureInput {
  structureId: string;
  organizationId: string;
  userId: string;
  data: {
    name?: string;
    code?: string | null;
    address?: string | null;
    city?: string | null;
    province?: string | null;
    postalCode?: string | null;
    phone?: string | null;
    email?: string | null;
    pec?: string | null;
    website?: string | null;
    vatNumber?: string | null;
    fiscalCode?: string | null;
    responsiblePersonId?: string | null;
    legalRepName?: string | null;
    licenseNumber?: string | null;
    licenseExpiry?: string | Date | null;
    insurancePolicy?: string | null;
    insuranceExpiry?: string | Date | null;
    notes?: string | null;
    active?: boolean;
  };
}

// Get Structures Input
export interface GetStructuresInput {
  organizationId: string;
  userId: string;
  filters?: {
    active?: boolean;
  };
}

// Get Structure Input
export interface GetStructureInput {
  structureId: string;
  organizationId: string;
  userId: string;
  includeCount?: boolean;
}
