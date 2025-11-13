# 📦 Dipendenze Sistema - Studio Compliance Manager

Documentazione completa di tutte le dipendenze necessarie per il funzionamento del sistema.

## 🎯 Dipendenze Critiche (MUST HAVE)

Queste dipendenze sono **essenziali** per il funzionamento del sistema:

### Runtime Production (incluse nel Docker)

- ⭐⭐⭐⭐⭐ **Next.js** ^16.0.1 - Framework applicazione
- ⭐⭐⭐⭐⭐ **@prisma/client** ^6.1.0 - Database ORM
- ⭐⭐⭐⭐⭐ **Pino** ^10.1.0 - Structured logging (debugging/monitoring)
- ⭐⭐⭐⭐⭐ **NextAuth.js** ^5.0.0 - Autenticazione e sessioni
- ⭐⭐⭐⭐⭐ **Nodemailer** ^6.9.16 - Invio email (verifiche, reminder)
- ⭐⭐⭐⭐⭐ **Zod** ^3.25.76 - Validazione input (sicurezza)
- ⭐⭐⭐⭐ **bcryptjs** ^2.4.3 - Hash password
- ⭐⭐⭐⭐ **node-cron** ^3.0.3 - Scheduled jobs (reminder, cleanup)
- ⭐⭐⭐⭐ **date-fns** ^4.1.0 - Gestione date/timezone

### Development (CRITICHE per qualità codice)

- ⭐⭐⭐⭐⭐ **Husky** ^9.1.7 - Git hooks (previene commit problematici)
- ⭐⭐⭐⭐⭐ **lint-staged** ^16.2.6 - Pre-commit automation
- ⭐⭐⭐⭐⭐ **Prisma CLI** ^6.1.0 - Database migrations
- ⭐⭐⭐⭐⭐ **TypeScript** ^5.7.2 - Type safety
- ⭐⭐⭐⭐ **Commitlint** ^20.1.0 - Conventional commits
- ⭐⭐⭐⭐ **ESLint** ^9.17.0 - Code quality
- ⭐⭐⭐⭐ **Prettier** ^3.4.2 - Code formatting

### Servizi Docker (OBBLIGATORI)

- ⭐⭐⭐⭐⭐ **PostgreSQL 16** - Database principale
- ⭐⭐⭐⭐ **Redis 7** - Cache e sessioni
- ⭐⭐⭐ **Nginx** - Reverse proxy (opzionale ma raccomandato)

### Servizi Esterni (RICHIESTI)

- ⭐⭐⭐⭐⭐ **Email Provider** - AWS SES, SendGrid, o Mailgun (sistema NON funziona senza)
- ⭐⭐⭐ **Storage** - Locale (default) o AWS S3 (opzionale)

---

## 📋 Indice

