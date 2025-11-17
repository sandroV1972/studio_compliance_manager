#!/usr/bin/env node

/**
 * Script di test per verificare l'invio email via SMTP
 * Usage: node scripts/test-email.js <destination-email>
 */

const nodemailer = require("nodemailer");

// Leggi l'email di destinazione dai parametri
const destinationEmail = process.argv[2];

if (!destinationEmail) {
  console.error("❌ Errore: specifica un'email di destinazione");
  console.log("Usage: node scripts/test-email.js <email>");
  process.exit(1);
}

// Verifica che le variabili d'ambiente siano configurate
const requiredEnvVars = ["SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASSWORD", "EMAIL_FROM"];
const missingVars = requiredEnvVars.filter((varName) => !process.env[varName]);

if (missingVars.length > 0) {
  console.error("❌ Variabili d'ambiente mancanti:", missingVars.join(", "));
  process.exit(1);
}

console.log("📧 Test invio email tramite SMTP\n");
console.log("Configurazione:");
console.log("  SMTP_HOST:", process.env.SMTP_HOST);
console.log("  SMTP_PORT:", process.env.SMTP_PORT);
console.log("  SMTP_USER:", process.env.SMTP_USER);
console.log("  EMAIL_FROM:", process.env.EMAIL_FROM);
console.log("  Destinatario:", destinationEmail);
console.log("\n" + "=".repeat(50) + "\n");

// Crea il transporter (stessa configurazione di lib/email.ts)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
  ignoreTLS: false,
});

async function testEmail() {
  try {
    // Step 1: Verifica connessione SMTP
    console.log("🔍 Step 1: Verifica connessione SMTP...");
    await transporter.verify();
    console.log("✅ Connessione SMTP verificata\n");

    // Step 2: Invia email di test
    console.log("📨 Step 2: Invio email di test...");
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: destinationEmail,
      subject: "🧪 Test Email - Studio Compliance Manager",
      text: `Questa è un'email di test inviata dallo script test-email.js

Se hai ricevuto questa email, significa che la configurazione SMTP è corretta!

Configurazione utilizzata:
- SMTP Host: ${process.env.SMTP_HOST}
- SMTP Port: ${process.env.SMTP_PORT}
- From: ${process.env.EMAIL_FROM}

Timestamp: ${new Date().toISOString()}`,
      html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px;
      text-align: center;
      border-radius: 10px 10px 0 0;
    }
    .content {
      background: #f7fafc;
      padding: 30px;
      border-radius: 0 0 10px 10px;
    }
    .success {
      background: #d4edda;
      border: 1px solid #c3e6cb;
      color: #155724;
      padding: 15px;
      border-radius: 5px;
      margin: 20px 0;
    }
    .info {
      background: #e7f3ff;
      border: 1px solid #b3d9ff;
      padding: 15px;
      border-radius: 5px;
      margin: 20px 0;
    }
    .config {
      font-family: monospace;
      font-size: 12px;
      color: #666;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>🧪 Test Email</h1>
    <p>Studio Compliance Manager</p>
  </div>
  <div class="content">
    <div class="success">
      <strong>✅ Successo!</strong><br>
      Se hai ricevuto questa email, significa che la configurazione SMTP è corretta!
    </div>

    <p>Questa è un'email di test inviata dallo script <code>test-email.js</code></p>

    <div class="info">
      <strong>Configurazione utilizzata:</strong>
      <div class="config">
        <p>SMTP Host: ${process.env.SMTP_HOST}</p>
        <p>SMTP Port: ${process.env.SMTP_PORT}</p>
        <p>From: ${process.env.EMAIL_FROM}</p>
        <p>Timestamp: ${new Date().toISOString()}</p>
      </div>
    </div>

    <p style="color: #666; font-size: 12px; margin-top: 30px; border-top: 1px solid #ddd; padding-top: 15px;">
      Questa è un'email automatica di test. Non è necessario rispondere.
    </p>
  </div>
</body>
</html>`,
    });

    console.log("✅ Email inviata con successo!\n");
    console.log("Dettagli invio:");
    console.log("  Message ID:", info.messageId);
    console.log("  Response:", info.response);
    console.log("\n✨ Test completato! Controlla la casella email:", destinationEmail);
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Errore durante il test email:");
    console.error("  Tipo:", error.name);
    console.error("  Messaggio:", error.message);
    if (error.code) {
      console.error("  Codice:", error.code);
    }
    if (error.response) {
      console.error("  Response:", error.response);
    }
    console.error("\nStack trace completo:");
    console.error(error);
    process.exit(1);
  }
}

// Esegui il test
testEmail();