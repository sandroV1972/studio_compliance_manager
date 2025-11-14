# 🚀 Deployment Hetzner CX33 + Fedora 42 - Guida Completa

Guida step-by-step per deployment su **Hetzner Cloud CX33** con **Fedora 42**.

## 📊 Configurazione Scelta

- **Provider:** Hetzner Cloud
- **Piano:** CX33 (8GB RAM, 4 vCPU, 80GB NVMe) - **€12.96/mese**
- **OS:** Fedora 42 (x86)
- **Location:** Nuremberg, Germania

**Vantaggi CX33:**

- ✅ 8GB RAM - Ottimo per produzione
- ✅ 4 vCPU - Performance eccellenti
- ✅ 80GB storage NVMe - Veloce
- ✅ 20TB traffico incluso

---

## 📝 STEP 1: Crea Server Hetzner (5 minuti)

### 1.1 Accedi a Hetzner Cloud

```bash
1. Vai su https://console.hetzner.cloud
2. Login con il tuo account
3. Seleziona il tuo progetto o creane uno nuovo
```

### 1.2 Crea Server

```bash
1. Click "Add Server"

2. Location:
   ☑️ Nuremberg (nbg1-dc3) - Germania

3. Image:
   ☑️ Fedora 42 (x86)

4. Type:
   ☑️ Shared vCPU
   ☑️ CX33 (8 GB RAM, 4 vCPU, 80 GB NVMe) - €12.96/mese

5. Networking:
   ☑️ Public IPv4 (gratis)
   ☐ Public IPv6 (opzionale)

6. SSH Keys:
   # Se già configurata, seleziona
   # Altrimenti aggiungi la tua chiave pubblica

7. Volumes: Skip

8. Firewalls:
   # Creiamo firewall
   Click "Create Firewall"
   Nome: "compliance-firewall"

   Inbound Rules:
   - TCP, Port 22 (SSH) - Sources: 0.0.0.0/0, ::/0
   - TCP, Port 80 (HTTP) - Sources: 0.0.0.0/0, ::/0
   - TCP, Port 443 (HTTPS) - Sources: 0.0.0.0/0, ::/0

   Click "Create Firewall"
   ☑️ Seleziona "compliance-firewall"

9. Backups:
   ☐ Backups (opzionale, +20% = €2.59/mese)

10. Name: "compliance-prod"

11. Click "Create & Buy Now"
```

### 1.3 Salva Dati

```bash
# Apparirà finestra con:
Server IP: 123.45.67.89  ← SALVALO!
Root Password: xyz123    ← SALVALO! (se non usi SSH key)

# Il server sarà pronto in ~60 secondi
```

---

## 🔧 STEP 2: Configurazione Iniziale Fedora (10 minuti)

### 2.1 Connetti al Server

```bash
# Dal tuo Mac (che usa Fedora, quindi conosci bene!)
ssh root@123.45.67.89
# Sostituisci con il TUO IP

# Conferma fingerprint: yes

# Sei dentro! Prompt:
[root@compliance-prod ~]#
```

### 2.2 Aggiorna Sistema

```bash
# Aggiorna tutti i pacchetti (Fedora 42 è recente)
dnf update -y

# Installa strumenti base
dnf install -y curl git nano wget htop

# Tempo: ~2-3 minuti
```

### 2.3 Installa Docker

```bash
# Fedora 42 supporta Docker nativo
# Rimuovi vecchie versioni (se presenti)
dnf remove -y docker docker-client docker-client-latest \
             docker-common docker-latest docker-latest-logrotate \
             docker-logrotate docker-engine

# Installa Docker CE
dnf install -y dnf-plugins-core
dnf config-manager --add-repo https://download.docker.com/linux/fedora/docker-ce.repo

# Installa Docker Engine
dnf install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Avvia Docker
systemctl start docker
systemctl enable docker

# Verifica
docker --version
# Output: Docker version 24.x.x

docker compose version
# Output: Docker Compose version v2.x.x

# Test rapido
docker run hello-world
# Dovresti vedere "Hello from Docker!"
```

### 2.4 Configura Firewalld (Fedora usa firewalld, non ufw)

