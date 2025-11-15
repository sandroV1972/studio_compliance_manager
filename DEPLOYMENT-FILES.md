# 📁 File di Deployment - Guida Completa

Questa guida spiega quali file sono necessari per il deployment e quali devono rimanere solo in locale.

## 📦 File nel Repository Git (Committati)

### ✅ File Essenziali per Deployment

```
studio-compliance-manager/
├── app/                          # Codice applicazione Next.js
├── components/                   # Componenti React
├── lib/                         # Librerie e utilities
├── prisma/
│   ├── schema.prisma            # Schema database PostgreSQL
│   ├── migrations/              # Migrazioni database
│   │   └── 20251115123414_init/
│   │       └── migration.sql
│   └── seed.ts                  # Seed data (opzionale)
├── scripts/
│   ├── init-superadmin.js       # Crea super admin al primo avvio
│   ├── migrate-global-templates.js  # Migra template da SQLite
│   ├── docker-entrypoint.sh     # Script di avvio Docker
│   ├── backup.sh                # Backup database
│   └── restore.sh               # Restore database
├── public/                      # Asset statici
├── docker-compose.yml           # Docker Compose per sviluppo locale
├── docker-compose.test.yml      # Docker Compose per ambiente TEST
├── docker-compose.preprod.yml   # Docker Compose per PRE-PROD
├── docker-compose.prod.yml      # Docker Compose per PRODUZIONE
├── Dockerfile                   # Build immagine Docker
├── .env.example                 # Template variabili sviluppo
├── .env.production.example      # Template variabili produzione
├── package.json                 # Dipendenze Node.js
├── package-lock.json            # Lock dipendenze
├── next.config.mjs              # Configurazione Next.js
├── tsconfig.json                # Configurazione TypeScript
├── DEPLOYMENT.md                # Guida deployment
├── MIGRATION-SUMMARY.md         # Riepilogo migrazione
└── README.md                    # Documentazione progetto
```

### ❌ File ESCLUSI dal Repository (in .gitignore)

Questi file **NON** devono essere committati:

```
# File di configurazione con credenziali
.env                    # Configurazione locale con password/secrets
.env.local              # Override locali
.env.test               # Config ambiente test con credenziali
.env.preprod            # Config pre-prod con credenziali REALI
.env.production         # Config produzione con credenziali REALI

# Database e dati
dev.db                  # Database SQLite locale (428KB)
*.db                    # Tutti i database SQLite
*.sql                   # Dump SQL
pg_dump.sql             # Dump PostgreSQL
sqlite_dump.sql         # Dump SQLite
convert_sqlite_to_pg.sh # Script di conversione temporaneo

# Backup
backups/                # Directory backup database
*.sql.gz                # File di backup compressi

# Build e dipendenze
node_modules/           # Dipendenze npm (ricostruite durante build)
.next/                  # Build Next.js (rigenerata)
dist/                   # Build output
build/                  # Build artifacts

# File temporanei
next                    # File temporaneo
tmp/                    # Directory temporanea
temp/                   # Directory temporanea
*.log                   # File di log

# Uploads e dati utente
uploads/                # File caricati dagli utenti
postgres_data/          # Dati PostgreSQL in volume Docker
redis_data/             # Dati Redis in volume Docker
logs/                   # Log applicazione
```

---

## 🚀 Deployment in PRE-PROD / PROD

### Cosa Clonare sul Server

```bash
# Sul server (pre-prod o prod)
git clone https://github.com/tuouser/studio-compliance-manager.git
cd studio-compliance-manager

# Verifica che NON ci siano file sensibili
ls -la .env* dev.db *.sql 2>/dev/null
# Non dovrebbe mostrare nulla (o solo .env.example)
```

### File da Creare sul Server

#### 1. File `.env` per Produzione

```bash
# Copia il template
cp .env.production.example .env

# Modifica con i valori REALI
nano .env
```

**Valori da configurare:**

```env
# Database
DB_PASSWORD=PasswordSicuraDatabaseProd123!

# NextAuth
NEXTAUTH_URL=https://compliance.tuodominio.it
NEXTAUTH_SECRET=GeneratoConOpenSSL_Base64_32Caratteri

# Email (SES)
EMAIL_FROM=noreply@tuodominio.it
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY

# Redis
REDIS_PASSWORD=PasswordRedisSecure456!

# Super Admin
SUPER_ADMIN_EMAIL=admin@tuodominio.it
SUPER_ADMIN_PASSWORD=AdminPasswordSicura789!
```

#### 2. Database SQLite con Template (Opzionale)

**Solo se vuoi importare i template globali:**

```bash
# Dal tuo computer locale, copia il file sul server
scp prisma/dev.db user@server:/opt/studio-compliance-manager/prisma/dev.db
```

Questo file (428KB) contiene:

- 11 RoleTemplate
- 52 DeadlineTemplate
- 32 DocumentTemplate

Se NON lo copi, l'applicazione partirà senza template e dovrai crearli manualmente dall'interfaccia.

---

## 🔐 Gestione File Sensibili

### File .env - Best Practices

