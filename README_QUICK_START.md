# 🚀 Quick Start - Studio Compliance Manager

## 📋 Prerequisiti

- **Node.js** (v18+)
- **npm** o **yarn**
- **Docker Desktop** (per MailHog in sviluppo)

## ⚡ Avvio Rapido

### 1. Installa le dipendenze

```bash
npm install --legacy-peer-deps
```

### 2. Genera il client Prisma

```bash
npm run prisma:generate
```

### 3. Avvia MailHog (per le email di test)

**Assicurati che Docker Desktop sia in esecuzione**, poi:

```bash
docker compose up -d mailhog
```

Interfaccia web: **http://localhost:8025**

### 4. Avvia l'applicazione

```bash
npm run dev
```

Applicazione: **http://localhost:3000**

---

## 🧪 Test del Flusso di Registrazione

1. **Apri l'app**: http://localhost:3000
2. **Registra un nuovo utente**: http://localhost:3000/auth/register
3. **Controlla MailHog**: http://localhost:8025
4. **Clicca il link** nell'email di verifica
5. **Account verificato!** ✅

---

## 📧 Email in Sviluppo

Tutte le email vengono catturate da **MailHog** e NON vengono inviate realmente.

### Email inviate automaticamente:

- ✉️ **Verifica email** - Quando un utente si registra
- ✉️ **Reinvio verifica** - Quando clicca "Reinvia email"
- ✉️ **Approvazione account** - Quando un admin approva l'utente

---

## 🔑 Primo Accesso

Il database viene inizializzato con un **superadmin** di default:

```
Email: admin@example.com
Password: admin123
```

⚠️ **IMPORTANTE**: Cambia questa password in produzione!

---

## 📁 Struttura Progetto

```
studio-compliance-manager/
├── app/                      # Next.js App Router
│   ├── auth/                # Autenticazione
│   ├── api/                 # API Routes
│   ├── admin/               # Dashboard Admin
│   └── dashboard/           # Dashboard Utente
├── lib/                      # Utility e configurazione
│   ├── auth.ts              # NextAuth config
│   ├── email.ts             # Email service ⭐ NEW
│   └── prisma.ts            # Database client
├── prisma/                   # Schema e migrations
├── components/               # Componenti React
└── docs/                     # Documentazione
    └── EMAIL_SETUP.md       # Setup email completo
```

---

## 🛠️ Comandi Utili

| Comando                  | Descrizione                  |
| ------------------------ | ---------------------------- |
| `npm run dev`            | Avvia dev server             |
| `npm run build`          | Build per produzione         |
| `npm run start`          | Avvia server produzione      |
| `npm run prisma:studio`  | Interfaccia DB visuale       |
| `npm run prisma:migrate` | Crea nuova migration         |
| `npm run format`         | Formatta codice con Prettier |

---

## 🐳 Docker Commands

| Comando                        | Descrizione            |
| ------------------------------ | ---------------------- |
| `docker compose up -d`         | Avvia tutti i servizi  |
| `docker compose up -d mailhog` | Avvia solo MailHog     |
| `docker compose down`          | Ferma tutti i servizi  |
| `docker compose logs mailhog`  | Visualizza log MailHog |
| `docker compose ps`            | Stato dei servizi      |

---

## 🐛 Troubleshooting

### Docker non si connette

```bash
# Verifica che Docker Desktop sia in esecuzione
open -a Docker

# Attendi 30 secondi, poi prova
docker ps
```

### Email non arrivano in MailHog

1. Verifica che MailHog sia attivo: `docker compose ps`
2. Controlla i log: `docker compose logs mailhog`
3. Riavvia: `docker compose restart mailhog`
4. Apri http://localhost:8025

### Errori di build

```bash
# Pulisci cache e reinstalla
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
npm run prisma:generate
```

### Database locked

```bash
# Riavvia il server dev
# Oppure elimina il lock file
rm prisma/dev.db-journal
```

---

## 📚 Documentazione Completa

- **[Email Setup](docs/EMAIL_SETUP.md)** - Configurazione email dettagliata
- **[Husky Testing](docs/TESTING_HUSKY.md)** - Test Git hooks

---

## 🔐 Sicurezza

- ✅ Le password sono hashate con bcrypt
- ✅ Le sessioni usano JWT con NextAuth
- ✅ Email verification obbligatoria
- ✅ Admin approval per nuovi utenti
- ✅ Token di verifica con scadenza 24h

---

## 🚀 Deploy in Produzione

Prima del deploy:

1. ✅ Configura variabili d'ambiente produzione
2. ✅ Sostituisci MailHog con vero servizio SMTP
3. ✅ Cambia password admin di default
4. ✅ Abilita HTTPS
5. ✅ Configura database PostgreSQL (opzionale)

Vedi [EMAIL_SETUP.md](docs/EMAIL_SETUP.md) per configurare email in produzione.

---

## 📞 Supporto

Per problemi o domande:

1. Controlla la documentazione in `docs/`
2. Controlla i log dell'applicazione
3. Verifica che tutti i servizi siano attivi

---

**Buon lavoro! 🎉**