```bash
# Fedora 42 usa firewalld di default
systemctl start firewalld
systemctl enable firewalld

# Aggiungi servizi
firewall-cmd --permanent --add-service=ssh
firewall-cmd --permanent --add-service=http
firewall-cmd --permanent --add-service=https

# Oppure porte specifiche
firewall-cmd --permanent --add-port=22/tcp
firewall-cmd --permanent --add-port=80/tcp
firewall-cmd --permanent --add-port=443/tcp

# Ricarica
firewall-cmd --reload

# Verifica
firewall-cmd --list-all
# Dovresti vedere: services: ssh http https
```

### 2.5 Configura Swap (opzionale ma raccomandato)

```bash
# Con 8GB RAM non è critico, ma utile
# Crea 4GB di swap
dd if=/dev/zero of=/swapfile bs=1G count=4
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile

# Rendi permanente
echo '/swapfile none swap sw 0 0' >> /etc/fstab

# Verifica
free -h
# Dovresti vedere Swap: 4.0Gi
```

### 2.6 Ottimizza Fedora per Docker

```bash
# Fedora 42 usa SELinux - configuriamolo per Docker
# (già configurato, ma verifichiamo)
getenforce
# Output: Enforcing (va bene)

# Configura Docker per SELinux
nano /etc/docker/daemon.json

# Incolla:
{
  "selinux-enabled": true,
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  },
  "storage-driver": "overlay2"
}

# Salva: CTRL+O, ENTER, CTRL+X

# Riavvia Docker
systemctl restart docker

# Verifica
docker info | grep -i selinux
# Output: Security Options: ... selinux
```

**✅ Server Fedora 42 configurato!**

---

## 📧 STEP 3: AWS SES per Email (come prima, invariato)

### 3.1 Crea Account AWS

```bash
1. https://aws.amazon.com
2. Create AWS Account
3. Compila dati (email, password, carta)
4. Verifica telefono
5. Scegli piano Free
```

### 3.2 Attiva SES

```bash
1. AWS Console → Cerca "SES"
2. Regione: Europe (Ireland) eu-west-1
3. Get started
```

### 3.3 Verifica Email

```bash
1. SES → Verified identities → Create identity
2. Email address: tuoemail@gmail.com
3. Create identity
4. Controlla inbox → Click link verifica
5. Torna SES → Status: Verified ✅
```

### 3.4 Crea Credenziali SMTP

```bash
1. SES → SMTP settings → Create SMTP credentials
2. IAM User Name: "compliance-smtp"
3. Create
4. ⚠️ SALVA le credenziali:
   SMTP Username: AKIA...
   SMTP Password: wJal...
5. Download o copia in file sicuro
```

**Configurazione SES:**

```bash
EMAIL_HOST=email-smtp.eu-west-1.amazonaws.com
EMAIL_PORT=587
EMAIL_USER=<SMTP_USERNAME>
EMAIL_PASSWORD=<SMTP_PASSWORD>
EMAIL_FROM=<TUA_EMAIL_VERIFICATA>
```

---

## 🚀 STEP 4: Deploy Applicazione su Fedora (15 minuti)

### 4.1 Clone Repository

```bash
# Sei connesso SSH al server?
ssh root@123.45.67.89

# Clone
cd /root
git clone https://github.com/sandroV1972/studio_compliance_manager.git
cd studio_compliance_manager

# Verifica
ls -la
```

### 4.2 Genera Segreti

```bash
# Genera password sicure
echo "=== SALVA QUESTI VALORI ==="
echo "NEXTAUTH_SECRET=$(openssl rand -base64 32)"
echo "POSTGRES_PASSWORD=$(openssl rand -base64 24)"
echo "REDIS_PASSWORD=$(openssl rand -base64 24)"
echo "SUPER_ADMIN_PASSWORD=$(openssl rand -base64 16)"
echo "==========================="

# COPIA l'output, ti servirà subito
```

### 4.3 Crea File .env

```bash
# Copia template
cp .env.production.example .env

# Modifica
nano .env
```

**Configurazione .env completa:**

