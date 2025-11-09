# Setup Cron Job per Reminder Automatici

Questo documento spiega come configurare l'invio automatico delle email di reminder per le scadenze.

## Come Funziona

Il sistema invia automaticamente email di reminder alle persone o strutture associate a una scadenza, nei giorni specificati prima della data di scadenza.

**Esempio:**

- Scadenza: 1 Gennaio 2025
- Reminder configurati: 14 giorni e 7 giorni prima
- Email inviate: 18 Dicembre 2024 (alle 8:00 AM) e 25 Dicembre 2024 (alle 8:00 AM)

## Configurazione

### 1. Variabile d'Ambiente

Assicurati di avere configurato la variabile `CRON_SECRET` nel file `.env`:

```env
CRON_SECRET="your-secret-token-here-change-in-production"
```

**IMPORTANTE:** Cambia questo valore in produzione con un token sicuro e casuale.

### 2. Opzioni di Configurazione

Ci sono diverse opzioni per eseguire il cron job:

#### Opzione A: Vercel Cron Jobs (Raccomandato per deployment su Vercel)

1. Crea un file `vercel.json` nella root del progetto:

```json
{
  "crons": [
    {
      "path": "/api/cron/send-deadline-reminders",
      "schedule": "0 8 * * *"
    }
  ]
}
```

2. Configura la variabile d'ambiente `CRON_SECRET` nelle impostazioni di Vercel

3. Il cron job verrà eseguito automaticamente ogni giorno alle 8:00 AM (UTC)

