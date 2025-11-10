/**
 * Rate Limiting Utility - In-Memory Implementation
 *
 * Questa implementazione usa una Map in-memory per tracciare i tentativi.
 * È adatta per applicazioni single-instance. Per deployment multi-instance
 * considerare l'uso di Redis o un database condiviso.
 */

interface RateLimitEntry {
  count: number;
  resetAt: number; // timestamp in ms
}

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number; // finestra temporale in millisecondi
}

// Storage in-memory delle richieste
const requestStore = new Map<string, RateLimitEntry>();

// Pulizia periodica delle entry scadute (ogni 5 minuti)
setInterval(
  () => {
    const now = Date.now();
    for (const [key, entry] of requestStore.entries()) {
      if (entry.resetAt < now) {
        requestStore.delete(key);
      }
    }
  },
  5 * 60 * 1000,
);

/**
 * Verifica se una richiesta può essere processata in base al rate limit
 * @param identifier - Identificatore univoco (es: email, IP)
 * @param config - Configurazione del rate limit
 * @returns Oggetto con success e informazioni sul rate limit
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig,
): {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
  retryAfter?: number;
} {
  const now = Date.now();
  const key = identifier.toLowerCase();

  // Ottieni o crea l'entry per questo identifier
  let entry = requestStore.get(key);

  // Se non esiste o è scaduta, crea una nuova entry
  if (!entry || entry.resetAt < now) {
    entry = {
      count: 0,
      resetAt: now + config.windowMs,
    };
    requestStore.set(key, entry);
  }

  // Incrementa il contatore
  entry.count++;

  // Calcola i valori di ritorno
  const remaining = Math.max(0, config.maxRequests - entry.count);
  const reset = entry.resetAt;

  // Verifica se il limite è stato superato
  if (entry.count > config.maxRequests) {
    const retryAfter = Math.ceil((reset - now) / 1000); // secondi
    return {
      success: false,
      limit: config.maxRequests,
      remaining: 0,
      reset,
      retryAfter,
    };
  }

  return {
    success: true,
    limit: config.maxRequests,
    remaining: remaining - 1, // -1 perché abbiamo già incrementato
    reset,
  };
}

/**
 * Reset manuale del rate limit per un identifier
 * Utile per testing o situazioni eccezionali
 */
export function resetRateLimit(identifier: string): void {
  requestStore.delete(identifier.toLowerCase());
}

/**
 * Ottieni statistiche sul rate limit senza incrementare il contatore
 */
export function getRateLimitInfo(
  identifier: string,
  config: RateLimitConfig,
): {
  remaining: number;
  reset: number;
} {
  const now = Date.now();
  const key = identifier.toLowerCase();
  const entry = requestStore.get(key);

  if (!entry || entry.resetAt < now) {
    return {
      remaining: config.maxRequests,
      reset: now + config.windowMs,
    };
  }

  return {
    remaining: Math.max(0, config.maxRequests - entry.count),
    reset: entry.resetAt,
  };
}

// Configurazioni predefinite per diversi endpoint
export const RateLimitConfigs = {
  login: {
    maxRequests: 5,
    windowMs: 15 * 60 * 1000, // 15 minuti
  },
  forgotPassword: {
    maxRequests: 3,
    windowMs: 60 * 60 * 1000, // 1 ora
  },
  resetPassword: {
    maxRequests: 5,
    windowMs: 15 * 60 * 1000, // 15 minuti
  },
  register: {
    maxRequests: 3,
    windowMs: 60 * 60 * 1000, // 1 ora
  },
  resendVerification: {
    maxRequests: 3,
    windowMs: 60 * 60 * 1000, // 1 ora
  },
} as const;

/**
 * Helper per ottenere l'identificatore dalla richiesta
 * Usa l'email se presente nel body, altrimenti fallback all'IP
 */
export function getIdentifier(request: Request, email?: string): string {
  if (email) {
    return `email:${email}`;
  }

  // Fallback: usa l'IP address
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0] || "unknown";
  return `ip:${ip}`;
}

/**
 * Formatta un messaggio di errore user-friendly per rate limit
 */
export function getRateLimitErrorMessage(retryAfter: number): string {
  const minutes = Math.ceil(retryAfter / 60);

  if (minutes < 1) {
    return `Troppi tentativi. Riprova tra ${retryAfter} secondi.`;
  } else if (minutes === 1) {
    return "Troppi tentativi. Riprova tra 1 minuto.";
  } else if (minutes < 60) {
    return `Troppi tentativi. Riprova tra ${minutes} minuti.`;
  } else {
    const hours = Math.ceil(minutes / 60);
    return `Troppi tentativi. Riprova tra ${hours} ${hours === 1 ? "ora" : "ore"}.`;
  }
}
