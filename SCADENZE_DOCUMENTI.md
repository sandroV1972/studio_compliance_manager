# Relazione Scadenze e Documenti

## Come Funziona

### 1. Template con Documenti Richiesti

I `DeadlineTemplate` possono avere un campo `requiredDocumentName` che specifica il tipo di documento richiesto per completare la scadenza.

### 2. Creazione Scadenze da Template

Quando si genera una scadenza da un template che richiede documenti:

- La `DeadlineInstance` eredita il campo `templateId`
- Il sistema sa che per completare questa scadenza serve un documento

### 3. Caricamento Documenti

I documenti vengono caricati tramite l'endpoint:

```
POST /api/organizations/[id]/deadlines/[deadlineId]/documents
```

Quando viene caricato un documento:

- Viene creato un `Document` con:
  - `ownerType = "DEADLINE"`
  - `ownerId = deadlineInstance.id`
  - Altri metadati (fileName, fileType, expiryDate, etc.)

### 4. Auto-Completamento Scadenze

**Logica implementata in:** [app/api/organizations/[id]/deadlines/[deadlineId]/documents/route.ts:243-258](app/api/organizations/[id]/deadlines/[deadlineId]/documents/route.ts#L243-L258)

Quando viene caricato un documento per una scadenza:

1. Il sistema verifica se la scadenza ha `status = PENDING` e un `templateId`
2. Carica il template associato
3. Se il template ha `requiredDocumentName`, marca automaticamente la scadenza come `DONE`
4. Imposta `completedAt = new Date()`

## Template Globali che Richiedono Documenti

### PERSON Scope (4 template)

| Template                                     | Documento Richiesto          |
| -------------------------------------------- | ---------------------------- |
| Dosimetria personale                         | Report dosimetrico           |
| Sorveglianza sanitaria - Visita periodica    | Giudizio idoneità            |
| **Assicurazione RC professionale - Rinnovo** | **Polizza RC professionale** |

### STRUCTURE Scope (7 template)

| Template                                        | Documento Richiesto                     |
| ----------------------------------------------- | --------------------------------------- |
| Impianto elettrico - Verifica periodica         | Rapporto di verifica impianto elettrico |
| Estintori - Controllo semestrale                | Rapporto controllo estintori            |
| Illuminazione emergenza - Prove funzionali      | Registro prove illuminazione emergenza  |
| Sorveglianza fisica radioprotezione - Visita ER | Rapporto visita ER                      |
| Controlli di qualità apparecchi RX              | Rapporto CQ apparecchi RX               |
| Autoclave - Test e manutenzione                 | Registro sterilizzazione e manutenzione |
| Manutenzione impianti aspirazione/compressori   | Rapporto manutenzione                   |

## Come Testare

### 1. Crea Scadenza da Template RC Professionale

Vai alla pagina delle scadenze e crea una nuova scadenza dal template "Assicurazione RC professionale - Rinnovo" per una persona.

### 2. Verifica Scadenza Creata

La scadenza dovrebbe avere:

- `status: PENDING`
- `templateId: cmhi57f8z0014mgsylai1hndj` (ID del template RC)
- Visibile nell'elenco scadenze

### 3. Carica Documento

Nella pagina della persona, cerca la scadenza RC Professionale e carica un documento (PDF della polizza).

**Endpoint utilizzato:**

```
POST /api/organizations/{orgId}/deadlines/{deadlineId}/documents
```

**FormData:**

```
file: [File PDF/DOC]
expiryDate: "2025-12-31" (opzionale)
notes: "Polizza rinnovata" (opzionale)
```

### 4. Verifica Auto-Completamento

Dopo il caricamento:

- La scadenza dovrebbe cambiare automaticamente da `PENDING` a `DONE`
- `completedAt` dovrebbe essere impostato
- Il documento dovrebbe essere visibile nell'elenco documenti della scadenza

## Endpoint Documenti Implementati

### 1. Documenti per Scadenze (DEADLINE)

- **GET** `/api/organizations/[id]/deadlines/[deadlineId]/documents`
- **POST** `/api/organizations/[id]/deadlines/[deadlineId]/documents`

### 2. Documenti per Persone (PERSON)

- **GET** `/api/organizations/[id]/people/[personId]/documents`
- **POST** `/api/organizations/[id]/people/[personId]/documents`

### 3. Documenti per Strutture (STRUCTURE)

- **GET** `/api/organizations/[id]/structures/[structureId]/documents`
- **POST** `/api/organizations/[id]/structures/[structureId]/documents`

## Schema Database

### Document Model

```prisma
model Document {
  id             String        @id @default(cuid())
  organizationId String
  templateId     String?       // Collegamento al template
  ownerType      DocumentOwner // DEADLINE, PERSON, STRUCTURE, ORGANIZATION
  ownerId        String        // ID dell'entità proprietaria
  fileName       String
  fileType       String?
  fileSize       Int?
  storagePath    String
  uploadedById   String?
  expiryDate     DateTime?
  isExpired      Boolean       @default(false)
  notes          String?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([organizationId, ownerType, ownerId])
}
```

### DeadlineTemplate Model

```prisma
model DeadlineTemplate {
  id                   String
  requiredDocumentName String?  // Nome del documento richiesto (es: "Polizza RC")
  // ... altri campi
}
```

### DeadlineInstance Model

```prisma
model DeadlineInstance {
  id         String
  templateId String?  // Collegamento al template
  status     DeadlineStatus  // PENDING, IN_PROGRESS, DONE, OVERDUE
  completedAt DateTime?
  // ... altri campi
}
```

## Note Implementazione

1. **Validazione File**: Gli endpoint validano formato e dimensione file se specificati nel template
2. **Storage**: I file vengono salvati in `uploads/{orgId}/deadlines/{deadlineId}/`
3. **Audit Log**: Ogni upload viene registrato nel sistema di audit
4. **Scadenza Documenti**: I documenti possono avere una `expiryDate` propria
5. **Auto-Expiry**: Il flag `isExpired` viene calcolato automaticamente al caricamento

## Flusso Completo

```
1. Admin crea template con requiredDocumentName
   ↓
2. Utente genera scadenza da template
   ↓
3. Sistema crea DeadlineInstance con templateId
   ↓
4. Utente carica documento via API
   ↓
5. Sistema crea Document con ownerType=DEADLINE, ownerId=deadlineId
   ↓
6. Sistema verifica se template richiede documento
   ↓
7. Se sì, marca scadenza come DONE automaticamente
   ↓
8. Scadenza completata!
```

## Esempi di Scadenze Attive

Attualmente nel sistema ci sono scadenze RC Professionale:

| ID                        | Assegnata a        | Scadenza   | Status  | Documento Richiesto      |
| ------------------------- | ------------------ | ---------- | ------- | ------------------------ |
| cmhtdy3rg0001axj7z241x2xd | Alessandro Valenti | 2026-01-30 | PENDING | Polizza RC professionale |
| cmhtdy3rj0003axj7sjhbvtmf | Alessandro Valenti | 2027-01-30 | PENDING | Polizza RC professionale |
| cmhtdy3rk0005axj7bxjaqb16 | Alessandro Valenti | 2028-01-30 | PENDING | Polizza RC professionale |

E scadenze per strutture:

| ID                        | Struttura | Scadenza   | Status  | Documento Richiesto          |
| ------------------------- | --------- | ---------- | ------- | ---------------------------- |
| cmhtaar8u0009ax2rgz8tmum2 | [Studio]  | 2026-05-10 | PENDING | Rapporto controllo estintori |
| cmhta9csk0005ax2rf1q6q0sn | [Studio]  | 2026-11-10 | PENDING | Rapporto controllo estintori |

---

**Data aggiornamento**: 2025-11-10
**Status implementazione**: ✅ Completato
