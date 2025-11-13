# Passi Successivi - Roadmap Backend

## ✅ Completato

### Service Layer & Architecture

- [x] **DeadlineService** - Gestione scadenze con validazione Zod
- [x] **DocumentService** - Upload/download documenti con file system
- [x] **TemplateService** - Template globali e organizzazione con filtri regionali
- [x] **StructureService** - Gestione strutture con conversione date italiane
- [x] **UserService** - Gestione utenti, approvazione, permessi
- [x] **Pino Structured Logging** - Log JSON strutturati per tutti i services
- [x] **API Response Envelope** - Formato standardizzato per tutte le risposte
- [x] **Error Handling Centralizzato** - ServiceError con codici standard
- [x] **DTO Types** - Input/Output types per tutti i services

### API Endpoints Refactored

- [x] 7 endpoint User (admin + utente)
- [x] 5 endpoint Deadline
- [x] 5 endpoint Document
- [x] 5 endpoint Template
- [x] 4 endpoint Structure
- **Totale: 26 endpoint migrati al Service Layer** ✨

## 🎯 Prossimi Step Raccomandati

### 1. **Testing** (Priorità Alta)

#### Unit Tests per Services

```typescript
// __tests__/services/user-service.test.ts
describe("UserService", () => {
  it("should approve user and set needsOnboarding", async () => {
    const mockPrisma = createMockPrisma();
    const service = new UserService(mockPrisma);

    const result = await service.approveUser({
      userId: "123",
      adminUserId: "admin-1",
    });

    expect(result.accountStatus).toBe("APPROVED");
    expect(result.needsOnboarding).toBe(true);
  });
});
```

**File da creare:**

- `__tests__/services/deadline-service.test.ts`
- `__tests__/services/document-service.test.ts`
- `__tests__/services/template-service.test.ts`
- `__tests__/services/structure-service.test.ts`
- `__tests__/services/user-service.test.ts`

**Setup necessario:**

```bash
npm install --save-dev jest @types/jest ts-jest
npm install --save-dev @testing-library/react @testing-library/jest-dom
```

#### Integration Tests per API Routes

```typescript
// __tests__/api/user/permissions.test.ts
describe("GET /api/user/permissions", () => {
  it("should return user permissions with envelope", async () => {
    const response = await fetch("/api/user/permissions");
    const result = await response.json();

    expect(result).toHaveProperty("success", true);
    expect(result).toHaveProperty("data");
    expect(result.data).toHaveProperty("role");
  });
});
```

---

### 2. **Monitoring & Observability** (Priorità Alta)

#### Log Aggregation

- **Setup Pino Pretty** per dev environment
- **Integrazione con log aggregator** (Datadog, LogRocket, Better Stack)
- **Error tracking** (Sentry integration)

```typescript
// lib/logger.ts - Aggiungere Sentry
import * as Sentry from "@sentry/nextjs";

export function createApiLogger(method: string, path: string, userId?: string) {
  return pino({
    // ... existing config
    hooks: {
      logMethod(inputArgs, method) {
        // Invia errori a Sentry
        if (inputArgs[0]?.level >= 50) {
          // Error level
          Sentry.captureException(inputArgs[0].error);
        }
        return method.apply(this, inputArgs);
      },
    },
  });
}
```

#### Metriche & Performance

```typescript
// lib/metrics.ts
export class MetricsService {
  trackApiCall(endpoint: string, duration: number, status: number) {
    // Invia a Datadog, CloudWatch, etc.
  }

  trackServiceCall(serviceName: string, method: string, duration: number) {
    // Track service performance
  }
}
```

---

### 3. **Validazione Input Avanzata** (Priorità Media)

Attualmente usiamo Zod solo nei services. Espandere con:

#### Rate Limiting

```typescript
// lib/rate-limit.ts
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "10 s"),
});

export async function checkRateLimit(identifier: string) {
  const { success } = await ratelimit.limit(identifier);
  if (!success) {
    throw new ValidationError("Too many requests", "RATE_LIMIT_EXCEEDED");
  }
}
```

#### Request Validation Middleware

```typescript
// lib/middleware/validate-request.ts
export function validateRequest<T>(schema: z.ZodSchema<T>) {
  return async (req: Request) => {
    const body = await req.json();
    const result = schema.safeParse(body);

    if (!result.success) {
      return createErrorResponse(
        ErrorCodes.VALIDATION_ERROR,
        "Invalid request body",
        400,
        { errors: result.error.errors },
      );
    }

    return result.data;
  };
}
```

---

### 4. **Caching** (Priorità Media)

#### Redis Cache per Queries Frequenti

```typescript
// lib/cache.ts
import Redis from "ioredis";

const redis = new Redis(process.env.REDIS_URL);

export async function getCached<T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttl: number = 60,
): Promise<T> {
  const cached = await redis.get(key);
  if (cached) return JSON.parse(cached);

  const data = await fetchFn();
  await redis.setex(key, ttl, JSON.stringify(data));
  return data;
}
```