```bash
# ============================================
# DATABASE
# ============================================
DATABASE_URL="postgresql://compliance_user:<POSTGRES_PASSWORD>@postgres:5432/compliance_prod"
POSTGRES_USER=compliance_user
POSTGRES_PASSWORD=<INCOLLA_POSTGRES_PASSWORD_GENERATO>
POSTGRES_DB=compliance_prod

# ============================================
# NEXTAUTH
# ============================================
NEXTAUTH_SECRET=<INCOLLA_NEXTAUTH_SECRET_GENERATO>
NEXTAUTH_URL=http://<TUO_IP_SERVER>
# Esempio: http://123.45.67.89

# ============================================
# EMAIL - AWS SES
# ============================================
EMAIL_PROVIDER=ses
EMAIL_HOST=email-smtp.eu-west-1.amazonaws.com
EMAIL_PORT=587
EMAIL_USER=<TUO_SMTP_USERNAME_AWS>
EMAIL_PASSWORD=<TUA_SMTP_PASSWORD_AWS>
EMAIL_FROM=<TUA_EMAIL_VERIFICATA>

# ============================================
# REDIS
# ============================================
REDIS_URL=redis://:<REDIS_PASSWORD>@redis:6379
REDIS_PASSWORD=<INCOLLA_REDIS_PASSWORD_GENERATO>

# ============================================
# SUPER ADMIN
# ============================================
SUPER_ADMIN_EMAIL=admin@tuodominio.it
# ☝️ Deve essere verificata in AWS SES!
SUPER_ADMIN_PASSWORD=<INCOLLA_SUPER_ADMIN_PASSWORD_GENERATO>
SUPER_ADMIN_NAME="Admin Sistema"

# ============================================
# APP
# ============================================
NODE_ENV=production
LOG_LEVEL=info
NEXT_PUBLIC_APP_URL=http://<TUO_IP_SERVER>

# ============================================
# STORAGE
# ============================================
STORAGE_TYPE=local
UPLOAD_DIR=/app/uploads

# ============================================
# BACKUP
# ============================================
BACKUP_RETENTION_DAYS=30
BACKUP_SCHEDULE="0 2 * * *"
```

```bash
# Salva: CTRL+O, ENTER, CTRL+X
```

### 4.4 Permessi SELinux per Docker Volumes

```bash
# Fedora 42 con SELinux richiede permessi corretti
# Crea directory per volumi Docker
mkdir -p /var/lib/docker-volumes/postgres
mkdir -p /var/lib/docker-volumes/redis
mkdir -p /var/lib/docker-volumes/uploads
mkdir -p /var/lib/docker-volumes/backups

# Configura contesto SELinux
chcon -Rt svirt_sandbox_file_t /var/lib/docker-volumes/

# Verifica
ls -Z /var/lib/docker-volumes/
# Dovresti vedere: svirt_sandbox_file_t
```

### 4.5 Verifica Setup

```bash
# Script di verifica
chmod +x scripts/*.sh
./scripts/check-docker-setup.sh

# Leggi output, risolvi eventuali warning
```

### 4.6 Build e Avvia

```bash
# Build immagini (prima volta, ~5-8 minuti)
docker compose -f docker-compose.prod.yml build

# Avvia containers
docker compose -f docker-compose.prod.yml up -d

# Monitora avvio (primi 2 minuti)
docker compose -f docker-compose.prod.yml logs -f

# Premi CTRL+C quando vedi "Ready in ..."
```

### 4.7 Verifica Containers

```bash
# Stato containers
docker compose -f docker-compose.prod.yml ps

# Output atteso:
# NAME                STATUS
# postgres            Up (healthy)
# redis               Up (healthy)
# app                 Up (healthy)
# backup              Up

# Se qualche container è unhealthy:
docker compose -f docker-compose.prod.yml logs <nome-container>
```

### 4.8 Test Health Check

```bash
# Test locale
curl http://localhost:3000/api/health

# Output atteso:
# {"status":"healthy","database":"connected",...}

# Test da esterno (dal tuo Mac)
curl http://123.45.67.89:3000/api/health
# ☝️ Usa il TUO IP

# Se non risponde, verifica firewall:
firewall-cmd --add-port=3000/tcp --permanent
firewall-cmd --reload
```

**✅ Applicazione online su Fedora 42!**

---

## 🌐 STEP 5: Cloudflare Tunnel (Alternativa a IP pubblico)

Hai detto che hai già account Cloudflare. Ecco come usare Cloudflare Tunnel:

### 5.1 Vantaggi Cloudflare Tunnel

- ✅ **HTTPS automatico** (no certificati manuali)
- ✅ **No apertura porte** (sicurezza)
- ✅ **DDoS protection** (gratis)
- ✅ **Zero Trust access** (opzionale)
- ✅ **Dominio .cfargotunnel.com gratis** (per test)

### 5.2 Installa cloudflared su Fedora

