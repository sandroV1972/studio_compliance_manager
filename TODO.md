# 📋 Studio Compliance Manager - TODO

> **Ultimo aggiornamento:** 9 Novembre 2025  
> **Versione:** 1.0.0  
> **Branch:** main

---

## 🚨 Critiche (Da risolvere prima di production)

### Infrastruttura

- [ ] **Storage:** Migrazione da filesystem locale a S3/Cloud Storage
  - Attualmente: solo local filesystem in `uploads/`
  - Obiettivo: AWS S3, Google Cloud Storage, o MinIO
  - File da modificare: `app/api/*/documents/route.ts`

- [ ] **Database:** Migrazione da SQLite a PostgreSQL
  - Attualmente: SQLite (`prisma/dev.db`)
  - Obiettivo: PostgreSQL per produzione
  - Richiede: aggiornamento `schema.prisma` e connection string

### Sicurezza

- [x] **Password Reset:** Flow completo non implementato
  - Token mechanism + email templates
  - Endpoints: `/api/auth/forgot-password`, `/api/auth/reset-password`

- [ ] **Rate Limiting:** Assente su tutti gli endpoint
  - Implementare con `express-rate-limit` o simile
  - Protezione contro brute-force su login/registrazione

- [ ] **Input Validation:** Solo auth usa Zod
  - Estendere validazione Zod a tutti gli endpoint API
  - Schema validation per request bodies
  - Errori validazione strutturati

- [ ] **Password Requirements:** Troppo deboli (solo 8+ caratteri)
  - Aggiungere: maiuscole, minuscole, numeri, caratteri speciali
  - Implementare password strength meter nel frontend

- [ ] **CSRF Protection:** Mancante
  - Implementare token CSRF per form critici
  - Protezione per operazioni di modifica/cancellazione

### Funzionalità Mancanti

- [ ] **Document-Deadline Linking:** Endpoint mancante
  - TODO trovato in: `components/documents/upload-document-modal.tsx:250`
  - Endpoint: `POST /api/organizations/[id]/deadlines/[deadlineId]/documents`
  - Necessario per collegare documenti caricati a scadenze specifiche

- [ ] **Document Versioning:** Assente
  - Tracciare versioni di documenti caricati
  - Storico modifiche e rollback

---

## ⚡ Alta Priorità

### Backend

- [ ] **Paginazione:** Implementare per tutti gli endpoint lista
  - Parametri: `page`, `limit`, `sort`, `order`
  - Response con metadata: `total`, `page`, `totalPages`

- [ ] **Logging Strutturato:** Winston o Pino
  - Log levels appropriati (error, warn, info, debug)
  - Log rotation e archiviazione
  - Integrazione con monitoring tools

- [ ] **Business Logic Layer:** Separare da API routes
  - Creare service layer (`lib/services/`)
  - Maggiore testabilità e riusabilità
  - Separazione delle responsabilità

- [ ] **API Response Envelope:** Standardizzare formato
  ```typescript
  {
    success: boolean,
    data?: any,
    error?: { code: string, message: string },
    meta?: { page, total, ... }
  }
  ```

### Testing

- [ ] **Unit Tests:** Configurati ma non scritti
  - Test per utilities (`lib/utils.ts`, `lib/email.ts`)
  - Test per helper functions
  - Coverage minimo: 70%

- [ ] **Integration Tests:** API critiche
  - Test auth flow completo
  - Test CRUD operations
  - Test permessi e autorizzazioni

### Frontend

- [ ] **Error Boundaries:** Gestione errori React
  - Componenti wrapper per sezioni critiche
  - Fallback UI informativi
  - Log errori frontend

---

## 📊 Media Priorità

### Funzionalità

- [ ] **Sistema Notifiche In-App:** Real-time alerts
  - WebSocket o Server-Sent Events
  - Badge notifiche non lette
  - Centro notifiche con storico

- [ ] **Dashboard Analytics:** Metriche e statistiche
  - Grafici scadenze per periodo
  - Compliance rate per organizzazione
  - Alert trend e pattern

- [ ] **Export PDF/Excel:** Report scaricabili
  - Esportazione liste (scadenze, persone, documenti)
  - Report personalizzabili
  - Template PDF branded

- [ ] **Bulk Operations:** Operazioni massive
  - Import CSV per persone/strutture
  - Bulk email/notifiche
  - Operazioni batch su scadenze

### Documentazione

- [ ] **OpenAPI Documentation:** Swagger/ReDoc
  - Documentazione automatica API
  - Esempi request/response
  - Try-it-out interattivo

- [ ] **User Documentation:** Guide utente
  - Manuale amministratore
  - FAQ e troubleshooting
  - Video tutorials

---

## 🔧 Bassa Priorità / Nice-to-Have

