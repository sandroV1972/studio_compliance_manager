import pino from "pino";
import { loggerConfig } from "./logger-config";

// Crea il logger principale usando la configurazione
export const logger = pino(loggerConfig);

/**
 * Crea un logger child con contesto specifico
 */
export function createLogger(context: Record<string, any>) {
  return logger.child(context);
}

/**
 * Logger per API routes - include informazioni sulla richiesta
 */
export function createApiLogger(
  method: string,
  path: string,
  userId?: string,
  organizationId?: string,
) {
  return logger.child({
    context: "api",
    method,
    path,
    userId,
    organizationId,
  });
}

/**
 * Logger per operazioni sul database
 */
export function createDbLogger(operation: string, table: string) {
  return logger.child({
    context: "database",
    operation,
    table,
  });
}

/**
 * Logger per operazioni di autenticazione
 */
export function createAuthLogger(action: string) {
  return logger.child({
    context: "auth",
    action,
  });
}

/**
 * Logger per operazioni sui file
 */
export function createFileLogger(operation: string) {
  return logger.child({
    context: "file",
    operation,
  });
}

/**
 * Logger per email
 */
export function createEmailLogger(action: string) {
  return logger.child({
    context: "email",
    action,
  });
}

/**
 * Logger per audit log
 */
export function createAuditLogger(
  userId: string,
  organizationId: string,
  action: string,
) {
  return logger.child({
    context: "audit",
    userId,
    organizationId,
    action,
  });
}

// Export default per import diretto
export default logger;
