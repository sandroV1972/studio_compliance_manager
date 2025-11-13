# 🎯 Prossimi Passi - Deployment Produzione# Passi Successivi - Roadmap Backend

Guida rapida per mettere online il sistema **Studio Compliance Manager**.## ✅ Completato

## 📚 Documentazione Disponibile### Service Layer & Architecture

Hai a disposizione **5 guide complete**:- [x] **DeadlineService** - Gestione scadenze con validazione Zod

- [x] **DocumentService** - Upload/download documenti con file system

### 1. **PRODUCTION_SETUP.md** ⭐ INIZIA DA QUI- [x] **TemplateService** - Template globali e organizzazione con filtri regionali

Guida completa setup produzione con:- [x] **StructureService** - Gestione strutture con conversione date italiane

- 🖥️ Scelta server (DigitalOcean, Hetzner, AWS)- [x] **UserService** - Gestione utenti, approvazione, permessi

- 📧 Configurazione AWS SES passo-passo- [x] **Pino Structured Logging** - Log JSON strutturati per tutti i services

- 📨 Alternative SMTP (SendGrid, Mailgun)- [x] **API Response Envelope** - Formato standardizzato per tutte le risposte

- 📦 Storage S3 opzionale- [x] **Error Handling Centralizzato** - ServiceError con codici standard

- 🚀 Installazione completa- [x] **DTO Types** - Input/Output types per tutti i services

- 🔒 SSL/HTTPS con Let's Encrypt

- 🔧 Troubleshooting dettagliato### API Endpoints Refactored

### 2. **DEPENDENCIES.md**- [x] 7 endpoint User (admin + utente)

Elenco completo dipendenze:- [x] 5 endpoint Deadline

- 🐳 Immagini Docker utilizzate- [x] 5 endpoint Document

- 📦 Dipendenze NPM runtime e development- [x] 5 endpoint Template

- 🌐 Servizi esterni necessari- [x] 4 endpoint Structure

- 💻 Requisiti sistema e stime consumi- **Totale: 26 endpoint migrati al Service Layer** ✨

### 3. **DEPLOYMENT.md**## 🎯 Prossimi Step Raccomandati

Guida deployment tecnica (900+ righe):

- Prerequisiti server### 1. **Testing** (Priorità Alta)

- Setup TEST/PRE-PROD/PROD

- Configurazione backup#### Unit Tests per Services

- Monitoraggio sistema

- Best practices sicurezza```typescript

// **tests**/services/user-service.test.ts

### 4. **DOCKER_QUICKSTART.md**describe("UserService", () => {

Quick start in 5 minuti: it("should approve user and set needsOnboarding", async () => {

- Clone repository const mockPrisma = createMockPrisma();

- Configurazione veloce const service = new UserService(mockPrisma);

- Deploy immediato

- Test funzionamento const result = await service.approveUser({

      userId: "123",

### 5. **scripts/README.md** adminUserId: "admin-1",

Documentazione script helper: });

- check-docker-setup.sh

- test-email-config.sh expect(result.accountStatus).toBe("APPROVED");

- backup/restore/sync expect(result.needsOnboarding).toBe(true);

- Esempi d'uso comuni });

});

---```

## 🚀 Quick Start - 3 Step Deployment**File da creare:**

### Step 1: Scegli e Configura Server (30 minuti)- `__tests__/services/deadline-service.test.ts`

- `__tests__/services/document-service.test.ts`

**Opzione A - DigitalOcean** (Raccomandato per semplicità)- `__tests__/services/template-service.test.ts`

```bash- `**tests**/services/structure-service.test.ts`

# 1. Crea account su digitalocean.com- `__tests__/services/user-service.test.ts`

# 2. Crea Droplet:

# - Ubuntu 22.04 LTS**Setup necessario:**

# - 4GB RAM / 2 CPU ($24/mese)

# - Amsterdam o Frankfurt```bash

