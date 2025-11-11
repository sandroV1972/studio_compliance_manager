/**
 * Validation Helper
 * Funzione centralizzata per validare richieste con Zod
 */

import { NextResponse } from "next/server";
import { z, ZodError } from "zod";

/**
 * Valida il body di una richiesta con uno schema Zod
 * @param schema - Schema Zod per la validazione
 * @param data - Dati da validare
 * @returns Oggetto con success e data validati o errore
 */
export function validateRequest<T extends z.ZodType>(
  schema: T,
  data: unknown,
): {
  success: boolean;
  data?: z.infer<T>;
  error?: NextResponse;
  errorDetails?: Record<string, string[]>;
} {
  try {
    const validatedData = schema.parse(data);
    return {
      success: true,
      data: validatedData,
    };
  } catch (error) {
    if (error instanceof ZodError) {
      // Formatta gli errori Zod in modo user-friendly
      const formattedErrors = error.errors.reduce(
        (acc, err) => {
          const path = err.path.join(".");
          if (!acc[path]) {
            acc[path] = [];
          }
          acc[path].push(err.message);
          return acc;
        },
        {} as Record<string, string[]>,
      );

      return {
        success: false,
        errorDetails: formattedErrors,
        error: NextResponse.json(
          {
            error: "Dati non validi",
            details: formattedErrors,
          },
          { status: 400 },
        ),
      };
    }

    // Errore generico
    return {
      success: false,
      error: NextResponse.json(
        { error: "Errore di validazione" },
        { status: 400 },
      ),
    };
  }
}

/**
 * Valida query parameters
 */
export function validateQuery<T extends z.ZodType>(
  schema: T,
  searchParams: URLSearchParams,
): {
  success: boolean;
  data?: z.infer<T>;
  error?: NextResponse;
} {
  try {
    const params: Record<string, any> = {};
    searchParams.forEach((value, key) => {
      params[key] = value;
    });

    const validatedData = schema.parse(params);
    return {
      success: true,
      data: validatedData,
    };
  } catch (error) {
    if (error instanceof ZodError) {
      const formattedErrors = error.errors.reduce(
        (acc, err) => {
          const path = err.path.join(".");
          if (!acc[path]) {
            acc[path] = [];
          }
          acc[path].push(err.message);
          return acc;
        },
        {} as Record<string, string[]>,
      );

      return {
        success: false,
        error: NextResponse.json(
          {
            error: "Parametri query non validi",
            details: formattedErrors,
          },
          { status: 400 },
        ),
      };
    }

    return {
      success: false,
      error: NextResponse.json(
        { error: "Errore di validazione query" },
        { status: 400 },
      ),
    };
  }
}
