/**
 * StructureService
 * Gestisce strutture e gerarchie
 */

import { PrismaClient } from "@prisma/client";
import { prisma as defaultPrisma } from "@/lib/prisma";
import {
  ValidationError,
  NotFoundError,
  ForbiddenError,
} from "@/lib/errors/service-errors";
import {
  CreateStructureInput,
  UpdateStructureInput,
  GetStructuresInput,
  GetStructureInput,
  StructureWithRelations,
} from "@/lib/dto/structure.dto";

export class StructureService {
  constructor(private readonly db: PrismaClient = defaultPrisma) {}

  /**
   * Ottiene lista di strutture di un'organizzazione
   */
  async getStructures(
    input: GetStructuresInput,
  ): Promise<StructureWithRelations[]> {
    const { organizationId, filters } = input;

    const whereClause: any = {
      organizationId,
    };

    if (filters?.active !== undefined) {
      whereClause.active = filters.active;
    } else {
      // Default: solo strutture attive
      whereClause.active = true;
    }

    const structures = await this.db.structure.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        address: true,
        city: true,
        province: true,
        code: true,
        active: true,
        createdAt: true,
        updatedAt: true,
        organizationId: true,
        postalCode: true,
        phone: true,
        email: true,
        pec: true,
        website: true,
        vatNumber: true,
        fiscalCode: true,
        responsiblePersonId: true,
        legalRepName: true,
        licenseNumber: true,
        licenseExpiry: true,
        insurancePolicy: true,
        insuranceExpiry: true,
        notes: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return structures;
  }

