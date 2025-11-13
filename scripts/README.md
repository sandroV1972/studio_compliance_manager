# 🛠️ Script Utilities - Studio Compliance Manager

Raccolta di script helper per gestione, deployment e manutenzione del sistema.

## 📋 Indice Script

### 🔍 Verifica e Test

#### `check-docker-setup.sh`

Verifica completa della configurazione Docker e delle dipendenze di sistema.

**Uso:**

```bash
./scripts/check-docker-setup.sh
```

**Verifica:**

- ✅ Installazione Docker e Docker Compose
- ✅ File di configurazione presenti
- ✅ Variabili d'ambiente nel .env
- ✅ Immagini Docker base
- ✅ Dipendenze Node.js
- ✅ Schema Prisma
- ✅ Porte disponibili
- ✅ Risorse sistema (RAM, CPU, disco)
- ✅ Test build opzionale

**Output:**

```
✅ Docker installato: v24.0.7
✅ Docker Compose installato: v2.23.0
✅ .env presente
✅ DATABASE_URL configurato
...
```

---

#### `test-email-config.sh`

Testa la configurazione email (SMTP/SES) inviando una email di prova.

**Uso:**

```bash
./scripts/test-email-config.sh email@destinatario.it
```

**Verifica:**

- ✅ Connessione al server SMTP
- ✅ Autenticazione credenziali
- ✅ Invio email reale
- ✅ Deliverability

**Output:**

```
✅ Connessione SMTP riuscita!
📤 Invio email di test a: email@destinatario.it
✅ Email di test inviata con successo!
📬 Message ID: <abc123@example.com>
```

**Troubleshooting automatico:**

- 🔐 Errore autenticazione → Verifica credenziali
- 🌐 Errore connessione → Verifica host/porta
- ⏱️ Timeout → Verifica firewall

---

### 💾 Backup e Restore

#### `backup.sh`

Backup automatico del database PostgreSQL con compressione.

**Uso:**

```bash
# Manuale
./scripts/backup.sh

# Automatico (configurato in docker-compose)
# Esegue ogni giorno alle 2:00 AM
```

**Caratteristiche:**

- 📦 Compressione gzip
- 📅 Timestamp nel nome file
- 🗑️ Pulizia automatica (retention days)
- 📊 Report dimensioni backup
- 📝 Logging verboso

**Esempio output:**

```
🗄️  Avvio backup database: compliance_prod
✅ Backup completato: compliance_prod_20251113_020000.sql.gz
📊 Dimensione backup: 2.5 MB
🗑️  Pulizia backup vecchi di 30 giorni...
✅ Backup completato con successo!
```

**Configurazione:**

```bash
# In .env
BACKUP_RETENTION_DAYS=30
BACKUP_SCHEDULE="0 2 * * *"  # Cron format
```

---

#### `restore.sh`

Ripristina il database da un backup.

**Uso:**

```bash
./scripts/restore.sh /backups/compliance_prod_20251113_020000.sql.gz
```

**⚠️ ATTENZIONE:**

- Cancella tutti i dati attuali del database
- Richiede conferma interattiva
- Ferma l'applicazione durante il restore

**Processo:**

1. ⚠️ Richiede conferma
2. 🛑 Ferma connessioni attive
3. 🗑️ Drop database esistente
4. 🆕 Crea database vuoto
5. 📥 Restore da backup
6. ✅ Verifica integrità

**Output:**

```
⚠️  ATTENZIONE: Questa operazione cancellerà tutti i dati attuali!
❓ Continuare? (yes/no): yes
🗄️  Restore database da: compliance_prod_20251113_020000.sql.gz
✅ Restore completato con successo!
```

---

### 🔄 Sincronizzazione

#### `sync-prod-to-preprod.sh`

Sincronizza database da PRODUZIONE a PRE-PRODUZIONE (per testing).

**Uso:**

```bash
# Esecuzione manuale
./scripts/sync-prod-to-preprod.sh

# Automatico (cron job configurato)
# Esegue ogni giorno alle 3:00 AM
```

