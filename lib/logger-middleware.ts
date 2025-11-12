import { NextResponse } from "next/server";
import { logger } from "@/lib/logger";

/**
 * Middleware per il logging delle richieste API
 * Wrappa un handler API e logga automaticamente richiesta/risposta
 */
export function withLogging<T extends any[]>(
  handler: (request: Request, ...args: T) => Promise<Response>,
  options?: {
    context?: string;
    logBody?: boolean;
    logResponse?: boolean;
  },
) {
  return async (request: Request, ...args: T): Promise<Response> => {
    const startTime = Date.now();
    const { method, url } = request;
    const pathname = new URL(url).pathname;

    // Crea logger con contesto
    const reqLogger = logger.child({
      context: options?.context || "api",
      method,
      path: pathname,
      requestId: crypto.randomUUID(),
    });

    try {
      // Log della richiesta in entrata
      const logData: any = {
        msg: "Incoming request",
      };

      // Opzionalmente logga il body (attenzione ai dati sensibili!)
      if (
        options?.logBody &&
        (method === "POST" || method === "PUT" || method === "PATCH")
      ) {
        try {
          const clonedRequest = request.clone();
          const body = await clonedRequest.text();
          if (body) {
            // Redigi informazioni sensibili
            const parsedBody = JSON.parse(body);
            const sanitizedBody = sanitizeLogData(parsedBody);
            logData.body = sanitizedBody;
          }
        } catch (e) {
          // Ignora errori di parsing del body
        }
      }

      reqLogger.info(logData);

      // Esegui l'handler
      const response = await handler(request, ...args);

      // Log della risposta
      const duration = Date.now() - startTime;
      const responseLogData: any = {
        msg: "Request completed",
        status: response.status,
        duration,
      };

      // Opzionalmente logga il body della risposta
      if (options?.logResponse) {
        try {
          const clonedResponse = response.clone();
          const body = await clonedResponse.text();
          if (body) {
            const parsedBody = JSON.parse(body);
            const sanitizedBody = sanitizeLogData(parsedBody);
            responseLogData.responseBody = sanitizedBody;
          }
        } catch (e) {
          // Ignora errori di parsing del body
        }
      }

      // Log con livello appropriato in base allo status
      if (response.status >= 500) {
        reqLogger.error(responseLogData);
      } else if (response.status >= 400) {
        reqLogger.warn(responseLogData);
      } else {
        reqLogger.info(responseLogData);
      }

      return response;
    } catch (error) {
      // Log dell'errore
      const duration = Date.now() - startTime;
      reqLogger.error({
        msg: "Request failed",
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        duration,
      });

      // Rilancia l'errore
      throw error;
    }
  };
}

/**
 * Rimuove informazioni sensibili dai log
 */
function sanitizeLogData(data: any): any {
  if (typeof data !== "object" || data === null) {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map(sanitizeLogData);
  }

  const sanitized: any = {};
  const sensitiveFields = [
    "password",
    "token",
    "secret",
    "authorization",
    "cookie",
    "apiKey",
    "creditCard",
    "ssn",
    "taxId",
  ];

  for (const [key, value] of Object.entries(data)) {
    const lowerKey = key.toLowerCase();
    const isSensitive = sensitiveFields.some((field) =>
      lowerKey.includes(field.toLowerCase()),
    );

    if (isSensitive) {
      sanitized[key] = "[REDACTED]";
    } else if (typeof value === "object" && value !== null) {
      sanitized[key] = sanitizeLogData(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

/**
 * Helper per loggare operazioni del database
 */
export function logDbOperation(
  operation: string,
  table: string,
  details?: Record<string, any>,
) {
  logger.info({
    context: "database",
    operation,
    table,
    ...details,
  });
}

/**
 * Helper per loggare errori del database
 */
export function logDbError(
  operation: string,
  table: string,
  error: Error,
  details?: Record<string, any>,
) {
  logger.error({
    context: "database",
    operation,
    table,
    error: error.message,
    stack: error.stack,
    ...details,
  });
}
