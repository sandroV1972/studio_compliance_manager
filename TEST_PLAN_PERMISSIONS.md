# Piano di Test - Sistema Permessi Studio Compliance Manager

## Panoramica

Questo documento descrive il piano di test per il nuovo sistema di permessi gerarchico implementato per gli studi medici e odontoiatrici.

## Gerarchia Ruoli

```
SUPER_ADMIN (Sistema)
  ↓ Gestisce template GLOBAL e amministrazione sistema
ADMIN/OWNER (Organizzazione)
  ↓ Gestisce template ORG, utenti, strutture dell'organizzazione
MANAGER (Responsabile Struttura)
  ↓ Gestisce scadenze della propria struttura
OPERATOR (Operatore Base)
  ↓ Visualizza e carica documenti nella propria struttura
```

---

## 1. Test Permessi Template

### 1.1 Visualizzazione Template

**Obiettivo**: Verificare che solo utenti autorizzati possano visualizzare i template.

#### Test Case 1.1.1: SUPER_ADMIN visualizza template

- **Precondizioni**: Utente loggato come SUPER_ADMIN
- **Azioni**:
  1. Navigare a `/settings/deadline-templates` o `/structures/[id]/deadline-templates`
  2. Verificare che i template siano visualizzati
- **Risultato Atteso**:
  - ✅ Lista completa di template GLOBAL e ORG visibili
  - ✅ Pulsante "Nuovo Adempimento" visibile

#### Test Case 1.1.2: ADMIN visualizza template

- **Precondizioni**: Utente loggato come ADMIN di un'organizzazione
- **Azioni**:
  1. Navigare a `/settings/deadline-templates` o `/structures/[id]/deadline-templates`
  2. Verificare che i template siano visualizzati
- **Risultato Atteso**:
  - ✅ Template GLOBAL (nazionali e regionali) + template ORG della propria organizzazione visibili
  - ✅ Pulsante "Nuovo Adempimento" visibile

#### Test Case 1.1.3: MANAGER visualizza template

- **Precondizioni**: Utente loggato come MANAGER di una struttura
- **Azioni**:
  1. Navigare a `/structures/[id]/deadline-templates` (della propria struttura)
  2. Verificare che i template siano visualizzati
- **Risultato Atteso**:
  - ✅ Template GLOBAL + template ORG visibili (solo lettura)
  - ❌ Pulsante "Nuovo Adempimento" NON visibile

#### Test Case 1.1.4: OPERATOR tenta di visualizzare template

- **Precondizioni**: Utente loggato come OPERATOR
- **Azioni**:
  1. Tentare di navigare a `/settings/deadline-templates` o `/structures/[id]/deadline-templates`
- **Risultato Atteso**:
  - ❌ Errore 403: "Non hai i permessi per visualizzare i template"

### 1.2 Creazione Template ORG

#### Test Case 1.2.1: ADMIN crea template ORG

- **Precondizioni**: Utente loggato come ADMIN di un'organizzazione
- **Azioni**:
  1. Navigare a `/settings/deadline-templates`
  2. Cliccare su "Nuovo Adempimento"
  3. Compilare form (titolo, tipo compliance, ricorrenza, etc.)
  4. Salvare
- **Risultato Atteso**:
  - ✅ Template creato con successo
  - ✅ `ownerType` = "ORG"
  - ✅ `organizationId` corrisponde all'organizzazione dell'ADMIN

#### Test Case 1.2.2: SUPER_ADMIN crea template ORG per un'organizzazione

- **Precondizioni**: Utente loggato come SUPER_ADMIN
- **Azioni**:
  1. Navigare a `/settings/deadline-templates` specificando un'organizzazione
  2. Cliccare su "Nuovo Adempimento"
  3. Compilare form e salvare
- **Risultato Atteso**:
  - ✅ Template creato con successo per l'organizzazione specificata

