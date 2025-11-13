#!/bin/bash

# Script per verificare dipendenze e configurazione Docker
# Uso: ./check-docker-setup.sh

set -e

echo "🔍 Verifica Setup Docker - Studio Compliance Manager"
echo "===================================================="
echo ""

# Colori per output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Funzioni helper
check_ok() {
  echo -e "${GREEN}✅ $1${NC}"
}

check_warn() {
  echo -e "${YELLOW}⚠️  $1${NC}"
}

check_fail() {
  echo -e "${RED}❌ $1${NC}"
}

# 1. Verifica Docker
echo "📦 1. Verifica Docker Engine"
echo "----------------------------"
if command -v docker &> /dev/null; then
  DOCKER_VERSION=$(docker --version | cut -d ' ' -f3 | cut -d ',' -f1)
  check_ok "Docker installato: v$DOCKER_VERSION"
  
  # Verifica che Docker sia in esecuzione
  if docker ps &> /dev/null; then
    check_ok "Docker daemon in esecuzione"
  else
    check_fail "Docker daemon non in esecuzione"
    echo "   Avvia Docker con: sudo systemctl start docker"
    exit 1
  fi
else
  check_fail "Docker non installato"
  echo ""
  echo "Installa Docker con:"
  echo "  curl -fsSL https://get.docker.com -o get-docker.sh"
  echo "  sudo sh get-docker.sh"
  exit 1
fi
echo ""

# 2. Verifica Docker Compose
echo "📦 2. Verifica Docker Compose"
echo "-----------------------------"
if docker compose version &> /dev/null; then
  COMPOSE_VERSION=$(docker compose version --short)
  check_ok "Docker Compose installato: v$COMPOSE_VERSION"
elif command -v docker-compose &> /dev/null; then
  COMPOSE_VERSION=$(docker-compose --version | cut -d ' ' -f4 | cut -d ',' -f1)
  check_ok "Docker Compose installato (legacy): v$COMPOSE_VERSION"
  check_warn "Considera di aggiornare a Docker Compose V2"
else
  check_fail "Docker Compose non installato"
  echo ""
  echo "Installa Docker Compose plugin:"
  echo "  sudo apt install docker-compose-plugin"
  exit 1
fi
echo ""

# 3. Verifica file di configurazione
echo "📄 3. Verifica File di Configurazione"
echo "--------------------------------------"

required_files=(
  "Dockerfile"
  "docker-compose.prod.yml"
  "docker-compose.test.yml"
  "docker-compose.preprod.yml"
  ".dockerignore"
  "package.json"
  "prisma/schema.prisma"
  "next.config.mjs"
  "scripts/docker-entrypoint.sh"
  "scripts/backup.sh"
  "scripts/restore.sh"
)

for file in "${required_files[@]}"; do
  if [ -f "$file" ]; then
    check_ok "$file"
  else
    check_fail "$file mancante"
  fi
done
echo ""

# 4. Verifica file .env
echo "🔐 4. Verifica Configurazione Ambiente"
echo "--------------------------------------"

