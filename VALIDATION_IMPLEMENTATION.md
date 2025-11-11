# Zod Validation Implementation Guide

## ✅ Completamente Implementato

### Setup Base

- ✅ Zod installato (`npm install zod --legacy-peer-deps`)
- ✅ Schema comuni creati (`lib/validation/common.ts`)
- ✅ Schema auth creati (`lib/validation/auth.ts`)
- ✅ Schema deadline creati (`lib/validation/deadline.ts`)
- ✅ Schema template creati (`lib/validation/template.ts`)
- ✅ Schema structure creati (`lib/validation/structure.ts`)
- ✅ Schema person creati (`lib/validation/person.ts`)
- ✅ Helper di validazione (`lib/validation/validate.ts`)
- ✅ Index per export (`lib/validation/index.ts`)

### Endpoint Auth (Alta Priorità)

- ✅ `/api/auth/register` - Validazione con `registerSchema`
- ✅ `/api/auth/check-account` - Validazione con `loginSchema`
- ✅ `/api/auth/forgot-password` - Validazione con `forgotPasswordSchema`
- ✅ `/api/auth/reset-password` - Validazione con `resetPasswordSchema`
- ✅ `/api/auth/resend-verification` - Validazione con `loginSchema`

### Endpoint Template (Media Priorità)

- ✅ `/api/organizations/[id]/deadline-templates` (POST) - Validazione con `createTemplateSchema`
- ✅ `/api/organizations/[id]/deadline-templates/[templateId]` (PATCH) - Validazione con `updateTemplateSchema`

### Endpoint Deadline (Media Priorità)

- ✅ `/api/organizations/[id]/deadlines` (POST) - Validazione con `createDeadlineSchema`
- ✅ `/api/organizations/[id]/deadlines/[deadlineId]` (PATCH) - Validazione con `updateDeadlineSchema`
- ✅ `/api/organizations/[id]/deadlines/generate-from-template` (POST) - Validazione con `generateFromTemplateSchema`

## 📋 Da Implementare (Bassa Priorità)

### Endpoint CRUD Standard

Questi endpoint hanno priorità bassa perché sono meno critici e seguono pattern standard:

#### Structures

- [ ] `/api/organizations/[id]/structures` (POST) - Usare `createStructureSchema`
- [ ] `/api/organizations/[id]/structures/[structureId]` (PATCH) - Usare `updateStructureSchema`

#### People

- [ ] `/api/organizations/[id]/people` (POST) - Usare `createPersonSchema`
- [ ] `/api/organizations/[id]/people/[personId]` (PATCH) - Usare `updatePersonSchema`

#### Altri Endpoint

- [ ] Endpoint di lettura (GET) - Non richiedono validazione del body
- [ ] Endpoint di eliminazione (DELETE) - Validano solo parametri URL

## 📚 Schema Disponibili

### Common (`lib/validation/common.ts`)

Schema riutilizzabili per tutti gli endpoint:

- `emailSchema` - Email valida, lowercase, trimmed
- `passwordSchema` - Password min 8 caratteri
- `uuidSchema` - UUID valido
- `nameSchema` - Nome 1-255 caratteri
- `descriptionSchema` - Descrizione opzionale fino a 2000 caratteri
- `dateISOSchema` - Data in formato ISO
- `complianceTypeSchema` - Enum per tipi di compliance
- `prioritySchema` - Enum per priorità
- `deadlineStatusSchema` - Enum per stati deadline
- `provinceCodeSchema` - Codice provincia italiano (2 lettere)
- `phoneSchema` - Numero di telefono italiano
- `codiceFiscaleSchema` - Codice fiscale italiano (16 caratteri)
- E molti altri...

### Auth (`lib/validation/auth.ts`)

- `registerSchema` - Registrazione utente
- `loginSchema` - Login utente
- `forgotPasswordSchema` - Richiesta reset password
- `resetPasswordSchema` - Reset password con token

### Deadline (`lib/validation/deadline.ts`)

- `reminderSchema` - Schema per reminder di scadenze
- `createDeadlineSchema` - Creazione scadenza manuale
- `updateDeadlineSchema` - Aggiornamento scadenza
- `generateFromTemplateSchema` - Generazione scadenze da template

### Template (`lib/validation/template.ts`)

- `createTemplateSchema` - Creazione template scadenza
- `updateTemplateSchema` - Aggiornamento template

### Structure (`lib/validation/structure.ts`)

- `createStructureSchema` - Creazione struttura
- `updateStructureSchema` - Aggiornamento struttura

### Person (`lib/validation/person.ts`)

- `createPersonSchema` - Creazione persona
- `updatePersonSchema` - Aggiornamento persona

## 🎯 Pattern di Implementazione

Per applicare validazione a un nuovo endpoint, seguire questo pattern:

### 1. Import degli Schema

```typescript
import { [schemaName] } from "@/lib/validation/[file]";
import { validateRequest } from "@/lib/validation/validate";
```

### 2. Nel Handler della Route

```typescript
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validazione con Zod
    const validation = validateRequest([schemaName], body);
    if (!validation.success) {
      return validation.error;
    }

    // Usa i dati validati (type-safe)
    const { field1, field2 } = validation.data;

    // ... resto della logica
  } catch (error) {
    // error handling
  }
}
```

### 3. Per Endpoint PATCH (Partial Update)

