# API Client - Esempi di Utilizzo

## Import

```typescript
import {
  apiGet,
  apiPost,
  apiPatch,
  apiDelete,
  apiFetch,
  apiFetchRaw,
  ApiError,
  handleApiError,
} from "@/lib/api/api-client";
```

## Esempi Base

### GET Request

```typescript
// Semplice GET
const permissions = await apiGet<UserPermissions>("/api/user/permissions");

// GET con query parameters
const structures = await apiGet<Structure[]>(
  "/api/organizations/123/structures",
  {
    active: true,
    region: "Lombardia",
  },
);
```

### POST Request

```typescript
// Crea nuovo utente
const user = await apiPost<User>("/api/admin/users/approve", {
  userId: "123",
});

// Crea struttura
const structure = await apiPost<Structure>("/api/structures", {
  name: "Nuova Struttura",
  city: "Milano",
  province: "MI",
});
```

### PATCH Request

```typescript
// Aggiorna profilo
const updatedUser = await apiPatch<User>("/api/user/profile", {
  name: "Nuovo Nome",
  currentPassword: "old123",
  newPassword: "new456",
});

// Aggiorna struttura
const updated = await apiPatch<Structure>("/api/structures/123", {
  name: "Nome Aggiornato",
});
```

### DELETE Request

```typescript
// Elimina utente
await apiDelete("/api/admin/users/123");

// Elimina template
await apiDelete("/api/organizations/123/deadline-templates/456");
```

## Gestione Errori

### Try-Catch Base

```typescript
try {
  const data = await apiGet<UserPermissions>("/api/user/permissions");
  console.log("Permessi:", data);
} catch (error) {
  if (error instanceof ApiError) {
    console.error("Codice:", error.code);
    console.error("Messaggio:", error.message);
    console.error("Dettagli:", error.details);
    console.error("Status:", error.status);
  } else {
    console.error("Errore sconosciuto:", error);
  }
}
```

### Con Helper handleApiError

```typescript
try {
  const user = await apiPost("/api/admin/users/approve", { userId: "123" });
  toast.success("Utente approvato con successo");
} catch (error) {
  const message = handleApiError(error);
  toast.error(message);
}
```

### Gestione Errori Specifici

```typescript
try {
  await apiDelete("/api/structures/123");
} catch (error) {
  if (error instanceof ApiError) {
    switch (error.code) {
      case "UNAUTHORIZED":
        router.push("/auth/login");
        break;
      case "FORBIDDEN":
        toast.error("Non hai i permessi necessari");
        break;
      case "NOT_FOUND":
        toast.error("Struttura non trovata");
        break;
      default:
        toast.error(error.message);
    }
  }
}
```

## React Hooks

### Hook Custom Base

```typescript
import { useState, useEffect } from 'react';
import { apiGet, ApiError } from '@/lib/api/api-client';

function useApi<T>(url: string) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet<T>(url)
      .then(setData)
      .catch(err => {
        if (err instanceof ApiError) {
          setError(err);
        }
      })
      .finally(() => setLoading(false));
  }, [url]);

  return { data, error, loading };
}

// Utilizzo
function PermissionsComponent() {
  const { data, error, loading } = useApi<UserPermissions>('/api/user/permissions');

  if (loading) return <Spinner />;
  if (error) return <ErrorMessage message={error.message} />;
  if (!data) return null;

  return <div>Role: {data.role}</div>;
}
```

### Hook con Refetch

```typescript
function useApiWithRefetch<T>(url: string) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    setLoading(true);
    try {
      const result = await apiGet<T>(url);
      setData(result);
      setError(null);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err);
      }
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, error, loading, refetch };
}
```

### Hook per Mutation (POST/PATCH/DELETE)

```typescript
function useApiMutation<TRequest, TResponse>(
  method: 'POST' | 'PATCH' | 'DELETE',
  url: string
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const mutate = async (data?: TRequest): Promise<TResponse | null> => {
    setLoading(true);
    setError(null);

    try {
      let result: TResponse;

      if (method === 'POST') {
        result = await apiPost<TResponse>(url, data);
      } else if (method === 'PATCH') {
        result = await apiPatch<TResponse>(url, data);
      } else {
        result = await apiDelete<TResponse>(url);
      }

      return result;
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err);
      }
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { mutate, loading, error };
}

// Utilizzo
function ApproveUserButton({ userId }: { userId: string }) {
  const { mutate, loading, error } = useApiMutation<
    { userId: string },
    User
  >('POST', '/api/admin/users/approve');

  const handleApprove = async () => {
    const result = await mutate({ userId });
    if (result) {
      toast.success('Utente approvato!');
    }
  };

  return (
    <>
      <button onClick={handleApprove} disabled={loading}>
        {loading ? 'Approvazione...' : 'Approva'}
      </button>
      {error && <ErrorMessage message={error.message} />}
    </>
  );
}
```

