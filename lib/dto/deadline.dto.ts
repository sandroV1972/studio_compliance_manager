import type {
  DeadlineInstance,
  DeadlineTemplate,
  Person,
  Structure,
  DeadlineReminder,
} from "@prisma/client";

/**
 * Input per la creazione di una deadline
 */
export interface CreateDeadlineInput {
  organizationId: string;
  userId: string;
  data: {
    title: string;
    dueDate: string | Date;
    templateId?: string | null;
    structureId?: string | null;
    personId?: string | null;
    notes?: string | null;
    isRecurring?: boolean;
    recurrenceUnit?: "DAY" | "MONTH" | "YEAR" | null;
    recurrenceEvery?: number | null;
    recurrenceEndDate?: string | Date | null;
    reminders?: Array<{
      daysBefore: number;
      message?: string | null;
    }>;
  };
}

/**
 * Input per l'aggiornamento di una deadline
 */
export interface UpdateDeadlineInput {
  organizationId: string;
  userId: string;
  deadlineId: string;
  data: {
    title?: string;
    dueDate?: string | Date;
    personId?: string | null;
    structureId?: string | null;
    notes?: string | null;
    status?: "PENDING" | "DONE";
    reminders?: Array<{
      daysBefore: number;
      message?: string | null;
    }>;
  };
}

/**
 * Deadline con relazioni complete
 */
export interface DeadlineWithRelations extends DeadlineInstance {
  person?: Person | null;
  structure?: Structure | null;
  template?: DeadlineTemplate | null;
  reminders?: DeadlineReminder[];
}

/**
 * Opzioni per la query di deadlines
 */
export interface GetDeadlinesOptions {
  organizationId: string;
  structureId?: string;
  status?: "PENDING" | "DONE";
  upcoming?: boolean;
  overdue?: boolean;
  page?: number;
  limit?: number;
}

/**
 * Risultato paginato di deadlines
 */
export interface PaginatedDeadlines {
  deadlines: DeadlineWithRelations[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