```typescript
export async function PATCH(request: Request) {
  try {
    const body = await request.json();

    // Validazione con schema partial
    const validation = validateRequest(updateSchema, body);
    if (!validation.success || !validation.data) {
      return validation.error;
    }

    const validatedData = validation.data;

    // Prepara dati per update (solo campi forniti)
    const updateData: any = {};
    if (validatedData.field1 !== undefined)
      updateData.field1 = validatedData.field1;
    if (validatedData.field2 !== undefined)
      updateData.field2 = validatedData.field2;
    // ... altri campi

    // Esegui update
    const updated = await prisma.model.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ data: updated });
  } catch (error) {
    // error handling
  }
}
```

## 🎯 Benefici Ottenuti

1. **Type Safety**: TypeScript inferisce automaticamente i tipi dai dati validati
2. **Errori Consistenti**: Tutti gli errori di validazione hanno lo stesso formato strutturato
3. **Codice Più Pulito**: Elimina validazioni manuali ripetitive (`if (!field) { ... }`)
4. **Manutenibilità**: Schema centralizzati facili da modificare
5. **Documentazione Implicita**: Gli schema documentano i requisiti dei dati
6. **Sicurezza**: Protezione automatica contro dati malformati o mancanti
7. **Normalizzazione**: Conversioni automatiche (email lowercase, trim, coercion numerica)

## 🔧 Caratteristiche Implementate

### Validazione Helper (`lib/validation/validate.ts`)

```typescript
export function validateRequest<T extends z.ZodType>(
  schema: T,
  data: unknown,
): {
  success: boolean;
  data?: z.infer<T>;
  error?: NextResponse;
};
```

Funzionalità:

- Valida i dati con lo schema Zod
- Restituisce errori strutturati e user-friendly
- Supporta errori multipli con path specifici
- Formato errore consistente: `{ error: string, details: Record<string, string[]> }`

### Errori Strutturati

```json
{
  "error": "Dati non validi",
  "details": {
    "email": ["Email non valida"],
    "password": ["La password deve contenere almeno 8 caratteri"]
  }
}
```

### Coercion Automatica

Gli schema usano `z.coerce` per convertire automaticamente stringhe in numeri dove necessario:

```typescript
recurrenceEvery: z.coerce.number().int().positive().default(1);
```

## 📝 Note di Implementazione

### 1. Gestione Campi Opzionali vs Nullable

- `.optional()` - Il campo può essere omesso
- `.nullable()` - Il campo può essere `null`
- `.optional().nullable()` - Il campo può essere omesso o `null`

### 2. Valori di Default

```typescript
priority: prioritySchema.default("MEDIUM");
```

### 3. Schema Parziali

Per endpoint PATCH, usa `.partial()`:

```typescript
export const updateSchema = createSchema.partial();
```

### 4. Schema Estesi

Per aggiungere campi a uno schema esistente:

```typescript
export const updateSchema = createSchema.partial().extend({
  status: statusSchema.optional(),
});
```

### 5. Validazioni Custom

Esempio di validazione custom:

```typescript
const schema = z
  .object({
    email: emailSchema,
  })
  .refine((data) => !blockedEmails.includes(data.email), {
    message: "Email bloccata",
  });
```

## 🚀 Prossimi Passi (Opzionali)

Se in futuro si desidera estendere la validazione:

1. **Query Parameters**: Creare schema per validare query params negli endpoint GET
2. **File Upload**: Aggiungere validazione per upload di file
3. **Validazione Async**: Implementare verifiche asincrone (es. email duplicata)
4. **Custom Error Messages**: Personalizzare ulteriormente i messaggi di errore
5. **Middleware Globale**: Creare middleware per validazione automatica

## 📚 Riferimenti

- **Zod Documentation**: https://zod.dev/
- **Schema Comuni**: `lib/validation/common.ts`
- **Schema Auth**: `lib/validation/auth.ts`
- **Schema Deadline**: `lib/validation/deadline.ts`
- **Schema Template**: `lib/validation/template.ts`
- **Schema Structure**: `lib/validation/structure.ts`
- **Schema Person**: `lib/validation/person.ts`
- **Helper Validazione**: `lib/validation/validate.ts`
- **Index Export**: `lib/validation/index.ts`

## 🔍 Esempi di Implementazione

### Esempio 1: Auth Register

File: `app/api/auth/register/route.ts`

```typescript
const validation = validateRequest(registerSchema, body);
if (!validation.success) {
  return validation.error;
}
const { email, password, name } = validation.data;
// email è già lowercase e trimmed automaticamente
```

### Esempio 2: Template Creation

File: `app/api/organizations/[id]/deadline-templates/route.ts`

```typescript
const validation = validateRequest(createTemplateSchema, body);
if (!validation.success) {
  return validation.error;
}
// recurrenceEvery è automaticamente convertito in numero
const { recurrenceEvery, anchor, regions } = validation.data;
```

### Esempio 3: Deadline Update (Partial)

File: `app/api/organizations/[id]/deadlines/[deadlineId]/route.ts`

```typescript
const validation = validateRequest(updateDeadlineSchema, body);
if (!validation.success || !validation.data) {
  return validation.error;
}
// Solo i campi forniti sono presenti in validation.data
const { title, dueDate, status } = validation.data;
```

---

**Stato**: ✅ Implementazione Core Completata
**Data Ultimo Aggiornamento**: 2025-11-10
**Endpoint Validati**: 10/12 (83%)
