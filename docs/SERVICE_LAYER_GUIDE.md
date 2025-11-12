# Service Layer Implementation Guide

## 🎯 Cosa Abbiamo Implementato

Abbiamo creato un **Business Logic Layer** completo con il pattern Service-DTO-Error, partendo con `DeadlineService` come esempio.

### Struttura Creata

```
lib/
├── services/
│   └── deadline-service.ts          ✅ Service per deadline logic
├── dto/
│   └── deadline.dto.ts               ✅ Data Transfer Objects
├── errors/
│   ├── service-errors.ts             ✅ Custom error classes
│   └── index.ts                      ✅ Error exports
├── api/
│   └── handle-service-error.ts       ✅ Helper per gestire errori nelle API routes
└── logger.ts                         ✅ Logger già esistente

app/api/organizations/[id]/deadlines/
└── route.service-example.ts          ✅ Esempio di route refactorata

scripts/
└── test-deadline-service.ts          ✅ Script di test manuale
```

## 📖 Come Usare il DeadlineService

### 1. Nelle API Routes (Recommended)

```typescript
import { deadlineService } from "@/lib/services/deadline-service";
import { handleServiceError } from "@/lib/api/handle-service-error";

export async function POST(request: Request) {
  try {
    // 1. Autenticazione e autorizzazione
    const session = await auth();
    // ... verifiche permessi

    // 2. Parse input
    const body = await request.json();

    // 3. Chiama il service (tutta la business logic)
    const deadline = await deadlineService.createDeadline({
      organizationId,
      userId: session.user.id,
      data: body,
    });

    // 4. Return response
    return NextResponse.json({ deadline }, { status: 201 });
  } catch (error) {
    // 5. Gestione errori centralizzata
    return handleServiceError(error, logger);
  }
}
```

### 2. In Server Actions

```typescript
"use server";

import { deadlineService } from "@/lib/services/deadline-service";
import { auth } from "@/lib/auth";

export async function createDeadlineAction(data: any) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  // Stessa business logic, context diverso
  const deadline = await deadlineService.createDeadline({
    organizationId: data.organizationId,
    userId: session.user.id,
    data,
  });

  return { deadline };
}
```

### 3. In Script/Cron Jobs

```typescript
import { deadlineService } from "@/lib/services/deadline-service";

// Genera deadlines ricorrenti
async function generateRecurringDeadlines() {
  const deadlines = await deadlineService.getDeadlines({
    organizationId: "org-123",
    status: "PENDING",
    upcoming: true,
  });

  for (const deadline of deadlines.deadlines) {
    // Process...
  }
}
```

## 🧪 Come Testare

### Test Manuali (Immediate)

```bash
# Esegui lo script di test
npx tsx scripts/test-deadline-service.ts
```

### Unit Tests (Recommended per produzione)

Crea `__tests__/services/deadline-service.test.ts`:

```typescript
import { DeadlineService } from "@/lib/services/deadline-service";
import { ValidationError, NotFoundError } from "@/lib/errors";

// Mock Prisma
const mockPrisma = {
  deadlineInstance: {
    create: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  // ... altri mock
};

describe("DeadlineService", () => {
  let service: DeadlineService;

  beforeEach(() => {
    service = new DeadlineService(mockPrisma as any);
  });

  test("createDeadline - should throw ValidationError for invalid data", async () => {
    await expect(
      service.createDeadline({
        organizationId: "org-123",
        userId: "user-456",
        data: { title: "", dueDate: new Date() } as any,
      }),
    ).rejects.toThrow(ValidationError);
  });

  test("createDeadline - should create deadline successfully", async () => {
    mockPrisma.deadlineInstance.create.mockResolvedValue({
      id: "deadline-123",
      title: "Test Deadline",
      // ... altri campi
    });

    const result = await service.createDeadline({
      organizationId: "org-123",
      userId: "user-456",
      data: {
        title: "Test Deadline",
        dueDate: new Date(),
      },
    });

    expect(result.id).toBe("deadline-123");
    expect(mockPrisma.deadlineInstance.create).toHaveBeenCalled();
  });
});
```

## 🔄 Piano di Refactoring Graduale

### Phase 1: DeadlineService ✅ (COMPLETATO)

- [x] Error classes
- [x] DTO definitions
- [x] DeadlineService implementation
- [x] Error handler helper
- [x] Esempio route refactorata
- [x] Test script

### Phase 2: Refactor Deadline Routes (PROSSIMO PASSO)

Refactorare queste routes per usare DeadlineService:

1. **POST /api/organizations/[id]/deadlines** (creare deadline)
   - File: `app/api/organizations/[id]/deadlines/route.ts`
   - Metodo: `POST`
   - Usa: `deadlineService.createDeadline()`

2. **PATCH /api/organizations/[id]/deadlines/[deadlineId]** (aggiornare deadline)
   - File: `app/api/organizations/[id]/deadlines/[deadlineId]/route.ts`
   - Metodo: `PATCH`
   - Usa: `deadlineService.updateDeadline()`

3. **GET /api/organizations/[id]/deadlines/[deadlineId]** (ottenere deadline)
   - File: `app/api/organizations/[id]/deadlines/[deadlineId]/route.ts`
   - Metodo: `GET`
   - Usa: `deadlineService.getDeadline()`

4. **DELETE /api/organizations/[id]/deadlines/[deadlineId]** (eliminare deadline)
   - File: `app/api/organizations/[id]/deadlines/[deadlineId]/route.ts`
   - Metodo: `DELETE`
   - Usa: `deadlineService.deleteDeadline()`

