#!/bin/bash

# Script per testare la configurazione email
# Uso: ./test-email-config.sh email@destinatario.it

set -e

if [ -z "$1" ]; then
  echo "❌ Errore: Specifica un indirizzo email di destinazione"
  echo "Uso: $0 email@destinatario.it"
  exit 1
fi

TO_EMAIL=$1

echo "📧 Test Configurazione Email"
echo "============================"
echo ""

# Carica variabili d'ambiente
if [ -f .env ]; then
  echo "✅ File .env trovato"
  source .env
else
  echo "❌ File .env non trovato!"
  exit 1
fi

# Verifica variabili email
echo ""
echo "📋 Configurazione Rilevata:"
echo "  EMAIL_HOST: ${EMAIL_HOST:-non configurato}"
echo "  EMAIL_PORT: ${EMAIL_PORT:-non configurato}"
echo "  EMAIL_USER: ${EMAIL_USER:-non configurato}"
echo "  EMAIL_FROM: ${EMAIL_FROM:-non configurato}"
echo ""

if [ -z "$EMAIL_HOST" ] || [ -z "$EMAIL_PORT" ] || [ -z "$EMAIL_USER" ] || [ -z "$EMAIL_PASSWORD" ]; then
  echo "❌ Configurazione email incompleta nel file .env"
  echo ""
  echo "Assicurati di configurare:"
  echo "  - EMAIL_HOST"
  echo "  - EMAIL_PORT"
  echo "  - EMAIL_USER"
  echo "  - EMAIL_PASSWORD"
  echo "  - EMAIL_FROM"
  exit 1
fi

echo "🔍 Test connessione SMTP..."

# Test con Node.js
docker-compose -f docker-compose.prod.yml exec -T app node << 'EOF'
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT),
  secure: process.env.EMAIL_PORT === '465',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

console.log('\n🔌 Verifica connessione SMTP...');

transporter.verify()
  .then(() => {
    console.log('✅ Connessione SMTP riuscita!');
    console.log('');
    
    // Invia email di test
    const toEmail = process.argv[1];
    console.log(`📤 Invio email di test a: ${toEmail}`);
    
    return transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: toEmail,
      subject: '🧪 Test Email - Studio Compliance Manager',
      text: `Questa è una email di test dal sistema Studio Compliance Manager.

Se ricevi questa email, la configurazione email è corretta! ✅

Dettagli configurazione:
- Provider: ${process.env.EMAIL_HOST}
- Porta: ${process.env.EMAIL_PORT}
- From: ${process.env.EMAIL_FROM}
- Data: ${new Date().toLocaleString('it-IT')}

---
Studio Compliance Manager
Sistema di gestione adempimenti
`,
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #10b981; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
    .success-box { background: #d1fae5; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0; border-radius: 4px; }
    .info { background: white; padding: 15px; border-radius: 4px; margin: 20px 0; }
    .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🧪 Test Email Riuscito!</h1>
    </div>
    <div class="content">
      <div class="success-box">
        <strong>✅ Configurazione email corretta!</strong><br>
        Se ricevi questa email, il sistema è configurato correttamente e può inviare email.
      </div>
      
      <h3>📋 Dettagli Configurazione</h3>
      <div class="info">
        <p style="margin: 5px 0;"><strong>Provider:</strong> ${process.env.EMAIL_HOST}</p>
        <p style="margin: 5px 0;"><strong>Porta:</strong> ${process.env.EMAIL_PORT}</p>
        <p style="margin: 5px 0;"><strong>From:</strong> ${process.env.EMAIL_FROM}</p>
        <p style="margin: 5px 0;"><strong>Data test:</strong> ${new Date().toLocaleString('it-IT')}</p>
      </div>

      <p>Il sistema è pronto per inviare:</p>
      <ul>
        <li>✉️ Email di verifica account</li>
        <li>✅ Email di approvazione</li>
        <li>🔐 Email reset password</li>
        <li>⏰ Promemoria scadenze</li>
        <li>👥 Inviti organizzazione</li>
      </ul>

      <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
        Questo è un messaggio automatico di test dal sistema <strong>Studio Compliance Manager</strong>.
      </p>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} Studio Compliance Manager</p>
    </div>
  </div>
</body>
</html>
`
    });
  })
  .then((info) => {
    console.log('✅ Email di test inviata con successo!');
    console.log('');
    console.log('📬 Message ID:', info.messageId);
    console.log('');
    console.log('🎉 Configurazione completata!');
    console.log('');
    console.log('⚠️  Controlla la inbox di:', process.argv[1]);
    console.log('    (controlla anche spam/junk se non la trovi)');
    console.log('');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Errore:', error.message);
    console.error('');
    
    if (error.code === 'EAUTH') {
      console.error('🔐 Errore di autenticazione SMTP');
      console.error('   Verifica EMAIL_USER e EMAIL_PASSWORD nel file .env');
      console.error('');
      console.error('   Per AWS SES:');
      console.error('   - Usa le credenziali SMTP (non le IAM keys)');
      console.error('   - Verifica che il dominio sia verificato');
      console.error('   - Controlla di essere uscito dalla sandbox mode');
    } else if (error.code === 'ECONNECTION') {
      console.error('🌐 Errore di connessione');
      console.error('   Verifica EMAIL_HOST e EMAIL_PORT nel file .env');
      console.error('   Controlla che il server email sia raggiungibile');
    } else if (error.code === 'ETIMEDOUT') {
      console.error('⏱️  Timeout connessione');
      console.error('   Il server email non risponde');
      console.error('   Verifica firewall e connectivity');
    }
    
    console.error('');
    process.exit(1);
  });
EOF

if [ $? -eq 0 ]; then
  echo ""
  echo "============================================"
  echo "✅ TEST COMPLETATO CON SUCCESSO!"
  echo "============================================"
  echo ""
  echo "Il sistema può ora inviare email in produzione."
  echo ""
else
  echo ""
  echo "============================================"
  echo "❌ TEST FALLITO"
  echo "============================================"
  echo ""
  echo "Controlla la configurazione nel file .env"
  echo "Consulta PRODUCTION_SETUP.md per maggiori dettagli"
  echo ""
  exit 1
fi