```bash
# Sul server Fedora
# Download cloudflared per Fedora (x86_64)
wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.rpm

# Installa
dnf install -y ./cloudflared-linux-amd64.rpm

# Verifica
cloudflared --version
# Output: cloudflared version 2024.x.x
```

### 5.3 Login Cloudflare

```bash
# Autentica cloudflared
cloudflared tunnel login

# Output:
# Please open the following URL in your browser:
# https://dash.cloudflare.com/argotunnel?...

# Copia URL, aprilo nel browser sul tuo Mac
# Login Cloudflare → Autorizza

# Torna al terminale, dovresti vedere:
# You have successfully logged in!
```

### 5.4 Crea Tunnel

```bash
# Crea tunnel nominato
cloudflared tunnel create compliance-prod

# Output:
# Created tunnel compliance-prod with id abc-def-ghi-123
# Credentials written to /root/.cloudflared/abc-def-ghi-123.json

# SALVA il Tunnel ID: abc-def-ghi-123
```

### 5.5 Configura Tunnel

```bash
# Crea file config
mkdir -p /root/.cloudflared
nano /root/.cloudflared/config.yml

# Incolla (sostituisci TUNNEL_ID):
tunnel: abc-def-ghi-123
credentials-file: /root/.cloudflared/abc-def-ghi-123.json

ingress:
  - hostname: compliance.tuodominio.com
    service: http://localhost:3000
  - service: http_status:404
```

**Se NON hai dominio, usa tunnel gratuito:**

```yaml
tunnel: abc-def-ghi-123
credentials-file: /root/.cloudflared/abc-def-ghi-123.json

ingress:
  - service: http://localhost:3000
```

```bash
# Salva: CTRL+O, ENTER, CTRL+X
```

### 5.6 Route DNS (se hai dominio)

```bash
# Se hai dominio su Cloudflare
cloudflared tunnel route dns compliance-prod compliance.tuodominio.com

# Output:
# Created CNAME record compliance.tuodominio.com → abc-def.cfargotunnel.com
```

**Se NON hai dominio:**

```bash
# Cloudflare genera URL automatico:
# https://<tunnel-id>.cfargotunnel.com
```

### 5.7 Avvia Tunnel come Servizio

```bash
# Installa come systemd service
cloudflared service install

# Avvia servizio
systemctl start cloudflared
systemctl enable cloudflared

# Verifica
systemctl status cloudflared
# Output: Active: active (running)

# Logs
journalctl -u cloudflared -f
# Premi CTRL+C per uscire
```

### 5.8 Trova il Tuo URL

```bash
# Lista tunnel
cloudflared tunnel list

# Output:
# ID                             NAME              CREATED
# abc-def-ghi-123               compliance-prod    2024-11-13...

# URL pubblico:
# Se hai dominio: https://compliance.tuodominio.com
# Se NO dominio: https://abc-def-ghi-123.cfargotunnel.com

# Prova ad aprirlo nel browser!
```

**✅ Applicazione online con HTTPS via Cloudflare!**

---

## 🧪 STEP 6: Test Completo

### 6.1 Accedi all'App

```bash
# Nel browser, vai su:
# Opzione A (Cloudflare): https://compliance.tuodominio.com
# Opzione B (IP diretto): http://123.45.67.89:3000

# Dovresti vedere la homepage!
```

### 6.2 Login Super Admin

```bash
1. Click "Login"
2. Email: (SUPER_ADMIN_EMAIL dal .env)
3. Password: (SUPER_ADMIN_PASSWORD dal .env)
4. Login

# Sei dentro come Super Admin!
```

### 6.3 Test Email

```bash
1. Logout
2. Click "Registrati"
3. Usa una email verificata in AWS SES
4. Compila form → Registrati

# Dovresti ricevere email di verifica!
# Controlla inbox

5. Click link nell'email
6. Email verificata!

# Utente ora in pending approval
```

### 6.4 Test Approvazione

```bash
1. Login come Super Admin
2. Admin → Utenti Pending
3. Vedi nuovo utente
4. Click "Approva"

# Utente riceve email di approvazione!
```

### 6.5 Verifica Logs

```bash
# SSH sul server
ssh root@123.45.67.89
cd /root/studio_compliance_manager

# Logs applicazione
docker compose -f docker-compose.prod.yml logs app | tail -50

# Logs email
docker compose -f docker-compose.prod.yml logs app | grep "📧"

# Dovresti vedere:
# 📧 Email di verifica inviata a: ...
# 📧 Email di approvazione inviata a: ...
```

