import nodemailer from "nodemailer";

// Configura il transporter per l'invio email
export const emailTransporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "localhost",
  port: parseInt(process.env.EMAIL_PORT || "1025"),
  secure: false, // true per 465, false per altri
  auth:
    process.env.EMAIL_USER && process.env.EMAIL_PASSWORD
      ? {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        }
      : undefined,
  // Per MailHog non serve autenticazione
  ignoreTLS: process.env.NODE_ENV === "development",
});

// Funzione helper per inviare email di verifica
export async function sendVerificationEmail(
  to: string,
  name: string,
  verificationUrl: string,
) {
  const emailHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; padding: 12px 30px; background: #2563eb; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🏥 Studio Compliance Manager</h1>
          </div>
          <div class="content">
            <h2>Ciao ${name}! 👋</h2>
            <p>Grazie per esserti registrato a <strong>Studio Compliance Manager</strong>.</p>
            <p>Per completare la registrazione e attivare il tuo account, clicca sul pulsante qui sotto:</p>
            <div style="text-align: center;">
              <a href="${verificationUrl}" class="button">Verifica il tuo indirizzo email</a>
            </div>
            <p>Oppure copia e incolla questo link nel tuo browser:</p>
            <p style="background: #e5e7eb; padding: 10px; border-radius: 4px; word-break: break-all;">
              ${verificationUrl}
            </p>
            <p><strong>⏰ Questo link è valido per 24 ore.</strong></p>
            <p>Se non hai richiesto questa registrazione, puoi ignorare questa email in tutta sicurezza.</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Studio Compliance Manager - Sistema di gestione adempimenti</p>
          </div>
        </div>
      </body>
    </html>
  `;

  const emailText = `
Ciao ${name}!

Grazie per esserti registrato a Studio Compliance Manager.

Per completare la registrazione e attivare il tuo account, clicca sul link qui sotto:
${verificationUrl}

Questo link è valido per 24 ore.

Se non hai richiesto questa registrazione, puoi ignorare questa email.

---
© ${new Date().getFullYear()} Studio Compliance Manager
  `;

  await emailTransporter.sendMail({
    from: process.env.EMAIL_FROM || "noreply@studiocompliance.local",
    to,
    subject: "✉️ Verifica il tuo indirizzo email - Studio Compliance Manager",
    text: emailText,
    html: emailHtml,
  });

  console.log(`📧 Email di verifica inviata a: ${to}`);
}

// Funzione helper per inviare email di approvazione account
export async function sendApprovalEmail(to: string, name: string) {
  const loginUrl = `${process.env.NEXTAUTH_URL}/auth/login`;

  const emailHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #10b981; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; padding: 12px 30px; background: #10b981; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Account Approvato!</h1>
          </div>
          <div class="content">
            <h2>Ciao ${name}! 🎉</h2>
            <p>Ottime notizie! Il tuo account è stato approvato dall'amministratore.</p>
            <p>Ora puoi accedere a <strong>Studio Compliance Manager</strong> e iniziare a gestire le scadenze del tuo studio.</p>
            <div style="text-align: center;">
              <a href="${loginUrl}" class="button">Accedi ora</a>
            </div>
            <p>Ti aspettiamo! 🏥</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Studio Compliance Manager - Sistema di gestione adempimenti</p>
          </div>
        </div>
      </body>
    </html>
  `;

  const emailText = `
Ciao ${name}!

Ottime notizie! Il tuo account è stato approvato dall'amministratore.

Ora puoi accedere a Studio Compliance Manager:
${loginUrl}

Ti aspettiamo!

---
© ${new Date().getFullYear()} Studio Compliance Manager
  `;

  await emailTransporter.sendMail({
    from: process.env.EMAIL_FROM || "noreply@studiocompliance.local",
    to,
    subject: "✅ Account Approvato - Studio Compliance Manager",
    text: emailText,
    html: emailHtml,
  });

  console.log(`📧 Email di approvazione inviata a: ${to}`);
}
