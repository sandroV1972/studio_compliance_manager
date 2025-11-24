import type { PrismaClient } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { createLogger } from "@/lib/logger";
import {
  ValidationError,
  NotFoundError,
  BusinessLogicError,
} from "@/lib/errors";
import {
  createDeadlineSchema,
  updateDeadlineSchema,
} from "@/lib/validation/deadline";
import { validateRequest } from "@/lib/validation/validate";
import type {
  CreateDeadlineInput,
  UpdateDeadlineInput,
  DeadlineWithRelations,
  GetDeadlinesOptions,
  PaginatedDeadlines,
} from "@/lib/dto/deadline.dto";

/**
 * Service per la gestione delle Deadlines
 * Contiene tutta la business logic relativa alle scadenze
 */
export class DeadlineService {
  private logger = createLogger({ context: "DeadlineService" });

  constructor(private db: PrismaClient = prisma) {}

  /**
   * Crea una nuova deadline
   */
  async createDeadline(
    input: CreateDeadlineInput,
  ): Promise<DeadlineWithRelations> {
    this.logger.info({
      msg: "Creating deadline",
      organizationId: input.organizationId,
      userId: input.userId,
    });

    // Validazione input
    this.logger.info({
      msg: "Validating deadline data",
      data: input.data,
    });
    const validation = validateRequest(createDeadlineSchema, input.data);
    if (!validation.success || !validation.data) {
      this.logger.error({
        msg: "Validation failed",
        errors: validation.errorDetails,
        data: input.data,
      });
      throw new ValidationError(
        `Dati deadline non validi: ${JSON.stringify(validation.errorDetails)}`,
      );
    }

    const validatedData = validation.data;

    // Business rule: almeno uno tra personId e structureId deve essere specificato
    if (!validatedData.personId && !validatedData.structureId) {
      throw new ValidationError("Specifica almeno una persona o una struttura");
    }

    // Verifica struttura se fornita
    if (validatedData.structureId) {
      await this.verifyStructure(
        validatedData.structureId,
        input.organizationId,
      );
    }

    // Verifica persona se fornita
    if (validatedData.personId) {
      await this.verifyPerson(validatedData.personId, input.organizationId);
    }

    // Crea la deadline con i reminders in un'unica transazione
    const deadline = await this.db.deadlineInstance.create({
      data: {
        organizationId: input.organizationId,
        title: validatedData.title.trim(),
        dueDate: new Date(validatedData.dueDate),
        structureId: validatedData.structureId || null,
        personId: validatedData.personId || null,
        notes: validatedData.notes?.trim() || null,
        complianceType: validatedData.complianceType || null,
        status: "PENDING",
        // Crea i reminders se presenti
        reminders: {
          create:
            validatedData.reminders?.map((reminder) => ({
              daysBefore: reminder.daysBefore,
              message: reminder.message?.trim() || null,
            })) || [],
        },
      },
      include: {
        person: true,
        structure: true,
        template: true,
        reminders: true,
      },
    });

    // Crea audit log
    await this.createAuditLog(
      input.organizationId,
      input.userId,
      "CREATE_DEADLINE",
      deadline.id,
      {
        title: deadline.title,
        dueDate: deadline.dueDate,
        personId: deadline.personId,
        structureId: deadline.structureId,
      },
    );

    this.logger.info({
      msg: "Deadline created successfully",
      deadlineId: deadline.id,
      isRecurring: deadline.isRecurring,
    });

    return deadline;
  }

