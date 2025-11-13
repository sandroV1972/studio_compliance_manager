# 📦 Dipendenze Sistema - Studio Compliance Manager

Documentazione completa di tutte le dipendenze necessarie per il funzionamento del sistema.

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

### Logging

#### **Pino** `^10.1.0`

```json
"pino": "^10.1.0",
"pino-http": "^11.0.0",
"pino-pretty": "^13.1.2"
```

- **Dimensione:** ~100 KB
- **Uso:** Structured logging
- **Features:**
  - JSON logs
  - Low overhead
  - Child loggers
  - HTTP middleware
  - Pretty print dev

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

### Linting & Formatting

#### **ESLint** `^9.17.0`

```json
"eslint": "^9.17.0",
"eslint-config-next": "^16.0.1"
```

- **Uso:** Code quality
- **Rules:** Next.js best practices

#### **Prettier** `^3.4.2`

```json
"prettier": "^3.4.2",
"prettier-plugin-tailwindcss": "^0.6.9"
```

- **Uso:** Code formatting
- **Features:** Tailwind class sorting

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