#### Applicazione nei Services

```typescript
// lib/services/template-service.ts
async getGlobalTemplates(region?: string) {
  const cacheKey = `global-templates:${region || 'all'}`;

  return getCached(cacheKey, async () => {
    return this.db.deadlineTemplate.findMany({
      where: { ownerType: 'GLOBAL', active: true }
    });
  }, 300); // Cache 5 min
}
```

---

### 5. **Database Optimization** (Priorità Media)

#### Indexes

Verificare e aggiungere indexes per query frequenti:

```sql
-- prisma/schema.prisma
model DeadlineInstance {
  // ... fields

  @@index([organizationId, status])
  @@index([dueDate, status])
  @@index([structureId, status])
}

model Document {
  @@index([organizationId, ownerType, ownerId])
  @@index([uploadedById, createdAt])
}
```

#### Query Optimization

```typescript
// Evitare N+1 queries con include
const deadlines = await this.db.deadlineInstance.findMany({
  where: { organizationId },
  include: {
    person: true,
    structure: true,
    template: true,
    documents: true, // Single query invece di N queries
  },
});
```

---

### 6. **Webhook & Background Jobs** (Priorità Bassa)

#### Cron Jobs per Reminder

```typescript
// app/api/cron/deadline-reminders/route.ts
import { deadlineService } from "@/lib/services/deadline-service";

export async function GET(request: Request) {
  // Verifica cron secret
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  // Trova deadlines con reminder da inviare
  const upcomingDeadlines = await deadlineService.getUpcomingDeadlines();

  for (const deadline of upcomingDeadlines) {
    await sendReminderEmail(deadline);
  }

  return Response.json({ processed: upcomingDeadlines.length });
}
```

#### Queue System (BullMQ/Inngest)

```typescript
// lib/queue/email-queue.ts
import { Queue } from "bullmq";

export const emailQueue = new Queue("email", {
  connection: { host: "localhost", port: 6379 },
});

export async function sendEmailAsync(
  to: string,
  subject: string,
  body: string,
) {
  await emailQueue.add("send-email", { to, subject, body });
}
```

---

### 7. **API Documentation** (Priorità Bassa)

#### OpenAPI/Swagger

```typescript
// app/api/docs/route.ts
import { generateOpenAPISpec } from "@/lib/openapi";

export async function GET() {
  const spec = generateOpenAPISpec({
    title: "Compliance Manager API",
    version: "1.0.0",
    endpoints: [
      // Auto-generate from route files
    ],
  });

  return Response.json(spec);
}
```

---

### 8. **Security Enhancements** (Priorità Alta)

#### Input Sanitization

```typescript
// lib/sanitize.ts
import createDOMPurify from "dompurify";
import { JSDOM } from "jsdom";

const window = new JSDOM("").window;
const DOMPurify = createDOMPurify(window);

export function sanitizeHTML(dirty: string): string {
  return DOMPurify.sanitize(dirty);
}
```

#### SQL Injection Prevention

- ✅ Già coperto da Prisma ORM

#### XSS Prevention

- Sanitize input HTML nei notes/description fields
- CSP headers in Next.js config

#### CORS Configuration

```typescript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: process.env.ALLOWED_ORIGIN,
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET,POST,PATCH,DELETE",
          },
        ],
      },
    ];
  },
};
```

---

## 📋 Checklist Implementazione

### Testing

- [ ] Setup Jest + Testing Library
- [ ] Unit tests per tutti i services (80% coverage minimo)
- [ ] Integration tests per API routes critiche
- [ ] E2E tests per flussi principali (Playwright/Cypress)

### Monitoring

- [ ] Setup Sentry per error tracking
- [ ] Integrazione log aggregator (Datadog/LogRocket)
- [ ] Dashboard metriche performance API
- [ ] Alert configurati per errori critici

### Performance

- [ ] Redis cache per queries frequenti
- [ ] Database indexes ottimizzati
- [ ] Query optimization (eliminare N+1)
- [ ] CDN per file statici

### Security

- [ ] Rate limiting su tutti gli endpoint
- [ ] Input sanitization per HTML
- [ ] CORS configuration
- [ ] Security headers (CSP, HSTS, etc.)
- [ ] Penetration testing

### Documentation

- [ ] OpenAPI/Swagger docs
- [ ] Postman collection
- [ ] README aggiornato con esempi
- [ ] Architecture diagram

---

## 🚀 Quick Wins (Da fare subito)

1. **Testing Setup** - 2h

   ```bash
   npm install --save-dev jest @types/jest ts-jest
   npm install --save-dev @testing-library/react
   # Creare jest.config.js e primi 5 test
   ```

2. **Sentry Integration** - 1h

   ```bash
   npm install @sentry/nextjs
   npx @sentry/wizard -i nextjs
   # Configurare error tracking
   ```

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