  /**
   * Ottiene una singola struttura
   */
  async getStructure(
    input: GetStructureInput,
  ): Promise<StructureWithRelations> {
    const { structureId, organizationId, includeCount } = input;

    const structure = await this.db.structure.findFirst({
      where: {
        id: structureId,
        organizationId,
      },
      include: includeCount
        ? {
            _count: {
              select: {
                personStructures: true,
                deadlineInstances: true,
              },
            },
            responsiblePerson: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          }
        : {
            responsiblePerson: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
    });

    if (!structure) {
      throw new NotFoundError("Struttura non trovata", "STRUCTURE");
    }

    return structure;
  }

  /**
   * Crea una nuova struttura
   */
  async createStructure(
    input: CreateStructureInput,
  ): Promise<StructureWithRelations> {
    const { organizationId, userId, data } = input;

    // Validazione base
    if (!data.name || data.name.trim().length === 0) {
      throw new ValidationError("Il nome della struttura è obbligatorio");
    }

    // Verifica che l'organizzazione esista
    const organization = await this.db.organization.findUnique({
      where: { id: organizationId },
    });

    if (!organization) {
      throw new NotFoundError("Organizzazione non trovata", "ORGANIZATION");
    }

    // Converti date italiane (dd/mm/yyyy) in Date se sono stringhe
    const licenseExpiry = this.convertItalianDateToISO(data.licenseExpiry);
    const insuranceExpiry = this.convertItalianDateToISO(data.insuranceExpiry);

    // Verifica che la persona responsabile esista se specificata
    if (data.responsiblePersonId) {
      const person = await this.db.person.findFirst({
        where: {
          id: data.responsiblePersonId,
          organizationId,
        },
      });

      if (!person) {
        throw new NotFoundError(
          "Persona responsabile non trovata nell'organizzazione",
          "PERSON",
        );
      }
    }

    const structure = await this.db.structure.create({
      data: {
        organizationId,
        name: data.name.trim(),
        code: data.code?.trim() || null,
        address: data.address?.trim() || null,
        city: data.city?.trim() || null,
        province: data.province?.trim() || null,
        postalCode: data.postalCode?.trim() || null,
        phone: data.phone?.trim() || null,
        email: data.email?.trim() || null,
        pec: data.pec?.trim() || null,
        website: data.website?.trim() || null,
        vatNumber: data.vatNumber?.trim() || null,
        fiscalCode: data.fiscalCode?.trim() || null,
        responsiblePersonId: data.responsiblePersonId || null,
        legalRepName: data.legalRepName?.trim() || null,
        licenseNumber: data.licenseNumber?.trim() || null,
        licenseExpiry,
        insurancePolicy: data.insurancePolicy?.trim() || null,
        insuranceExpiry,
        notes: data.notes?.trim() || null,
        active: true,
      },
    });

    // Audit log
    await this.createAuditLog(
      organizationId,
      userId,
      "CREATE_STRUCTURE",
      structure.id,
      { name: structure.name, code: structure.code },
    );

    return structure;
  }

  /**
   * Aggiorna una struttura esistente
   */
  async updateStructure(
    input: UpdateStructureInput,
  ): Promise<StructureWithRelations> {
    const { structureId, organizationId, userId, data } = input;

    // Verifica che la struttura esista e appartenga all'organizzazione
    const existingStructure = await this.getStructure({
      structureId,
      organizationId,
      userId,
    });

    // Validazione base
    if (data.name !== undefined && data.name.trim().length === 0) {
      throw new ValidationError("Il nome della struttura non può essere vuoto");
    }

    // Verifica che la persona responsabile esista se specificata
    if (data.responsiblePersonId) {
      const person = await this.db.person.findFirst({
        where: {
          id: data.responsiblePersonId,
          organizationId,
        },
      });

      if (!person) {
        throw new NotFoundError(
          "Persona responsabile non trovata nell'organizzazione",
          "PERSON",
        );
      }
    }

    // Converti date italiane (dd/mm/yyyy) in Date se sono stringhe
    const licenseExpiry =
      data.licenseExpiry !== undefined
        ? this.convertItalianDateToISO(data.licenseExpiry)
        : undefined;
    const insuranceExpiry =
      data.insuranceExpiry !== undefined
        ? this.convertItalianDateToISO(data.insuranceExpiry)
        : undefined;

    // Prepara i dati per l'update (solo campi forniti)
    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name.trim();
    if (data.code !== undefined) updateData.code = data.code?.trim() || null;
    if (data.address !== undefined)
      updateData.address = data.address?.trim() || null;
    if (data.city !== undefined) updateData.city = data.city?.trim() || null;
    if (data.province !== undefined)
      updateData.province = data.province?.trim() || null;
    if (data.postalCode !== undefined)
      updateData.postalCode = data.postalCode?.trim() || null;
    if (data.phone !== undefined) updateData.phone = data.phone?.trim() || null;
    if (data.email !== undefined) updateData.email = data.email?.trim() || null;
    if (data.pec !== undefined) updateData.pec = data.pec?.trim() || null;
    if (data.website !== undefined)
      updateData.website = data.website?.trim() || null;
    if (data.vatNumber !== undefined)
      updateData.vatNumber = data.vatNumber?.trim() || null;
    if (data.fiscalCode !== undefined)
      updateData.fiscalCode = data.fiscalCode?.trim() || null;
    if (data.responsiblePersonId !== undefined)
      updateData.responsiblePersonId = data.responsiblePersonId || null;
    if (data.legalRepName !== undefined)
      updateData.legalRepName = data.legalRepName?.trim() || null;
    if (data.licenseNumber !== undefined)
      updateData.licenseNumber = data.licenseNumber?.trim() || null;
    if (licenseExpiry !== undefined) updateData.licenseExpiry = licenseExpiry;
    if (data.insurancePolicy !== undefined)
      updateData.insurancePolicy = data.insurancePolicy?.trim() || null;
    if (insuranceExpiry !== undefined)
      updateData.insuranceExpiry = insuranceExpiry;
    if (data.notes !== undefined) updateData.notes = data.notes?.trim() || null;
    if (data.active !== undefined) updateData.active = data.active;

    const updatedStructure = await this.db.structure.update({
      where: { id: structureId },
      data: updateData,
    });

    // Audit log
    await this.createAuditLog(
      organizationId,
      userId,
      "UPDATE_STRUCTURE",
      structureId,
      { changes: updateData },
    );

    return updatedStructure;
  }

  /**
   * Helper: Converte date italiane (dd/mm/yyyy) in Date ISO
   */
  private convertItalianDateToISO(
    dateInput: string | Date | null | undefined,
  ): Date | null {
    if (!dateInput) return null;

    // Se è già un Date, ritorna
    if (dateInput instanceof Date) return dateInput;

    // Se è una stringa, cerca di convertire da formato italiano
    const dateStr = dateInput as string;
    const parts = dateStr.split("/");
    if (parts.length !== 3) {
      // Prova come ISO string
      try {
        return new Date(dateStr);
      } catch {
        return null;
      }
    }

    const [day, month, year] = parts;
    if (!day || !month || !year) return null;

    return new Date(
      `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`,
    );
  }

  /**
   * Helper: Crea audit log
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
        entity: "Structure",
        entityId,
        metadata: metadata || {},
      },
    });
  }
}

// Export singleton instance
export const structureService = new StructureService();