# 3. Salva IP assegnatonpm install --save-dev jest @types/jest ts-jest

```npm install --save-dev @testing-library/react @testing-library/jest-dom

```

**Opzione B - Hetzner** (Miglior prezzo)

````bash#### Integration Tests per API Routes

# 1. Crea account su hetzner.com

# 2. Cloud Console -> Server:```typescript

#    - CX21 (4GB RAM, €5.83/mese)// __tests__/api/user/permissions.test.ts

#    - Nurembergdescribe("GET /api/user/permissions", () => {

# 3. Salva IP assegnato  it("should return user permissions with envelope", async () => {

```    const response = await fetch("/api/user/permissions");

    const result = await response.json();

**Connettiti al server:**

```bash    expect(result).toHaveProperty("success", true);

ssh root@IL_TUO_IP    expect(result).toHaveProperty("data");

    expect(result.data).toHaveProperty("role");

# Setup iniziale (copia-incolla tutto)  });

apt update && apt upgrade -y});

curl -fsSL https://get.docker.com | sh```

apt install docker-compose-plugin -y

ufw allow 22/tcp && ufw allow 80/tcp && ufw allow 443/tcp---

ufw enable

```### 2. **Monitoring & Observability** (Priorità Alta)



---#### Log Aggregation



### Step 2: Configura Email Provider (20 minuti)- **Setup Pino Pretty** per dev environment

- **Integrazione con log aggregator** (Datadog, LogRocket, Better Stack)

**Opzione A - AWS SES** (Raccomandato, $0.10/1000 email)- **Error tracking** (Sentry integration)



1. **Crea account AWS** → aws.amazon.com```typescript

2. **Attiva SES** → Console AWS → Simple Email Service// lib/logger.ts - Aggiungere Sentry

3. **Verifica dominio:**import * as Sentry from "@sentry/nextjs";

   - SES → Verified identities → Create identity

   - Domain: `tuodominio.it`export function createApiLogger(method: string, path: string, userId?: string) {

   - Aggiungi record DNS forniti  return pino({

4. **Richiedi production access:**    // ... existing config

   - Account dashboard → Request production access    hooks: {

   - Use case: "Transactional emails"      logMethod(inputArgs, method) {

   - Stima: 500 email/giorno        // Invia errori a Sentry

5. **Crea credenziali SMTP:**        if (inputArgs[0]?.level >= 50) {

   - SMTP settings → Create SMTP credentials          // Error level

   - Salva username/password          Sentry.captureException(inputArgs[0].error);

        }

**Opzione B - SendGrid** (100 email/giorno gratis)        return method.apply(this, inputArgs);

      },

1. **Crea account** → sendgrid.com    },

2. **API Key** → Settings → API Keys → Create  });

3. Usa nelle variabili:}

   ```bash```

   EMAIL_HOST=smtp.sendgrid.net

   EMAIL_PORT=587#### Metriche & Performance

   EMAIL_USER=apikey

   EMAIL_PASSWORD=<TUA_API_KEY>```typescript

   ```// lib/metrics.ts