**✅ Sistema completamente funzionante!**

---

## 📊 Riepilogo Deployment Fedora 42

### ✅ Configurazione Finale

- **Server:** Hetzner CX33 (8GB RAM, 4 vCPU, 80GB)
- **OS:** Fedora 42 x86
- **Container Engine:** Docker CE 24.x + Compose V2
- **Firewall:** firewalld (servizi: ssh, http, https)
- **SELinux:** Enforcing (configurato per Docker)
- **Email:** AWS SES (eu-west-1)
- **HTTPS:** Cloudflare Tunnel (opzionale)
- **Backup:** Automatici ogni notte ore 2:00

### 💰 Costi Mensili

```
Hetzner CX33:                €12.96/mese
AWS SES:                     €0 (62k email gratis)
Cloudflare Tunnel:           €0 (gratis)
──────────────────────────────────────
TOTALE:                      €12.96/mese
```

### 🌐 Accesso

**Con Cloudflare Tunnel:**

- URL: https://compliance.tuodominio.com
- HTTPS: ✅ Automatico
- DDoS Protection: ✅ Attiva

**Senza Cloudflare (IP diretto):**

- URL: http://123.45.67.89:3000
- HTTPS: ⚠️ Da configurare manualmente

### 🔧 Comandi Utili Fedora

```bash
# Gestione containers
docker compose -f docker-compose.prod.yml start
docker compose -f docker-compose.prod.yml stop
docker compose -f docker-compose.prod.yml restart

# Logs
docker compose -f docker-compose.prod.yml logs -f app
journalctl -u docker -f
journalctl -u cloudflared -f

# Firewall
firewall-cmd --list-all
firewall-cmd --add-port=3000/tcp --permanent
firewall-cmd --reload

# SELinux
getenforce  # Verifica stato
audit2allow  # Analizza violazioni
restorecon -R /var/lib/docker-volumes/  # Reset contesto

# Sistema
htop  # Monitor risorse
df -h  # Spazio disco
free -h  # Memoria
systemctl status docker
systemctl status cloudflared

# Docker cleanup
docker system prune -a  # Pulisci tutto (ATTENZIONE!)
docker volume prune  # Pulisci volumi non usati
```

---

## 🆘 Troubleshooting Fedora Specifico

### Container non si avvia (SELinux)

```bash
# Verifica violazioni SELinux
ausearch -m avc -ts recent

# Permetti policy mancante
audit2allow -a -M mydocker
semodule -i mydocker.pp

# Oppure disabilita temporaneamente (NON raccomandato)
setenforce 0  # Temporaneo
# Per permanente: /etc/selinux/config → SELINUX=permissive
```

### Firewall blocca connessioni

```bash
# Verifica porte aperte
ss -tuln | grep LISTEN

# Aggiungi porta Docker
firewall-cmd --permanent --add-port=3000/tcp
firewall-cmd --reload

# Lista tutte le regole
firewall-cmd --list-all
```

### Docker lento su Fedora

```bash
# Verifica storage driver
docker info | grep "Storage Driver"
# Dovrebbe essere: overlay2

# Se diverso, configura:
nano /etc/docker/daemon.json
# Aggiungi: "storage-driver": "overlay2"

systemctl restart docker
```

### Cloudflare Tunnel non funziona

```bash
# Verifica servizio
systemctl status cloudflared

# Restart
systemctl restart cloudflared

# Logs dettagliati
journalctl -u cloudflared -f --no-pager

# Test manuale
cloudflared tunnel run compliance-prod
# CTRL+C per fermare
```

---

## 🎉 Complimenti!

Hai deployato con successo **Studio Compliance Manager** su:

- ✅ **Hetzner Cloud CX33** (performance ottimali)
- ✅ **Fedora 42** (come a casa tua!)
- ✅ **Docker** (containerizzazione)
- ✅ **AWS SES** (email transazionali)
- ✅ **Cloudflare Tunnel** (HTTPS gratis)

Il sistema è **ONLINE e PRONTO** per i test! 🚀

---

## 📚 Documentazione

Per maggiori dettagli:

- **PRODUCTION_SETUP.md** - Setup generale
- **DEPLOYMENT.md** - Deployment tecnico
- **DEPENDENCIES.md** - Tutte le dipendenze
- **scripts/README.md** - Script utilities

**Buon deployment! 🎯**
