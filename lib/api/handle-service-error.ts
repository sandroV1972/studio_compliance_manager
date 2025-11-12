import { NextResponse } from "next/server";
import { ServiceError } from "@/lib/errors";
import type { Logger } from "pino";
import {
  createErrorResponse,
  ErrorCodes,
  type ErrorResponse,
} from "@/lib/api/response-envelope";

/**
 * Helper per gestire gli errori dei services nelle API routes
 * Converte ServiceError in NextResponse con envelope standardizzato
 */
export function handleServiceError(
  error: unknown,
  logger?: Logger,
): NextResponse<ErrorResponse> {
  // Log dell'errore
  if (logger) {
    logger.error({
      msg: "Service error",
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      code: error instanceof ServiceError ? error.code : undefined,
    });
  }

  // Se è un ServiceError, usa il suo status code e code
  if (error instanceof ServiceError) {
    return createErrorResponse(
      error.code || ErrorCodes.INTERNAL_SERVER_ERROR,
      error.message,
      error.statusCode,
    );
  }

  // Se è un errore Prisma
  if (error && typeof error === "object" && "code" in error) {
    const prismaError = error as any;
    if (prismaError.code?.startsWith("P")) {
      return createErrorResponse(
        ErrorCodes.DATABASE_ERROR,
        "Errore del database",
        500,
        { prismaCode: prismaError.code },
      );
    }
  }

  // Errore generico
  return createErrorResponse(
    ErrorCodes.INTERNAL_SERVER_ERROR,
    "Errore interno del server",
    500,
  );
}