**Processo:**

1. 📦 Backup database PRODUZIONE
2. 🛑 Stop container PRE-PROD app
3. 🗑️ Drop database PRE-PROD
4. 🆕 Crea database PRE-PROD vuoto
5. 📥 Restore backup PROD → PRE-PROD
6. ▶️ Restart container PRE-PROD app
7. ✅ Verifica health check

**Output:**

```
🔄 Avvio sincronizzazione PROD → PRE-PROD
📦 Backup database PROD...
✅ Backup completato: /tmp/prod_sync_20251113.sql.gz
🛑 Stop app PRE-PROD...
🗄️  Reset database PRE-PROD...
📥 Restore backup in PRE-PROD...
▶️  Restart app PRE-PROD...
✅ Sincronizzazione completata!
```

**Configurazione cron:**

```bash
# Crontab su server
0 3 * * * /path/to/scripts/sync-prod-to-preprod.sh >> /var/log/sync-preprod.log 2>&1
```

---

### 🚀 Startup e Inizializzazione

#### `docker-entrypoint.sh`

Script di avvio automatico del container Docker.

**Esecuzione:** Automatica all'avvio del container

**Processo:**

1. ⏳ Attesa connessione database (max 60s)
2. 🔄 Esecuzione migrations Prisma
3. 👤 Inizializzazione super admin
4. 🚀 Avvio applicazione Next.js

**Output:**

```
⏳ Attesa database PostgreSQL...
✅ Database pronto!
🔄 Esecuzione migrations...
✅ Migrations completate
👤 Inizializzazione super admin...
✅ Super admin configurato
🚀 Avvio applicazione...
```

**Variabili d'ambiente utilizzate:**

- `DATABASE_URL` - Connessione database
- `SUPER_ADMIN_EMAIL` - Email super admin
- `SUPER_ADMIN_PASSWORD` - Password super admin
- `SUPER_ADMIN_NAME` - Nome super admin

---

#### `init-superadmin.js`

Crea o aggiorna il super admin al primo avvio.

**Esecuzione:** Automatica tramite `docker-entrypoint.sh`

**Logica:**

```javascript
if (super admin non exists) {
  ✅ Crea nuovo super admin
} else if (super admin exists && !isSuperAdmin) {
  ✅ Promuovi a super admin
} else {
  ℹ️ Super admin già configurato
}
```

**Output:**

```
👤 Verifica super admin: admin@studio.it
✅ Super admin creato con successo
   Email: admin@studio.it
   Nome: Admin Studio
```

---

#### `make-superadmin.js`

Promuove un utente esistente a super admin.

**Uso:**

```bash
# Da fuori il container
node scripts/make-superadmin.js email@utente.it

# Dentro il container Docker
docker-compose exec app node scripts/make-superadmin.js email@utente.it
```

**Output:**

```
👤 Ricerca utente: email@utente.it
✅ Utente trovato: Mario Rossi
🔄 Promozione a super admin...
✅ Utente promosso a super admin con successo!
```

---

## 📚 Esempi d'Uso Comuni

### Setup Iniziale

```bash
# 1. Verifica sistema
./scripts/check-docker-setup.sh

# 2. Configura .env (se non fatto)
cp .env.production.example .env
nano .env

# 3. Test email
./scripts/test-email-config.sh tuoemail@test.it

# 4. Avvia produzione
docker-compose -f docker-compose.prod.yml up -d

# 5. Verifica super admin
docker-compose -f docker-compose.prod.yml logs app | grep "super admin"
```

---

### Backup Manuale

```bash
# Esegui backup immediato
docker-compose -f docker-compose.prod.yml exec backup /app/scripts/backup.sh

# Verifica backup creati
docker-compose -f docker-compose.prod.yml exec backup ls -lh /backups/

# Scarica backup in locale
docker cp $(docker-compose ps -q backup):/backups/compliance_prod_20251113_020000.sql.gz ./
```

---

