# Studio Compliance Manager

Sistema completo di gestione scadenze e adempimenti per studi medici e dentistici in Italia.

## 🎯 Caratteristiche Principali

- **Multi-tenant**: Gestione di più organizzazioni con isolamento completo dei dati
- **RBAC**: Ruoli OWNER, ADMIN, MEMBER con permessi granulari
- **Catalogo Scadenze Italia**: Template GLOBAL preconfigurati per:
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

## 🛠️ Stack Tecnologico

- **Framework**: Next.js 14+ (App Router, RSC)
- **Language**: TypeScript
- **UI**: Tailwind CSS + shadcn/ui (design Stripe/Linear style)
- **Forms**: React Hook Form + Zod
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: Auth.js (NextAuth) con Credentials
- **Background Jobs**: node-cron (dev) / Vercel Cron (prod)
- **Testing**: Jest (unit) + Playwright (e2e)

## 📋 Prerequisiti

- Node.js 18+ e npm
- Docker e Docker Compose (per PostgreSQL)
- PostgreSQL 14+ (se non usi Docker)

## 🚀 Installazione e Setup

### 1. Clona e installa dipendenze

```bash
cd studio-compliance-manager
npm install
```

### 2. Avvia PostgreSQL con Docker

```bash
docker-compose up -d
```

### 3. Configura variabili d'ambiente

Il file `.env` è già configurato per lo sviluppo locale. Modifica se necessario:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/studio_compliance?schema=public"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-change-in-production"
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
- Verifica email (placeholder)
- Reset password (placeholder)

### ✅ Dashboard
- KPI scadenze (scadute, 30/60/90 giorni)
- Lista prossime scadenze
- Grafici e statistiche

### ✅ Gestione Strutture
- CRUD strutture operative
- Associazione persone a strutture
- Scadenze per struttura

### ✅ Gestione Persone
- CRUD persone (dipendenti/collaboratori)
- Associazione a strutture multiple
- Assegnazione ruoli
- Tab scadenze personali

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

### ✅ Admin Panel
- Gestione membri organizzazione
- Promozione/demozione admin
- SuperAdmin: gestione template GLOBAL
- Audit log

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
  "crons": [{
    "path": "/api/notifications/dispatch",
    "schedule": "0 6 * * *"
  }]
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

- **Multi-tenancy**: Scoping rigoroso per organizationId
- **RBAC**: Controllo accessi granulare
- **Password**: Hash con bcrypt
- **Session**: JWT con NextAuth
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

- `POST /api/auth/[...nextauth]` - NextAuth handlers
- `GET/POST /api/organizations` - Gestione organizzazioni
- `GET/POST/PATCH/DELETE /api/structures` - CRUD strutture
- `GET/POST/PATCH/DELETE /api/people` - CRUD persone
- `GET/POST /api/roles/templates` - Template ruoli
- `GET/POST/PATCH/DELETE /api/roles/assignments` - Assegnazioni ruoli
- `GET/POST/PATCH /api/deadlines/templates` - Template scadenze
- `GET/POST/PATCH /api/deadlines` - Istanze scadenze
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