  /**
   * Aggiorna una deadline esistente
   */
  async updateDeadline(
    input: UpdateDeadlineInput,
  ): Promise<DeadlineWithRelations> {
    this.logger.info({
      msg: "Updating deadline",
      deadlineId: input.deadlineId,
      userId: input.userId,
    });

    // Validazione input
    const validation = validateRequest(updateDeadlineSchema, input.data);
    if (!validation.success || !validation.data) {
      throw new ValidationError("Dati aggiornamento non validi");
    }

    const validatedData = validation.data;

    // Verifica che la deadline esista
    const existingDeadline = await this.db.deadlineInstance.findFirst({
      where: {
        id: input.deadlineId,
        organizationId: input.organizationId,
      },
    });

    if (!existingDeadline) {
      throw new NotFoundError("Scadenza non trovata", "DeadlineInstance");
    }

    // Verifica persona se viene aggiornata
    if (
      validatedData.personId !== undefined &&
      validatedData.personId !== null
    ) {
      await this.verifyPerson(validatedData.personId, input.organizationId);
    }

    // Verifica struttura se viene aggiornata
    if (
      validatedData.structureId !== undefined &&
      validatedData.structureId !== null
    ) {
      await this.verifyStructure(
        validatedData.structureId,
        input.organizationId,
      );
    }

    // Prepara i dati da aggiornare
    const updateData: any = {};
    if (validatedData.title !== undefined)
      updateData.title = validatedData.title.trim();
    if (validatedData.dueDate !== undefined)
      updateData.dueDate = new Date(validatedData.dueDate);
    if (validatedData.personId !== undefined)
      updateData.personId = validatedData.personId;
    if (validatedData.structureId !== undefined)
      updateData.structureId = validatedData.structureId;
    if (validatedData.notes !== undefined)
      updateData.notes = validatedData.notes?.trim() || null;

    // Gestione cambio status
    if (validatedData.status !== undefined) {
      updateData.status = validatedData.status;
      if (
        validatedData.status === "COMPLETED" &&
        !existingDeadline.completedAt
      ) {
        updateData.completedAt = new Date();
      } else if (validatedData.status === "PENDING") {
        updateData.completedAt = null;
      }
    }

    // Gestione reminders
    if (validatedData.reminders !== undefined) {
      await this.db.deadlineReminder.deleteMany({
        where: { deadlineId: input.deadlineId },
      });

      if (validatedData.reminders.length > 0) {
        await this.db.deadlineReminder.createMany({
          data: validatedData.reminders.map((reminder) => ({
            deadlineId: input.deadlineId,
            daysBefore: reminder.daysBefore,
            message: reminder.message?.trim() || null,
          })),
        });
      }
    }

    // Aggiorna la deadline
    const updatedDeadline = await this.db.deadlineInstance.update({
      where: { id: input.deadlineId },
      data: updateData,
      include: {
        person: true,
        structure: true,
        template: true,
        reminders: true,
      },
    });

    // Se la data viene modificata in una scadenza ricorrente, aggiorna tutte le occorrenze future
    if (
      validatedData.dueDate !== undefined &&
      existingDeadline.isRecurring &&
      existingDeadline.recurrenceGroupId &&
      existingDeadline.templateId
    ) {
      await this.updateFutureRecurringInstances(
        existingDeadline,
        updateData.dueDate,
      );
    }

    // Crea audit log
    await this.createAuditLog(
      input.organizationId,
      input.userId,
      "UPDATE_DEADLINE",
      updatedDeadline.id,
      { changes: updateData },
    );

    // Auto-rigenerazione per deadline ricorrenti completate
    if (
      validatedData.status === "COMPLETED" &&
      existingDeadline.isRecurring &&
      existingDeadline.recurrenceActive &&
      existingDeadline.templateId
    ) {
      await this.generateNextRecurringInstance(existingDeadline);
    }

    this.logger.info({
      msg: "Deadline updated successfully",
      deadlineId: updatedDeadline.id,
    });

    return updatedDeadline;
  }

  /**
   * Ottiene una deadline specifica con tutte le relazioni
   */
  async getDeadline(
    deadlineId: string,
    organizationId: string,
  ): Promise<DeadlineWithRelations> {
    const deadline = await this.db.deadlineInstance.findFirst({
      where: {
        id: deadlineId,
        organizationId,
      },
      include: {
        person: true,
        structure: true,
        template: true,
        reminders: {
          orderBy: { daysBefore: "desc" },
        },
      },
    });

    if (!deadline) {
      throw new NotFoundError("Scadenza non trovata", "DeadlineInstance");
    }

    return deadline;
  }

