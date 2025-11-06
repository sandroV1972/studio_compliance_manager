import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string, format: "short" | "long" = "short"): string {
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
    case "DONE":
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
