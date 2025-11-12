/**
 * TemplateService
 * Gestisce template globali e organizzazione
 */

import { PrismaClient } from "@prisma/client";
import { prisma as defaultPrisma } from "@/lib/prisma";
import {
  ValidationError,
  NotFoundError,
  ForbiddenError,
} from "@/lib/errors/service-errors";
import { validateRequest } from "@/lib/validation/validate";
import {
  createTemplateSchema,
  updateTemplateSchema,
} from "@/lib/validation/template";
import {
  CreateTemplateInput,
  UpdateTemplateInput,
  GetTemplatesInput,
  DeleteTemplateInput,
  TemplateWithRelations,
} from "@/lib/dto/template.dto";

export class TemplateService {
  constructor(private readonly db: PrismaClient = defaultPrisma) {}

  /**
   * Ottiene lista di template con filtri
   * Include logica complessa per filtro regionale su GLOBAL templates
   */
  async getTemplates(
    input: GetTemplatesInput,
  ): Promise<TemplateWithRelations[]> {
    const { organizationId, filters } = input;

    // Costruisci filtri base
    const whereClause: any = {
      active: true,
      OR: [{ ownerType: "ORG", organizationId }, { ownerType: "GLOBAL" }],
    };

    // Filtri aggiuntivi
    if (filters?.complianceType) {
      whereClause.complianceType = filters.complianceType;
    }

    // Recupera tutti i template che matchano i filtri base
    const templates = await this.db.deadlineTemplate.findMany({
      where: whereClause,
      orderBy: [{ complianceType: "asc" }, { title: "asc" }],
    });

    // Se non abbiamo regioni utente, ritorna tutti i template
    if (!filters?.regions || filters.regions.length === 0) {
      return templates;
    }

    // Filtra GLOBAL templates per regione
    const userRegions = filters.regions;
    const filteredTemplates = templates.filter((template) => {
      // Template ORG sono sempre visibili
      if (template.ownerType === "ORG") {
        return true;
      }

      // Template GLOBAL senza regioni specifiche sono nazionali (visibili a tutti)
      if (!template.regions) {
        return true;
      }

      // Template GLOBAL con regioni specifiche: verifica intersezione
      try {
        const templateRegions = JSON.parse(template.regions) as string[];
        if (!Array.isArray(templateRegions) || templateRegions.length === 0) {
          // Se regions è vuoto o non valido, consideriamolo nazionale
          return true;
        }
        // Verifica se c'è almeno una regione in comune
        return userRegions.some((userRegion) =>
          templateRegions.includes(userRegion),
        );
      } catch (error) {
        // Se il parsing fallisce, consideriamo il template nazionale
        return true;
      }
    });

    return filteredTemplates;
  }

  /**
   * Ottiene un singolo template
   */
  async getTemplate(
    templateId: string,
    organizationId: string,
  ): Promise<TemplateWithRelations> {
    const template = await this.db.deadlineTemplate.findFirst({
      where: {
        id: templateId,
        active: true,
        OR: [{ ownerType: "ORG", organizationId }, { ownerType: "GLOBAL" }],
      },
    });

    if (!template) {
      throw new NotFoundError(
        "Template non trovato o non accessibile",
        "TEMPLATE",
      );
    }

    return template;
  }

  /**
   * Crea un nuovo template ORG
   */
  async createTemplate(
    input: CreateTemplateInput,
  ): Promise<TemplateWithRelations> {
    const { organizationId, userId, data } = input;

    // Validazione input
    const validation = validateRequest(createTemplateSchema, data);
    if (!validation.success || !validation.data) {
      throw new ValidationError("Dati template non validi");
    }

    const validatedData = validation.data;

    // Verifica che l'organizzazione esista
    const organization = await this.db.organization.findUnique({
      where: { id: organizationId },
    });

    if (!organization) {
      throw new NotFoundError("Organizzazione non trovata", "ORGANIZATION");
    }

    // Prepara il JSON delle regioni se presente
    const regionsJson = validatedData.regions
      ? JSON.stringify(validatedData.regions)
      : null;

    // Crea template
    const template = await this.db.deadlineTemplate.create({
      data: {
        organizationId,
        ownerType: "ORG",
        scope: validatedData.scope as any,
        title: validatedData.title.trim(),
        complianceType: validatedData.complianceType as any,
        description: validatedData.description || null,
        recurrenceUnit: validatedData.recurrenceUnit as any,
        recurrenceEvery: validatedData.recurrenceEvery,
        firstDueOffsetDays: validatedData.firstDueOffsetDays || 0,
        anchor: validatedData.anchor as any,
        requiredDocumentName: validatedData.requiredDocumentName || null,
        regions: regionsJson,
        active: true,
      },
    });

    // Audit log
    await this.createAuditLog(
      organizationId,
      userId,
      "CREATE_TEMPLATE",
      template.id,
      { title: template.title, ownerType: template.ownerType },
    );

    return template;
  }

