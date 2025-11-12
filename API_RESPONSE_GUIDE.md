# API Response Envelope - Guida all'implementazione

## Panoramica

Tutte le risposte API seguono un formato standardizzato (envelope) che rende più semplice la gestione lato client e fornisce informazioni consistenti su successo, errori e metadata.

## Formato Response Envelope

### Risposta di Successo

```typescript
{
  success: true,
  data: T,           // I dati effettivi della risposta
  meta?: {           // Metadata opzionali
    pagination?: {
      page: number,
      pageSize: number,
      total: number,
      totalPages: number
    },
    timestamp?: string,
    [key: string]: any
  }
}
```

### Risposta di Errore

```typescript
{
  success: false,
  error: {
    code: string,      // Codice errore machine-readable
    message: string,   // Messaggio user-friendly
    details?: any      // Dettagli aggiuntivi opzionali
  },
  meta?: {             // Metadata opzionali
    timestamp?: string,
    [key: string]: any
  }
}
```

## Codici di Errore Standard

```typescript
// Autenticazione (401)
UNAUTHORIZED;
SESSION_EXPIRED;
INVALID_CREDENTIALS;

// Autorizzazione (403)
FORBIDDEN;
INSUFFICIENT_PERMISSIONS;
ACCESS_DENIED;

// Validazione (400)
VALIDATION_ERROR;
INVALID_INPUT;
MISSING_REQUIRED_FIELD;

// Risorsa (404)
NOT_FOUND;
RESOURCE_NOT_FOUND;

// Business Logic (400, 409)
BUSINESS_LOGIC_ERROR;
DUPLICATE_ENTRY;
INVALID_STATUS;
CONSTRAINT_VIOLATION;

// Server (500)
INTERNAL_SERVER_ERROR;
DATABASE_ERROR;
SERVICE_UNAVAILABLE;
```

## Utilizzo nelle API Routes

### Import dei Helper

```typescript
import {
  createSuccessResponse,
  createErrorResponse,
  createPaginatedResponse,
  ErrorCodes,
} from "@/lib/api/response-envelope";
import { handleServiceError } from "@/lib/api/handle-service-error";
```

### Risposta di Successo Semplice

```typescript
export async function GET(request: Request) {
  try {
    const data = await someService.getData();

    return createSuccessResponse(data);
  } catch (error) {
    return handleServiceError(error, logger);
  }
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "123",
    "name": "Example"
  }
}
```

### Risposta di Successo con Metadata

```typescript
export async function POST(request: Request) {
  try {
    const created = await someService.create(data);

    return createSuccessResponse(
      created,
      { timestamp: new Date().toISOString() },
      201, // Status code personalizzato
    );
  } catch (error) {
    return handleServiceError(error, logger);
  }
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "123",
    "name": "New Item"
  },
  "meta": {
    "timestamp": "2025-11-12T12:00:00.000Z"
  }
}
```

### Risposta Paginata

```typescript
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "20");

    const { items, total } = await someService.getItems({ page, pageSize });

    return createPaginatedResponse(items, {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    return handleServiceError(error, logger);
  }
}
```

**Response:**

```json
{
  "success": true,
  "data": [
    { "id": "1", "name": "Item 1" },
    { "id": "2", "name": "Item 2" }
  ],
  "meta": {
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "total": 42,
      "totalPages": 3
    },
    "timestamp": "2025-11-12T12:00:00.000Z"
  }
}
```

### Risposta di Errore Manuale

```typescript
export async function POST(request: Request) {
  const session = await auth();

  // Verifica autenticazione
  if (!session?.user?.id) {
    return createErrorResponse(ErrorCodes.UNAUTHORIZED, "Non autorizzato", 401);
  }

  // Verifica autorizzazione
  if (!session.user.isSuperAdmin) {
    return createErrorResponse(
      ErrorCodes.FORBIDDEN,
      "Non hai i permessi necessari",
      403,
    );
  }

  // Validazione input
  if (!body.name) {
    return createErrorResponse(
      ErrorCodes.MISSING_REQUIRED_FIELD,
      "Il campo 'name' è obbligatorio",
      400,
      { field: "name" }, // Details opzionali
    );
  }

  try {
    const result = await someService.doSomething(body);
    return createSuccessResponse(result);
  } catch (error) {
    return handleServiceError(error, logger);
  }
}
```

