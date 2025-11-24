# 🚀 Setup Ambiente di Sviluppo

Ambiente di sviluppo completamente allineato a pre-prod/prod con Docker Compose.

## 📋 Requisiti

- Docker Desktop installato
- Node.js 20+ (per sviluppo locale fuori Docker)
- Git

## 🔧 Configurazione Iniziale

### 1. Copia il file di ambiente

```bash
cp .env.example .env
```

Il file `.env` è già preconfigurato per lo sviluppo locale.

### 2. Avvia i servizi Docker

```bash
docker-compose up -d
```

Questo avvierà:

- **PostgreSQL** (porta 5432)
- **Redis** (porta 6379)
- **MailHog** (porta 1025 SMTP, 8025 Web UI)
- **App Next.js** (porta 3000)

### 3. Verifica i servizi

```bash
docker-compose ps
```

Dovresti vedere tutti i servizi in stato `healthy` o `running`.

### 4. Applica le migrazioni database

```bash
npx prisma migrate deploy
```

### 5. (Opzionale) Seed del database

```bash
npm run prisma:seed
```

## 🎯 Modalità di Sviluppo

### Opzione A: App in Docker (raccomandato per allineamento con prod)

L'app è già in esecuzione nel container Docker sulla porta 3000.

- **URL App**: http://localhost:3000
- **MailHog UI**: http://localhost:8025

**Vantaggi:**

- ✅ Ambiente identico a pre-prod/prod
- ✅ Nessuna dipendenza Node.js locale necessaria
- ✅ Hot reload attivo (grazie ai volumi montati)

**Riavviare app dopo modifiche:**

```bash
docker-compose restart app
```

**Logs dell'app:**

```bash
docker-compose logs -f app
```

### Opzione B: App in sviluppo locale (più veloce per iterazioni rapide)

Se preferisci `npm run dev` locale:

1. Ferma solo il container app:

```bash
docker-compose stop app
```

2. Avvia Next.js localmente:

```bash
npm run dev
```

3. Modifica `.env` per puntare ai servizi Docker:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/studio_compliance?schema=public"
REDIS_URL="redis://:dev_redis_password@localhost:6379"
EMAIL_HOST="localhost"  # MailHog è esposto su localhost:1025
```

## 🔍 Servizi Disponibili

| Servizio              | Porta | URL/Connessione                                                 |
| --------------------- | ----- | --------------------------------------------------------------- |
| **App Next.js**       | 3000  | http://localhost:3000                                           |
| **PostgreSQL**        | 5432  | postgresql://postgres:postgres@localhost:5432/studio_compliance |
| **Redis**             | 6379  | redis://:dev_redis_password@localhost:6379                      |
| **MailHog SMTP**      | 1025  | localhost:1025                                                  |
| **MailHog Web UI**    | 8025  | http://localhost:8025                                           |
| **Nginx** (opzionale) | 80    | http://localhost                                                |

## 🛠️ Comandi Utili

### Docker Compose

```bash
# Avvia tutti i servizi
docker-compose up -d

# Avvia con nginx (opzionale)
docker-compose --profile with-nginx up -d

# Ferma tutti i servizi
docker-compose down

# Ferma e rimuovi volumi (⚠️ cancella dati!)
docker-compose down -v

# Ricostruisci l'immagine app
docker-compose build app

# Logs di tutti i servizi
docker-compose logs -f

# Logs di un servizio specifico
docker-compose logs -f app
docker-compose logs -f postgres
docker-compose logs -f redis
```

### Database

```bash
# Accedi a PostgreSQL
docker exec -it studio-compliance-dev-db psql -U postgres -d studio_compliance

# Backup database
docker exec studio-compliance-dev-db pg_dump -U postgres studio_compliance > backup.sql

# Restore database
cat backup.sql | docker exec -i studio-compliance-dev-db psql -U postgres -d studio_compliance

# Prisma Studio (GUI database)
npm run prisma:studio
```

### Redis

```bash
# Accedi a Redis CLI
docker exec -it studio-compliance-dev-redis redis-cli -a dev_redis_password

# Cancella cache Redis
docker exec -it studio-compliance-dev-redis redis-cli -a dev_redis_password FLUSHALL
```

## 📧 Testing Email

Le email inviate dall'app vengono catturate da **MailHog**.

Apri http://localhost:8025 per visualizzare tutte le email inviate.

## 🐛 Troubleshooting

### I container non si avviano

```bash
# Verifica lo stato
docker-compose ps

# Verifica i logs
docker-compose logs

# Riavvia tutto
docker-compose down && docker-compose up -d
```

### Database error: "Can't reach database server"

```bash
# Verifica che PostgreSQL sia healthy
docker-compose ps postgres

# Se non è healthy, controlla i logs
docker-compose logs postgres
```

### Redis connection error

```bash
# Verifica Redis
docker-compose ps redis

# Testa connessione
docker exec -it studio-compliance-dev-redis redis-cli -a dev_redis_password ping
```

### App container esce immediatamente

```bash
# Controlla gli errori
docker-compose logs app

# Spesso è un problema di migrazioni
npx prisma migrate deploy
docker-compose restart app
```

## 🔄 Allineamento con Pre-Prod

L'ambiente dev è ora **completamente allineato** con pre-prod:

| Componente         | Dev          | Pre-Prod     | Allineato |
| ------------------ | ------------ | ------------ | --------- |
| **PostgreSQL**     | 16-alpine    | 16-alpine    | ✅        |
| **Redis**          | 7-alpine     | 7-alpine     | ✅        |
| **Node.js**        | 20-alpine    | 20-alpine    | ✅        |
| **Schema DB**      | 3 migrazioni | 3 migrazioni | ✅        |
| **package.json**   | Identico     | Identico     | ✅        |
| **Docker Compose** | Completo     | Completo     | ✅        |

**Differenze:**

- Dev usa **MailHog** per email (pre-prod usa SendGrid reale)
- Dev espone porta 3000 direttamente (pre-prod usa Nginx)
- Dev ha volumi montati per hot reload

## 📚 Prossimi Passi

1. Sviluppa e testa localmente con `docker-compose up -d`
2. Fai commit e push delle modifiche
3. Deploy su pre-prod per testing finale
4. Deploy su prod

## 🆘 Supporto

Se riscontri problemi, controlla:

1. Logs dei container: `docker-compose logs -f`
2. Health status: `docker-compose ps`
3. File `.env` configurato correttamente