### Restore da Backup

```bash
# 1. Lista backup disponibili
docker-compose -f docker-compose.prod.yml exec backup ls -lh /backups/

# 2. Esegui restore (ATTENZIONE!)
docker-compose -f docker-compose.prod.yml exec backup \
  /app/scripts/restore.sh /backups/compliance_prod_20251113_020000.sql.gz

# 3. Verifica applicazione
curl http://localhost:3000/api/health
```

---

### Sincronizzazione PROD → PRE-PROD

```bash
# Sync manuale
./scripts/sync-prod-to-preprod.sh

# Verifica PRE-PROD aggiornato
curl http://localhost:3002/api/health

# Login PRE-PROD (usa credenziali PROD)
open http://localhost:3002/auth/login
```

---

### Troubleshooting

```bash
# Verifica stato completo
./scripts/check-docker-setup.sh

# Test connessione email
./scripts/test-email-config.sh test@email.it

# Verifica logs applicazione
docker-compose -f docker-compose.prod.yml logs -f app

# Verifica database
docker-compose -f docker-compose.prod.yml exec postgres \
  psql -U compliance_user -d compliance_prod -c '\dt'

# Rigenera super admin
docker-compose -f docker-compose.prod.yml exec app \
  node scripts/init-superadmin.js
```

---

### Manutenzione Periodica

```bash
# Verifica spazio backup
du -sh /var/lib/docker/volumes/*backups*

# Pulizia backup vecchi (oltre retention)
# Automatico con backup.sh, oppure manuale:
find /backups -name "*.sql.gz" -mtime +30 -delete

# Verifica dimensione database
docker-compose -f docker-compose.prod.yml exec postgres \
  psql -U compliance_user -d compliance_prod \
  -c "SELECT pg_size_pretty(pg_database_size('compliance_prod'));"

# Ottimizza database
docker-compose -f docker-compose.prod.yml exec postgres \
  psql -U compliance_user -d compliance_prod -c "VACUUM ANALYZE;"
```

---

## 🔒 Sicurezza Script

### Permessi Corretti

```bash
# Gli script devono essere eseguibili
chmod +x scripts/*.sh

# Ma non scrivibili da altri
chmod 755 scripts/*.sh

# File .env deve essere privato
chmod 600 .env
```

### Variabili Sensibili

Gli script NON loggano mai:

- ❌ Password database
- ❌ NEXTAUTH_SECRET
- ❌ Credenziali email
- ❌ API keys

Le password sono sempre lette da variabili d'ambiente, mai hardcoded.

---

## 📊 Monitoring Script

### Cron Jobs Raccomandati

```bash
# Apri crontab
crontab -e

# Aggiungi:
# Backup giornaliero ore 2:00
0 2 * * * cd /path/to/app && docker-compose -f docker-compose.prod.yml exec -T backup /app/scripts/backup.sh >> /var/log/compliance-backup.log 2>&1

# Sync PRE-PROD ore 3:00
0 3 * * * /path/to/app/scripts/sync-prod-to-preprod.sh >> /var/log/compliance-sync.log 2>&1

# Pulizia logs settimanale
0 4 * * 0 find /var/log/compliance-*.log -mtime +30 -delete

# Health check ogni 5 minuti
*/5 * * * * curl -f http://localhost:3000/api/health || echo "App down!" | mail -s "Alert" admin@example.com
```

---

## 🆘 Supporto

Per problemi con gli script:

1. **Verifica permessi esecuzione:**

   ```bash
   ls -la scripts/
   ```

2. **Esegui in modalità debug:**

   ```bash
   bash -x scripts/nome-script.sh
   ```

3. **Verifica variabili d'ambiente:**

   ```bash
   docker-compose -f docker-compose.prod.yml exec app printenv
   ```

4. **Consulta logs:**
   ```bash
   docker-compose -f docker-compose.prod.yml logs --tail=100 app
   ```

Per documentazione completa: `PRODUCTION_SETUP.md` e `DEPLOYMENT.md`