#### Test Case 1.2.3: MANAGER tenta di creare template ORG

- **Precondizioni**: Utente loggato come MANAGER
- **Azioni**:
  1. Tentare di chiamare `POST /api/organizations/[id]/deadline-templates`
- **Risultato Atteso**:
  - ❌ Errore 403: "Non hai i permessi per creare template. Solo gli amministratori possono creare template per l'organizzazione."

### 1.3 Modifica Template

#### Test Case 1.3.1: ADMIN modifica template ORG della propria organizzazione

- **Precondizioni**:
  - Utente loggato come ADMIN
  - Esiste un template ORG creato dalla propria organizzazione
- **Azioni**:
  1. Visualizzare il template ORG
  2. Cliccare su "Modifica"
  3. Modificare campi (es. titolo, descrizione)
  4. Salvare
- **Risultato Atteso**:
  - ✅ Template aggiornato con successo

#### Test Case 1.3.2: ADMIN tenta di modificare template GLOBAL

- **Precondizioni**:
  - Utente loggato come ADMIN
  - Esiste un template GLOBAL
- **Azioni**:
  1. Visualizzare il template GLOBAL
  2. Verificare presenza pulsante "Visualizza" (non "Modifica")
  3. Tentare di chiamare `PATCH /api/organizations/[id]/deadline-templates/[templateId]`
- **Risultato Atteso**:
  - ❌ UI: Pulsante "Modifica" NON presente, solo "Visualizza"
  - ❌ API: Errore 403: "Solo l'amministratore del sito può modificare i template globali"

#### Test Case 1.3.3: SUPER_ADMIN modifica template GLOBAL

- **Precondizioni**:
  - Utente loggato come SUPER_ADMIN
  - Esiste un template GLOBAL
- **Azioni**:
  1. Navigare a admin interface o endpoint specifico
  2. Modificare template GLOBAL
  3. Salvare
- **Risultato Atteso**:
  - ✅ Template GLOBAL aggiornato con successo

### 1.4 Eliminazione Template

#### Test Case 1.4.1: ADMIN elimina template ORG

- **Precondizioni**:
  - Utente loggato come ADMIN
  - Esiste un template ORG della propria organizzazione
- **Azioni**:
  1. Eliminare il template (soft delete)
- **Risultato Atteso**:
  - ✅ `active` impostato a `false`
  - ✅ Template non più visibile nelle liste

#### Test Case 1.4.2: MANAGER tenta di eliminare template

- **Precondizioni**: Utente loggato come MANAGER
- **Azioni**:
  1. Tentare di chiamare `DELETE /api/organizations/[id]/deadline-templates/[templateId]`
- **Risultato Atteso**:
  - ❌ Errore 403: "Non hai i permessi per eliminare i template"

---

## 2. Test Permessi Scadenze

### 2.1 Creazione Scadenze

#### Test Case 2.1.1: ADMIN crea scadenza per qualsiasi struttura

- **Precondizioni**: Utente loggato come ADMIN
- **Azioni**:
  1. Creare una scadenza per una struttura A
  2. Creare una scadenza per una struttura B
- **Risultato Atteso**:
  - ✅ Entrambe le scadenze create con successo

#### Test Case 2.1.2: MANAGER crea scadenza per la propria struttura

- **Precondizioni**:
  - Utente loggato come MANAGER
  - Assegnato a struttura con ID X
- **Azioni**:
  1. Creare una scadenza per la struttura X
- **Risultato Atteso**:
  - ✅ Scadenza creata con successo

#### Test Case 2.1.3: MANAGER tenta di creare scadenza per altra struttura

- **Precondizioni**:
  - Utente loggato come MANAGER
  - Assegnato a struttura con ID X
- **Azioni**:
  1. Tentare di creare una scadenza per la struttura Y (diversa da X)
- **Risultato Atteso**:
  - ❌ Errore 403: "Non hai i permessi per creare scadenze in questa struttura"

