/**
 * API Client Helper
 * Utility per chiamare API con envelope standardizzato
 */

import type {
  ApiResponse,
  SuccessResponse,
  ErrorResponse,
} from "./response-envelope";

/**
 * Errore API custom che include code e details
 */
export class ApiError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly details?: any,
    public readonly status?: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * Type guard per verificare se la risposta è un successo
 */
export function isSuccessResponse<T>(
  response: ApiResponse<T>,
): response is SuccessResponse<T> {
  return response.success === true;
}

/**
 * Type guard per verificare se la risposta è un errore
 */
export function isErrorResponse(
  response: ApiResponse<any>,
): response is ErrorResponse {
  return response.success === false;
}

/**
 * Opzioni per fetch API
 */
export interface ApiFetchOptions extends RequestInit {
  baseUrl?: string;
  params?: Record<string, string | number | boolean>;
}

/**
 * Helper per costruire URL con query parameters
 */
function buildUrl(
  path: string,
  params?: Record<string, string | number | boolean>,
  baseUrl?: string,
): string {
  const base = baseUrl || "";
  const url = new URL(path, base || window.location.origin);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, String(value));
    });
  }

  return url.toString();
}

/**
 * Wrapper per fetch che gestisce automaticamente l'envelope
 * Lancia ApiError in caso di errore
 */
export async function apiFetch<T>(
  path: string,
  options?: ApiFetchOptions,
): Promise<T> {
  const { baseUrl, params, ...fetchOptions } = options || {};

  const url = buildUrl(path, params, baseUrl);

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      headers: {
        "Content-Type": "application/json",
        ...fetchOptions.headers,
      },
    });

    const result: ApiResponse<T> = await response.json();

    if (isSuccessResponse(result)) {
      return result.data;
    } else {
      throw new ApiError(
        result.error.code,
        result.error.message,
        result.error.details,
        response.status,
      );
    }
  } catch (error) {
    // Se è già un ApiError, rilancialo
    if (error instanceof ApiError) {
      throw error;
    }

    // Errore di rete o parsing
    throw new ApiError(
      "NETWORK_ERROR",
      error instanceof Error ? error.message : "Errore di rete",
      undefined,
      0,
    );
  }
}

/**
 * Wrapper che ritorna l'intera risposta (success + data + meta)
 * invece di solo data
 */
export async function apiFetchRaw<T>(
  path: string,
  options?: ApiFetchOptions,
): Promise<ApiResponse<T>> {
  const { baseUrl, params, ...fetchOptions } = options || {};

  const url = buildUrl(path, params, baseUrl);

  const response = await fetch(url, {
    ...fetchOptions,
    headers: {
      "Content-Type": "application/json",
      ...fetchOptions.headers,
    },
  });

  return response.json();
}

/**
 * Helper per GET request
 */
export function apiGet<T>(
  path: string,
  params?: Record<string, string | number | boolean>,
  options?: Omit<ApiFetchOptions, "method" | "params">,
): Promise<T> {
  return apiFetch<T>(path, {
    ...options,
    method: "GET",
    params,
  });
}

/**
 * Helper per POST request
 */
export function apiPost<T>(
  path: string,
  body?: any,
  options?: Omit<ApiFetchOptions, "method" | "body">,
): Promise<T> {
  return apiFetch<T>(path, {
    ...options,
    method: "POST",
    body: body ? JSON.stringify(body) : undefined,
  });
}

/**
 * Helper per PATCH request
 */
export function apiPatch<T>(
  path: string,
  body?: any,
  options?: Omit<ApiFetchOptions, "method" | "body">,
): Promise<T> {
  return apiFetch<T>(path, {
    ...options,
    method: "PATCH",
    body: body ? JSON.stringify(body) : undefined,
  });
}

/**
 * Helper per DELETE request
 */
export function apiDelete<T>(
  path: string,
  options?: Omit<ApiFetchOptions, "method">,
): Promise<T> {
  return apiFetch<T>(path, {
    ...options,
    method: "DELETE",
  });
}

/**
 * Helper per gestire errori in try-catch
 */
export function handleApiError(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Si è verificato un errore sconosciuto";
}

/**
 * Hook-ready function per React
 * Ritorna un oggetto con { data, error, isLoading }
 */
export async function apiRequest<T>(
  path: string,
  options?: ApiFetchOptions,
): Promise<{
  data: T | null;
  error: ApiError | null;
  response: ApiResponse<T>;
}> {
  try {
    const response = await apiFetchRaw<T>(path, options);

    if (isSuccessResponse(response)) {
      return {
        data: response.data,
        error: null,
        response,
      };
    } else {
      return {
        data: null,
        error: new ApiError(
          response.error.code,
          response.error.message,
          response.error.details,
        ),
        response,
      };
    }
  } catch (error) {
    const apiError =
      error instanceof ApiError
        ? error
        : new ApiError(
            "NETWORK_ERROR",
            error instanceof Error ? error.message : "Errore di rete",
          );

    return {
      data: null,
      error: apiError,
      response: {
        success: false,
        error: {
          code: apiError.code,
          message: apiError.message,
          details: apiError.details,
        },
      },
    };
  }
}