5. **GET /api/organizations/[id]/deadlines** (lista deadlines)
   - File: `app/api/organizations/[id]/deadlines/route.ts`
   - Metodo: `GET`
   - Usa: `deadlineService.getDeadlines()`

### Phase 3: Altri Services (Futuri)

Dopo aver completato le deadline routes, creare:

1. **DocumentService**
   - `lib/services/document-service.ts`
   - `lib/dto/document.dto.ts`
   - Gestisce upload, download, validazione documenti

2. **TemplateService**
   - `lib/services/template-service.ts`
   - `lib/dto/template.dto.ts`
   - Gestisce template globali e organizzazione

3. **StructureService**
   - `lib/services/structure-service.ts`
   - `lib/dto/structure.dto.ts`
   - Gestisce strutture e gerarchie

4. **UserService**
   - `lib/services/user-service.ts`
   - `lib/dto/user.dto.ts`
   - Gestisce utenti, ruoli, permessi

## 📝 Checklist per Refactoring di una Route

Quando refactori una route per usare un service:

- [ ] **Identifica la business logic** - Cosa fa la route oltre a HTTP?
- [ ] **Crea metodo nel service** - Sposta la logica nel service
- [ ] **Aggiungi validazione** - Usa Zod schema nel service
- [ ] **Aggiungi logging** - Usa logger strutturato nel service
- [ ] **Gestisci errori** - Lancia ServiceError appropriati
- [ ] **Semplifica la route** - Mantieni solo: auth, authz, parsing, service call, response
- [ ] **Testa** - Scrivi unit test per il service
- [ ] **Verifica** - Testa l'endpoint tramite Postman/curl

## ✅ Vantaggi che Otteniamo

### Prima (route.ts - 150 righe)

```typescript
export async function POST() {
  // 30 righe: auth + authz
  // 40 righe: validazione input
  // 30 righe: verifica relazioni (person, structure, template)
  // 25 righe: creazione deadline
  // 15 righe: generazione ricorrenze
  // 10 righe: audit log
  // = 150 righe, tutto mescolato
}
```

### Dopo (route.service-example.ts - 50 righe)

```typescript
export async function POST() {
  // 10 righe: auth + authz
  // 5 righe: parsing
  // 3 righe: service call
  // 2 righe: response
  // 3 righe: error handling
  // = 23 righe effettive, chiare e pulite
}
```

**Business logic (127 righe) è ora in DeadlineService:**

- Testabile in isolamento
- Riusabile in context diversi
- Manutenibile centralmente

## 🚀 Come Procedere

### Opzione A: Refactoring Graduale (Recommended)

1. Prendi una route alla volta
2. Crea il metodo nel service
3. Refactora la route per usarlo
4. Testa che tutto funzioni
5. Passa alla prossima route
6. **Non toccare le vecchie routes fino a che non sei sicuro**

### Opzione B: Big Bang (Rischioso)

1. Crea tutti i services
2. Refactora tutte le routes insieme
3. Rischio alto di breaking changes

**Raccomandazione: Usa Opzione A**

## 🔍 Debugging

### Service Logs

Il service usa il logger strutturato:

```typescript
// In development
logger.info({ msg: "Creating deadline", organizationId, userId });
// Output: [INFO] Creating deadline organizationId=org-123 userId=user-456

// In production (JSON)
{"level":30,"msg":"Creating deadline","organizationId":"org-123","userId":"user-456"}
```

### Error Tracing

Gli errori del service includono stack trace completo:

```typescript
try {
  await deadlineService.createDeadline(input);
} catch (error) {
  if (error instanceof ValidationError) {
    console.log(error.message); // "Dati deadline non validi"
    console.log(error.statusCode); // 400
    console.log(error.code); // "VALIDATION_ERROR"
    console.log(error.stack); // Full stack trace
  }
}
```

## 📚 Risorse Aggiuntive

### File di Riferimento

- `lib/services/deadline-service.ts` - Implementazione completa
- `app/api/organizations/[id]/deadlines/route.service-example.ts` - Esempio route
- `scripts/test-deadline-service.ts` - Test script
- `docs/LOGGING.md` - Guida al logging

### Pattern Usati

- **Service Layer Pattern** - Business logic isolata
- **DTO Pattern** - Input/Output tipizzati
- **Custom Errors** - Error handling strutturato
- **Dependency Injection** - Service riceve PrismaClient nel constructor

### Testing

- **Unit Tests** - Test del service in isolamento con mock
- **Integration Tests** - Test dell'API route completa
- **Manual Tests** - Script tsx per test rapidi

## ❓ FAQ

**Q: Devo refactorare tutto subito?**
A: No! Inizia con 1-2 routes, testa il pattern, poi procedi.

**Q: Cosa faccio con la logica già esistente?**
A: Lasciala com'è finché non hai tempo di refactorare. Il vecchio codice continua a funzionare.

**Q: Come testo il service senza database?**
A: Usa Jest/Vitest con mock di Prisma (vedi esempio sopra).

**Q: Posso usare il service in Server Components?**
A: Sì! Importa e usa direttamente in Server Components.

**Q: Devo sempre creare un DTO?**
A: Sì, aiuta con type safety e rende chiaro cosa il service si aspetta.

## 🎉 Prossimi Passi

1. **Rivedi** `route.service-example.ts` per capire il pattern
2. **Esegui** `npx tsx scripts/test-deadline-service.ts` per vedere gli errori in azione
3. **Scegli** una route da refactorare (inizia con POST deadlines)
4. **Refactora** seguendo l'esempio
5. **Testa** tramite Postman/curl
6. **Ripeti** per le altre routes

Buon refactoring! 🚀