#### Test Case 2.1.4: OPERATOR tenta di creare scadenza

- **Precondizioni**: Utente loggato come OPERATOR
- **Azioni**:
  1. Tentare di chiamare `POST /api/organizations/[id]/deadlines`
- **Risultato Atteso**:
  - ❌ Errore 403: "Non hai i permessi per creare scadenze"

### 2.2 Modifica Scadenze

#### Test Case 2.2.1: MANAGER modifica scadenza della propria struttura

- **Precondizioni**:
  - Utente loggato come MANAGER
  - Assegnato a struttura X
  - Esiste scadenza con `structureId` = X
- **Azioni**:
  1. Modificare la scadenza (es. titolo, data, note)
  2. Salvare
- **Risultato Atteso**:
  - ✅ Scadenza aggiornata con successo

#### Test Case 2.2.2: MANAGER tenta di modificare scadenza di altra struttura

- **Precondizioni**:
  - Utente loggato come MANAGER di struttura X
  - Esiste scadenza con `structureId` = Y (diversa)
- **Azioni**:
  1. Tentare di modificare la scadenza
- **Risultato Atteso**:
  - ❌ Errore 403: "Non hai i permessi per modificare questa scadenza"

### 2.3 Aggiornamento Stato Scadenze

#### Test Case 2.3.1: OPERATOR aggiorna stato scadenza della propria struttura

- **Precondizioni**:
  - Utente loggato come OPERATOR
  - Assegnato a struttura X
  - Esiste scadenza PENDING con `structureId` = X
- **Azioni**:
  1. Cambiare stato da PENDING a DONE
- **Risultato Atteso**:
  - ✅ Stato aggiornato con successo

#### Test Case 2.3.2: OPERATOR tenta di aggiornare stato di altra struttura

- **Precondizioni**:
  - Utente loggato come OPERATOR di struttura X
  - Esiste scadenza con `structureId` = Y
- **Azioni**:
  1. Tentare di aggiornare lo stato
- **Risultato Atteso**:
  - ❌ Errore 403: "Non hai i permessi per aggiornare questa scadenza"

---

## 3. Test Permessi Documenti

### 3.1 Caricamento Documenti

#### Test Case 3.1.1: OPERATOR carica documento nella propria struttura

- **Precondizioni**:
  - Utente loggato come OPERATOR
  - Assegnato a struttura X
  - Esiste una scadenza in struttura X
- **Azioni**:
  1. Aprire la scadenza
  2. Caricare un documento PDF/immagine
- **Risultato Atteso**:
  - ✅ Documento caricato con successo
  - ✅ Associato alla scadenza e alla struttura X

#### Test Case 3.1.2: OPERATOR tenta di caricare documento in altra struttura

- **Precondizioni**:
  - Utente loggato come OPERATOR di struttura X
  - Esiste scadenza in struttura Y
- **Azioni**:
  1. Tentare di caricare documento per struttura Y
- **Risultato Atteso**:
  - ❌ Errore 403: "Non hai i permessi per caricare documenti in questa struttura"

### 3.2 Eliminazione Documenti

#### Test Case 3.2.1: MANAGER elimina documento della propria struttura

- **Precondizioni**:
  - Utente loggato come MANAGER di struttura X
  - Esiste documento con `structureId` = X
- **Azioni**:
  1. Eliminare il documento
- **Risultato Atteso**:
  - ✅ Documento eliminato con successo

#### Test Case 3.2.2: OPERATOR tenta di eliminare documento

- **Precondizioni**:
  - Utente loggato come OPERATOR
  - Esiste documento nella propria struttura
- **Azioni**:
  1. Tentare di eliminare il documento
- **Risultato Atteso**:
  - ❌ UI: Pulsante "Elimina" NON presente
  - ❌ API: Errore 403: "Non hai i permessi per eliminare documenti"

---

## 4. Test Interfaccia Utente

