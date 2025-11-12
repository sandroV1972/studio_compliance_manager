/**
 * Base error class per tutti gli errori del service layer
 */
export class ServiceError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly code?: string,
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Errore di validazione (400)
 */
export class ValidationError extends ServiceError {
  constructor(message: string, code = "VALIDATION_ERROR") {
    super(message, 400, code);
  }
}

/**
 * Risorsa non trovata (404)
 */
export class NotFoundError extends ServiceError {
  constructor(
    message: string,
    public readonly resource?: string,
    code = "NOT_FOUND",
  ) {
    super(message, 404, code);
  }
}

/**
 * Non autorizzato (401)
 */
export class UnauthorizedError extends ServiceError {
  constructor(message: string, code = "UNAUTHORIZED") {
    super(message, 401, code);
  }
}

/**
 * Accesso negato (403)
 */
export class ForbiddenError extends ServiceError {
  constructor(message: string, code = "FORBIDDEN") {
    super(message, 403, code);
  }
}

/**
 * Conflitto (409)
 */
export class ConflictError extends ServiceError {
  constructor(message: string, code = "CONFLICT") {
    super(message, 409, code);
  }
}

/**
 * Errore generico del business logic (422)
 */
export class BusinessLogicError extends ServiceError {
  constructor(message: string, code = "BUSINESS_LOGIC_ERROR") {
    super(message, 422, code);
  }
}