**Nota:** Per timezone Europa/Roma (UTC+1), il cron verrà eseguito alle 9:00 ora italiana (10:00 durante l'ora legale).

Per eseguirlo alle 8:00 ora italiana, usa schedule: `0 7 * * *` (UTC)

#### Opzione B: Servizi Cron Esterni

Puoi usare servizi come:

- [cron-job.org](https://cron-job.org/) (Gratuito)
- [EasyCron](https://www.easycron.com/) (Gratuito/Premium)
- [cPanel Cron Jobs](https://cpanel.net/) (se hai hosting con cPanel)

**Configurazione esempio per cron-job.org:**

1. Registrati su cron-job.org
2. Crea un nuovo cron job con:
   - **URL:** `https://your-domain.com/api/cron/send-deadline-reminders`
   - **Schedule:** Ogni giorno alle 8:00 AM
   - **Request Method:** POST
   - **Headers:**
     ```
     Authorization: Bearer your-cron-secret-here
     ```

#### Opzione C: Server Locale con Crontab (Linux/Mac)

Se stai ospitando l'applicazione su un server Linux/Mac:

1. Apri il crontab:

```bash
crontab -e
```

2. Aggiungi questa riga:

```
0 8 * * * curl -X POST -H "Authorization: Bearer your-cron-secret-here" https://your-domain.com/api/cron/send-deadline-reminders
```

3. Salva e chiudi l'editor

#### Opzione D: Windows Task Scheduler

Se stai ospitando su Windows Server:

1. Apri Task Scheduler
2. Crea un nuovo task con:
   - **Trigger:** Daily at 8:00 AM
   - **Action:** Start a program
   - **Program:** `powershell.exe`
   - **Arguments:**
   ```powershell
   -Command "Invoke-WebRequest -Uri 'https://your-domain.com/api/cron/send-deadline-reminders' -Method POST -Headers @{'Authorization'='Bearer your-cron-secret-here'}"
   ```

## Test del Cron Job

### Verifica dello Stato

Puoi verificare lo stato del cron job chiamando l'endpoint GET:

```bash
curl -H "Authorization: Bearer your-cron-secret-here" \
  https://your-domain.com/api/cron/send-deadline-reminders
```

Risposta esempio:

```json
{
  "status": "healthy",
  "timestamp": "2024-12-15T08:00:00.000Z",
  "stats": {
    "pendingReminders": 5,
    "sentToday": 3
  },
  "info": "Endpoint cron per l'invio automatico dei reminder delle scadenze",
  "schedule": "Giornalmente alle 8:00 AM"
}
```

### Test Manuale dell'Invio

Puoi testare manualmente l'invio dei reminder:

```bash
curl -X POST \
  -H "Authorization: Bearer your-cron-secret-here" \
  https://your-domain.com/api/cron/send-deadline-reminders
```

Risposta esempio:

```json
{
  "success": true,
  "timestamp": "2024-12-15T08:00:00.000Z",
  "stats": {
    "deadlinesProcessed": 10,
    "emailsSent": 3,
    "errors": 0
  }
}
```

## Come Funziona il Sistema di Reminder

1. **Creazione Scadenza:** Quando crei una scadenza, puoi aggiungere uno o più reminder (es. 14 giorni, 7 giorni, 1 giorno prima)

2. **Database:** I reminder vengono salvati nel database con:
   - `daysBefore`: Quanti giorni prima della scadenza inviare l'email
   - `message`: Messaggio personalizzato opzionale
   - `notified`: Flag che indica se l'email è stata inviata
   - `notifiedAt`: Data e ora di invio

3. **Cron Job Giornaliero:** Ogni giorno alle 8:00 AM:
   - Il cron job cerca tutte le scadenze PENDING (non completate)
   - Per ogni scadenza, verifica i reminder non ancora inviati
   - Calcola quanti giorni mancano alla scadenza
   - Se un reminder corrisponde (es. mancano 7 giorni e c'è un reminder a 7 giorni):
     - Invia l'email al destinatario (persona o struttura)
     - Marca il reminder come `notified: true`
     - Salva la data di invio in `notifiedAt`

4. **Destinatari:**
   - **Scadenza Personale:** Email inviata all'indirizzo della persona
   - **Scadenza Struttura:** Email inviata all'indirizzo della struttura

## Monitoraggio

### Log

Il cron job produce log dettagliati:

```
🔄 Inizio processo di invio reminder scadenze...
📋 Trovate 10 scadenze con reminder da processare
📅 Scadenza "Visita medica Mario Rossi" - Mancano 7 giorni
✅ Reminder inviato a mario.rossi@email.com per "Visita medica Mario Rossi" (7 giorni prima)
✅ Processo completato: { deadlinesProcessed: 10, emailsSent: 3, errors: 0 }
```

### Database

Puoi controllare i reminder nel database:

```sql
-- Reminder non ancora inviati
SELECT * FROM DeadlineReminder WHERE notified = false;

-- Reminder inviati oggi
SELECT * FROM DeadlineReminder
WHERE notified = true
AND DATE(notifiedAt) = DATE('now');

-- Statistiche reminder per scadenza
SELECT
  d.title,
  COUNT(r.id) as total_reminders,
  SUM(CASE WHEN r.notified THEN 1 ELSE 0 END) as sent,
  SUM(CASE WHEN NOT r.notified THEN 1 ELSE 0 END) as pending
FROM DeadlineInstance d
LEFT JOIN DeadlineReminder r ON d.id = r.deadlineId
GROUP BY d.id, d.title;
```

## Risoluzione Problemi

### Reminder non inviati

1. Verifica che il cron job sia configurato correttamente
2. Controlla i log del server per errori
3. Verifica che la persona/struttura abbia un indirizzo email valido
4. Controlla che il servizio email sia configurato correttamente (SMTP)

### Email in spam

1. Configura SPF, DKIM e DMARC per il tuo dominio
2. Usa un servizio email professionale (SendGrid, AWS SES, etc.)
3. Verifica che l'indirizzo mittente sia valido

### Cron job non eseguito

1. Verifica che `CRON_SECRET` sia configurato
2. Controlla che il servizio cron esterno sia attivo
3. Verifica che l'URL sia corretto e accessibile
4. Controlla che l'header Authorization sia corretto

## Sicurezza

- ⚠️ **NON condividere mai il CRON_SECRET**
- ✅ Usa HTTPS in produzione
- ✅ Cambia il CRON_SECRET in produzione
- ✅ Monitora i tentativi di accesso non autorizzati
- ✅ Usa un token casuale lungo (almeno 32 caratteri)

## Best Practices

1. **Timezone:** Assicurati che il cron job sia configurato nel timezone corretto
2. **Backup:** Fai backup regolari del database per non perdere i reminder
3. **Monitoraggio:** Imposta alert per essere notificato se il cron job fallisce
4. **Testing:** Testa il sistema in ambiente di staging prima di andare in produzione
5. **Email Templates:** Personalizza i template email secondo le tue esigenze