### 4.1 Visibilità Pulsanti e Azioni

#### Test Case 4.1.1: Verifica UI per ADMIN

- **Precondizioni**: Utente loggato come ADMIN
- **Verifica**:
  - ✅ Pulsante "Nuovo Adempimento" visibile in deadline-templates page
  - ✅ Pulsante "Modifica" visibile per template ORG
  - ✅ Pulsante "Visualizza" per template GLOBAL
  - ✅ Tutti i pulsanti di gestione scadenze visibili

#### Test Case 4.1.2: Verifica UI per MANAGER

- **Precondizioni**: Utente loggato come MANAGER
- **Verifica**:
  - ❌ Pulsante "Nuovo Adempimento" NON visibile
  - ❌ Pulsanti "Modifica/Elimina" per template NON visibili
  - ✅ Pulsante "Visualizza" per template disponibile
  - ✅ Pulsanti gestione scadenze della propria struttura visibili

#### Test Case 4.1.3: Verifica UI per OPERATOR

- **Precondizioni**: Utente loggato come OPERATOR
- **Verifica**:
  - ❌ Accesso a deadline-templates negato
  - ✅ Può visualizzare scadenze della propria struttura
  - ✅ Può cambiare stato scadenze (PENDING -> DONE)
  - ✅ Può caricare documenti
  - ❌ NON può eliminare documenti

---

## 5. Test API Endpoints

### 5.1 GET /api/user/permissions

#### Test Case 5.1.1: Recupero permessi utente

- **Azioni**: Chiamare `GET /api/user/permissions` per ogni ruolo
- **Risultato Atteso**:

**SUPER_ADMIN**:

```json
{
  "canViewTemplates": true,
  "canManageGlobalTemplates": true,
  "canManageOrgTemplates": true,
  "canCreateDeadlines": true,
  "role": "Super Admin",
  "isSuperAdmin": true,
  "organizationId": null,
  "structureId": null
}
```

**ADMIN**:

```json
{
  "canViewTemplates": true,
  "canManageGlobalTemplates": false,
  "canManageOrgTemplates": true,
  "canCreateDeadlines": true,
  "role": "Amministratore",
  "isSuperAdmin": false,
  "organizationId": "org-123",
  "structureId": null
}
```

**MANAGER**:

```json
{
  "canViewTemplates": true,
  "canManageGlobalTemplates": false,
  "canManageOrgTemplates": false,
  "canCreateDeadlines": true,
  "role": "Responsabile Struttura",
  "isSuperAdmin": false,
  "organizationId": "org-123",
  "structureId": "struct-456"
}
```

**OPERATOR**:

```json
{
  "canViewTemplates": false,
  "canManageGlobalTemplates": false,
  "canManageOrgTemplates": false,
  "canCreateDeadlines": false,
  "role": "Operatore",
  "isSuperAdmin": false,
  "organizationId": "org-123",
  "structureId": "struct-456"
}
```

### 5.2 GET /api/organizations/[id]/deadline-templates

#### Test Case 5.2.1: Filtro template in base a regione

- **Precondizioni**:
  - Organizzazione con strutture in Lombardia
  - Esistono template GLOBAL regionali per Lombardia e Lazio
- **Azioni**: Chiamare endpoint
- **Risultato Atteso**:
  - ✅ Template nazionali (senza regione) inclusi
  - ✅ Template regionali Lombardia inclusi
  - ❌ Template regionali Lazio NON inclusi

---

## 6. Test Database e Migrazioni

### 6.1 Verifica Schema Database

#### Test Case 6.1.1: Verifica enum OrgUserRole

- **Azioni**:
  ```sql
  SELECT * FROM sqlite_schema WHERE name = 'OrgUserRole';
  ```
- **Risultato Atteso**:
  - ✅ Enum contiene: OWNER, ADMIN, MANAGER, OPERATOR

