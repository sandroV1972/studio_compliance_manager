# Schema Update Summary - Template Una Tantum

## ✅ Modifica Completata

### Database Schema Change

**File modificato:** `prisma/schema.prisma`

**Campi modificati nel modello `DeadlineTemplate`:**

```diff
- recurrenceUnit       RecurrenceUnit
- recurrenceEvery      Int
+ recurrenceUnit       RecurrenceUnit?  // Ora nullable
+ recurrenceEvery      Int?             // Ora nullable
```

**Migration applicata:** `20251112212349_make_recurrence_fields_nullable`

---

## 🎯 Perché Questa Modifica

### Problema

Il sistema precedentemente supportava SOLO template ricorrenti (con scadenze che si ripetono nel tempo).

Molti adempimenti obbligatori sono **una tantum** (si fanno solo una volta):

- Corso RLS base (32h)
- Formazione generale lavoratori (4h)
- Formazione specifica lavoratori base (4-8-12h)
- Corso RSPP base (16-48h)
- Corso Preposto base (8h)
- Visita medica preassuntiva
- Ecc.

### Soluzione

Rendendo `recurrenceUnit` e `recurrenceEvery` **nullable**, il sistema ora supporta:

#### 1. Template Ricorrenti (comportamento esistente)

```typescript
{
  title: "Aggiornamento RLS annuale",
  recurrenceUnit: "YEAR",   // ✅ Con valore
  recurrenceEvery: 1,        // ✅ Con valore
  anchor: "LAST_COMPLETION"
}
```

→ Crea scadenze ripetute ogni anno

#### 2. Template Una Tantum (nuovo comportamento)

```typescript
{
  title: "Corso RLS base (32 ore)",
  recurrenceUnit: null,      // ✅ NULL
  recurrenceEvery: null,     // ✅ NULL
  anchor: "ASSIGNMENT_START"
}
```

→ Crea UNA SOLA scadenza quando l'evento si verifica (es. assegnazione ruolo)

---

## 📋 Anchor Types per Template Una Tantum

| Anchor             | Quando si attiva      | Esempio Uso                                |
| ------------------ | --------------------- | ------------------------------------------ |
| `ASSIGNMENT_START` | Assegnazione ruolo    | Corsi base RLS, RSPP, Preposto             |
| `HIRE_DATE`        | Assunzione dipendente | Formazione lavoratori, visita preassuntiva |
| `CUSTOM`           | Data personalizzata   | Eventi specifici one-time                  |

---

## 🚀 Impatto sul Sistema

### Backend

- ✅ Schema aggiornato e migration applicata
- ⚠️ **DA VERIFICARE:** Services (DeadlineService, TemplateService) devono gestire template con `recurrenceUnit: null`
- ⚠️ **DA VERIFICARE:** Logica di creazione deadline instances per template una tantum

### Frontend

- ⚠️ **DA AGGIORNARE:** Form creazione/modifica template deve permettere `recurrenceUnit: null`
- ⚠️ **DA AGGIORNARE:** Validazione form deve accettare template senza ricorrenza
- ⚠️ **DA AGGIORNARE:** UI per distinguere visualmente template una tantum da ricorrenti

### Seed Data

- ⚠️ **DA AGGIUNGERE:** 6+ template una tantum mancanti (vedi COMPLIANCE_ANALYSIS.md sezione 📚)

---

## 🔍 Test da Eseguire

### 1. Test Creazione Template Una Tantum

```typescript
// Via API o Prisma Studio
{
  title: "Test - Corso RLS base",
  scope: "PERSON",
  complianceType: "TRAINING",
  recurrenceUnit: null,  // ❌ NULL
  recurrenceEvery: null, // ❌ NULL
  anchor: "ASSIGNMENT_START"
}
```

### 2. Test Creazione Deadline Instance da Template Una Tantum

- Assegnare ruolo RLS a una persona
- Verificare che venga creata UNA deadline
- Completare la deadline
- Verificare che NON venga creata una nuova deadline ricorrente

### 3. Test Backward Compatibility

