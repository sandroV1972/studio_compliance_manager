import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(
  date: Date | string,
  format: "short" | "long" = "short",
): string {
  const d = typeof date === "string" ? new Date(date) : date;

  if (format === "long") {
    return new Intl.DateTimeFormat("it-IT", {
      dateStyle: "long",
      timeZone: "Europe/Rome",
    }).format(d);
  }

  return new Intl.DateTimeFormat("it-IT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "Europe/Rome",
  }).format(d);
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;

  return new Intl.DateTimeFormat("it-IT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Rome",
  }).format(d);
}

export function getDaysUntil(date: Date | string): number {
  const target = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diff = target.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function getDeadlineStatusColor(status: string): string {
  switch (status) {
    case "COMPLETED":
      return "text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-950";
    case "OVERDUE":
      return "text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-950";
    case "CANCELLED":
      return "text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-950";
    default:
      return "text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-950";
  }
}

export function getDeadlineUrgencyColor(daysUntil: number): string {
  if (daysUntil < 0) return "text-red-600";
  if (daysUntil <= 7) return "text-orange-600";
  if (daysUntil <= 30) return "text-yellow-600";
  return "text-gray-600";
}

/**
 * Valida un codice fiscale italiano
 * @param fiscalCode - Il codice fiscale da validare
 * @returns true se il codice fiscale è formalmente corretto
 */
export function validateFiscalCode(fiscalCode: string): boolean {
  if (!fiscalCode) return false;

  // Normalizza in maiuscolo e rimuovi spazi
  const code = fiscalCode.toUpperCase().trim();

  // Verifica lunghezza (16 caratteri)
  if (code.length !== 16) return false;

  // Pattern del codice fiscale italiano:
  // 6 lettere (cognome e nome) + 2 numeri (anno) + 1 lettera (mese) + 2 numeri (giorno e sesso) +
  // 1 lettera + 3 numeri (comune) + 1 lettera (carattere di controllo)
  const fiscalCodePattern = /^[A-Z]{6}[0-9]{2}[A-Z][0-9]{2}[A-Z][0-9]{3}[A-Z]$/;

  if (!fiscalCodePattern.test(code)) return false;

  // Verifica del carattere di controllo
  const evenMap: Record<string, number> = {
    "0": 0,
    "1": 1,
    "2": 2,
    "3": 3,
    "4": 4,
    "5": 5,
    "6": 6,
    "7": 7,
    "8": 8,
    "9": 9,
    A: 0,
    B: 1,
    C: 2,
    D: 3,
    E: 4,
    F: 5,
    G: 6,
    H: 7,
    I: 8,
    J: 9,
    K: 10,
    L: 11,
    M: 12,
    N: 13,
    O: 14,
    P: 15,
    Q: 16,
    R: 17,
    S: 18,
    T: 19,
    U: 20,
    V: 21,
    W: 22,
    X: 23,
    Y: 24,
    Z: 25,
  };

  const oddMap: Record<string, number> = {
    "0": 1,
    "1": 0,
    "2": 5,
    "3": 7,
    "4": 9,
    "5": 13,
    "6": 15,
    "7": 17,
    "8": 19,
    "9": 21,
    A: 1,
    B: 0,
    C: 5,
    D: 7,
    E: 9,
    F: 13,
    G: 15,
    H: 17,
    I: 19,
    J: 21,
    K: 2,
    L: 4,
    M: 18,
    N: 20,
    O: 11,
    P: 3,
    Q: 6,
    R: 8,
    S: 12,
    T: 14,
    U: 16,
    V: 10,
    W: 22,
    X: 25,
    Y: 24,
    Z: 23,
  };

  let sum = 0;
  for (let i = 0; i < 15; i++) {
    const char = code[i];
    if (i % 2 === 0) {
      // Posizione dispari (0-indexed, quindi pari nel codice fiscale)
      sum += oddMap[char] || 0;
    } else {
      // Posizione pari (0-indexed, quindi dispari nel codice fiscale)
      sum += evenMap[char] || 0;
    }
  }

  const checkChar = String.fromCharCode(65 + (sum % 26));
  return code[15] === checkChar;
}