  /**
   * Ottiene una lista di deadlines con filtri e paginazione
   */
  async getDeadlines(
    options: GetDeadlinesOptions,
  ): Promise<PaginatedDeadlines> {
    const page = options.page || 1;
    const limit = options.limit || 50;
    const skip = (page - 1) * limit;

    // Costruisci where clause
    const where: any = {
      organizationId: options.organizationId,
    };

    if (options.structureId) {
      where.structureId = options.structureId;
    }

    if (options.status) {
      where.status = options.status;
    }

    if (options.upcoming) {
      where.dueDate = {
        gte: new Date(),
      };
      where.status = "PENDING";
    }

    if (options.overdue) {
      where.dueDate = {
        lt: new Date(),
      };
      where.status = "PENDING";
    }

    // Query con paginazione
    const [deadlines, total] = await Promise.all([
      this.db.deadlineInstance.findMany({
        where,
        include: {
          person: true,
          structure: true,
          template: true,
          reminders: true,
        },
        orderBy: {
          dueDate: "asc",
        },
        skip,
        take: limit,
      }),
      this.db.deadlineInstance.count({ where }),
    ]);

    return {
      deadlines,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Elimina una deadline
   */
  async deleteDeadline(
    deadlineId: string,
    organizationId: string,
    userId: string,
  ): Promise<void> {
    this.logger.info({
      msg: "Deleting deadline",
      deadlineId,
      userId,
    });

    // Verifica che la deadline esista
    const existingDeadline = await this.db.deadlineInstance.findFirst({
      where: {
        id: deadlineId,
        organizationId,
      },
    });

    if (!existingDeadline) {
      throw new NotFoundError("Scadenza non trovata", "DeadlineInstance");
    }

    // Elimina la deadline (i reminders verranno eliminati in cascata)
    await this.db.deadlineInstance.delete({
      where: { id: deadlineId },
    });

    // Crea audit log
    await this.createAuditLog(
      organizationId,
      userId,
      "DELETE_DEADLINE",
      deadlineId,
      {
        title: existingDeadline.title,
        dueDate: existingDeadline.dueDate,
      },
    );

    this.logger.info({
      msg: "Deadline deleted successfully",
      deadlineId,
    });
  }

  // ========== PRIVATE HELPER METHODS ==========

  /**
   * Verifica che un template esista
   */
  private async verifyTemplate(templateId: string): Promise<void> {
    const template = await this.db.deadlineTemplate.findUnique({
      where: { id: templateId },
    });

    if (!template) {
      throw new NotFoundError("Template non trovato", "DeadlineTemplate");
    }
  }

  /**
   * Verifica che una struttura esista e appartenga all'organizzazione
   */
  private async verifyStructure(
    structureId: string,
    organizationId: string,
  ): Promise<void> {
    const structure = await this.db.structure.findFirst({
      where: {
        id: structureId,
        organizationId,
      },
    });

    if (!structure) {
      throw new NotFoundError(
        "Struttura non trovata o non appartiene a questa organizzazione",
        "Structure",
      );
    }
  }

  /**
   * Verifica che una persona esista e appartenga all'organizzazione
   */
  private async verifyPerson(
    personId: string,
    organizationId: string,
  ): Promise<void> {
    const person = await this.db.person.findFirst({
      where: {
        id: personId,
        organizationId,
      },
    });

    if (!person) {
      throw new NotFoundError(
        "Persona non trovata o non appartiene a questa organizzazione",
        "Person",
      );
    }
  }

  /**
   * Crea un audit log
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
        entity: "DeadlineInstance",
        entityId,
        metadata: metadata || {},
      },
    });
  }

  /**
   * Genera le istanze ricorrenti future
   */
  private async generateRecurringInstances(
    deadline: DeadlineWithRelations,
  ): Promise<void> {
    if (
      !deadline.isRecurring ||
      !deadline.template ||
      !deadline.template.recurrenceUnit ||
      !deadline.template.recurrenceEvery
    ) {
      return;
    }

    this.logger.debug({
      msg: "Generating recurring instances",
      deadlineId: deadline.id,
      recurrenceUnit: deadline.template.recurrenceUnit,
    });

    // Genera le prossime 3 occorrenze
    const instancesToGenerate = 3;
    const instances = [];

    for (let i = 1; i <= instancesToGenerate; i++) {
      const nextDueDate = this.calculateNextDueDate(
        deadline.dueDate,
        deadline.template.recurrenceUnit,
        deadline.template.recurrenceEvery * i,
      );

      // Verifica se rientra nel limite (se c'è)
      if (
        deadline.recurrenceEndDate &&
        nextDueDate > deadline.recurrenceEndDate
      ) {
        break;
      }

      instances.push({
        organizationId: deadline.organizationId,
        templateId: deadline.templateId,
        title: deadline.title,
        dueDate: nextDueDate,
        status: "PENDING" as const,
        personId: deadline.personId,
        structureId: deadline.structureId,
        notes: deadline.notes,
        isRecurring: true,
        recurrenceActive: true,
        recurrenceEndDate: deadline.recurrenceEndDate,
        recurrenceGroupId: deadline.recurrenceGroupId,
      });
    }

    if (instances.length > 0) {
      await this.db.deadlineInstance.createMany({
        data: instances,
      });

      this.logger.info({
        msg: "Recurring instances generated",
        count: instances.length,
        deadlineId: deadline.id,
      });
    }
  }

  /**
   * Genera la prossima istanza ricorrente quando una viene completata
   */
  private async generateNextRecurringInstance(
    deadline: DeadlineWithRelations,
  ): Promise<void> {
    if (!deadline.templateId) return;

    const template = await this.db.deadlineTemplate.findUnique({
      where: { id: deadline.templateId },
    });

    if (!template || !template.recurrenceUnit || !template.recurrenceEvery)
      return;

    // Calcola la data della prossima occorrenza
    const nextDueDate = this.calculateNextDueDate(
      deadline.dueDate,
      template.recurrenceUnit,
      template.recurrenceEvery,
    );

    // Verifica se rientra nel limite
    const shouldGenerate =
      !deadline.recurrenceEndDate || nextDueDate <= deadline.recurrenceEndDate;

    if (!shouldGenerate) return;

    // Verifica quante occorrenze future esistono già
    const futureOccurrences = await this.db.deadlineInstance.count({
      where: {
        recurrenceGroupId: deadline.recurrenceGroupId,
        status: "PENDING",
        dueDate: {
          gt: new Date(),
        },
      },
    });

    // Genera la prossima solo se abbiamo meno di 3 occorrenze future
    if (futureOccurrences < 3) {
      await this.db.deadlineInstance.create({
        data: {
          organizationId: deadline.organizationId,
          templateId: deadline.templateId,
          title: deadline.title,
          dueDate: nextDueDate,
          status: "PENDING",
          personId: deadline.personId,
          structureId: deadline.structureId,
          notes: deadline.notes,
          isRecurring: true,
          recurrenceActive: true,
          recurrenceEndDate: deadline.recurrenceEndDate,
          recurrenceGroupId: deadline.recurrenceGroupId,
        },
      });

      this.logger.info({
        msg: "Next recurring instance generated",
        deadlineId: deadline.id,
        nextDueDate,
      });
    }
  }

  /**
   * Aggiorna tutte le occorrenze future di una scadenza ricorrente
   * quando viene modificata la data dell'occorrenza corrente
   */
  private async updateFutureRecurringInstances(
    deadline: DeadlineWithRelations,
    newDueDate: Date,
  ): Promise<void> {
    if (!deadline.recurrenceGroupId || !deadline.templateId) return;

    // Ottieni il template per la ricorrenza
    const template = await this.db.deadlineTemplate.findUnique({
      where: { id: deadline.templateId },
    });

    if (!template || !template.recurrenceUnit || !template.recurrenceEvery)
      return;

    // Elimina tutte le occorrenze future PENDING dello stesso gruppo
    await this.db.deadlineInstance.deleteMany({
      where: {
        recurrenceGroupId: deadline.recurrenceGroupId,
        status: "PENDING",
        dueDate: {
          gt: deadline.dueDate, // Maggiore della data originale
        },
      },
    });

    this.logger.info({
      msg: "Future recurring instances deleted",
      recurrenceGroupId: deadline.recurrenceGroupId,
    });

    // Conta quante scadenze PENDING ci sono già nel gruppo dopo la delete
    // (dovrebbe includere quella corrente se è PENDING, altrimenti solo quelle future)
    const existingPending = await this.db.deadlineInstance.count({
      where: {
        recurrenceGroupId: deadline.recurrenceGroupId,
        status: "PENDING",
      },
    });

    this.logger.info({
      msg: "Existing PENDING instances after delete",
      count: existingPending,
      recurrenceGroupId: deadline.recurrenceGroupId,
    });

    // Rigenera le occorrenze future con la nuova data base
    const instances: any[] = [];
    let currentDate = new Date(newDueDate);

    // Genera occorrenze fino ad avere massimo 3 PENDING nel gruppo
    const maxToGenerate = Math.max(0, 3 - existingPending);

    this.logger.info({
      msg: "Will generate instances",
      maxToGenerate,
      recurrenceGroupId: deadline.recurrenceGroupId,
    });

    for (let i = 0; i < maxToGenerate; i++) {
      currentDate = this.calculateNextDueDate(
        currentDate,
        template.recurrenceUnit,
        template.recurrenceEvery,
      );

      // Verifica se rientra nel limite di recurrenceEndDate
      if (
        deadline.recurrenceEndDate &&
        currentDate > deadline.recurrenceEndDate
      ) {
        break;
      }

      instances.push({
        organizationId: deadline.organizationId,
        templateId: deadline.templateId,
        title: deadline.title,
        dueDate: currentDate,
        status: "PENDING",
        personId: deadline.personId,
        structureId: deadline.structureId,
        notes: deadline.notes,
        isRecurring: true,
        recurrenceActive: true,
        recurrenceEndDate: deadline.recurrenceEndDate,
        recurrenceGroupId: deadline.recurrenceGroupId,
      });
    }

    if (instances.length > 0) {
      await this.db.deadlineInstance.createMany({
        data: instances,
      });

      this.logger.info({
        msg: "Future recurring instances regenerated",
        count: instances.length,
        recurrenceGroupId: deadline.recurrenceGroupId,
      });
    }
  }

  /**
   * Calcola la prossima data di scadenza per una deadline ricorrente
   */
  private calculateNextDueDate(
    currentDate: Date,
    unit: "DAY" | "MONTH" | "YEAR",
    every: number,
  ): Date {
    const nextDate = new Date(currentDate);

    switch (unit) {
      case "DAY":
        nextDate.setDate(nextDate.getDate() + every);
        break;
      case "MONTH":
        nextDate.setMonth(nextDate.getMonth() + every);
        break;
      case "YEAR":
        nextDate.setFullYear(nextDate.getFullYear() + every);
        break;
    }

    return nextDate;
  }
}

// Export singleton instance
export const deadlineService = new DeadlineService();