  /**
   * Aggiorna un template esistente
   */
  async updateTemplate(
    input: UpdateTemplateInput,
  ): Promise<TemplateWithRelations> {
    const { templateId, organizationId, userId, data } = input;

    // Validazione input
    const validation = validateRequest(updateTemplateSchema, data);
    if (!validation.success || !validation.data) {
      throw new ValidationError("Dati template non validi");
    }

    const validatedData = validation.data;

    // Verifica che il template esista
    const existingTemplate = await this.getTemplate(templateId, organizationId);

    // Business rule: template ORG possono essere modificati solo dall'organizzazione proprietaria
    if (existingTemplate.ownerType === "ORG") {
      if (existingTemplate.organizationId !== organizationId) {
        throw new ForbiddenError(
          "Non hai i permessi per modificare questo template",
        );
      }
    }

    // Business rule: template GLOBAL richiedono super admin
    // Questa verifica viene fatta nella route, non nel service
    // Il service assume che l'autorizzazione sia già stata verificata

    // Prepara il JSON delle regioni se presente
    const regionsJson =
      validatedData.regions !== undefined
        ? validatedData.regions
          ? JSON.stringify(validatedData.regions)
          : null
        : undefined;

    // Aggiorna template
    const updatedTemplate = await this.db.deadlineTemplate.update({
      where: { id: templateId },
      data: {
        title: validatedData.title?.trim(),
        scope: validatedData.scope as any,
        complianceType: validatedData.complianceType as any,
        description:
          validatedData.description !== undefined
            ? validatedData.description || null
            : undefined,
        recurrenceUnit: validatedData.recurrenceUnit as any,
        recurrenceEvery: validatedData.recurrenceEvery,
        firstDueOffsetDays: validatedData.firstDueOffsetDays,
        anchor: validatedData.anchor as any,
        requiredDocumentName:
          validatedData.requiredDocumentName !== undefined
            ? validatedData.requiredDocumentName || null
            : undefined,
        regions: regionsJson,
        active: validatedData.active,
      },
    });

    // Audit log
    await this.createAuditLog(
      organizationId,
      userId,
      "UPDATE_TEMPLATE",
      templateId,
      { changes: validatedData },
    );

    return updatedTemplate;
  }

  /**
   * Elimina un template (soft delete)
   */
  async deleteTemplate(input: DeleteTemplateInput): Promise<void> {
    const { templateId, organizationId, userId } = input;

    // Verifica che il template esista
    const existingTemplate = await this.getTemplate(templateId, organizationId);

    // Business rule: template ORG possono essere eliminati solo dall'organizzazione proprietaria
    if (existingTemplate.ownerType === "ORG") {
      if (existingTemplate.organizationId !== organizationId) {
        throw new ForbiddenError(
          "Non hai i permessi per eliminare questo template",
        );
      }
    }

    // Business rule: template GLOBAL richiedono super admin
    // Questa verifica viene fatta nella route

    // Soft delete
    await this.db.deadlineTemplate.update({
      where: { id: templateId },
      data: { active: false },
    });

    // Audit log
    await this.createAuditLog(
      organizationId,
      userId,
      "DELETE_TEMPLATE",
      templateId,
      { title: existingTemplate.title },
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
        entity: "DeadlineTemplate",
        entityId,
        metadata: metadata || {},
      },
    });
  }
}

// Export singleton instance
export const templateService = new TemplateService();
