# 🚀 Quick Start - Docker Deployment

## Deploy in 5 minuti

### 1. Clone e Setup

```bash
# Clone repository
git clone https://github.com/tuouser/studio-compliance-manager.git
cd studio-compliance-manager

# Copia environment file
cp .env.production.example .env

# Genera secrets
openssl rand -base64 32  # Per NEXTAUTH_SECRET
openssl rand -base64 24  # Per DB_PASSWORD
openssl rand -base64 24  # Per REDIS_PASSWORD
```

### 2. Configura `.env`

Modifica almeno questi valori:

```env
# Database
DB_PASSWORD=tua_password_db

# Auth
NEXTAUTH_URL=https://tuodominio.it
NEXTAUTH_SECRET=tuo_secret_generato

# Email
EMAIL_FROM=noreply@tuodominio.it
AWS_ACCESS_KEY_ID=tua_key
AWS_SECRET_ACCESS_KEY=tuo_secret

# Redis
REDIS_PASSWORD=tua_password_redis

# Super Admin
SUPER_ADMIN_EMAIL=admin@tuodominio.it
SUPER_ADMIN_PASSWORD=PasswordSicura123!
```

### 3. Avvia!

```bash
# Build e start
docker-compose -f docker-compose.prod.yml up -d

# Verifica
docker-compose -f docker-compose.prod.yml ps
docker-compose -f docker-compose.prod.yml logs -f app

# Health check
curl http://localhost:3000/api/health
```

### 4. Accedi

- Apri browser: `http://localhost:3000` (o tuo dominio)
- Email: valore di `SUPER_ADMIN_EMAIL`
- Password: valore di `SUPER_ADMIN_PASSWORD`

---

## Ambienti Disponibili

### TEST

```bash
docker-compose -f docker-compose.test.yml up -d
# URL: http://localhost:3001
```

### PRE-PROD

```bash
docker-compose -f docker-compose.preprod.yml up -d
# URL: http://localhost:3002
```

### PROD

```bash
docker-compose -f docker-compose.prod.yml up -d
# URL: http://localhost:3000
```

---

## Comandi Utili

```bash
# Stop
docker-compose -f docker-compose.prod.yml down

# Restart
docker-compose -f docker-compose.prod.yml restart app

# Logs
docker-compose -f docker-compose.prod.yml logs -f app

# Backup database
./scripts/backup.sh

# Update app
git pull
docker-compose -f docker-compose.prod.yml up -d --build app
```

---

## Documentazione Completa

Vedi [DEPLOYMENT.md](./DEPLOYMENT.md) per la guida completa.

---

## Supporto

- **Issues**: https://github.com/tuouser/studio-compliance-manager/issues
- **Email**: support@tuodominio.it
