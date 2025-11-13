# 🚀 Deployment Guide - Studio Compliance Manager

## 📋 Indice

1. [Prerequisiti](#prerequisiti)
2. [Configurazione Iniziale](#configurazione-iniziale)
3. [Ambiente TEST](#ambiente-test)
4. [Ambiente PRE-PROD](#ambiente-pre-prod)
5. [Ambiente PROD](#ambiente-prod)
6. [Gestione Backup](#gestione-backup)
7. [Monitoring e Manutenzione](#monitoring-e-manutenzione)
8. [Troubleshooting](#troubleshooting)

---

## 📦 Prerequisiti

### Server Requirements

- **CPU**: Minimo 2 core (consigliato 4)
- **RAM**: Minimo 4 GB (consigliato 8 GB)
- **Disco**: Minimo 50 GB SSD
- **OS**: Ubuntu 22.04 LTS / Debian 11+

### Software Necessario

```bash
# Installa Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Installa Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verifica installazione
docker --version
docker-compose --version
```

### Dominio e DNS

- **PROD**: `compliance.tuodominio.it` → IP server
- **PRE-PROD**: `preprod-compliance.tuodominio.it` → IP server
- **TEST**: `test-compliance.tuodominio.it` → IP server

### Email Provider

**Opzione 1: AWS SES** (consigliato)

- Account AWS attivo
- SES configurato e verificato per regione EU (es: eu-south-1)
- Domini verificati in SES
- Access Key ID e Secret Access Key

**Opzione 2: SMTP Generico**

- Server SMTP configurato (es: Gmail, SendGrid, Mailgun)
- Credenziali SMTP

---

## ⚙️ Configurazione Iniziale

### 1. Clone del Repository

```bash
# Sul server di produzione
cd /opt
sudo git clone https://github.com/tuouser/studio-compliance-manager.git
cd studio-compliance-manager
```

### 2. Configurazione File Environment

```bash
# Copia template environment
cp .env.production.example .env

# Modifica con i tuoi valori
nano .env
```

**Valori da modificare obbligatoriamente:**

```env
# Database
DB_PASSWORD=TUA_PASSWORD_SICURA_QUI

# NextAuth
NEXTAUTH_URL=https://compliance.tuodominio.it
NEXTAUTH_SECRET=$(openssl rand -base64 32)

# Email (SES)
EMAIL_FROM=noreply@tuodominio.it
AWS_ACCESS_KEY_ID=TUA_AWS_KEY
AWS_SECRET_ACCESS_KEY=TUA_AWS_SECRET

# Redis
REDIS_PASSWORD=TUA_REDIS_PASSWORD

# Super Admin
SUPER_ADMIN_EMAIL=admin@tuodominio.it
SUPER_ADMIN_PASSWORD=PasswordSicura123!
```

### 3. Generazione Secrets

```bash
# Secret NextAuth
openssl rand -base64 32

# Password Database
openssl rand -base64 24

# Password Redis
openssl rand -base64 24
```

### 4. Permessi Scripts

```bash
chmod +x scripts/*.sh
```

---

## 🧪 Ambiente TEST

### Deploy Ambiente Test

```bash
# 1. Crea file .env per test
cp .env.production.example .env.test

# 2. Modifica valori per test
nano .env.test

# 3. Avvia ambiente test
docker-compose -f docker-compose.test.yml up -d

# 4. Verifica log
docker-compose -f docker-compose.test.yml logs -f app

# 5. Accedi all'applicazione
open http://localhost:3001
```

### Accesso Test

- **URL**: http://localhost:3001 (o http://test-compliance.tuodominio.it)
- **Email**: admin@test.local
- **Password**: Admin123! (cambia nel .env.test)

### Comandi Utili Test

```bash
# Stop ambiente test
docker-compose -f docker-compose.test.yml down

# Restart solo app
docker-compose -f docker-compose.test.yml restart app

# Rebuild immagine
docker-compose -f docker-compose.test.yml up -d --build

# Logs in tempo reale
docker-compose -f docker-compose.test.yml logs -f

# Pulisci tutto (ATTENZIONE: cancella dati)
docker-compose -f docker-compose.test.yml down -v
```

---

## 🔶 Ambiente PRE-PROD

### Setup Pre-Produzione

```bash
# 1. Avvia PRE-PROD
docker-compose -f docker-compose.preprod.yml up -d

# 2. Verifica health
docker-compose -f docker-compose.preprod.yml ps

# 3. Accedi
open http://localhost:3002
```

### Sync Quotidiano PROD → PRE-PROD

**Setup Cron Job:**

```bash
# Edita crontab
crontab -e

# Aggiungi sync ogni notte alle 3 AM
0 3 * * * /opt/studio-compliance-manager/scripts/sync-prod-to-preprod.sh >> /var/log/preprod-sync.log 2>&1
```

**Test Manuale Sync:**

```bash
cd /opt/studio-compliance-manager
./scripts/sync-prod-to-preprod.sh
```

---

## 🚀 Ambiente PROD

### Deploy Produzione

```bash
# 1. Verifica file .env
cat .env | grep -v "^#" | grep -v "^$"

# 2. Build e avvia tutti i servizi
docker-compose -f docker-compose.prod.yml up -d

# 3. Verifica stato
docker-compose -f docker-compose.prod.yml ps

# 4. Monitora log
docker-compose -f docker-compose.prod.yml logs -f app

# 5. Verifica health endpoint
curl http://localhost:3000/api/health
```

### Accesso Primo Avvio

1. Vai a `https://compliance.tuodominio.it`
2. Login con credenziali Super Admin dal `.env`:
   - Email: valore di `SUPER_ADMIN_EMAIL`
   - Password: valore di `SUPER_ADMIN_PASSWORD`

### Applicazione Migrazioni Database

```bash
# Entra nel container app
docker exec -it studio-compliance-app sh

# Esegui migrazioni Prisma
npx prisma migrate deploy

# Esci dal container
exit
```

### Deploy con Nginx (SSL)

```bash
# Avvia anche nginx
docker-compose -f docker-compose.prod.yml --profile with-nginx up -d

# Configurazione SSL Let's Encrypt
docker exec -it studio-compliance-nginx sh

# Installa certbot
apk add certbot certbot-nginx

# Genera certificato
certbot --nginx -d compliance.tuodominio.it

# Exit
exit
```

---

## 💾 Gestione Backup

### Backup Automatico

I backup vengono eseguiti automaticamente ogni notte alle 2 AM.

**Verifica backup esistenti:**

```bash
ls -lh backups/
```

### Backup Manuale

```bash
# Entra nel container backup
docker exec -it studio-compliance-backup sh

# Esegui backup
/backup.sh

# Exit
exit
```

### Restore da Backup

```bash
# Lista backup disponibili
ls -lh backups/

# Restore specifico backup
./scripts/restore.sh backups/backup_studio_compliance_20250113_020000.sql.gz
```

### Download Backup Locale

```bash
# Scarica backup sul tuo computer
scp user@server:/opt/studio-compliance-manager/backups/backup_*.sql.gz ~/Downloads/
```

---

## 📊 Monitoring e Manutenzione

### Health Check

```bash
# API health endpoint
curl http://localhost:3000/api/health

# Docker health
docker-compose -f docker-compose.prod.yml ps
```

### Log Monitoring

```bash
# Log applicazione
docker-compose -f docker-compose.prod.yml logs -f app

# Log database
docker-compose -f docker-compose.prod.yml logs -f postgres

# Log nginx
docker-compose -f docker-compose.prod.yml logs -f nginx

# Log ultimi 100 righe
docker-compose -f docker-compose.prod.yml logs --tail=100 app
```

### Disk Usage

```bash
# Spazio occupato da Docker
docker system df

# Pulizia immagini vecchie
docker system prune -a

# Spazio volumi
docker volume ls
du -sh /var/lib/docker/volumes/*
```

### Database Maintenance

```bash
# Entra in PostgreSQL
docker exec -it studio-compliance-db psql -U compliance_user -d studio_compliance

# Verifica dimensioni tabelle
\dt+

# Vacuum database
VACUUM ANALYZE;

# Exit
\q
```

### Update Applicazione

```bash
# 1. Pull nuovi cambiamenti
cd /opt/studio-compliance-manager
git pull origin main

# 2. Rebuild immagine
docker-compose -f docker-compose.prod.yml build app

# 3. Restart con zero-downtime
docker-compose -f docker-compose.prod.yml up -d --no-deps app

# 4. Verifica
docker-compose -f docker-compose.prod.yml logs -f app
```

---

## 🔧 Troubleshooting

### App non risponde

```bash
# Restart app
docker-compose -f docker-compose.prod.yml restart app

# Rebuild e restart
docker-compose -f docker-compose.prod.yml up -d --build app

# Check logs
docker-compose -f docker-compose.prod.yml logs --tail=200 app
```

### Database connection error

```bash
# Verifica postgres
docker-compose -f docker-compose.prod.yml ps postgres

# Restart database
docker-compose -f docker-compose.prod.yml restart postgres

# Verifica connessione
docker exec -it studio-compliance-db psql -U compliance_user -d studio_compliance -c "SELECT 1"
```

### Email non inviate

```bash
# Verifica configurazione email nel .env
cat .env | grep EMAIL

# Test invio email (da container app)
docker exec -it studio-compliance-app sh
node -e "const { sendVerificationEmail } = require('./lib/email'); sendVerificationEmail('test@example.com', 'Test', 'http://test.com').then(() => console.log('OK')).catch(console.error)"
```

### Spazio disco esaurito

```bash
# Pulisci log vecchi
find /var/lib/docker/containers/ -name "*.log" -size +100M -delete

# Pulisci backup vecchi (oltre 30 giorni)
find backups/ -name "*.sql.gz" -mtime +30 -delete

# Docker cleanup
docker system prune -af --volumes
```

### Ripristino Completo

```bash
# 1. Stop tutto
docker-compose -f docker-compose.prod.yml down

# 2. Rimuovi volumi (ATTENZIONE: perdi dati)
docker volume rm studio_compliance_postgres_data

# 3. Ricrea da backup
docker-compose -f docker-compose.prod.yml up -d postgres
./scripts/restore.sh backups/backup_latest.sql.gz

# 4. Avvia app
docker-compose -f docker-compose.prod.yml up -d
```

---

## 🔒 Sicurezza

### Firewall

```bash
# Configura UFW
sudo ufw allow 22/tcp   # SSH
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp  # HTTPS
sudo ufw enable

# Blocca porte database (accesso solo da Docker network)
sudo ufw deny 5432/tcp
sudo ufw deny 6379/tcp
```

### SSL Certificate Renewal

```bash
# Certbot auto-renewal (già configurato)
sudo certbot renew --dry-run

# Forza renewal
docker exec -it studio-compliance-nginx certbot renew --force-renewal
docker-compose -f docker-compose.prod.yml restart nginx
```

### Change Passwords

```bash
# 1. Modifica .env con nuove password
nano .env

# 2. Ricrea container con nuove credenziali
docker-compose -f docker-compose.prod.yml up -d --force-recreate
```

---

## 📞 Supporto

- **GitHub Issues**: https://github.com/tuouser/studio-compliance-manager/issues
- **Email**: support@tuodominio.it
- **Documentazione**: https://docs.tuodominio.it

---

**Ultima revisione**: Novembre 2025  
**Versione**: 1.0.0
