/**
 * Configurazione avanzata per il logging con Pino
 * Include supporto per log rotation e configurazioni per ambienti diversi
 */

import type { LoggerOptions } from "pino";

const isDevelopment = process.env.NODE_ENV !== "production";
const isTest = process.env.NODE_ENV === "test";

/**
 * Configurazione base per Pino
 */
export const loggerConfig: LoggerOptions = {
  level: process.env.LOG_LEVEL || (isDevelopment ? "debug" : "info"),

  // In test mode, disable logging unless explicitly enabled
  enabled: isTest ? process.env.ENABLE_LOGS === "true" : true,

  // Formattazione per sviluppo (pretty print) e produzione (JSON)
  ...(isDevelopment
    ? {
        transport: {
          target: "pino-pretty",
          options: {
            colorize: true,
            translateTime: "HH:MM:ss Z",
            ignore: "pid,hostname",
            singleLine: false,
            levelFirst: true,
            messageKey: "msg",
          },
        },
      }
    : {}),

  // Serializzatori per oggetti comuni
  serializers: {
    req: (req) => ({
      id: req.id,
      method: req.method,
      url: req.url,
      headers: {
        host: req.headers.host,
        "user-agent": req.headers["user-agent"],
        referer: req.headers.referer,
      },
      remoteAddress: req.remoteAddress,
      remotePort: req.remotePort,
    }),
    res: (res) => ({
      statusCode: res.statusCode,
      headers: res.headers,
    }),
    err: (err) => ({
      type: err.constructor.name,
      message: err.message,
      stack: err.stack,
      code: err.code,
      ...(err.cause && { cause: err.cause }),
    }),
  },

  // Informazioni di base da includere in ogni log
  base: {
    env: process.env.NODE_ENV,
    revision: process.env.VERCEL_GIT_COMMIT_SHA || process.env.GIT_COMMIT_SHA,
    ...(process.env.VERCEL && {
      deployment: {
        id: process.env.VERCEL_DEPLOYMENT_ID,
        url: process.env.VERCEL_URL,
      },
    }),
  },

  // Timestamp ISO
  timestamp: () => `,"time":"${new Date().toISOString()}"`,

  // Redact sensitive fields
  redact: {
    paths: [
      "password",
      "*.password",
      "token",
      "*.token",
      "authorization",
      "*.authorization",
      "cookie",
      "*.cookie",
      "secret",
      "*.secret",
      "apiKey",
      "*.apiKey",
      "accessToken",
      "*.accessToken",
      "refreshToken",
      "*.refreshToken",
    ],
    remove: true,
  },
};

/**
 * Configurazione per log rotation in produzione
 *
 * Per abilitare la log rotation in produzione, utilizzare pino con file stream:
 *
 * Example usando pino-roll:
 * ```
 * npm install pino-roll
 * ```
 *
 * Poi nel tuo script di avvio:
 * ```javascript
 * import pino from 'pino';
 * import pinoRoll from 'pino-roll';
 *
 * const logger = pino(pinoRoll({
 *   file: './logs/app.log',
 *   frequency: 'daily',
 *   size: '10m',
 *   extension: '.log'
 * }));
 * ```
 *
 * Oppure usando pm2 ecosystem file:
 * ```javascript
 * module.exports = {
 *   apps: [{
 *     name: 'app',
 *     script: './server.js',
 *     error_file: './logs/err.log',
 *     out_file: './logs/out.log',
 *     log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
 *     max_size: '10M',
 *     retain: 10
 *   }]
 * }
 * ```
 */
export const logRotationConfig = {
  // Rotazione giornaliera
  frequency: "daily" as const,

  // Dimensione massima file prima della rotazione (10MB)
  maxSize: "10m",

  // Numero di file da mantenere
  maxFiles: 30,

  // Directory dei log
  logDirectory: process.env.LOG_DIR || "./logs",

  // Pattern nome file
  filePattern: "app-%DATE%.log",

  // Comprimi file vecchi
  compress: true,
};

/**
 * Livelli di log personalizzati (opzionale)
 *
 * Se vuoi usare livelli custom:
 * ```
 * const logger = pino({
 *   customLevels: {
 *     audit: 35
 *   }
 * });
 *
 * logger.audit('Audit event');
 * ```
 */
export const customLevels = {
  // audit: 35, // Between info (30) and warn (40)
};

/**
 * Hook per processare i log prima dell'output
 * Utile per inviare log a servizi esterni (Sentry, Datadog, etc.)
 */
export function createLogHooks() {
  return {
    logMethod(inputArgs: any[], method: any, level: number) {
      // In produzione, invia errori critici a servizi esterni
      if (level >= 50 && !isDevelopment) {
        // Example: Send to Sentry
        // Sentry.captureException(inputArgs[0]);
      }
      return method.apply(this, inputArgs);
    },
  };
}

/**
 * Esempio di configurazione per Vercel
 * Vercel cattura automaticamente i log da stdout/stderr
 */
export const vercelConfig = {
  // In Vercel, usa sempre JSON format
  transport: undefined,
  // Livello info di default
  level: "info",
};

/**
 * Esempio di configurazione per Docker
 */
export const dockerConfig = {
  // In Docker, logga a stdout
  transport: undefined,
  // JSON format per facilità di parsing
  // Use container orchestration (K8s, Docker Compose) per log rotation
};