if [ -f ".env" ]; then
  check_ok ".env presente"
  
  # Verifica variabili critiche
  required_vars=(
    "DATABASE_URL"
    "NEXTAUTH_SECRET"
    "NEXTAUTH_URL"
    "EMAIL_HOST"
    "EMAIL_PORT"
    "EMAIL_USER"
    "EMAIL_FROM"
    "REDIS_URL"
    "SUPER_ADMIN_EMAIL"
  )
  
  missing_vars=()
  for var in "${required_vars[@]}"; do
    if grep -q "^${var}=" .env 2>/dev/null && ! grep -q "^${var}=$" .env; then
      check_ok "$var configurato"
    else
      check_warn "$var non configurato o vuoto"
      missing_vars+=("$var")
    fi
  done
  
  if [ ${#missing_vars[@]} -gt 0 ]; then
    echo ""
    check_warn "Alcune variabili critiche non sono configurate:"
    for var in "${missing_vars[@]}"; do
      echo "     - $var"
    done
    echo ""
    echo "   Consulta .env.production.example per la configurazione completa"
  fi
else
  check_fail ".env non trovato"
  echo ""
  echo "Crea il file .env:"
  echo "  cp .env.production.example .env"
  echo "  nano .env  # Modifica con i tuoi dati"
  echo ""
  exit 1
fi
echo ""

# 5. Verifica immagini Docker necessarie
echo "🐳 5. Verifica Immagini Docker Base"
echo "-----------------------------------"

base_images=(
  "node:20-alpine"
  "postgres:16-alpine"
  "redis:7-alpine"
)

for image in "${base_images[@]}"; do
  if docker image inspect "$image" &> /dev/null; then
    check_ok "$image già presente"
  else
    check_warn "$image non presente (verrà scaricata)"
  fi
done
echo ""

# 6. Verifica dipendenze Node.js
echo "📚 6. Verifica Dipendenze Applicazione"
echo "---------------------------------------"

if [ -f "package.json" ]; then
  check_ok "package.json presente"
  
  # Conta dipendenze
  DEPS_COUNT=$(grep -c '"' package.json | head -1)
  if [ -f "package-lock.json" ]; then
    check_ok "package-lock.json presente (build riproducibile)"
  else
    check_warn "package-lock.json mancante"
    echo "   Esegui 'npm install' per generarlo"
  fi
  
  # Verifica dipendenze critiche
  critical_deps=(
    "next"
    "@prisma/client"
    "nodemailer"
    "next-auth"
    "react"
  )
  
  for dep in "${critical_deps[@]}"; do
    if grep -q "\"$dep\"" package.json; then
      check_ok "$dep presente in package.json"
    else
      check_fail "$dep mancante in package.json"
    fi
  done
else
  check_fail "package.json non trovato"
  exit 1
fi
echo ""

# 7. Verifica Prisma Schema
echo "🗄️  7. Verifica Schema Database"
echo "--------------------------------"

if [ -f "prisma/schema.prisma" ]; then
  check_ok "prisma/schema.prisma presente"
  
  # Conta modelli
  MODELS_COUNT=$(grep -c "^model " prisma/schema.prisma)
  check_ok "$MODELS_COUNT modelli definiti"
  
  # Verifica datasource
  if grep -q 'provider = "postgresql"' prisma/schema.prisma || grep -q 'provider = "sqlite"' prisma/schema.prisma; then
    PROVIDER=$(grep 'provider =' prisma/schema.prisma | head -1 | cut -d '"' -f2)
    check_ok "Provider database: $PROVIDER"
  else
    check_fail "Provider database non riconosciuto"
  fi
else
  check_fail "prisma/schema.prisma non trovato"
  exit 1
fi
echo ""

# 8. Verifica porte disponibili
echo "🔌 8. Verifica Porte Disponibili"
echo "---------------------------------"

ports_to_check=(
  "3000:App principale"
  "5432:PostgreSQL"
  "6379:Redis"
  "80:HTTP"
  "443:HTTPS"
)

for port_info in "${ports_to_check[@]}"; do
  port=$(echo $port_info | cut -d ':' -f1)
  name=$(echo $port_info | cut -d ':' -f2)
  
  if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1 || netstat -tuln 2>/dev/null | grep -q ":$port "; then
    check_warn "Porta $port ($name) già in uso"
  else
    check_ok "Porta $port ($name) disponibile"
  fi
done
echo ""

# 9. Verifica risorse sistema
echo "💻 9. Verifica Risorse Sistema"
echo "-------------------------------"

# RAM
TOTAL_RAM=$(free -g | awk '/^Mem:/{print $2}')
if [ $TOTAL_RAM -ge 4 ]; then
  check_ok "RAM: ${TOTAL_RAM}GB (sufficiente)"
else
  check_warn "RAM: ${TOTAL_RAM}GB (minimo raccomandato: 4GB)"
  echo "   Considera di aggiungere swap:"
  echo "   sudo fallocate -l 4G /swapfile"
  echo "   sudo chmod 600 /swapfile"
  echo "   sudo mkswap /swapfile"
  echo "   sudo swapon /swapfile"
fi

# Spazio disco
AVAILABLE_SPACE=$(df -BG . | awk 'NR==2 {print $4}' | sed 's/G//')
if [ $AVAILABLE_SPACE -ge 20 ]; then
  check_ok "Spazio disco: ${AVAILABLE_SPACE}GB disponibili (sufficiente)"
else
  check_warn "Spazio disco: ${AVAILABLE_SPACE}GB disponibili (minimo raccomandato: 20GB)"
fi

# CPU cores
CPU_CORES=$(nproc)
if [ $CPU_CORES -ge 2 ]; then
  check_ok "CPU: ${CPU_CORES} core (sufficiente)"
else
  check_warn "CPU: ${CPU_CORES} core (minimo raccomandato: 2)"
fi
echo ""

# 10. Test build Docker (opzionale)
echo "🔨 10. Test Build Docker (opzionale)"
echo "------------------------------------"
read -p "Vuoi eseguire un test build? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  echo "Avvio test build..."
  if docker build -t studio-compliance-test --target builder . ; then
    check_ok "Build Docker completata con successo"
    # Pulisci immagine di test
    docker rmi studio-compliance-test 2>/dev/null || true
  else
    check_fail "Build Docker fallita"
    echo "   Controlla i log sopra per dettagli"
  fi
else
  check_warn "Test build saltato"
fi
echo ""

# Riepilogo finale
echo "============================================"
echo "📊 RIEPILOGO VERIFICA"
echo "============================================"
echo ""

# Conta check OK e FAIL
OK_COUNT=$(grep -c "✅" /tmp/check_output.txt 2>/dev/null || echo "0")
WARN_COUNT=$(grep -c "⚠️" /tmp/check_output.txt 2>/dev/null || echo "0")
FAIL_COUNT=$(grep -c "❌" /tmp/check_output.txt 2>/dev/null || echo "0")

if [ ! -f ".env" ]; then
  echo "❌ AZIONE RICHIESTA:"
  echo "   1. Crea file .env da template:"
  echo "      cp .env.production.example .env"
  echo "   2. Modifica .env con le tue configurazioni"
  echo "   3. Riesegui questo script"
  echo ""
elif [ ${#missing_vars[@]} -gt 0 ]; then
  echo "⚠️  CONFIGURAZIONE INCOMPLETA:"
  echo "   Completa la configurazione delle variabili in .env"
  echo "   Consulta PRODUCTION_SETUP.md per le istruzioni"
  echo ""
else
  echo "✅ SISTEMA PRONTO!"
  echo ""
  echo "Prossimi passi:"
  echo "  1. Test configurazione email:"
  echo "     ./scripts/test-email-config.sh tuoemail@test.it"
  echo ""
  echo "  2. Avvia ambiente TEST:"
  echo "     docker-compose -f docker-compose.test.yml up -d"
  echo ""
  echo "  3. Oppure avvia PRODUZIONE:"
  echo "     docker-compose -f docker-compose.prod.yml up -d"
  echo ""
  echo "  4. Verifica salute sistema:"
  echo "     curl http://localhost:3000/api/health"
  echo ""
fi

echo "============================================"
echo ""
echo "📚 Documentazione:"
echo "   - PRODUCTION_SETUP.md  : Guida setup completo"
echo "   - DEPLOYMENT.md        : Guida deployment dettagliata"
echo "   - DOCKER_QUICKSTART.md : Quick start Docker"
echo ""