- [ ] **Two-Factor Authentication (2FA):** Sicurezza extra
- [ ] **Audit Trail Avanzato:** Tracciamento dettagliato modifiche
- [ ] **Multi-language Support:** i18n per internazionalizzazione
- [ ] **Dark Mode:** Tema scuro UI
- [ ] **Mobile App:** PWA o React Native
- [ ] **Advanced Search:** Filtri complessi e ricerca full-text
- [ ] **Integrations:** API esterne (e-mail marketing, CRM, etc.)
- [ ] **CI/CD Pipeline:** GitHub Actions o GitLab CI
  - Build automatico
  - Test automatici
  - Deploy automatico su staging/production

---

## 📈 Metriche Codebase (Aggiornate)

| Metrica                 | Valore           | Note                        |
| ----------------------- | ---------------- | --------------------------- |
| **API Routes**          | 32 file          | ~4,925 LOC                  |
| **Controlli Auth**      | 56 occorrenze    | `auth()` checks             |
| **SuperAdmin Checks**   | 27 occorrenze    | `isSuperAdmin` validations  |
| **Organization Checks** | 34 occorrenze    | `organizationUser` queries  |
| **Template Compliance** | 30+ template     | Template italiani specifici |
| **Province Mappate**    | 107 → 20 regioni | Copertura nazionale Italia  |
| **Modelli Database**    | 18 modelli       | Prisma schema               |
| **Seed Data**           | 745 righe        | Template e dati demo        |
| **Frontend Components** | 60+ componenti   | UI Components + features    |
| **Test Coverage**       | 0%               | ⚠️ Da implementare          |

---

## 🗓️ Roadmap Suggerita

### 📅 Settimana 1-2 (Immediate)

**Focus:** Funzionalità mancanti critiche

1. ✅ **Document-Deadline Linking**
   - Endpoint: `POST /api/organizations/[id]/deadlines/[deadlineId]/documents`
   - Risolve TODO trovato nel codice

2. ✅ **Password Reset Flow**
   - Token mechanism + email templates
   - Endpoints: `/api/auth/forgot-password`, `/api/auth/reset-password`

3. ✅ **Input Validation con Zod**
   - Schema validation per tutti gli endpoint
   - Errori validazione strutturati e user-friendly

4. ✅ **Test Setup Base**
   - Unit test per utilities
   - Integration test per API critiche (auth, deadlines, documents)

### 📅 Mese 1 (Short Term)

**Focus:** Infrastruttura e sicurezza

1. **Migrazione Storage S3**
   - Setup bucket S3/MinIO
   - Migrazione file esistenti
   - Update upload logic

2. **PostgreSQL Setup**
   - Database provisioning
   - Migrazione dati da SQLite
   - Connection pooling

3. **Rate Limiting**
   - Implementazione globale
   - Configurazione per endpoint critici
   - Monitoring tentativi sospetti

4. **Paginazione**
   - Standardizzazione response
   - Implementazione su tutti gli endpoint lista

5. **Logging Strutturato**
   - Setup Winston/Pino
   - Log rotation
   - Integration con monitoring

### 📅 Mesi 2-3 (Medium Term)

**Focus:** Features avanzate e polish

1. **Enhanced Security**
   - CSRF protection
   - 2FA (opzionale)
   - Password complexity
   - Session management avanzato

2. **Analytics & Reporting**
   - Dashboard metriche
   - Export PDF/Excel
   - Report automatici

3. **Bulk Operations**
   - Import CSV
   - Operazioni batch
   - Background jobs

4. **Documentazione API**
   - OpenAPI/Swagger
   - Esempi e tutorials
   - SDK client (opzionale)

5. **CI/CD Pipeline**
   - GitHub Actions setup
   - Automated testing
   - Staging/Production deployment

---

## 💡 Note Implementative

### Priorità Raccomandata

1. **Sicurezza** → Rate limiting, input validation, password reset
2. **Testing** → Unit tests, integration tests, coverage
3. **Infrastruttura** → PostgreSQL, S3, logging
4. **Features** → Analytics, bulk operations, notifications
5. **Polish** → Documentation, CI/CD, advanced features

### Decisioni Architetturali

- **Service Layer:** Separare business logic da API routes per testabilità
- **Validation:** Zod per tutti gli input API (request bodies, query params)
- **Error Handling:** Standardizzare error responses con codici consistenti
- **Pagination:** Cursore vs offset-based (decidere per performance)
- **Caching:** Redis per session e data frequenti (considerare per futuro)

---

## 🔗 Risorse Utili

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Best Practices](https://www.prisma.io/docs/guides/performance-and-optimization)
- [NextAuth.js Guide](https://next-auth.js.org/getting-started/introduction)
- [Zod Schema Validation](https://zod.dev/)
- [AWS S3 Node.js SDK](https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/s3-examples.html)

---

**📝 Nota:** Questo documento va aggiornato regolarmente man mano che i task vengono completati e nuove necessità emergono.