export class MetricsService {

---  trackApiCall(endpoint: string, duration: number, status: number) {

    // Invia a Datadog, CloudWatch, etc.

### Step 3: Deploy Applicazione (20 minuti)  }



**Sul server, esegui:**  trackServiceCall(serviceName: string, method: string, duration: number) {

    // Track service performance

```bash  }

# 1. Clone repository}

cd ~```

git clone https://github.com/sandroV1972/studio_compliance_manager.git

cd studio_compliance_manager---



# 2. Crea configurazione### 3. **Validazione Input Avanzata** (Priorità Media)

cp .env.production.example .env

Attualmente usiamo Zod solo nei services. Espandere con:

# 3. Genera segreti sicuri

echo "NEXTAUTH_SECRET=$(openssl rand -base64 32)"#### Rate Limiting

echo "DB_PASSWORD=$(openssl rand -base64 24)"

echo "REDIS_PASSWORD=$(openssl rand -base64 24)"```typescript

// lib/rate-limit.ts

# 4. Modifica .env con i tuoi datiimport { Ratelimit } from "@upstash/ratelimit";

nano .envimport { Redis } from "@upstash/redis";

````

const ratelimit = new Ratelimit({

**Configurazione minima .env:** redis: Redis.fromEnv(),

````bash limiter: Ratelimit.slidingWindow(10, "10 s"),

# Database});

DATABASE_URL="postgresql://compliance_user:PASSWORD_DB@postgres:5432/compliance_prod"

POSTGRES_PASSWORD=PASSWORD_DBexport async function checkRateLimit(identifier: string) {

  const { success } = await ratelimit.limit(identifier);

# NextAuth  if (!success) {

NEXTAUTH_SECRET=SEGRETO_GENERATO_SOPRA    throw new ValidationError("Too many requests", "RATE_LIMIT_EXCEEDED");

NEXTAUTH_URL=https://tuodominio.it  }

}

# Email (AWS SES)```

EMAIL_HOST=email-smtp.eu-west-1.amazonaws.com

EMAIL_PORT=587#### Request Validation Middleware

EMAIL_USER=TUO_SMTP_USERNAME

EMAIL_PASSWORD=TUO_SMTP_PASSWORD```typescript

EMAIL_FROM=noreply@tuodominio.it// lib/middleware/validate-request.ts

export function validateRequest<T>(schema: z.ZodSchema<T>) {

# Redis  return async (req: Request) => {

REDIS_PASSWORD=PASSWORD_REDIS    const body = await req.json();

    const result = schema.safeParse(body);

# Super Admin

SUPER_ADMIN_EMAIL=admin@tuodominio.it    if (!result.success) {

SUPER_ADMIN_PASSWORD=PasswordSicura123!      return createErrorResponse(

SUPER_ADMIN_NAME="Admin Sistema"        ErrorCodes.VALIDATION_ERROR,

```        "Invalid request body",

        400,

**Salva (CTRL+O, CTRL+X) e avvia:**        { errors: result.error.errors },

      );

```bash    }

# 5. Verifica configurazione

./scripts/check-docker-setup.sh    return result.data;

  };

# 6. Test email}

./scripts/test-email-config.sh admin@tuodominio.it```



# 7. Avvia produzione---

docker-compose -f docker-compose.prod.yml up -d

### 4. **Caching** (Priorità Media)

# 8. Verifica containers

docker-compose -f docker-compose.prod.yml ps#### Redis Cache per Queries Frequenti



# 9. Verifica salute app```typescript

curl http://localhost:3000/api/health// lib/cache.ts

import Redis from "ioredis";

# Dovresti vedere: {"status":"healthy","database":"connected"}

```const redis = new Redis(process.env.REDIS_URL);



**Configura SSL (5 minuti):**export async function getCached<T>(

  key: string,

```bash  fetchFn: () => Promise<T>,

# Certbot automatico  ttl: number = 60,

apt install certbot python3-certbot-nginx -y): Promise<T> {

certbot --nginx -d tuodominio.it  const cached = await redis.get(key);

  if (cached) return JSON.parse(cached);

# Segui wizard:

# - Email: tuoemail@esempio.it  const data = await fetchFn();

# - ToS: Yes  await redis.setex(key, ttl, JSON.stringify(data));

# - Redirect HTTPS: Yes  return data;

}

# Auto-renewal configurato ✅```

````

#### Applicazione nei Services

---

````typescript

## ✅ Verifica Installazione// lib/services/template-service.ts

async getGlobalTemplates(region?: string) {

### 1. Test Login Super Admin  const cacheKey = `global-templates:${region || 'all'}`;

```bash

# Apri browser  return getCached(cacheKey, async () => {

https://tuodominio.it/auth/login    return this.db.deadlineTemplate.findMany({

      where: { ownerType: 'GLOBAL', active: true }

# Login con:    });

Email: SUPER_ADMIN_EMAIL (dal .env)  }, 300); // Cache 5 min

Password: SUPER_ADMIN_PASSWORD (dal .env)}

````

### 2. Test Registrazione Utente---

```bash

# Apri### 5. **Database Optimization** (Priorità Media)

https://tuodominio.it/auth/register

#### Indexes

# Registra nuovo utente

# Dovresti ricevere email di verifica ✉️Verificare e aggiungere indexes per query frequenti:

```

````sql

### 3. Test Upload Documenti-- prisma/schema.prisma

```bashmodel DeadlineInstance {

# Dopo login, vai in una scadenza  // ... fields

# Carica un documento PDF

# Verifica che venga salvato  @@index([organizationId, status])

```  @@index([dueDate, status])

  @@index([structureId, status])

### 4. Monitoring Attivo}

```bash

# Logs in tempo realemodel Document {

docker-compose -f docker-compose.prod.yml logs -f app  @@index([organizationId, ownerType, ownerId])

  @@index([uploadedById, createdAt])

# Verifica backup}

docker-compose -f docker-compose.prod.yml exec backup ls -lh /backups/```



# Verifica database#### Query Optimization

docker-compose -f docker-compose.prod.yml exec postgres \

  psql -U compliance_user -d compliance_prod -c '\dt'```typescript

```// Evitare N+1 queries con include

const deadlines = await this.db.deadlineInstance.findMany({

---  where: { organizationId },

  include: {

## 📊 Costi Mensili Stimati    person: true,

    structure: true,

### Setup Base (Studio medio, 20 utenti)    template: true,

    documents: true, // Single query invece di N queries

| Servizio | Scelta | Costo |  },

|----------|--------|-------|});

| **Server** | DigitalOcean 4GB | €22/mese |```

| **Email** | AWS SES (2.000 email) | €0.20/mese |

| **Storage** | Locale (incluso) | €0 |---

| **SSL** | Let's Encrypt | €0 |

| **Dominio** | .it (separato) | €10/anno |### 6. **Webhook & Background Jobs** (Priorità Bassa)

| **TOTALE** | | **~€22/mese** |

#### Cron Jobs per Reminder

### Setup Economico

```typescript

| Servizio | Scelta | Costo |// app/api/cron/deadline-reminders/route.ts

|----------|--------|-------|import { deadlineService } from "@/lib/services/deadline-service";

| **Server** | Hetzner CX21 | €5.83/mese |

| **Email** | SendGrid Free | €0 |export async function GET(request: Request) {

| **Storage** | Locale | €0 |  // Verifica cron secret

| **SSL** | Let's Encrypt | €0 |  const authHeader = request.headers.get("authorization");

| **TOTALE** | | **€5.83/mese** |  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {

    return new Response("Unauthorized", { status: 401 });

### Setup Enterprise  }



| Servizio | Scelta | Costo |  // Trova deadlines con reminder da inviare

|----------|--------|-------|  const upcomingDeadlines = await deadlineService.getUpcomingDeadlines();

| **Server** | AWS t3.medium | €28/mese |

| **Email** | AWS SES | €0.20/mese |  for (const deadline of upcomingDeadlines) {

| **Storage** | AWS S3 (20GB) | €0.50/mese |    await sendReminderEmail(deadline);

| **Backup** | S3 (50GB) | €1.20/mese |  }

| **CloudWatch** | Monitoring | €5/mese |

| **TOTALE** | | **~€35/mese** |  return Response.json({ processed: upcomingDeadlines.length });

}

---```



## 🔧 Comandi Utili Post-Deployment#### Queue System (BullMQ/Inngest)



### Gestione Containers```typescript

// lib/queue/email-queue.ts

```bashimport { Queue } from "bullmq";

# Start/Stop/Restart

docker-compose -f docker-compose.prod.yml startexport const emailQueue = new Queue("email", {

docker-compose -f docker-compose.prod.yml stop  connection: { host: "localhost", port: 6379 },

docker-compose -f docker-compose.prod.yml restart});



# Logsexport async function sendEmailAsync(

docker-compose -f docker-compose.prod.yml logs -f app  to: string,

docker-compose -f docker-compose.prod.yml logs postgres  subject: string,

docker-compose -f docker-compose.prod.yml logs redis  body: string,

) {

# Stato  await emailQueue.add("send-email", { to, subject, body });

docker-compose -f docker-compose.prod.yml ps}

docker stats```

````

---

### Backup/Restore

### 7. **API Documentation** (Priorità Bassa)

````bash

# Backup manuale#### OpenAPI/Swagger

docker-compose -f docker-compose.prod.yml exec backup /app/scripts/backup.sh

```typescript

# Lista backup// app/api/docs/route.ts

docker-compose -f docker-compose.prod.yml exec backup ls -lh /backups/import { generateOpenAPISpec } from "@/lib/openapi";



# Restoreexport async function GET() {

docker-compose -f docker-compose.prod.yml exec backup \  const spec = generateOpenAPISpec({

  /app/scripts/restore.sh /backups/FILE_BACKUP.sql.gz    title: "Compliance Manager API",

```    version: "1.0.0",

    endpoints: [

### Manutenzione Database      // Auto-generate from route files

    ],

```bash  });

# Accedi al database

docker-compose -f docker-compose.prod.yml exec postgres \  return Response.json(spec);

  psql -U compliance_user -d compliance_prod}

````

# Dimensione database

SELECT pg_size_pretty(pg_database_size('compliance_prod'));---

# Ottimizza### 8. **Security Enhancements** (Priorità Alta)

VACUUM ANALYZE;

#### Input Sanitization

# Esci

\q```typescript

````// lib/sanitize.ts

import createDOMPurify from "dompurify";

### Aggiornamentiimport { JSDOM } from "jsdom";



```bashconst window = new JSDOM("").window;

# Pull nuova versioneconst DOMPurify = createDOMPurify(window);

git pull origin main

export function sanitizeHTML(dirty: string): string {

# Rebuild e riavvia  return DOMPurify.sanitize(dirty);

docker-compose -f docker-compose.prod.yml down}

docker-compose -f docker-compose.prod.yml build --no-cache```

docker-compose -f docker-compose.prod.yml up -d

#### SQL Injection Prevention

# Verifica

curl http://localhost:3000/api/health- ✅ Già coperto da Prisma ORM

````

#### XSS Prevention

---

- Sanitize input HTML nei notes/description fields

## 🆘 Troubleshooting Rapido- CSP headers in Next.js config

### Container non si avvia#### CORS Configuration

````bash

# Verifica logs```typescript

docker-compose -f docker-compose.prod.yml logs app// next.config.js

module.exports = {

# Riavvia tutto  async headers() {

docker-compose -f docker-compose.prod.yml down    return [

docker-compose -f docker-compose.prod.yml up -d      {

```        source: "/api/:path*",

        headers: [

### Email non funzionano          {

```bash            key: "Access-Control-Allow-Origin",

# Test configurazione            value: process.env.ALLOWED_ORIGIN,

./scripts/test-email-config.sh test@email.it          },

          {

# Verifica logs email            key: "Access-Control-Allow-Methods",

docker-compose -f docker-compose.prod.yml logs app | grep "📧"            value: "GET,POST,PATCH,DELETE",

```          },

        ],

### Applicazione lenta      },

```bash    ];

# Verifica risorse  },

docker stats};

````

# Aggiungi swap se poca RAM

sudo fallocate -l 4G /swapfile---

sudo chmod 600 /swapfile

sudo mkswap /swapfile## 📋 Checklist Implementazione

sudo swapon /swapfile

````### Testing



### Database corrotto- [ ] Setup Jest + Testing Library

```bash- [ ] Unit tests per tutti i services (80% coverage minimo)

# Restore da ultimo backup- [ ] Integration tests per API routes critiche

./scripts/restore.sh /backups/ULTIMO_BACKUP.sql.gz- [ ] E2E tests per flussi principali (Playwright/Cypress)

````

### Monitoring

---

- [ ] Setup Sentry per error tracking

## 📞 Supporto e Risorse- [ ] Integrazione log aggregator (Datadog/LogRocket)

- [ ] Dashboard metriche performance API

### Documentazione- [ ] Alert configurati per errori critici

- 📖 **PRODUCTION_SETUP.md** - Setup completo

- 📖 **DEPLOYMENT.md** - Deployment dettagliato### Performance

- 📖 **DEPENDENCIES.md** - Tutte le dipendenze

- 📖 **scripts/README.md** - Script utilities- [ ] Redis cache per queries frequenti

- 📖 **BACKEND_ROADMAP.md** - Roadmap sviluppo backend- [ ] Database indexes ottimizzati

- [ ] Query optimization (eliminare N+1)

### Monitoring Raccomandato- [ ] CDN per file statici

- [UptimeRobot](https://uptimerobot.com) - Free uptime monitoring

- [Netdata](https://www.netdata.cloud) - Real-time monitoring### Security

- [Sentry](https://sentry.io) - Error tracking

- [ ] Rate limiting su tutti gli endpoint

### Community Support- [ ] Input sanitization per HTML

- GitHub Issues: [Apri issue](https://github.com/sandroV1972/studio_compliance_manager/issues)- [ ] CORS configuration

- Email: Configurato nel sistema- [ ] Security headers (CSP, HSTS, etc.)

- [ ] Penetration testing

---

### Documentation

## 🎉 Congratulazioni!

- [ ] OpenAPI/Swagger docs

Il tuo sistema **Studio Compliance Manager** è ora online e pronto per l'uso!- [ ] Postman collection

- [ ] README aggiornato con esempi

**Prossimi step operativi:**- [ ] Architecture diagram

1. ✅ Crea la tua prima organizzazione

2. ✅ Configura le strutture---

3. ✅ Aggiungi persone e ruoli

4. ✅ Imposta scadenze e template## 🚀 Quick Wins (Da fare subito)

5. ✅ Invita membri del team

6. ✅ Configura reminder automatici1. **Testing Setup** - 2h

7. ✅ Monitora compliance

   ```bash

   ```

**Buon lavoro! 🚀** npm install --save-dev jest @types/jest ts-jest

npm install --save-dev @testing-library/react

# Creare jest.config.js e primi 5 test

````

2. **Sentry Integration** - 1h

```bash
npm install @sentry/nextjs
npx @sentry/wizard -i nextjs
# Configurare error tracking
````

3. **Rate Limiting** - 1h

   ```bash
   npm install @upstash/ratelimit @upstash/redis
   # Implementare su endpoint critici
   ```

4. **Database Indexes** - 30min

   ```prisma
   // Aggiungere @@index nei modelli Prisma
   // npx prisma migrate dev
   ```

5. **Input Sanitization** - 1h
   ```bash
   npm install dompurify jsdom
   # Sanitize HTML nei notes/description
   ```

---

## 📊 Metriche di Successo

- **Test Coverage**: > 80%
- **API Response Time**: P95 < 500ms
- **Error Rate**: < 0.1%
- **Uptime**: > 99.9%
- **Log Retention**: 30 giorni
- **MTTR (Mean Time To Recovery)**: < 15min

---

## 🎓 Risorse

- [Testing Next.js Apps](https://nextjs.org/docs/testing)
- [Pino Logging Best Practices](https://github.com/pinojs/pino/blob/master/docs/best-practices.md)
- [Prisma Performance Guide](https://www.prisma.io/docs/guides/performance-and-optimization)
- [API Security Checklist](https://github.com/shieldfy/API-Security-Checklist)
- [Next.js Production Checklist](https://nextjs.org/docs/going-to-production)