1. **MAI committare su Git**
   - ❌ `.env`
   - ❌ `.env.production`
   - ❌ `.env.preprod`
   - ✅ `.env.example` (solo template senza valori reali)

2. **Dove conservare le credenziali**
   - Password manager (1Password, LastPass, Bitwarden)
   - Vault sicuro (HashiCorp Vault)
   - Secrets manager AWS/Azure/GCP
   - File criptato offline

3. **Come trasferire sul server**

   ```bash
   # Opzione 1: Creazione manuale sul server
   ssh user@server
   nano /opt/studio-compliance-manager/.env
   # Incolla i valori e salva

   # Opzione 2: SCP con file locale criptato
   scp .env.prod.encrypted user@server:/tmp/
   ssh user@server
   openssl enc -d -aes-256-cbc -in /tmp/.env.prod.encrypted -out /opt/studio-compliance-manager/.env
   rm /tmp/.env.prod.encrypted

   # Opzione 3: Variabili d'ambiente Docker Swarm/Kubernetes secrets
   ```

### Database dev.db - Gestione

**File**: `prisma/dev.db` (428KB)

**Dove conservarlo:**

- ✅ Computer locale di sviluppo
- ✅ Backup sicuro offline
- ✅ Server durante il deployment (temporaneamente)
- ❌ Repository Git (troppo grande, può cambiare spesso)

**Come usarlo in produzione:**

```bash
# 1. Copia sul server solo durante il primo deployment
scp prisma/dev.db user@server:/opt/studio-compliance-manager/prisma/dev.db

# 2. Avvia l'applicazione (importerà i template automaticamente)
docker-compose -f docker-compose.prod.yml up -d

# 3. Una volta importati i template, puoi rimuovere il file
rm /opt/studio-compliance-manager/prisma/dev.db

# 4. Verifica che i template siano stati importati
docker exec studio-compliance-db psql -U compliance_user -d studio_compliance \
  -c "SELECT COUNT(*) FROM \"DeadlineTemplate\" WHERE \"ownerType\" = 'GLOBAL';"
```

---

## 📋 Checklist Deployment

### Pre-Deployment (Da Locale)

- [ ] Verifica che `.gitignore` escluda file sensibili
- [ ] Fai commit e push delle modifiche
- [ ] Fai backup di `prisma/dev.db` (se hai template)
- [ ] Annota le credenziali in password manager

### Sul Server

- [ ] Clona repository Git
- [ ] Crea file `.env` con valori di produzione
- [ ] (Opzionale) Copia `prisma/dev.db` per template
- [ ] Verifica permessi scripts: `chmod +x scripts/*.sh`
- [ ] Avvia applicazione: `docker-compose -f docker-compose.prod.yml up -d`
- [ ] Verifica log startup
- [ ] Testa primo login Super Admin
- [ ] Verifica template importati (se applicabile)
- [ ] (Opzionale) Rimuovi `prisma/dev.db` dopo import
- [ ] Configura backup automatici

### Post-Deployment

- [ ] Testa funzionalità principali
- [ ] Configura SSL/HTTPS
- [ ] Configura firewall
- [ ] Setup monitoring
- [ ] Documenta credenziali usate (in vault sicuro)

---

## 🔄 Aggiornamenti Futuri

### Quando aggiorni il codice:

```bash
# Sul server
cd /opt/studio-compliance-manager
git pull origin main

# Rebuild e restart
docker-compose -f docker-compose.prod.yml build app
docker-compose -f docker-compose.prod.yml up -d --no-deps app

# Il file .env rimane invariato (non viene sovrascritto)
# Il database dev.db NON viene scaricato (è in .gitignore)
```

### Se aggiungi nuovi template:

```bash
# Da locale, dopo aver aggiunto template nel dev.db locale
scp prisma/dev.db user@server:/tmp/dev.db

# Sul server
docker exec studio-compliance-app node scripts/migrate-global-templates.js

# Lo script importerà SOLO i nuovi template (non duplica)
```

---

## ⚠️ Sicurezza

### File che NON devono MAI finire in Git

1. `.env` - Contiene password e secrets
2. `*.db` - Database con dati sensibili
3. `backups/` - Backup database con dati clienti
4. `uploads/` - File caricati dagli utenti
5. `*.log` - Log possono contenere dati sensibili

### Verifica periodica

```bash
# Controlla che non ci siano file sensibili tracciati
git ls-files | grep -E "\.env$|\.db$|backups|uploads"
# Non dovrebbe restituire nulla (o solo .env.example)

# Controlla cosa verrebbe committato
git status
git diff

# Controlla .gitignore
cat .gitignore
```

---

## 📞 Supporto

Per domande sulla gestione dei file di deployment:

- 📖 Leggi [DEPLOYMENT.md](DEPLOYMENT.md) per deployment completo
- 📋 Leggi [MIGRATION-SUMMARY.md](MIGRATION-SUMMARY.md) per migrazione template
- 🐛 Controlla la sezione Troubleshooting in DEPLOYMENT.md

---

**Ultima revisione**: 15 Novembre 2025
**Versione**: 1.0.0
