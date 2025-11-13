# 🚀 Guida Completa Setup Produzione

Questa guida ti accompagna passo dopo passo nell'installazione completa del sistema in produzione.

## 📋 Indice

1. [Dipendenze Docker](#dipendenze-docker)
2. [Scelta Server](#scelta-server)
3. [Configurazione AWS SES](#configurazione-aws-ses)
4. [Configurazione SMTP Alternative](#configurazione-smtp-alternative)
5. [Storage S3 (Opzionale)](#storage-s3-opzionale)
6. [Installazione Step-by-Step](#installazione-step-by-step)
7. [Troubleshooting](#troubleshooting)

---

## 📦 Dipendenze Docker

### Dipendenze di Sistema nel Dockerfile

Il container include automaticamente:

```dockerfile
# Runtime Node.js
FROM node:20-alpine

# Strumenti di sistema installati
RUN apk add --no-cache \
    netcat-openbsd    # Per health check database
```

### Dipendenze NPM (già incluse nel build)

Tutte le dipendenze sono automaticamente installate durante il build Docker:

**Runtime (Production Dependencies):**

- `next` ^16.0.1 - Framework Next.js
- `react` ^19.0.0 - React
- `@prisma/client` ^6.1.0 - Database ORM
- `nodemailer` ^6.9.16 - Invio email
- `bcryptjs` ^2.4.3 - Hash password
- `next-auth` ^5.0.0-beta.25 - Autenticazione
- `zod` ^3.25.76 - Validazione dati
- `pino` ^10.1.0 - Logging
- `date-fns` ^4.1.0 - Gestione date
- `node-cron` ^3.0.3 - Scheduled jobs

**Build Dependencies (solo per compilazione):**

- `prisma` ^6.1.0 - CLI Prisma
- `typescript` ^5.7.2 - TypeScript compiler
- `tailwindcss` ^3.4.17 - CSS framework

### Servizi Docker Esterni

Il sistema richiede questi servizi tramite Docker Compose:

1. **PostgreSQL 16** - Database principale

   ```yaml
   image: postgres:16-alpine
   ```

2. **Redis 7** - Cache e sessioni

   ```yaml
   image: redis:7-alpine
   ```

3. **Nginx** (opzionale) - Reverse proxy
   ```yaml
   image: nginx:alpine
   ```

---

## 🖥️ Scelta Server

### Requisiti Minimi

Per ambiente **TEST** (basso traffico):

- **CPU**: 2 core
- **RAM**: 4 GB
- **Disco**: 40 GB SSD
- **Costo stimato**: €10-15/mese

Per ambiente **PRODUZIONE** (traffico medio):

- **CPU**: 4 core
- **RAM**: 8 GB
- **Disco**: 80 GB SSD
- **Costo stimato**: €30-50/mese

### Provider Consigliati

#### 1. **DigitalOcean** (Raccomandato per semplicità)

**Droplet da 4GB RAM:**

```bash
# Prezzo: $24/mese (circa €22)
# Specifica: 4GB RAM, 2 CPU, 80GB SSD, 4TB transfer
```

**Vantaggi:**

- ✅ Interfaccia semplice e intuitiva
- ✅ Documentazione eccellente
- ✅ Backup automatici opzionali (+20%)
- ✅ Datacenter in Europa (Amsterdam, Francoforte)
- ✅ Firewall integrato
- ✅ Snapshots gratuiti

**Setup iniziale:**

```bash
# 1. Crea account su digitalocean.com
# 2. Crea Droplet Ubuntu 22.04 LTS
# 3. Scegli datacenter EU (Amsterdam/Frankfurt)
# 4. Abilita "Backups" opzionale
# 5. Aggiungi SSH key per accesso sicuro
```

#### 2. **Hetzner** (Miglior rapporto qualità/prezzo)

**Cloud CX21:**

```bash
# Prezzo: €5.83/mese
# Specifica: 4GB RAM, 2 CPU, 40GB SSD, 20TB transfer
```

**Vantaggi:**

- ✅ Prezzo imbattibile
- ✅ Datacenter in Germania (Falkenstein, Nuremberg)
- ✅ Ottime prestazioni
- ✅ Conformità GDPR garantita

**Setup iniziale:**

```bash
# 1. Crea account su hetzner.com
# 2. Cloud Console -> New Project
# 3. Add Server -> CX21 o CX31
# 4. Ubuntu 22.04
# 5. Location: Nuremberg (nbg1-dc3)
```

#### 3. **AWS EC2** (Per chi già usa AWS)

**t3.medium:**

```bash
# Prezzo: $30-35/mese (circa €28-32)
# Specifica: 4GB RAM, 2 CPU, variabile storage
```

**Vantaggi:**

- ✅ Integrazione nativa con SES (email)
- ✅ Integrazione nativa con S3 (storage)
- ✅ Scalabilità enterprise
- ✅ Free tier per primi 12 mesi (limitato)

**Setup iniziale:**

```bash
# 1. Account AWS
# 2. EC2 -> Launch Instance
# 3. Ubuntu Server 22.04 LTS
# 4. t3.medium
# 5. Security Group: 22, 80, 443
# 6. Elastic IP (opzionale ma consigliato)
```

### Configurazione Server Iniziale

Una volta scelto il server, configuralo:

```bash
# 1. Accedi via SSH
ssh root@IL_TUO_IP

# 2. Aggiorna sistema
apt update && apt upgrade -y

# 3. Installa Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# 4. Installa Docker Compose
apt install docker-compose-plugin -y

# 5. Configura firewall
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS
ufw enable

# 6. Crea utente non-root
adduser deploy
usermod -aG sudo deploy
usermod -aG docker deploy

# 7. Configura swap (importante per 4GB RAM)
fallocate -l 4G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
echo '/swapfile none swap sw 0 0' | tee -a /etc/fstab
```

---

## 📧 Configurazione AWS SES

### Perché AWS SES?

- ✅ **Economico**: $0.10 per 1.000 email (prime 62.000/mese gratuite)
- ✅ **Affidabile**: 99.9% deliverability
- ✅ **Scalabile**: Milioni di email/giorno
- ✅ **Conformità**: GDPR compliant

### Setup AWS SES Passo-Passo

#### Step 1: Crea Account AWS

```bash
# 1. Vai su https://aws.amazon.com
# 2. Crea account (richiede carta di credito)
# 3. Accedi alla Console AWS
```

#### Step 2: Configura SES

```bash
# 1. Nella Console AWS, cerca "SES" (Simple Email Service)
# 2. Scegli regione EU (Ireland) eu-west-1 o EU (Frankfurt) eu-central-1
```

#### Step 3: Verifica Dominio (RACCOMANDATO)

**Verifica del dominio per invio professionale:**

```bash
# 1. SES Console -> Verified identities -> Create identity
# 2. Scegli "Domain"
# 3. Inserisci il tuo dominio: studiocompliance.it

# 4. SES ti fornirà record DNS da aggiungere:
```

**Record DNS da aggiungere al tuo provider DNS:**

```dns
# Record TXT per verifica dominio
_amazonses.studiocompliance.it    TXT    "amazonses_verification_code_qui"

# Record CNAME per DKIM (autenticazione email)
abc123._domainkey.studiocompliance.it    CNAME    abc123.dkim.amazonses.com
def456._domainkey.studiocompliance.it    CNAME    def456.dkim.amazonses.com
ghi789._domainkey.studiocompliance.it    CNAME    ghi789.dkim.amazonses.com

# Record MX per ricevere email (opzionale)
studiocompliance.it    MX    10 inbound-smtp.eu-west-1.amazonaws.com
```

**Tempo di propagazione DNS:** 15 minuti - 48 ore (solitamente ~1 ora)

#### Step 4: Richiedi Uscita dalla Sandbox

**IMPORTANTE:** Per default, SES è in "sandbox mode" (solo email verificate).

```bash
# 1. SES Console -> Account dashboard
# 2. Click "Request production access"
# 3. Compila il form:

Use case: "Transactional emails"
Website URL: "https://tuodominio.it"
Descrizione: "Sistema di gestione compliance per studi medici.
              Invieremo email transazionali (conferme registrazione,
              reset password, promemoria scadenze) ai nostri utenti
              che hanno accettato di riceverle."
Compliance: "Yes, tutti i nostri utenti hanno opt-in"
Bounce/Complaint rate: "Monitoriamo e rimuoviamo email bounce"
Volume giornaliero stimato: "500 email/giorno" (o la tua stima)

# 4. Invia richiesta
# 5. Attendi approvazione (24-48 ore)
```

#### Step 5: Crea Credenziali SMTP

```bash
# 1. SES Console -> SMTP settings
# 2. Crea SMTP credentials
# 3. SALVA le credenziali mostrate (username e password):

SMTP Username: AKIAIOSFODNN7EXAMPLE
SMTP Password: wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
```

#### Step 6: Configura nel File .env

```bash
# Configurazione AWS SES
EMAIL_PROVIDER=ses

# Credenziali SES SMTP
EMAIL_HOST=email-smtp.eu-west-1.amazonaws.com
EMAIL_PORT=587
EMAIL_USER=AKIAIOSFODNN7EXAMPLE
EMAIL_PASSWORD=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
EMAIL_FROM=noreply@studiocompliance.it

# Se hai verificato il dominio, usa un indirizzo del dominio
# Se hai verificato solo l'email, usa quella email
```

### Verifica Configurazione SES

Testa l'invio email:

```bash
# Avvia il container
docker-compose -f docker-compose.prod.yml up -d

# Verifica i log
docker-compose -f docker-compose.prod.yml logs app

# Prova registrazione nuovo utente
# Dovresti ricevere email di verifica
```

### Monitoraggio SES

```bash
# 1. SES Console -> Reputation dashboard
# 2. Monitora:
#    - Bounce rate (deve essere < 5%)
#    - Complaint rate (deve essere < 0.1%)
#    - Sending statistics
```

**Alert automatici:**

```bash
# 1. CloudWatch -> Alarms -> Create alarm
# 2. Metric: SES -> Bounce rate
# 3. Threshold: > 5%
# 4. Action: Email notification
```

---

## 📨 Configurazione SMTP Alternative

Se preferisci non usare AWS SES, ecco le alternative:

### Opzione 1: SendGrid

**Vantaggi:**

- ✅ 100 email/giorno gratuite
- ✅ Setup semplicissimo
- ✅ Ottima deliverability

**Setup:**

```bash
# 1. Crea account su sendgrid.com
# 2. Settings -> API Keys -> Create API Key
# 3. Salva la chiave generata

# Nel file .env:
EMAIL_PROVIDER=smtp
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASSWORD=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
EMAIL_FROM=noreply@tuodominio.it
```

**Prezzi:**

- Free: 100 email/giorno
- Essentials: $19.95/mese - 50.000 email/mese
- Pro: $89.95/mese - 100.000 email/mese

### Opzione 2: Mailgun

**Vantaggi:**

- ✅ 5.000 email/mese gratuite (primi 3 mesi)
- ✅ API potente
- ✅ EU region disponibile

**Setup:**

```bash
# 1. Crea account su mailgun.com
# 2. Scegli EU region
# 3. Verifica dominio (stesso processo di SES)
# 4. Sending -> Domain settings -> SMTP credentials

# Nel file .env:
EMAIL_PROVIDER=smtp
EMAIL_HOST=smtp.eu.mailgun.org
EMAIL_PORT=587
EMAIL_USER=postmaster@mg.tuodominio.it
EMAIL_PASSWORD=la_tua_password_smtp
EMAIL_FROM=noreply@tuodominio.it
```

**Prezzi:**

- Foundation: $35/mese - 50.000 email
- Growth: $80/mese - 100.000 email

### Opzione 3: Gmail/Google Workspace (Solo per sviluppo)

**⚠️ NON raccomandato per produzione** (limite 500 email/giorno)

**Per TEST/SVILUPPO:**

```bash
# 1. Abilita 2FA sul tuo account Google
# 2. Genera App Password:
#    Account Google -> Security -> 2-Step Verification -> App passwords
# 3. Genera password per "Mail"

# Nel file .env:
EMAIL_PROVIDER=smtp
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tuoemail@gmail.com
EMAIL_PASSWORD=la_app_password_generata
EMAIL_FROM=tuoemail@gmail.com
```

### Opzione 4: Server SMTP Proprio

**Solo se hai già un server email aziendale:**

```bash
# Nel file .env:
EMAIL_PROVIDER=smtp
EMAIL_HOST=smtp.tuaazienda.it
EMAIL_PORT=587
EMAIL_USER=noreply@tuaazienda.it
EMAIL_PASSWORD=password_sicura
EMAIL_FROM=noreply@tuaazienda.it
EMAIL_SECURE=true  # true per porta 465, false per 587
```

### Test Configurazione Email

Dopo aver configurato l'email provider, testa:

```bash
# 1. Avvia l'applicazione
docker-compose -f docker-compose.prod.yml up -d

# 2. Registra un nuovo utente
# Apri: https://tuodominio.it/auth/register
# Compila il form

# 3. Verifica logs
docker-compose -f docker-compose.prod.yml logs -f app | grep "📧"

# Dovresti vedere:
# 📧 Email di verifica inviata a: utente@email.it

# 4. Controlla inbox dell'utente
# Dovrebbe arrivare email di verifica
```

---

## 📦 Storage S3 (Opzionale)

Per salvare i file (documenti caricati) su AWS S3 invece che localmente.

### Perché S3?

- ✅ **Scalabile**: Storage illimitato
- ✅ **Economico**: $0.023/GB/mese
- ✅ **Affidabile**: 99.999999999% durability
- ✅ **Backup automatico**: Versioning integrato
- ✅ **CDN**: Integrazione CloudFront per download veloci

### Setup S3

```bash
# 1. AWS Console -> S3 -> Create bucket

Nome bucket: studio-compliance-uploads
Regione: eu-west-1 (Ireland) o eu-central-1 (Frankfurt)
Block all public access: ENABLED (sicurezza)
Versioning: Enabled (backup automatico)
Encryption: Enabled (SSE-S3)

# 2. Crea IAM User per accesso programmatico
# IAM Console -> Users -> Add user

Username: studio-compliance-s3-user
Access type: Programmatic access

# 3. Attach policy
# Crea policy custom:
```

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::studio-compliance-uploads",
        "arn:aws:s3:::studio-compliance-uploads/*"
      ]
    }
  ]
}
```

```bash
# 4. Salva le credenziali IAM:
Access Key ID: AKIAIOSFODNN7EXAMPLE
Secret Access Key: wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
```

### Configurazione S3 nel .env

```bash
# Storage configuration
STORAGE_TYPE=s3

# AWS S3 Configuration
AWS_REGION=eu-west-1
AWS_S3_BUCKET=studio-compliance-uploads
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY

# Optional: CloudFront CDN (per download veloci)
# AWS_CLOUDFRONT_DOMAIN=d123456789.cloudfront.net
```

### Costi Stimati S3

Esempio per studio medio:

```
Storage: 10GB x $0.023 = $0.23/mese
Requests PUT: 1.000 x $0.005/1000 = $0.005/mese
Requests GET: 10.000 x $0.0004/1000 = $0.004/mese
Transfer out: 5GB x $0.09 = $0.45/mese

TOTALE: ~$0.70/mese (€0.65)
```

---

## 🚀 Installazione Step-by-Step

### Preparazione

**1. Configura DNS:**

```bash
# Nel tuo provider DNS (es: Cloudflare, Route53, ecc.)
# Aggiungi record A:

compliance.tuodominio.it    A    IL_TUO_IP_SERVER
```

**2. Connettiti al server:**

```bash
ssh deploy@IL_TUO_IP_SERVER
```

**3. Clona il repository:**

```bash
cd ~
git clone https://github.com/sandroV1972/studio_compliance_manager.git
cd studio_compliance_manager
```

### Configurazione Ambiente PRODUZIONE

```bash
# 1. Copia template configurazione
cp .env.production.example .env

# 2. Modifica con i tuoi dati
nano .env
```

**Configurazione minima .env per PRODUZIONE:**

```bash
# ============================================
# DATABASE
# ============================================
DATABASE_URL="postgresql://compliance_user:PASSWORD_SICURA_QUI@postgres:5432/compliance_prod"
POSTGRES_USER=compliance_user
POSTGRES_PASSWORD=PASSWORD_SICURA_QUI
POSTGRES_DB=compliance_prod

# ============================================
# NEXTAUTH
# ============================================
NEXTAUTH_SECRET=genera_con_comando_openssl_sotto
NEXTAUTH_URL=https://compliance.tuodominio.it

# ============================================
# EMAIL - AWS SES
# ============================================
EMAIL_PROVIDER=ses
EMAIL_HOST=email-smtp.eu-west-1.amazonaws.com
EMAIL_PORT=587
EMAIL_USER=TUO_SMTP_USERNAME_SES
EMAIL_PASSWORD=TUO_SMTP_PASSWORD_SES
EMAIL_FROM=noreply@tuodominio.it

# ============================================
# REDIS
# ============================================
REDIS_URL=redis://redis:6379
REDIS_PASSWORD=PASSWORD_REDIS_SICURA

# ============================================
# SUPER ADMIN
# ============================================
SUPER_ADMIN_EMAIL=tuo.email@tuodominio.it
SUPER_ADMIN_PASSWORD=PASSWORD_SUPER_ADMIN_SICURA
SUPER_ADMIN_NAME="Tuo Nome"

# ============================================
# APP
# ============================================
NODE_ENV=production
LOG_LEVEL=info

# ============================================
# STORAGE (locale o s3)
# ============================================
STORAGE_TYPE=local
# Per S3, cambia in:
# STORAGE_TYPE=s3
# AWS_REGION=eu-west-1
# AWS_S3_BUCKET=tuo-bucket
# AWS_ACCESS_KEY_ID=tua_key
# AWS_SECRET_ACCESS_KEY=tuo_secret

# ============================================
# BACKUP
# ============================================
BACKUP_RETENTION_DAYS=30
BACKUP_SCHEDULE="0 2 * * *"
```

**Genera segreti sicuri:**

```bash
# NEXTAUTH_SECRET
openssl rand -base64 32

# Password database
openssl rand -base64 24

# Password Redis
openssl rand -base64 24

# Password Super Admin
openssl rand -base64 16
```

### Avvio Produzione

```bash
# 1. Build e avvia i container
docker-compose -f docker-compose.prod.yml up -d

# 2. Verifica che tutto sia partito
docker-compose -f docker-compose.prod.yml ps

# Dovresti vedere:
# NAME                          STATUS
# postgres                      Up (healthy)
# redis                         Up (healthy)
# app                           Up (healthy)
# backup                        Up

# 3. Verifica logs
docker-compose -f docker-compose.prod.yml logs -f app

# Cerca messaggi come:
# ✅ Database connection successful
# ✅ Migrations completed
# ✅ Super admin initialized
# 🚀 Server listening on http://0.0.0.0:3000
```

### Configurazione SSL con Let's Encrypt

```bash
# 1. Installa Certbot
sudo apt install certbot python3-certbot-nginx -y

# 2. Ottieni certificato SSL (automatico)
sudo certbot --nginx -d compliance.tuodominio.it

# Segui il wizard:
# - Email: tuoemail@tuodominio.it
# - Accetta ToS: Yes
# - Redirect HTTP -> HTTPS: Yes (raccomandato)

# 3. Verifica auto-renewal
sudo certbot renew --dry-run

# 4. Il certificato si rinnoverà automaticamente ogni 60 giorni
```

**Oppure configura Nginx manualmente:**

```bash
# 1. Modifica nginx/nginx.conf
# 2. Ottieni certificato
sudo certbot certonly --standalone -d compliance.tuodominio.it

# 3. I certificati saranno in:
# /etc/letsencrypt/live/compliance.tuodominio.it/fullchain.pem
# /etc/letsencrypt/live/compliance.tuodominio.it/privkey.pem

# 4. Riavvia Nginx
docker-compose -f docker-compose.prod.yml restart nginx
```

### Verifica Installazione

```bash
# 1. Test endpoint health
curl http://localhost:3000/api/health

# Risposta attesa:
# {"status":"healthy","database":"connected",...}

# 2. Apri browser
https://compliance.tuodominio.it

# 3. Login super admin
# Email: SUPER_ADMIN_EMAIL dal .env
# Password: SUPER_ADMIN_PASSWORD dal .env

# 4. Verifica email funzionanti
# - Registra nuovo utente
# - Controlla che arrivi email verifica
```

---

## 🔧 Troubleshooting

### Problema: Container non si avvia

```bash
# Verifica logs dettagliati
docker-compose -f docker-compose.prod.yml logs app

# Errori comuni:

# 1. "Database connection failed"
# Soluzione: Verifica DATABASE_URL nel .env
docker-compose -f docker-compose.prod.yml restart postgres
docker-compose -f docker-compose.prod.yml restart app

# 2. "Port 3000 already in use"
# Soluzione: Cambia porta nel docker-compose.prod.yml
ports:
  - "3001:3000"  # Usa 3001 invece di 3000
```

### Problema: Email non vengono inviate

```bash
# 1. Verifica configurazione
docker-compose -f docker-compose.prod.yml exec app printenv | grep EMAIL

# 2. Verifica logs email
docker-compose -f docker-compose.prod.yml logs app | grep "📧"

# 3. Test manuale SMTP
docker-compose -f docker-compose.prod.yml exec app node -e "
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});
transporter.verify().then(console.log).catch(console.error);
"

# 4. SES Sandbox mode
# Se usi AWS SES, richiedi production access
# (vedi sezione AWS SES sopra)
```

### Problema: Out of Memory

```bash
# 1. Verifica memoria
free -h

# 2. Aggiungi/aumenta swap
sudo fallocate -l 4G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# 3. Limita memoria container (docker-compose.prod.yml)
services:
  app:
    deploy:
      resources:
        limits:
          memory: 2G
```

### Problema: Database lento

```bash
# 1. Ottimizza PostgreSQL
# Modifica docker-compose.prod.yml:
postgres:
  command: >
    postgres
    -c shared_buffers=256MB
    -c effective_cache_size=1GB
    -c max_connections=100

# 2. Riavvia
docker-compose -f docker-compose.prod.yml restart postgres
```

### Problema: Backup non funziona

```bash
# 1. Verifica cron logs
docker-compose -f docker-compose.prod.yml logs backup

# 2. Test manuale backup
docker-compose -f docker-compose.prod.yml exec backup /app/scripts/backup.sh

# 3. Verifica permessi
docker-compose -f docker-compose.prod.yml exec backup ls -la /backups
```

### Supporto

Per ulteriore supporto:

1. **Logs dettagliati:**

   ```bash
   docker-compose -f docker-compose.prod.yml logs --tail=100 -f
   ```

2. **Accedi al container:**

   ```bash
   docker-compose -f docker-compose.prod.yml exec app sh
   ```

3. **Verifica salute sistema:**
   ```bash
   curl http://localhost:3000/api/health
   ```

---

## 📊 Monitoraggio Post-Installazione

### Metriche da Monitorare

```bash
# 1. Uso CPU/RAM
docker stats

# 2. Spazio disco
df -h

# 3. Logs errori
docker-compose -f docker-compose.prod.yml logs app | grep ERROR

# 4. Database size
docker-compose -f docker-compose.prod.yml exec postgres \
  psql -U compliance_user -d compliance_prod \
  -c "SELECT pg_size_pretty(pg_database_size('compliance_prod'));"

# 5. Backup size
du -sh /var/lib/docker/volumes/studio-compliance-manager_backups/_data/
```

### Alert Raccomandati

Configura alert per:

- ✅ Disco > 80% pieno
- ✅ RAM > 90% usata
- ✅ Container down
- ✅ Database connection errors
- ✅ Email bounce rate > 5%

**Tool consigliati:**

- UptimeRobot (free) - monitoring uptime
- Netdata (free) - monitoring server real-time
- Cloudwatch (AWS) - se usi AWS

---

## ✅ Checklist Finale

Prima di andare in produzione, verifica:

- [ ] Server configurato con firewall attivo
- [ ] DNS punta al server
- [ ] SSL/HTTPS configurato e funzionante
- [ ] Email provider configurato e testato
- [ ] Backup automatici attivi
- [ ] Super admin può accedere
- [ ] Test registrazione nuovo utente
- [ ] Test invio email (verifica, reset password)
- [ ] Test caricamento documenti
- [ ] Monitoraggio attivo
- [ ] Documenti di emergenza salvati (password, accessi)

---

🎉 **Congratulazioni! Il sistema è pronto per la produzione!**

Per domande o supporto, consulta la documentazione completa in `DEPLOYMENT.md`.
