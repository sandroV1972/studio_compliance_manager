# 📧 Configurazione Email

Questa guida spiega come configurare l'invio email per l'applicazione Studio Compliance Manager.

## 🔧 Ambiente di Sviluppo: MailHog

Per lo sviluppo usiamo **MailHog**, un server SMTP fittizio che cattura le email senza inviarle realmente.

### Avvio MailHog

MailHog è già configurato in `docker-compose.yml`. Per avviarlo:

```bash
# Avvia tutti i servizi (Postgres + MailHog)
docker-compose up -d

# Solo MailHog
docker-compose up -d mailhog
```

### Accesso all'Interfaccia Web

- **URL**: http://localhost:8025
- **SMTP Server**: localhost:1025

Tutte le email inviate dall'applicazione appariranno nell'interfaccia web di MailHog.

### Configurazione (.env)

```env
EMAIL_HOST=localhost
EMAIL_PORT=1025
EMAIL_USER=
EMAIL_PASSWORD=
EMAIL_FROM=noreply@studiocompliance.local
```

### Test del Sistema

1. Avvia MailHog: `docker-compose up -d mailhog`
2. Avvia l'app: `npm run dev`
3. Registra un nuovo utente
4. Apri http://localhost:8025
5. Vedrai l'email di verifica con il link cliccabile

---

## 🚀 Ambiente di Produzione

Per produzione, puoi usare diversi provider SMTP.

### Opzione 1: Gmail

**Requisiti**: Account Gmail + App Password (non la password normale)

1. Vai su https://myaccount.google.com/apppasswords
2. Crea una "App Password" per "Mail"
3. Configura `.env`:

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tuoemail@gmail.com
EMAIL_PASSWORD=xxxx xxxx xxxx xxxx  # App Password
EMAIL_FROM=tuoemail@gmail.com
```

**Limiti**: 500 email/giorno (gratuito)

### Opzione 2: SendGrid

**Requisiti**: Account SendGrid (100 email/giorno gratis)

1. Registrati su https://sendgrid.com
2. Crea un API Key
3. Configura `.env`:

```env
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASSWORD=SG.xxxxxxxxxxxxxxxxxxxxx  # API Key
EMAIL_FROM=noreply@tuodominio.com
```

**Limiti**: 100 email/giorno (piano gratuito)

### Opzione 3: Mailgun

**Requisiti**: Account Mailgun (5.000 email/mese gratis per 3 mesi)

1. Registrati su https://www.mailgun.com
2. Verifica il dominio
3. Ottieni le credenziali SMTP
4. Configura `.env`:

```env
EMAIL_HOST=smtp.mailgun.org
EMAIL_PORT=587
EMAIL_USER=postmaster@tuodominio.mailgun.org
EMAIL_PASSWORD=xxxxxxxxxxxxxxxx
EMAIL_FROM=noreply@tuodominio.com
```

### Opzione 4: Amazon SES

**Requisiti**: Account AWS

```env
EMAIL_HOST=email-smtp.eu-south-1.amazonaws.com
EMAIL_PORT=587
EMAIL_USER=AKIAXXXXXXXXXXXXXXXX
EMAIL_PASSWORD=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
EMAIL_FROM=noreply@tuodominio.com
```

**Costi**: $0.10 per 1.000 email

### Opzione 5: Server SMTP Esistente

Se hai già un server email aziendale o del tuo provider:

```env
EMAIL_HOST=smtp.tuoprovider.it
EMAIL_PORT=587  # o 465 per SSL
EMAIL_USER=tua@email.it
EMAIL_PASSWORD=tua_password
EMAIL_FROM=tua@email.it
```

---

## 📝 Email Inviate dall'Applicazione

### 1. Email di Verifica (Registrazione)

- **Quando**: Quando un utente si registra
- **Scopo**: Verificare l'indirizzo email
- **Template**: `lib/email.ts` → `sendVerificationEmail()`
- **Validità link**: 24 ore

### 2. Email di Reinvio Verifica

- **Quando**: L'utente clicca "Reinvia email di verifica" al login
- **Scopo**: Inviare nuovo link se il precedente è scaduto
- **Template**: Uguale all'email di verifica
- **Validità link**: 24 ore

### 3. Email di Approvazione Account

- **Quando**: Un admin approva un nuovo utente
- **Scopo**: Notificare l'utente che può accedere
- **Template**: `lib/email.ts` → `sendApprovalEmail()`

---

## 🧪 Test delle Email

### Test Manuale

1. **Avvia MailHog**: `docker-compose up -d mailhog`
2. **Registra utente**: http://localhost:3000/auth/register
3. **Verifica email**: http://localhost:8025
4. **Clicca il link** nell'email per verificare

### Test con curl

```bash
# Registra un utente
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User"
  }'

# Controlla MailHog
open http://localhost:8025
```

---

## 🐛 Troubleshooting

### Email non arrivano in MailHog

1. Verifica che MailHog sia in esecuzione:

   ```bash
   docker-compose ps
   ```

2. Controlla i log:

   ```bash
   docker-compose logs mailhog
   ```

3. Verifica le variabili d'ambiente:
   ```bash
   cat .env | grep EMAIL
   ```

### Errore "Connection refused"

- MailHog non è avviato. Esegui: `docker-compose up -d mailhog`

### Email non arrivano in produzione

1. Verifica credenziali SMTP in `.env`
2. Controlla i log dell'applicazione per errori
3. Verifica che il firewall permetta connessioni sulla porta SMTP
4. Per Gmail, assicurati di usare App Password, non la password normale

### Link di verifica non funziona

1. Verifica che `NEXTAUTH_URL` in `.env` sia corretto
2. In produzione deve essere: `https://tuodominio.com`
3. In sviluppo: `http://localhost:3000`

---

## 📊 Monitoraggio

### Sviluppo

Tutte le email sono visibili su: http://localhost:8025

### Produzione

- **SendGrid**: Dashboard su https://app.sendgrid.com
- **Mailgun**: Dashboard su https://app.mailgun.com
- **Gmail**: Controlla la cartella "Inviati"
- **Amazon SES**: CloudWatch Logs

---

## 🔒 Sicurezza

### Best Practices

1. ✅ Non committare mai le credenziali SMTP in `.env`
2. ✅ Usa App Password per Gmail (non la password principale)
3. ✅ In produzione, usa HTTPS per i link nelle email
4. ✅ Imposta rate limiting per prevenire spam
5. ✅ Verifica SPF e DKIM del tuo dominio

### File .env.example

Mantieni un file `.env.example` senza credenziali reali:

```env
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USER=your_email@example.com
EMAIL_PASSWORD=your_password_here
EMAIL_FROM=noreply@example.com
```

---

## 📚 Risorse Utili

- [MailHog GitHub](https://github.com/mailhog/MailHog)
- [Nodemailer Docs](https://nodemailer.com/)
- [Gmail App Passwords](https://support.google.com/accounts/answer/185833)
- [SendGrid SMTP](https://docs.sendgrid.com/for-developers/sending-email/integrating-with-the-smtp-api)
- [Mailgun SMTP](https://documentation.mailgun.com/en/latest/user_manual.html#sending-via-smtp)
