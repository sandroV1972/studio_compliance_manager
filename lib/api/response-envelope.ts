/**
 * API Response Envelope
 * Formato standardizzato per tutte le risposte API
 */

import { NextResponse } from "next/server";

/**
 * Metadata per risposte paginate
 */
export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

/**
 * Metadata generica per risposte API
 */
export interface ResponseMeta {
  pagination?: PaginationMeta;
  timestamp?: string;
  [key: string]: any;
}

/**
 * Formato errore standardizzato
 */
export interface ApiError {
  code: string;
  message: string;
  details?: any;
}

/**
 * Envelope per risposta di successo
 */
export interface SuccessResponse<T = any> {
  success: true;
  data: T;
  meta?: ResponseMeta;
}

/**
 * Envelope per risposta di errore
 */
export interface ErrorResponse {
  success: false;
  error: ApiError;
  meta?: ResponseMeta;
}

/**
 * Tipo unione per tutte le risposte API
 */
export type ApiResponse<T = any> = SuccessResponse<T> | ErrorResponse;

/**
 * Helper per creare risposta di successo
 */
export function createSuccessResponse<T>(
  data: T,
  meta?: ResponseMeta,
  status: number = 200,
): NextResponse<SuccessResponse<T>> {
  const response: SuccessResponse<T> = {
    success: true,
    data,
    ...(meta && { meta }),
  };

  return NextResponse.json(response, { status });
}

/**
 * Helper per creare risposta di errore
 */
export function createErrorResponse(
  code: string,
  message: string,
  status: number = 500,
  details?: any,
  meta?: ResponseMeta,
): NextResponse<ErrorResponse> {
  const response: ErrorResponse = {
    success: false,
    error: {
      code,
      message,
      ...(details && { details }),
    },
    ...(meta && { meta }),
  };

  return NextResponse.json(response, { status });
}

/**
 * Helper per creare risposta paginata
 */
export function createPaginatedResponse<T>(
  data: T,
  pagination: PaginationMeta,
  status: number = 200,
): NextResponse<SuccessResponse<T>> {
  return createSuccessResponse(
    data,
    {
      pagination,
      timestamp: new Date().toISOString(),
    },
    status,
  );
}

/**
 * Codici di errore standard
 */
export const ErrorCodes = {
  // Errori di autenticazione (401)
  UNAUTHORIZED: "UNAUTHORIZED",
  SESSION_EXPIRED: "SESSION_EXPIRED",
  INVALID_CREDENTIALS: "INVALID_CREDENTIALS",

  // Errori di autorizzazione (403)
  FORBIDDEN: "FORBIDDEN",
  INSUFFICIENT_PERMISSIONS: "INSUFFICIENT_PERMISSIONS",
  ACCESS_DENIED: "ACCESS_DENIED",

  // Errori di validazione (400)
  VALIDATION_ERROR: "VALIDATION_ERROR",
  INVALID_INPUT: "INVALID_INPUT",
  MISSING_REQUIRED_FIELD: "MISSING_REQUIRED_FIELD",

  // Errori di risorsa (404)
  NOT_FOUND: "NOT_FOUND",
  RESOURCE_NOT_FOUND: "RESOURCE_NOT_FOUND",

  // Errori di business logic (400, 409)
  BUSINESS_LOGIC_ERROR: "BUSINESS_LOGIC_ERROR",
  DUPLICATE_ENTRY: "DUPLICATE_ENTRY",
  INVALID_STATUS: "INVALID_STATUS",
  CONSTRAINT_VIOLATION: "CONSTRAINT_VIOLATION",

  // Errori di server (500)
  INTERNAL_SERVER_ERROR: "INTERNAL_SERVER_ERROR",
  DATABASE_ERROR: "DATABASE_ERROR",
  SERVICE_UNAVAILABLE: "SERVICE_UNAVAILABLE",
} as const;

/**
 * Helper per mappare errori service a risposte API
 */
export function mapServiceErrorToResponse(
  error: any,
  defaultMessage: string = "Si è verificato un errore",
): NextResponse<ErrorResponse> {
  // Se è un ServiceError, usa il suo statusCode e code
  if (error?.statusCode && error?.code) {
    return createErrorResponse(
      error.code,
      error.message || defaultMessage,
      error.statusCode,
      error.details,
    );
  }

  // Se è un errore Prisma
  if (error?.code?.startsWith("P")) {
    return createErrorResponse(
      ErrorCodes.DATABASE_ERROR,
      "Errore del database",
      500,
      { prismaCode: error.code },
    );
  }

  // Errore generico
  return createErrorResponse(
    ErrorCodes.INTERNAL_SERVER_ERROR,
    defaultMessage,
    500,
  );
}