- Verificare che template ricorrenti esistenti continuino a funzionare
- Verificare creazione deadline instances da template ricorrenti

---

## 📚 Documentazione

Documentazione completa in: **COMPLIANCE_ANALYSIS.md**

Sezioni rilevanti:

- **Sezione "💡 Template Una Tantum vs Ricorrenti"** - Spiegazione dettagliata
- **Sezione "📚 Template Una Tantum Mancanti"** - 6 template da aggiungere con codice completo

---

## ✅ Checklist Implementazione

### Schema & Database

- [x] Modificare `prisma/schema.prisma`
- [x] Creare migration
- [x] Applicare migration
- [x] Verificare database aggiornato

### Backend Services

- [ ] Aggiornare `DeadlineService.createDeadline()` per gestire template una tantum
- [ ] Aggiornare logica ricorrenza in `DeadlineService`
- [ ] Aggiornare validazione in `TemplateService`
- [ ] Aggiungere test per template una tantum

### Frontend

- [ ] Aggiornare form template per permettere ricorrenza opzionale
- [ ] Aggiungere checkbox/toggle "Template una tantum" nella UI
- [ ] Aggiornare validazione client-side
- [ ] Mostrare distintivo "Una tantum" nelle liste template

### Seed Data

- [ ] Aggiungere template "Formazione generale lavoratori (4h)"
- [ ] Aggiungere template "Formazione specifica lavoratori" (3 varianti)
- [ ] Aggiungere template "Corso RLS base"
- [ ] Aggiungere template "Corso RSPP base"
- [ ] Aggiungere template "Corso Preposto base"
- [ ] Aggiungere template "Corso Primo Soccorso base"
- [ ] Aggiungere template "Visita medica preassuntiva"

### Testing

- [ ] Test unitari DeadlineService
- [ ] Test integrazione template una tantum
- [ ] Test E2E flusso completo (assegnazione ruolo → deadline → completamento)

---

## 📞 Domande da Risolvere

1. **Gestione completamento template una tantum:**
   - Dopo completamento, mostrare comunque la deadline come "storico"?
   - Permettere ri-creazione manuale se necessario?

2. **UI/UX:**
   - Come distinguere visivamente template una tantum da ricorrenti?
   - Badge "Una tantum" nelle liste?
   - Icona speciale?

3. **Validazione:**
   - Se `recurrenceUnit: null`, anchor deve essere `ASSIGNMENT_START` o `HIRE_DATE`?
   - `LAST_COMPLETION` non ha senso per template una tantum

---

## 🎓 Esempio Pratico: Flusso RLS

**Scenario:** Studio medico assume nuovo dipendente e lo nomina RLS

### Template Configurati

```typescript
// Template 1: Corso base (una tantum)
{
  title: "Corso RLS base (32 ore)",
  recurrenceUnit: null,
  recurrenceEvery: null,
  anchor: "ASSIGNMENT_START"
}

// Template 2: Aggiornamento (ricorrente)
{
  title: "Aggiornamento RLS annuale",
  recurrenceUnit: "YEAR",
  recurrenceEvery: 1,
  anchor: "LAST_COMPLETION"
}
```

### Timeline

```
01/01/2024 - Dipendente assunto
15/01/2024 - Dipendente nominato RLS
           → Sistema crea deadline: "Corso RLS base" con dueDate: 15/01/2024

15/02/2024 - Corso base completato ✅
           → Nessuna nuova deadline automatica (è una tantum)
           → Sistema crea deadline: "Aggiornamento RLS" per 15/02/2025

15/02/2025 - Aggiornamento completato ✅
           → Sistema crea automaticamente: "Aggiornamento RLS" per 15/02/2026

... e così via ogni anno
```

---

## 🚀 Next Steps Immediati

1. **Testing manuale:** Creare template una tantum via Prisma Studio
2. **Backend:** Verificare/aggiornare DeadlineService per supporto completo
3. **Frontend:** Aggiornare form template
4. **Seed:** Aggiungere i 6+ template una tantum mancanti

Documentazione completa: `COMPLIANCE_ANALYSIS.md`