**Error Response:**

```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Non autorizzato"
  }
}
```

### Gestione Automatica Errori Service

Il `handleServiceError` converte automaticamente i `ServiceError` in risposte con envelope:

```typescript
try {
  const result = await userService.approveUser({ userId, adminUserId });
  return createSuccessResponse(result);
} catch (error) {
  // handleServiceError gestisce automaticamente:
  // - ServiceError (ValidationError, NotFoundError, etc.)
  // - Errori Prisma
  // - Errori generici
  return handleServiceError(error, logger);
}
```

## Pattern di Migrazione

### Prima (senza envelope)

```typescript
export async function GET() {
  try {
    const data = await service.getData();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Errore" }, { status: 500 });
  }
}
```

### Dopo (con envelope)

```typescript
export async function GET() {
  try {
    const data = await service.getData();
    return createSuccessResponse(data);
  } catch (error) {
    return handleServiceError(error, logger);
  }
}
```

### Prima (errori manuali)

```typescript
if (!session?.user) {
  return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
}
```

### Dopo (errori con envelope)

```typescript
if (!session?.user) {
  return createErrorResponse(ErrorCodes.UNAUTHORIZED, "Non autorizzato", 401);
}
```

## Client-Side Usage

### TypeScript Client

```typescript
import type {
  ApiResponse,
  SuccessResponse,
  ErrorResponse,
} from "@/lib/api/response-envelope";

async function fetchPermissions(): Promise<UserPermissions> {
  const response = await fetch("/api/user/permissions");
  const result: ApiResponse<UserPermissions> = await response.json();

  if (result.success) {
    return result.data;
  } else {
    throw new Error(result.error.message);
  }
}
```

### Con Type Guard

```typescript
function isSuccessResponse<T>(
  response: ApiResponse<T>,
): response is SuccessResponse<T> {
  return response.success === true;
}

const result = await fetch("/api/data").then((r) => r.json());

if (isSuccessResponse(result)) {
  console.log("Data:", result.data);
} else {
  console.error("Error:", result.error.code, result.error.message);
}
```

### React Hook Example

```typescript
function useApiData<T>(url: string) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(url)
      .then((r) => r.json())
      .then((result: ApiResponse<T>) => {
        if (result.success) {
          setData(result.data);
        } else {
          setError(result.error.message);
        }
      })
      .finally(() => setLoading(false));
  }, [url]);

  return { data, error, loading };
}
```

## Vantaggi

1. **Consistenza**: Tutte le API hanno lo stesso formato
2. **Type Safety**: Tipi TypeScript forti per client e server
3. **Error Handling**: Gestione errori standardizzata e prevedibile
4. **Metadata**: Supporto built-in per paginazione e altre info
5. **Debugging**: Codici errore machine-readable per log e monitoring
6. **Client UX**: Messaggi user-friendly separati da codici tecnici

## Checklist Migrazione Endpoint

- [ ] Import helper da `response-envelope`
- [ ] Sostituire `NextResponse.json(data)` con `createSuccessResponse(data)`
- [ ] Sostituire errori manuali con `createErrorResponse()`
- [ ] Usare `handleServiceError()` nel catch
- [ ] Aggiungere metadata se appropriato (timestamp, pagination)
- [ ] Testare response format nel client
- [ ] Aggiornare tipi TypeScript nel client

## Note

- Gli errori di validazione Zod sono automaticamente gestiti dai services
- I ServiceError sono automaticamente convertiti in formato envelope
- Gli errori Prisma sono riconosciuti e wrappati con codice appropriato
- Tutti gli errori sono loggati con Pino prima di essere ritornati