## Casi d'Uso Avanzati

### Paginazione

```typescript
interface PaginatedStructures {
  structures: Structure[];
}

async function fetchStructuresPage(page: number, pageSize: number = 20) {
  // apiFetchRaw ritorna l'intera risposta con meta
  const response = await apiFetchRaw<PaginatedStructures>(
    "/api/organizations/123/structures",
    {
      params: { page, pageSize },
    },
  );

  if (response.success) {
    return {
      data: response.data.structures,
      pagination: response.meta?.pagination,
    };
  }

  throw new ApiError(
    response.error.code,
    response.error.message,
    response.error.details,
  );
}

// Utilizzo
const { data, pagination } = await fetchStructuresPage(1, 20);
console.log(`Pagina 1 di ${pagination?.totalPages}`);
```

### Form Submission con Validazione

```typescript
async function handleFormSubmit(formData: StructureFormData) {
  try {
    setSubmitting(true);
    setErrors({});

    const structure = await apiPost<Structure>("/api/structures", formData);

    toast.success("Struttura creata con successo!");
    router.push(`/structures/${structure.id}`);
  } catch (error) {
    if (error instanceof ApiError) {
      // Errore di validazione - mostra errori sui campi
      if (error.code === "VALIDATION_ERROR" && error.details?.fields) {
        setErrors(error.details.fields);
      } else {
        // Altri errori - mostra toast
        toast.error(error.message);
      }
    }
  } finally {
    setSubmitting(false);
  }
}
```

### Retry Logic

```typescript
async function fetchWithRetry<T>(
  path: string,
  maxRetries: number = 3,
): Promise<T> {
  let lastError: ApiError | null = null;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await apiGet<T>(path);
    } catch (error) {
      if (error instanceof ApiError) {
        lastError = error;

        // Non ritentare per errori client (4xx)
        if (error.status && error.status >= 400 && error.status < 500) {
          throw error;
        }

        // Aspetta prima di ritentare (exponential backoff)
        if (i < maxRetries - 1) {
          await new Promise((resolve) =>
            setTimeout(resolve, Math.pow(2, i) * 1000),
          );
        }
      }
    }
  }

  throw lastError || new ApiError("MAX_RETRIES", "Max retries raggiunto");
}
```

### Batch Requests

```typescript
async function fetchMultipleResources() {
  try {
    const [permissions, organization, structures] = await Promise.all([
      apiGet<UserPermissions>("/api/user/permissions"),
      apiGet<Organization>("/api/user/organization"),
      apiGet<Structure[]>("/api/organizations/123/structures"),
    ]);

    return { permissions, organization, structures };
  } catch (error) {
    console.error("Errore nel caricamento:", handleApiError(error));
    throw error;
  }
}
```

### Timeout

```typescript
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error("Request timeout")), ms),
  );

  return Promise.race([promise, timeout]);
}

// Utilizzo
try {
  const data = await withTimeout(
    apiGet<UserPermissions>("/api/user/permissions"),
    5000, // 5 secondi timeout
  );
} catch (error) {
  console.error("Timeout o errore:", error);
}
```

## Testing

### Mock per Testing

```typescript
// __tests__/api-client.test.ts
import { apiGet, ApiError } from "@/lib/api/api-client";

// Mock fetch
global.fetch = jest.fn();

describe("apiGet", () => {
  it("should return data on success", async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => ({
        success: true,
        data: { id: "123", name: "Test" },
      }),
    });

    const result = await apiGet("/api/test");
    expect(result).toEqual({ id: "123", name: "Test" });
  });

  it("should throw ApiError on failure", async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      status: 404,
      json: async () => ({
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Risorsa non trovata",
        },
      }),
    });

    await expect(apiGet("/api/test")).rejects.toThrow(ApiError);
  });
});
```

## Best Practices

1. **Type Safety**: Specifica sempre il tipo di ritorno `apiGet<Type>`
2. **Error Handling**: Gestisci sempre gli errori con try-catch
3. **User Feedback**: Mostra toast/notifiche per successo ed errore
4. **Loading States**: Mostra loader durante le richieste
5. **Retry Logic**: Implementa retry solo per errori 5xx
6. **Timeout**: Aggiungi timeout per evitare richieste infinite
7. **Validation**: Gestisci errori di validazione mostrando errori sui campi
8. **Authentication**: Reindirizza al login per errori UNAUTHORIZED
9. **Logging**: Logga gli errori per debugging
10. **Testing**: Mock fetch e testa tutti i casi (success, error, network error)