#### Test Case 6.1.2: Verifica campo structureId in OrganizationUser

- **Azioni**:
  ```sql
  PRAGMA table_info(OrganizationUser);
  ```
- **Risultato Atteso**:
  - ✅ Campo `structureId` presente e nullable
  - ✅ Foreign key a `Structure`

### 6.2 Dati di Test

#### Test Case 6.2.1: Creazione utenti di test

- **Azioni**: Creare utenti con ciascun ruolo nel seed script
- **Dati richiesti**:
  ```
  - 1 SUPER_ADMIN
  - 1 ADMIN per organizzazione "Studio Medico Milano"
  - 1 MANAGER per struttura "Sede Centrale"
  - 1 OPERATOR per struttura "Sede Centrale"
  ```

---

## 7. Test di Regressione

### 7.1 Funzionalità Esistenti

#### Test Case 7.1.1: Scadenze continuano a funzionare

- **Verifica**: Tutte le funzionalità di gestione scadenze pre-esistenti funzionano correttamente

#### Test Case 7.1.2: Report funzionano

- **Verifica**: La pagina dei report mostra dati corretti e rispetta i permessi

#### Test Case 7.1.3: Upload documenti funziona

- **Verifica**: Upload e visualizzazione documenti non regressa

---

## 8. Test di Sicurezza

### 8.1 Bypass Permessi

#### Test Case 8.1.1: Tentativo di escalation privilege via API

- **Azioni**:
  - Loggare come MANAGER
  - Tentare di chiamare direttamente endpoint amministrativi manipolando header/cookie
- **Risultato Atteso**:
  - ❌ Tutti i tentativi devono fallire con 403

#### Test Case 8.1.2: Accesso cross-organization

- **Azioni**:
  - ADMIN di organizzazione A tenta di modificare template di organizzazione B
- **Risultato Atteso**:
  - ❌ Errore 403: accesso negato

---

## 9. Checklist Esecuzione Test

### Pre-Test

- [ ] Database pulito o dati di test preparati
- [ ] Server dev in esecuzione
- [ ] Utenti di test creati per ogni ruolo

### Durante Test

- [ ] Registrare tutti i risultati (✅ Pass / ❌ Fail)
- [ ] Screenshot per test UI
- [ ] Log errori per test API falliti

### Post-Test

- [ ] Documentare issue trovati
- [ ] Creare ticket per fix necessari
- [ ] Ri-testare dopo fix

---

## 10. Criteri di Successo

Il sistema è considerato pronto per produzione quando:

1. ✅ Tutti i test case CRITICI passano al 100%
2. ✅ Almeno il 95% dei test case NON CRITICI passano
3. ✅ Nessun problema di sicurezza critico rilevato
4. ✅ Performance accettabili (< 500ms per chiamate API)
5. ✅ Zero regressioni su funzionalità esistenti

---

## Note Implementazione

### File Modificati

- [lib/permissions.ts](lib/permissions.ts) - Funzioni di controllo permessi
- [lib/auth-utils.ts](lib/auth-utils.ts) - Helper per autenticazione
- [app/api/organizations/[id]/deadline-templates/route.ts](app/api/organizations/[id]/deadline-templates/route.ts) - API template
- [app/api/organizations/[id]/deadline-templates/[templateId]/route.ts](app/api/organizations/[id]/deadline-templates/[templateId]/route.ts) - API template singolo
- [app/api/user/permissions/route.ts](app/api/user/permissions/route.ts) - Endpoint permessi utente
- [app/settings/deadline-templates/page.tsx](app/settings/deadline-templates/page.tsx) - UI template (settings)
- [app/structures/[id]/deadline-templates/page.tsx](app/structures/[id]/deadline-templates/page.tsx) - UI template (struttura)
- [prisma/schema.prisma](prisma/schema.prisma) - Schema database

### Migration

- `20251111070853_add_structure_permissions/migration.sql`
