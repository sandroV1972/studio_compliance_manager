import { NextRequest } from "next/server";

/**
 * Valida che la richiesta provenga dallo stesso sito (Origin/Referer check)
 * Questo previene attacchi CSRF da siti esterni
 */
export function validateRequestOrigin(request: NextRequest | Request): boolean {
  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");

  // Ottieni l'URL base dell'applicazione
  const appUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const allowedOrigins = [
    appUrl,
    // Aggiungi altri domini autorizzati se necessario
  ];

  // Se è presente l'header Origin, verifica che corrisponda
  if (origin) {
    return allowedOrigins.some((allowed) => origin === allowed);
  }

  // Se non c'è Origin, verifica il Referer
  if (referer) {
    try {
      const refererUrl = new URL(referer);
      return allowedOrigins.some((allowed) => {
        const allowedUrl = new URL(allowed);
        return (
          refererUrl.protocol === allowedUrl.protocol &&
          refererUrl.host === allowedUrl.host
        );
      });
    } catch {
      // Referer malformato
      return false;
    }
  }

  // Nessun header Origin o Referer - potrebbe essere una richiesta diretta
  // Per sicurezza, rifiuta le richieste senza questi header
  return false;
}

/**
 * Valida che una richiesta sia sicura contro CSRF
 * Combina validazione Origin/Referer
 */
export function validateCSRFProtection(
  request: NextRequest | Request,
): boolean {
  // GET e HEAD sono safe methods e non necessitano protezione CSRF
  const method = request.method.toUpperCase();
  if (method === "GET" || method === "HEAD" || method === "OPTIONS") {
    return true;
  }

  // Per POST, PUT, DELETE, PATCH verifica Origin/Referer
  return validateRequestOrigin(request);
}

/**
 * Wrapper per proteggere automaticamente gli handler API con CSRF protection
 * Usare questo wrapper per tutte le operazioni POST, PUT, DELETE, PATCH
 *
 * @example
 * export const DELETE = withCSRFProtection(async (request, params) => {
 *   // Il tuo codice qui
 * });
 */
export function withCSRFProtection<T extends any[]>(
  handler: (request: Request, ...args: T) => Promise<Response>,
) {
  return async (request: Request, ...args: T): Promise<Response> => {
    // Valida CSRF prima di eseguire l'handler
    if (!validateCSRFProtection(request)) {
      return createCSRFErrorResponse();
    }

    // Esegui l'handler originale
    return handler(request, ...args);
  };
}

/**
 * Helper per creare una risposta di errore CSRF
 */
export function createCSRFErrorResponse() {
  return Response.json(
    {
      error: "CSRF validation failed",
      message: "Request origin validation failed",
    },
    { status: 403 },
  );
}
