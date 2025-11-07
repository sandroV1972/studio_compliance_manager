# Studio Compliance Manager

Sistema completo di gestione scadenze e adempimenti per studi medici e dentistici in Italia.

## 🎯 Caratteristiche Principali

- **Multi-tenant**: Gestione di più organizzazioni con isolamento completo dei dati
- **RBAC**: Ruoli OWNER, ADMIN, MEMBER con permessi granulari
- **Gestione Strutture**: Creazione e gestione di strutture operative multiple
- **Gestione Personale**: Anagrafica completa con validazione codice fiscale italiano
- **Catalogo Scadenze Italia**: 35+ template GLOBAL preconfigurati per:
  - Sicurezza sul lavoro (D.Lgs. 81/08)
  - Radioprotezione (D.Lgs. 101/2020 e correttivi)
  - Rifiuti sanitari (DPR 254/2003, RENTRI)
  - Antincendio, formazione, manutenzioni
  - Privacy/GDPR, ECM, assicurazioni
- **Versioning Template**: Gestione versioni con changelog e simulatore impatto
- **Notifiche Email**: Reminder automatici a 90/60/30/7/1 giorni
- **Dashboard KPI**: Panoramica scadenze con grafici e statistiche
- **Gestione Documenti**: Upload e storage documenti di compliance
- **Audit Log**: Tracciamento completo delle azioni critiche
- **Email Verification**: Sistema di verifica email con resend

## 🛠️ Stack Tecnologico

- **Framework**: Next.js 16 (App Router, React Server Components)
- **Language**: TypeScript
- **UI**: Tailwind CSS + shadcn/ui (design Stripe/Linear style)
- **Forms**: React Hook Form + Zod
- **Database**: SQLite (dev) / PostgreSQL (prod) + Prisma ORM
- **Auth**: Auth.js (NextAuth) con Credentials
- **Email**: Resend (prod) / MailHog (dev)
- **Background Jobs**: node-cron (dev) / Vercel Cron (prod)
- **Testing**: Jest (unit) + Playwright (e2e)

## 📋 Prerequisiti

- Node.js 18+ e npm
- Docker e Docker Compose (per MailHog in sviluppo)

## 🚀 Installazione e Setup

### 1. Clona e installa dipendenze

```bash
cd studio-compliance-manager
npm install
```

### 2. Avvia MailHog con Docker (per email in sviluppo)

```bash
docker-compose up -d
```

MailHog sarà disponibile su:

- SMTP: `localhost:1025`
- Web UI: `http://localhost:8025`

### 3. Configura variabili d'ambiente

Il file `.env` è già configurato per lo sviluppo locale. Verifica la configurazione:

```env
# Database (SQLite in dev, usa file locale)
DATABASE_URL="file:./dev.db"

# Auth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-change-in-production"

# Email (MailHog in dev)
EMAIL_FROM="noreply@studiocompliance.local"
EMAIL_SERVER_HOST="localhost"
EMAIL_SERVER_PORT="1025"
EMAIL_SERVER_USER=""
EMAIL_SERVER_PASSWORD=""
```

### 4. Inizializza il database

```bash
# Genera Prisma Client
npm run prisma:generate

# Esegui le migrazioni
npm run prisma:migrate

# Popola il database con dati iniziali
npm run prisma:seed
```

### 5. Avvia il server di sviluppo

```bash
npm run dev
```