1. [Dipendenze Docker](#dipendenze-docker)
2. [Dipendenze NPM Runtime](#dipendenze-npm-runtime)
3. [Dipendenze NPM Development](#dipendenze-npm-development)
4. [Servizi Esterni](#servizi-esterni)
5. [Requisiti Sistema](#requisiti-sistema)

---

## 🐳 Dipendenze Docker

### Immagini Base

#### 1. **Node.js 20 Alpine**

```dockerfile
FROM node:20-alpine
```

- **Versione:** 20.x LTS
- **Dimensione:** ~40 MB (Alpine Linux)
- **Uso:** Runtime applicazione Next.js
- **Perché Alpine:** Immagine minimale, sicura, ottimizzata per produzione

#### 2. **PostgreSQL 16 Alpine**

```yaml
image: postgres:16-alpine
```

- **Versione:** 16.x
- **Dimensione:** ~80 MB
- **Uso:** Database principale
- **Features:**
  - ACID compliant
  - JSON support nativo
  - Ottime performance
  - Backup nativi (pg_dump)

#### 3. **Redis 7 Alpine**

```yaml
image: redis:7-alpine
```

- **Versione:** 7.x
- **Dimensione:** ~30 MB
- **Uso:** Cache, sessioni, code
- **Features:**
  - In-memory data structure
  - Pub/Sub
  - Persistence opzionale

#### 4. **Nginx Alpine** (opzionale)

```yaml
image: nginx:alpine
```

- **Versione:** Latest stable
- **Dimensione:** ~25 MB
- **Uso:** Reverse proxy, SSL termination
- **Features:**
  - HTTP/2 support
  - Rate limiting
  - Load balancing
  - Static file serving

### Strumenti di Sistema (installati in Dockerfile)

```dockerfile
RUN apk add --no-cache netcat-openbsd
```

- **netcat-openbsd:** Test connessione database
  - Dimensione: ~50 KB
  - Uso: Health checks, wait-for-db script

---

## 📚 Dipendenze NPM Runtime

Tutte installate automaticamente durante il build Docker.

### Core Framework

#### **Next.js** `^16.0.1`

```json
"next": "^16.0.1"
```

- **Dimensione:** ~20 MB
- **Uso:** Framework React full-stack
- **Features:**
  - Server-side rendering
  - API Routes
  - Static generation
  - Image optimization
  - Built-in routing

#### **React** `^19.0.0`

```json
"react": "^19.0.0",
"react-dom": "^19.0.0"
```

- **Dimensione:** ~300 KB
- **Uso:** UI library
- **Features:**
  - Component-based
  - Virtual DOM
  - Hooks
  - Concurrent features

### Database & ORM

#### **Prisma Client** `^6.1.0`

```json
"@prisma/client": "^6.1.0"
```

- **Dimensione:** ~2 MB
- **Uso:** ORM type-safe per database
- **Features:**
  - Auto-generated types
  - Migrations
  - Query builder type-safe
  - Connection pooling

### Autenticazione

#### **NextAuth.js** `^5.0.0-beta.25`

```json
"next-auth": "^5.0.0-beta.25",
"@auth/prisma-adapter": "^2.7.4"
```

- **Dimensione:** ~500 KB
- **Uso:** Autenticazione completa
- **Features:**
  - Sessioni
  - OAuth providers
  - JWT tokens
  - Database adapter
  - CSRF protection

#### **bcryptjs** `^2.4.3`

```json
"bcryptjs": "^2.4.3"
```

- **Dimensione:** ~50 KB
- **Uso:** Hash password sicuro
- **Features:**
  - Salt automatico
  - Algoritmo bcrypt
  - Protezione brute-force

### Email

#### **Nodemailer** `^6.9.16`

```json
"nodemailer": "^6.9.16"
```

- **Dimensione:** ~200 KB
- **Uso:** Invio email SMTP
- **Features:**
  - SMTP/SES support
  - HTML templates
  - Attachments
  - TLS/SSL

**Email supportate dal sistema:**

- ✉️ Verifica registrazione
- ✅ Approvazione account
- 🔐 Reset password
- ⏰ Reminder scadenze
- 👥 Inviti organizzazione

### Validazione

#### **Zod** `^3.25.76`

```json
"zod": "^3.25.76"
```

- **Dimensione:** ~60 KB
- **Uso:** Schema validation TypeScript-first
- **Features:**
  - Type inference
  - Runtime validation
  - Error messages personalizzati
  - Composizione schema

#### **React Hook Form** `^7.54.2`

```json
"react-hook-form": "^7.54.2",
"@hookform/resolvers": "^3.9.1"
```

- **Dimensione:** ~50 KB
- **Uso:** Form validation React
- **Features:**
  - Performance ottimizzate
  - Zod integration
  - Minimal re-renders

### Logging ⭐ CRITICAL

#### **Pino** `^10.1.0` - Sistema logging strutturato

```json
"pino": "^10.1.0",
"pino-http": "^11.0.0",
"pino-pretty": "^13.1.2"
```

- **Dimensione:** ~100 KB
- **Uso:** **Structured logging (OBBLIGATORIO)**
- **Importanza:** ⭐⭐⭐⭐⭐ Sistema centrale per debugging e monitoring
- **Features:**
  - JSON logs strutturati per aggregatori
  - Low overhead (<10ms per log)
  - Child loggers con contesto
  - HTTP middleware per API logging
  - Pretty print colorato per development
  - Log rotation e retention
  - Livelli: trace, debug, info, warn, error, fatal

**Configurazione attuale:**

- `lib/logger-config.ts` - Setup centrale con formatter
- `lib/services/*` - Logging in tutti i services (DeadlineService, UserService, ecc.)
- Logging automatico richieste HTTP
- Logging errori con stack trace
- Logging operazioni database critiche

**Esempio log produzione:**

```json
{
  "level": 30,
  "time": 1699876543210,
  "pid": 1234,
  "hostname": "app-container",
  "service": "DeadlineService",
  "method": "createDeadline",
  "userId": "user_123",
  "organizationId": "org_456",
  "duration": 45,
  "msg": "Deadline created successfully"
}
```

**Esempio log development:**

```
[14:23:45.123] INFO (DeadlineService): Deadline created successfully
    service: "DeadlineService"
    method: "createDeadline"
    userId: "user_123"
    duration: 45ms
```

**Perché Pino:**

- 5-10x più veloce di Winston/Bunyan
- Zero dependencies in produzione
- Supporto natale per Docker/Kubernetes
- Integrazione facile con Datadog, Elasticsearch, CloudWatch

### Scheduling

#### **Node Cron** `^3.0.3`

```json
"node-cron": "^3.0.3"
```

- **Dimensione:** ~20 KB
- **Uso:** Scheduled tasks
- **Features:**
  - Cron syntax
  - Timezone support
  - Task management

**Task schedulati:**

- 📧 Invio reminder scadenze
- 🔄 Generazione scadenze ricorrenti
- 🗑️ Cleanup sessioni scadute
- 📊 Statistiche giornaliere

### Utility Libraries

#### **Date-fns** `^4.1.0`

```json
"date-fns": "^4.1.0",
"date-fns-tz": "^3.2.0"
```

- **Dimensione:** ~200 KB (tree-shakeable)
- **Uso:** Manipolazione date
- **Features:**
  - Immutable
  - Timezone support
  - i18n ready
  - Modular

#### **Nanoid** `^5.0.9`

```json
"nanoid": "^5.0.9"
```

- **Dimensione:** ~5 KB
- **Uso:** Generazione ID unici
- **Features:**
  - Piccolo e veloce
  - URL-safe
  - Collision-resistant

### UI Components

#### **Radix UI** (multiple packages)

```json
"@radix-ui/react-dialog": "^1.1.2",
"@radix-ui/react-dropdown-menu": "^2.1.16",
"@radix-ui/react-select": "^2.2.6",
// ... altri componenti
```

- **Dimensione totale:** ~500 KB
- **Uso:** Componenti UI accessibili
- **Features:**
  - WAI-ARIA compliant
  - Keyboard navigation
  - Unstyled (Tailwind ready)

#### **Lucide React** `^0.468.0`

```json
"lucide-react": "^0.468.0"
```

- **Dimensione:** ~100 KB (tree-shakeable)
- **Uso:** Icone SVG
- **Features:**
  - 1000+ icone
  - Customizzabili
  - React components

#### **Tailwind CSS** `^3.4.17`

```json
"tailwindcss": "^3.4.17"
```

- **Dimensione:** ~3 MB (dev), purged in production
- **Uso:** Utility-first CSS
- **Features:**
  - JIT compiler
  - Purge unused CSS
  - Dark mode
  - Responsive

### Charts & Data Visualization

#### **Recharts** `^2.15.0`

```json
"recharts": "^2.15.0"
```

- **Dimensione:** ~300 KB
- **Uso:** Grafici dashboard
- **Features:**
  - React components
  - Responsive
  - Composable
  - Customizable

**Grafici implementati:**

- 📊 Scadenze per mese
- 📈 Trend completamento
- 🎯 Compliance rate
- 📉 Overdue trends

### Calendar & iCal

#### **React Day Picker** `^9.11.1`

```json
"react-day-picker": "^9.11.1"
```

- **Dimensione:** ~40 KB
- **Uso:** Date picker component
- **Features:**
  - Customizzabile
  - i18n support
  - Range selection

#### **ICS** `^3.8.1`

```json
"ics": "^3.8.1"
```

- **Dimensione:** ~30 KB
- **Uso:** Generazione file .ics
- **Features:**
  - Calendar events
  - Reminder
  - Recurring events

**Funzionalità:**

- 📅 Download scadenze come .ics
- 🔔 Import in Google Calendar/Outlook
- 🔄 Eventi ricorrenti

### AI Integration

#### **Anthropic SDK** `^0.68.0`

```json
"@anthropic-ai/sdk": "^0.68.0"
```

- **Dimensione:** ~100 KB
- **Uso:** Claude AI integration (opzionale)
- **Features:**
  - Assistenza compilazione
  - Suggerimenti scadenze
  - Analisi documenti

---

## 🛠️ Dipendenze NPM Development

Usate solo in fase di build, NON incluse in produzione.

### Build Tools

#### **TypeScript** `^5.7.2`

```json
"typescript": "^5.7.2"
```

- **Uso:** Type checking, compilazione
- **Features:** Strict mode, inference avanzata

#### **Prisma CLI** `^6.1.0`

```json
"prisma": "^6.1.0"
```

- **Uso:** Migrations, schema management
- **Features:** Generate client, migrate, studio

### Linting & Formatting ⭐ DEVELOPMENT CRITICAL

#### **ESLint** `^9.17.0` - Code quality

```json
"eslint": "^9.17.0",
"eslint-config-next": "^16.0.1"
```

- **Uso:** Linting JavaScript/TypeScript
- **Importanza:** ⭐⭐⭐⭐ Mantiene qualità codice
- **Rules:** Next.js best practices, React hooks, accessibility
- **Integrazione:** Pre-commit hook, VS Code, CI/CD

**Regole attive:**

- No unused variables
- React hooks dependencies
- Accessibility (a11y)
- Next.js specific patterns
- TypeScript strict

#### **Prettier** `^3.4.2` - Code formatting

```json
"prettier": "^3.4.2",
"prettier-plugin-tailwindcss": "^0.6.9"
```

- **Uso:** Code formatting automatico
- **Importanza:** ⭐⭐⭐⭐ Consistenza codice
- **Features:**
  - Tailwind class sorting automatico
  - Formatting su save
  - Pre-commit hook integration

**Configurazione:**

```json
{
  "semi": true,
  "trailingComma": "all",
  "singleQuote": false,
  "printWidth": 80,
  "tabWidth": 2,
  "plugins": ["prettier-plugin-tailwindcss"]
}
```

### Git Hooks & Quality ⭐ DEVELOPMENT CRITICAL

#### **Husky** `^9.1.7` - Git hooks manager

```json
"husky": "^9.1.7"
```

- **Dimensione:** ~50 KB
- **Uso:** **Git hooks automation (OBBLIGATORIO per team)**
- **Importanza:** ⭐⭐⭐⭐⭐ Previene commit problematici
- **Setup:** `npm run prepare` crea `.husky/` directory

**Hook configurati:**

1. **pre-commit** - Esegue prima di ogni commit

   ```bash
   # Formatta codice modificato
   # Esegue linter
   # Verifica TypeScript
   ```

2. **commit-msg** - Valida messaggio commit
   ```bash
   # Verifica conventional commits
   # Format: type(scope): description
   ```

**Previene:**

- ❌ Commit con errori TypeScript
- ❌ Commit con codice non formattato
- ❌ Commit con console.log dimenticati
- ❌ Commit con messaggi non validi

#### **lint-staged** `^16.2.6` - Run su file staged

```json
"lint-staged": "^16.2.6"
```

- **Dimensione:** ~40 KB
- **Uso:** **Esegue comandi solo su file modificati**
- **Importanza:** ⭐⭐⭐⭐⭐ Performance pre-commit
- **Integrazione:** Husky pre-commit hook

**Configurazione in package.json:**

```json
"lint-staged": {
  "*.{ts,tsx}": [
    "prettier --write",
    "eslint --fix"
  ],
  "*.{json,md,css}": [
    "prettier --write"
  ],
  "prisma/schema.prisma": [
    "prisma format",
    "prisma generate"
  ]
}
```

**Performance:**

- ⚡ Solo file modificati (non tutto il progetto)
- ⚡ Parallel execution
- ⚡ Pre-commit in <5 secondi

#### **Commitlint** `^20.1.0` - Conventional commits

```json
"@commitlint/cli": "^20.1.0",
"@commitlint/config-conventional": "^20.0.0"
```

- **Dimensione:** ~100 KB
- **Uso:** **Valida formato commit messages**
- **Importanza:** ⭐⭐⭐⭐ Changelog automatico, release notes
- **Standard:** Conventional Commits 1.0.0

**Format obbligatorio:**

```bash
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Type validi:**

- `feat`: Nuova feature
- `fix`: Bug fix
- `docs`: Solo documentazione
- `style`: Formatting, missing semicolons
- `refactor`: Code refactoring
- `perf`: Performance improvement
- `test`: Aggiunta test
- `chore`: Build, dependencies, config

**Esempi validi:**

```bash
feat(auth): add two-factor authentication
fix(deadline): correct timezone handling
docs: update deployment guide
refactor(services): extract user service layer
```

**Esempi NON validi:**

```bash
❌ updated stuff
❌ Fixed bug
❌ WIP
❌ feature: add login (tipo sbagliato)
```

**Benefici:**

- ✅ Changelog automatico (semantic-release)
- ✅ Versioning semantico automatico
- ✅ Release notes generate
- ✅ Storico comprensibile

### Utility Development Tools

#### **tsx** `^4.20.6` - TypeScript executor

```json
"tsx": "^4.20.6"
```

- **Dimensione:** ~5 MB
- **Uso:** **Esegue TypeScript direttamente senza compilazione**
- **Importanza:** ⭐⭐⭐⭐ Script e seed database
- **Performance:** 10x più veloce di ts-node

**Usato in:**

```json
"scripts": {
  "prisma:seed": "tsx prisma/seed.ts"
}
```

**Vantaggi:**

- ⚡ Nessuna compilazione preventiva
- ✅ ESM e CommonJS support
- ✅ Source maps automatiche
- ✅ Watch mode integrato

#### **PostCSS** `^8.4.49` + **Autoprefixer** `^10.4.20`

```json
"postcss": "^8.4.49",
"autoprefixer": "^10.4.20"
```

- **Uso:** CSS processing per Tailwind
- **Importanza:** ⭐⭐⭐⭐ Compatibilità browser
- **Features:**
  - Vendor prefixes automatici
  - CSS optimization
  - Tailwind processing

### Testing

#### **Jest** `^29.7.0`

```json
"jest": "^29.7.0",
"@testing-library/react": "^16.1.0",
"@testing-library/jest-dom": "^6.6.3"
```

- **Uso:** Unit & integration tests
- **Features:** React testing utilities

#### **Playwright** `^1.49.1`

```json
"@playwright/test": "^1.49.1"
```

- **Uso:** E2E testing
- **Features:** Multi-browser, screenshot

### Git Hooks

#### **Husky** `^9.1.7`

```json
"husky": "^9.1.7",
"lint-staged": "^16.2.6"
```

- **Uso:** Pre-commit hooks
- **Features:**
  - Auto-format on commit
  - Run tests before push
  - Conventional commits

#### **Commitlint** `^20.1.0`

```json
"@commitlint/cli": "^20.1.0",
"@commitlint/config-conventional": "^20.0.0"
```

- **Uso:** Commit message linting
- **Format:** `feat: description`

---

## 🌐 Servizi Esterni

### Email Provider (Obbligatorio)

#### Opzione 1: **AWS SES** (Raccomandato)

- **Costo:** $0.10 per 1.000 email
- **Setup:** Verifica dominio, SMTP credentials
- **Deliverability:** 99.9%
- **Configurazione:**
  ```bash
  EMAIL_HOST=email-smtp.eu-west-1.amazonaws.com
  EMAIL_PORT=587
  EMAIL_USER=<SMTP_USERNAME>
  EMAIL_PASSWORD=<SMTP_PASSWORD>
  ```

#### Opzione 2: **SendGrid**

- **Costo:** Free 100/giorno, $19.95/mese (50k)
- **Setup:** API key
- **Deliverability:** 99%+
- **Configurazione:**
  ```bash
  EMAIL_HOST=smtp.sendgrid.net
  EMAIL_PORT=587
  EMAIL_USER=apikey
  EMAIL_PASSWORD=<API_KEY>
  ```

#### Opzione 3: **Mailgun**

- **Costo:** $35/mese (50k email)
- **Setup:** Domain verification
- **EU Region:** Disponibile
- **Configurazione:**
  ```bash
  EMAIL_HOST=smtp.eu.mailgun.org
  EMAIL_PORT=587
  EMAIL_USER=<USERNAME>
  EMAIL_PASSWORD=<PASSWORD>
  ```

### Storage (Opzionale)

#### **AWS S3** - File storage cloud

- **Costo:** $0.023/GB/mese
- **Uso:** Upload documenti, backup
- **Alternative:** Locale (incluso di default)
- **Configurazione:**
  ```bash
  STORAGE_TYPE=s3
  AWS_REGION=eu-west-1
  AWS_S3_BUCKET=<bucket-name>
  AWS_ACCESS_KEY_ID=<key>
  AWS_SECRET_ACCESS_KEY=<secret>
  ```

### Monitoring (Raccomandato)

#### **Sentry** - Error tracking

- **Costo:** Free tier disponibile
- **Setup:** DSN key
- **Features:** Error tracking, performance

#### **Uptime Robot** - Uptime monitoring

- **Costo:** Free (50 monitors)
- **Setup:** URL monitoring
- **Alerts:** Email, SMS, Slack

---

## 💻 Requisiti Sistema

### Server Produzione

#### Minimo (TEST/SVILUPPO)

```
CPU: 2 cores
RAM: 4 GB
Disco: 40 GB SSD
Network: 1 Gbps
```

#### Raccomandato (PRODUZIONE)

```
CPU: 4 cores
RAM: 8 GB
Disco: 80 GB SSD
Network: 1 Gbps
Backup: Storage separato
```

### Software Server

```bash
# Sistema Operativo
Ubuntu 22.04 LTS o superiore
# oppure
Debian 11/12

# Docker
Docker Engine 24.0+
Docker Compose V2 2.20+

# Utilità
curl, git, nano/vim
ufw (firewall)
certbot (SSL)
```

### Porte Necessarie

```
22   - SSH
80   - HTTP (redirect HTTPS)
443  - HTTPS (applicazione)
3000 - App (interno Docker)
5432 - PostgreSQL (interno Docker)
6379 - Redis (interno Docker)
```

### Accesso Esterno

Solo HTTPS (443) deve essere esposto pubblicamente.
Tutte le altre porte sono interne alla rete Docker.

---

## 📊 Stima Consumi

### Ambiente PRODUZIONE (traffico medio)

**Storage:**

```
App Docker image:        500 MB
PostgreSQL data:         1-5 GB (dipende dall'uso)
Redis data:              50-200 MB
Logs:                    100 MB/mese
Backup:                  2-10 GB
Uploads (documenti):     1-10 GB

TOTALE STIMATO:          5-30 GB
```

**RAM (runtime):**

```
Next.js App:             512 MB - 2 GB
PostgreSQL:              256 MB - 1 GB
Redis:                   50 MB - 200 MB
Nginx:                   10 MB - 50 MB
Sistema:                 500 MB - 1 GB

TOTALE STIMATO:          1.5 GB - 5 GB
```

**CPU (medio):**

```
Idle:                    5-10%
Normale:                 10-30%
Picco:                   50-80%
```

**Network (al mese):**

```
Traffico HTTP:           10-50 GB
Email:                   Negligibile
Backup upload:           5-20 GB

TOTALE STIMATO:          15-70 GB
```

---

## 📊 Tabella Riassuntiva Dipendenze Critiche

### Runtime Production (nel container Docker)

| Dipendenza        | Versione    | Dimensione | Importanza | Scopo                   |
| ----------------- | ----------- | ---------- | ---------- | ----------------------- |
| **Next.js**       | ^16.0.1     | ~20 MB     | ⭐⭐⭐⭐⭐ | Framework applicazione  |
| **Prisma Client** | ^6.1.0      | ~2 MB      | ⭐⭐⭐⭐⭐ | Database ORM type-safe  |
| **Pino**          | ^10.1.0     | ~100 KB    | ⭐⭐⭐⭐⭐ | Structured logging      |
| **NextAuth**      | ^5.0.0-beta | ~500 KB    | ⭐⭐⭐⭐⭐ | Autenticazione completa |
| **Nodemailer**    | ^6.9.16     | ~200 KB    | ⭐⭐⭐⭐⭐ | Invio email SMTP/SES    |
| **Zod**           | ^3.25.76    | ~60 KB     | ⭐⭐⭐⭐⭐ | Validazione runtime     |
| **bcryptjs**      | ^2.4.3      | ~50 KB     | ⭐⭐⭐⭐   | Hash password sicuro    |
| **node-cron**     | ^3.0.3      | ~20 KB     | ⭐⭐⭐⭐   | Jobs schedulati         |
| **date-fns**      | ^4.1.0      | ~200 KB    | ⭐⭐⭐⭐   | Date/timezone           |
| React             | ^19.0.0     | ~300 KB    | ⭐⭐⭐⭐⭐ | UI library              |
| Tailwind CSS      | ^3.4.17     | ~3 MB dev  | ⭐⭐⭐⭐   | Styling (purged)        |

### Development Tools (NON in produzione)

| Dipendenza      | Versione | Importanza | Scopo                     | Quando si usa          |
| --------------- | -------- | ---------- | ------------------------- | ---------------------- |
| **Husky**       | ^9.1.7   | ⭐⭐⭐⭐⭐ | Git hooks automation      | Pre-commit, commit-msg |
| **lint-staged** | ^16.2.6  | ⭐⭐⭐⭐⭐ | Pre-commit formatter      | Ogni commit            |
| **Commitlint**  | ^20.1.0  | ⭐⭐⭐⭐   | Commit message validation | Ogni commit            |
| **Prisma CLI**  | ^6.1.0   | ⭐⭐⭐⭐⭐ | Migrations, generate      | Deploy, development    |
| **TypeScript**  | ^5.7.2   | ⭐⭐⭐⭐⭐ | Type checking             | Build time             |
| **ESLint**      | ^9.17.0  | ⭐⭐⭐⭐   | Code quality              | Pre-commit, CI/CD      |
| **Prettier**    | ^3.4.2   | ⭐⭐⭐⭐   | Code formatting           | Pre-commit, on save    |
| **tsx**         | ^4.20.6  | ⭐⭐⭐⭐   | Run TypeScript            | Scripts, seed          |
| Jest            | ^29.7.0  | ⭐⭐⭐     | Testing                   | CI/CD, development     |
| Playwright      | ^1.49.1  | ⭐⭐⭐     | E2E testing               | CI/CD                  |

### Docker Services (Obbligatori)

| Servizio       | Immagine           | Dimensione  | Importanza | Ports              |
| -------------- | ------------------ | ----------- | ---------- | ------------------ |
| **PostgreSQL** | postgres:16-alpine | ~80 MB      | ⭐⭐⭐⭐⭐ | 5432 (interno)     |
| **Redis**      | redis:7-alpine     | ~30 MB      | ⭐⭐⭐⭐   | 6379 (interno)     |
| **Nginx**      | nginx:alpine       | ~25 MB      | ⭐⭐⭐     | 80, 443 (pubblico) |
| **App**        | node:20-alpine     | ~40 MB base | ⭐⭐⭐⭐⭐ | 3000 (interno)     |

### Servizi Esterni (Richiesti)

| Servizio       | Provider      | Costo    | Importanza | Alternativa       |
| -------------- | ------------- | -------- | ---------- | ----------------- |
| **Email SMTP** | AWS SES       | $0.10/1k | ⭐⭐⭐⭐⭐ | SendGrid, Mailgun |
| Storage        | Locale        | €0       | ⭐⭐⭐⭐   | AWS S3 (~€1/mese) |
| SSL/TLS        | Let's Encrypt | €0       | ⭐⭐⭐⭐⭐ | Cloudflare        |
| Monitoring     | Logs locali   | €0       | ⭐⭐⭐     | Sentry, Datadog   |

---

## 🔍 Perché Queste Dipendenze?

### Husky + lint-staged + Commitlint = Quality Automation

**Problema risolto:**

- ❌ Commit con errori TypeScript
- ❌ Codice non formattato
- ❌ Commit messages non standardizzati
- ❌ console.log dimenticati

**Soluzione automatica:**

```bash
# Al commit, automaticamente:
1. Prettier formatta i file modificati
2. ESLint corregge problemi comuni
3. TypeScript verifica errori
4. Prisma rigenera client se schema modificato
5. Commitlint valida messaggio commit

# Tempo: ~3-5 secondi
# Previene: 90% dei problemi comuni
```

**Setup in questo progetto:**

```json
// package.json
"husky": {
  "hooks": {
    "pre-commit": "lint-staged",
    "commit-msg": "commitlint -E HUSKY_GIT_PARAMS"
  }
}
```

### Pino = Debugging e Monitoring Semplificato

**Senza Pino:**

```javascript
console.log("User created:", user.id);
// Problemi:
// - No context (chi? quando? dove?)
// - No aggregation possibile
// - No log levels
// - No structured data
```

**Con Pino:**

```javascript
logger.info(
  {
    service: "UserService",
    method: "createUser",
    userId: user.id,
    organizationId: user.organizationId,
    duration: 45,
  },
  "User created successfully",
);

// Output JSON:
// {"level":30,"service":"UserService","userId":"123",...}
//
// Vantaggi:
// ✅ Searchable in log aggregators
// ✅ Filtrable per service/user/org
// ✅ Metrics extraction automatica
// ✅ Error tracking con context
```

### Node-cron = Automation Background

**Jobs schedulati nel sistema:**

1. **Deadline reminders** (ogni ora)

   ```javascript
   cron.schedule("0 * * * *", async () => {
     // Trova scadenze in arrivo (7, 3, 1 giorni)
     // Invia email reminder
   });
   ```

2. **Recurring deadlines** (ogni giorno)

   ```javascript
   cron.schedule("0 2 * * *", async () => {
     // Genera prossime scadenze ricorrenti
   });
   ```

3. **Session cleanup** (ogni notte)
   ```javascript
   cron.schedule("0 3 * * *", async () => {
     // Elimina sessioni scadute
   });
   ```

**Alternativa:** Servizi esterni (AWS Lambda, cron jobs server)
**Scelta:** node-cron integrato = più semplice, zero costi extra

---

## ✅ Checklist Dipendenze

Prima del deployment, verifica:

### Docker

- [ ] Docker Engine installato (v24.0+)
- [ ] Docker Compose installato (v2.20+)
- [ ] Utente nel gruppo docker
- [ ] Docker daemon attivo

### Configurazione

- [ ] File .env creato e compilato
- [ ] Database URL configurato
- [ ] NEXTAUTH_SECRET generato
- [ ] Email provider configurato
- [ ] Super admin email/password definiti

### Server

- [ ] 4+ GB RAM disponibile
- [ ] 40+ GB disco disponibile
- [ ] Firewall configurato (22, 80, 443)
- [ ] DNS configurato
- [ ] SSL certificate (Let's Encrypt)

### Servizi Esterni

- [ ] Email provider account attivo
- [ ] SMTP credentials valide
- [ ] Dominio email verificato
- [ ] Sandbox mode disabilitato (se SES)

### Verifica Finale

- [ ] `./scripts/check-docker-setup.sh` → OK
- [ ] `./scripts/test-email-config.sh` → Email ricevuta
- [ ] `docker-compose up -d` → Containers healthy
- [ ] `curl http://localhost:3000/api/health` → 200 OK

---

## 🆘 Troubleshooting Dipendenze

### "Module not found"

```bash
# Rebuild immagine Docker
docker-compose build --no-cache app
```

### "Cannot connect to database"

```bash
# Verifica PostgreSQL
docker-compose ps postgres
docker-compose logs postgres

# Verifica DATABASE_URL in .env
```

### "Email not sending"

```bash
# Test configurazione
./scripts/test-email-config.sh test@email.it

# Verifica logs
docker-compose logs app | grep "📧"
```

### "Out of memory"

```bash
# Aggiungi swap
sudo fallocate -l 4G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

---

Per setup completo consulta: **`PRODUCTION_SETUP.md`**

Per deployment dettagliato: **`DEPLOYMENT.md`**

Per quick start: **`DOCKER_QUICKSTART.md`**