Apri [http://localhost:3000](http://localhost:3000) nel browser.

### 6. Testa l'invio email

Le email inviate dall'applicazione appariranno nella UI di MailHog su `http://localhost:8025`.

## 🔐 Credenziali Demo

### Super Admin (gestione template GLOBAL)

- Email: `admin@studiocompliance.it`
- Password: `Admin123!`

### Demo User (Studio Dentistico Rossi)

- Email: `demo@studiodentistico.it`
- Password: `Demo123!`

## 📁 Struttura del Progetto

```
studio-compliance-manager/
├── app/                      # Next.js App Router
│   ├── api/                  # API Route Handlers
│   ├── auth/                 # Pagine autenticazione
│   ├── dashboard/            # Dashboard principale
│   ├── structures/           # Gestione strutture
│   ├── people/               # Gestione persone
│   ├── roles/                # Gestione ruoli
│   ├── deadlines/            # Gestione scadenze
│   ├── templates/            # Catalogo template
│   ├── admin/                # Pannello amministrazione
│   └── settings/             # Impostazioni
├── components/               # Componenti React
│   └── ui/                   # shadcn/ui components
├── lib/                      # Utility e configurazioni
│   ├── auth.ts               # Auth.js config
│   ├── prisma.ts             # Prisma client
│   └── utils.ts              # Helper functions
├── prisma/                   # Database schema e seed
│   ├── schema.prisma         # Schema Prisma
│   └── seed.ts               # Seed data
├── docker-compose.yml        # PostgreSQL container
└── package.json              # Dipendenze
```

## 🗄️ Schema Database

### Modelli Principali

- **User**: Utenti del sistema
- **Organization**: Organizzazioni (studi medici/dentistici)
- **OrganizationUser**: Associazione utenti-organizzazioni con ruoli
- **Structure**: Strutture/sedi operative
- **Person**: Persone (dipendenti, collaboratori)
- **RoleTemplate**: Template ruoli (GLOBAL/ORG)
- **DeadlineTemplate**: Template scadenze con versioning
- **DeadlineInstance**: Istanze scadenze effettive
- **RoleAssignment**: Assegnazioni ruoli a persone
- **Document**: Documenti caricati
- **Notification**: Notifiche email
- **AuditLog**: Log azioni critiche

## 📊 Funzionalità Implementate

### ✅ Autenticazione e Onboarding

- Login con credenziali
- Registrazione nuova organizzazione
- Verifica email con token e resend
- Gestione account status (PENDING_VERIFICATION, ACTIVE, SUSPENDED)
- Messaggi di errore dettagliati per ogni stato
- Reset password (placeholder)

### ✅ Dashboard

- KPI scadenze (scadute, 30/60/90 giorni)
- Lista prossime scadenze
- Grafici e statistiche
- Visualizzazione basata su strutture

### ✅ Gestione Strutture

- CRUD strutture operative complete
- Associazione persone a strutture (con tab dedicato)
- Assegnazione multipla a strutture
- Scadenze per struttura
- Gestione struttura principale per persona

### ✅ Gestione Persone

- CRUD persone (dipendenti/collaboratori)
- **Validazione codice fiscale italiano** (formato e check character)
- **Controllo unicità codice fiscale per organizzazione**
- Normalizzazione automatica codice fiscale (uppercase, trim)
- Associazione a strutture multiple
- Assegnazione da personale esistente
- Assegnazione ruoli
- Tab scadenze personali
- Campi completi: nome, cognome, email, telefono, date assunzione/nascita, note

### ✅ Gestione Ruoli

- Template ruoli GLOBAL (preconfigurati)
- Template ruoli ORG (personalizzati)
- Assegnazione ruoli a persone
- Generazione automatica scadenze

### ✅ Catalogo Template Scadenze

- 35+ template GLOBAL Italia preconfigurati
- Metadati normativi (legalReference, sourceUrl)
- Versioning e changelog
- Simulatore impatto modifiche
- Configurabilità per organizzazione

### ✅ Gestione Scadenze

- Generazione automatica da template
- Stati: PENDING, DONE, OVERDUE, CANCELLED
- Completamento con upload documento
- Ricorrenza automatica
- Filtri avanzati
- Export ICS calendario

### ✅ Notifiche

- Email reminder a 90/60/30/7/1 giorni
- Tracking invii (PENDING/SENT/FAILED)
- Job cron giornaliero
- Sistema email con Resend (prod) / MailHog (dev)

### ✅ Admin Panel

- Gestione membri organizzazione
- Promozione/demozione admin
- SuperAdmin: gestione template GLOBAL
- Audit log

### ✅ Profilo Utente

- Gestione informazioni personali
- Cambio password
- Visualizzazione stato account

## 🔧 Script Disponibili

```bash
# Sviluppo
npm run dev                   # Avvia server dev
npm run build                 # Build produzione
npm run start                 # Avvia server produzione

# Database
npm run prisma:generate       # Genera Prisma Client
npm run prisma:migrate        # Esegui migrazioni
npm run prisma:seed           # Popola database
npm run prisma:studio         # Apri Prisma Studio

# Testing
npm run test                  # Jest unit tests
npm run test:watch            # Jest watch mode
npm run test:e2e              # Playwright e2e tests

# Code Quality
npm run lint                  # ESLint
npm run format                # Prettier
```

## 🌍 Deployment

### Vercel (Consigliato)

1. Connetti repository GitHub a Vercel
2. Configura variabili d'ambiente:
   - `DATABASE_URL`: Neon/Supabase/Render PostgreSQL
   - `NEXTAUTH_URL`: URL produzione
   - `NEXTAUTH_SECRET`: Genera con `openssl rand -base64 32`
   - `EMAIL_*`: Configurazione SMTP
   - `CRON_SECRET`: Secret per endpoint cron
3. Deploy automatico

### Vercel Cron per Notifiche

Crea `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/notifications/dispatch",
      "schedule": "0 6 * * *"
    }
  ]
}
```

## 📝 Template Scadenze GLOBAL Italia

Il sistema include 35+ template preconfigurati per:

### Sicurezza sul Lavoro (D.Lgs. 81/08)

- Formazione lavoratori (quinquennale)
- Formazione preposti (biennale)
- Formazione dirigenti (quinquennale)
- RSPP datore di lavoro (quinquennale)
- RLS (annuale)
- Addetti antincendio (quinquennale)
- Addetti primo soccorso (triennale)
- DVR riesame
- Impianto elettrico verifiche
- Estintori controlli

### Radioprotezione (D.Lgs. 101/2020)

- Sorveglianza fisica ER (annuale)
- Controlli qualità RX
- Notifica pratica radiologica
- Registrazione esposizioni mediche
- LDR verifica quadriennale
- Formazione radioprotezione (quinquennale)
- ECM radioprotezione (15% triennale)
- Dosimetria personale

### Rifiuti Sanitari

- Registro carico/scarico (5 giorni)
- Deposito temporaneo
- RENTRI iscrizione

### Altri Adempimenti

- BLSD/DAE retraining
- Sorveglianza sanitaria
- Autoclave manutenzione
- Privacy/GDPR formazione
- ECM generali (triennali)
- RC professionale

Tutti i template includono:

- Riferimenti normativi
- Link fonti ufficiali
- Periodicità configurabile
- Note operative

## 🔒 Sicurezza e Compliance

- **Multi-tenancy**: Scoping rigoroso per organizationId in tutte le query
- **RBAC**: Controllo accessi granulare (OWNER, ADMIN, MEMBER)
- **Password**: Hash con bcrypt
- **Session**: JWT con NextAuth
- **Email Verification**: Verifica email obbligatoria con token sicuri
- **Fiscal Code Validation**: Validazione completa codice fiscale italiano con check character
- **Data Normalization**: Normalizzazione automatica dati (es. codice fiscale uppercase)
- **Rate Limiting**: Implementabile con Upstash
- **GDPR**: Soft-delete, audit log, consensi
- **Audit Trail**: Log completo azioni critiche

## 🧪 Testing

### Unit Tests (Jest)

```bash
npm run test
```

### E2E Tests (Playwright)

```bash
npm run test:e2e
```

Flusso E2E coperto:

1. Signup → Onboarding
2. Crea Struttura
3. Crea Persona
4. Assegna Ruolo
5. Verifica scadenze generate
6. Completa scadenza con documento
7. Verifica ricorrenza

## 📚 Documentazione Aggiuntiva

### API Endpoints

#### Autenticazione

- `POST /api/auth/[...nextauth]` - NextAuth handlers
- `GET /api/auth/verify-email` - Verifica email con token
- `POST /api/auth/resend-verification` - Reinvia email di verifica

#### Organizzazioni e Utenti

- `GET/POST /api/organizations` - Gestione organizzazioni
- `GET/PATCH /api/user/profile` - Profilo utente
- `POST /api/user/change-password` - Cambio password

#### Strutture

- `GET/POST /api/structures` - Lista e creazione strutture
- `GET/PATCH/DELETE /api/structures/[id]` - Gestione singola struttura
- `GET/POST /api/structures/[id]/people` - Persone associate a struttura

#### Persone

- `GET/POST /api/people` - Lista e creazione persone
- `POST /api/people/check-fiscal-code` - Verifica unicità codice fiscale
- `GET/PATCH/DELETE /api/people/[id]` - Gestione singola persona

#### Ruoli

- `GET/POST /api/roles/templates` - Template ruoli
- `GET/POST/PATCH/DELETE /api/roles/assignments` - Assegnazioni ruoli

#### Scadenze

- `GET/POST/PATCH /api/deadlines/templates` - Template scadenze
- `GET/POST/PATCH /api/deadlines` - Istanze scadenze

#### Altro

- `POST /api/documents` - Upload documenti
- `POST /api/notifications/dispatch` - Dispatch notifiche (cron)
- `GET /api/ics` - Export calendario ICS

### Configurazione Timezone

Tutte le date sono gestite in `Europe/Rome`. Configurabile per organizzazione in `Organization.timezone`.

### Storage Documenti

- **Dev**: Local filesystem (`./uploads`)
- **Prod**: S3-compatible (configurare `AWS_*` env vars)

## 🤝 Contributi

Questo è un progetto dimostrativo completo. Per estensioni:

1. Fork del repository
2. Crea feature branch
3. Commit con messaggi descrittivi
4. Push e apri Pull Request

## 📄 Licenza

ISC

## 🆘 Supporto

Per domande o problemi:

- Apri una Issue su GitHub
- Consulta la documentazione Prisma/Next.js
- Verifica i log con `npm run dev`

## 🎉 Prossimi Sviluppi

- [ ] Magic Link authentication
- [ ] Import/Export CSV persone e scadenze
- [ ] Grafici avanzati (recharts)
- [ ] Notifiche in-app
- [ ] Mobile app (React Native)
- [ ] API pubblica con rate limiting
- [ ] Integrazione calendario (Google/Outlook)
- [ ] Report PDF automatici
- [ ] Multi-lingua (i18n)
- [ ] Billing e subscription (Stripe)

---

**Sviluppato con ❤️ per studi medici e dentistici italiani**
