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
          .info-box { background: white; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0; border-radius: 4px; }
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

            <div class="info-box">
              <p style="margin: 5px 0;"><strong>📋 Prossimi passi:</strong></p>
              <ol style="margin: 10px 0; padding-left: 20px;">
                <li>Accedi al sistema con le tue credenziali</li>
                <li>Crea la tua organizzazione (studio medico/sanitario)</li>
                <li>Configura le strutture e inizia a gestire gli adempimenti</li>
              </ol>
            </div>

            <p>Al primo accesso ti verrà chiesto di creare la tua organizzazione. Sarai automaticamente l'<strong>Amministratore</strong> della tua organizzazione e potrai invitare altri membri del team.</p>

            <div style="text-align: center;">
              <a href="${loginUrl}" class="button">Accedi e Inizia</a>
            </div>

            <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
              Studio Compliance Manager è un sistema di gestione adempimenti per studi medici e sanitari.
            </p>
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

PROSSIMI PASSI:
1. Accedi al sistema con le tue credenziali
2. Crea la tua organizzazione (studio medico/sanitario)
3. Configura le strutture e inizia a gestire gli adempimenti

Al primo accesso ti verrà chiesto di creare la tua organizzazione. Sarai automaticamente l'Amministratore della tua organizzazione e potrai invitare altri membri del team.

Accedi ora:
${loginUrl}

Studio Compliance Manager è un sistema di gestione adempimenti per studi medici e sanitari.

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

// Funzione helper per inviare email di reminder scadenza
export async function sendDeadlineReminderEmail(
  to: string,
  recipientName: string,
  deadlineTitle: string,
  dueDate: Date,
  daysBefore: number,
  customMessage?: string,
) {
  const formattedDate = dueDate.toLocaleDateString("it-IT", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const daysText = daysBefore === 1 ? "domani" : `tra ${daysBefore} giorni`;

  const emailHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #f59e0b; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .deadline-box { background: white; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px; }
          .deadline-title { font-size: 18px; font-weight: bold; color: #1f2937; margin-bottom: 10px; }
          .deadline-date { font-size: 16px; color: #f59e0b; font-weight: bold; }
          .alert-icon { font-size: 48px; text-align: center; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⏰ Promemoria Scadenza</h1>
          </div>
          <div class="content">
            <h2>Ciao ${recipientName}! 👋</h2>
            <p>Ti ricordiamo che hai una scadenza in arrivo.</p>

            <div class="deadline-box">
              <div class="deadline-title">📋 ${deadlineTitle}</div>
              <div class="deadline-date">📅 Scadenza: ${formattedDate}</div>
              <p style="margin-top: 10px; color: #6b7280;">
                ⚠️ La scadenza è prevista ${daysText}
              </p>
            </div>

            ${customMessage ? `<p style="background: #fef3c7; padding: 15px; border-radius: 4px; border-left: 4px solid #f59e0b;"><strong>Nota:</strong> ${customMessage}</p>` : ""}

            <p>Assicurati di completare tutte le attività necessarie entro la data prevista.</p>

            <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
              Accedi a <strong>Studio Compliance Manager</strong> per gestire le tue scadenze.
            </p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Studio Compliance Manager - Sistema di gestione adempimenti</p>
          </div>
        </div>
      </body>
    </html>
  `;

  const emailText = `
Ciao ${recipientName}!

Ti ricordiamo che hai una scadenza in arrivo.

📋 ${deadlineTitle}
📅 Scadenza: ${formattedDate}
⚠️ La scadenza è prevista ${daysText}

${customMessage ? `Nota: ${customMessage}` : ""}

Assicurati di completare tutte le attività necessarie entro la data prevista.

---
© ${new Date().getFullYear()} Studio Compliance Manager
  `;

  await emailTransporter.sendMail({
    from: process.env.EMAIL_FROM || "noreply@studiocompliance.local",
    to,
    subject: `⏰ Promemoria: ${deadlineTitle} - Scadenza ${daysText}`,
    text: emailText,
    html: emailHtml,
  });

  console.log(
    `📧 Email reminder inviata a: ${to} per scadenza: ${deadlineTitle}`,
  );
}

// Funzione helper per inviare email di reset password
export async function sendPasswordResetEmail(
  to: string,
  name: string,
  resetUrl: string,
) {
  const emailHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #dc2626; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; padding: 12px 30px; background: #dc2626; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .warning-box { background: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0; border-radius: 4px; }
          .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 Reset Password</h1>
          </div>
          <div class="content">
            <h2>Ciao ${name}! 👋</h2>
            <p>Hai richiesto di reimpostare la password per il tuo account su <strong>Studio Compliance Manager</strong>.</p>
            <p>Per creare una nuova password, clicca sul pulsante qui sotto:</p>
            <div style="text-align: center;">
              <a href="${resetUrl}" class="button">Reimposta Password</a>
            </div>
            <p>Oppure copia e incolla questo link nel tuo browser:</p>
            <p style="background: #e5e7eb; padding: 10px; border-radius: 4px; word-break: break-all;">
              ${resetUrl}
            </p>
            <p><strong>⏰ Questo link è valido per 1 ora.</strong></p>

            <div class="warning-box">
              <strong>⚠️ Importante:</strong> Se non hai richiesto tu questa operazione, ignora questa email.
              La tua password attuale rimarrà invariata fino a quando non creerai una nuova password utilizzando il link qui sopra.
            </div>

            <p style="color: #6b7280; font-size: 14px;">
              Per motivi di sicurezza, ti consigliamo di utilizzare una password complessa con almeno 8 caratteri,
              includendo lettere maiuscole, minuscole, numeri e simboli.
            </p>
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

Hai richiesto di reimpostare la password per il tuo account su Studio Compliance Manager.

Per creare una nuova password, clicca sul link qui sotto:
${resetUrl}

Questo link è valido per 1 ora.

⚠️ IMPORTANTE: Se non hai richiesto tu questa operazione, ignora questa email.
La tua password attuale rimarrà invariata.

Per motivi di sicurezza, ti consigliamo di utilizzare una password complessa.

---
© ${new Date().getFullYear()} Studio Compliance Manager
  `;

  await emailTransporter.sendMail({
    from: process.env.EMAIL_FROM || "noreply@studiocompliance.local",
    to,
    subject: "🔐 Reset Password - Studio Compliance Manager",
    text: emailText,
    html: emailHtml,
  });

  console.log(`📧 Email di reset password inviata a: ${to}`);
}

// Funzione helper per inviare conferma cambio password
export async function sendPasswordChangeConfirmationEmail(
  to: string,
  name: string,
) {
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
          .warning-box { background: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0; border-radius: 4px; }
          .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Password Aggiornata</h1>
          </div>
          <div class="content">
            <h2>Ciao ${name}! 👋</h2>
            <p>La tua password è stata modificata con successo.</p>
            <p>Ora puoi accedere al tuo account con la nuova password:</p>
            <div style="text-align: center;">
              <a href="${loginUrl}" class="button">Accedi ora</a>
            </div>

            <div class="warning-box">
              <strong>⚠️ Non sei stato tu?</strong><br>
              Se non hai effettuato tu questa modifica, contatta immediatamente l'amministratore del sistema.
              Qualcun altro potrebbe avere accesso al tuo account.
            </div>

            <p style="color: #6b7280; font-size: 14px;">
              Data e ora della modifica: ${new Date().toLocaleString("it-IT")}
            </p>
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

La tua password è stata modificata con successo.

Ora puoi accedere al tuo account con la nuova password:
${loginUrl}

⚠️ NON SEI STATO TU?
Se non hai effettuato tu questa modifica, contatta immediatamente l'amministratore del sistema.

Data e ora della modifica: ${new Date().toLocaleString("it-IT")}

---
© ${new Date().getFullYear()} Studio Compliance Manager
  `;

  await emailTransporter.sendMail({
    from: process.env.EMAIL_FROM || "noreply@studiocompliance.local",
    to,
    subject: "✅ Password Modificata - Studio Compliance Manager",
    text: emailText,
    html: emailHtml,
  });

  console.log(`📧 Email di conferma cambio password inviata a: ${to}`);
}

// Funzione helper per inviare email di invito
interface InviteEmailParams {
  to: string;
  organizationName: string;
  inviterName: string;
  inviteUrl: string;
  role: string;
  structureName?: string;
}

export async function sendInviteEmail({
  to,
  organizationName,
  inviterName,
  inviteUrl,
  role,
  structureName,
}: InviteEmailParams) {
  const roleLabel =
    role === "ADMIN"
      ? "Amministratore"
      : role === "MANAGER"
        ? "Responsabile"
        : "Operatore";

  const emailHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #7c3aed; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; padding: 12px 30px; background: #7c3aed; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .info-box { background: white; border-left: 4px solid #7c3aed; padding: 15px; margin: 20px 0; border-radius: 4px; }
          .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✉️ Invito a ${organizationName}</h1>
          </div>
          <div class="content">
            <h2>Ciao! 👋</h2>
            <p><strong>${inviterName}</strong> ti ha invitato a far parte di <strong>${organizationName}</strong> su Studio Compliance Manager.</p>

            <div class="info-box">
              <p style="margin: 5px 0;"><strong>🏢 Organizzazione:</strong> ${organizationName}</p>
              <p style="margin: 5px 0;"><strong>👤 Ruolo:</strong> ${roleLabel}</p>
              ${structureName ? `<p style="margin: 5px 0;"><strong>🏥 Struttura:</strong> ${structureName}</p>` : ""}
            </div>

            <p>Per accettare l'invito e creare il tuo account, clicca sul pulsante qui sotto:</p>
            <div style="text-align: center;">
              <a href="${inviteUrl}" class="button">Accetta Invito e Registrati</a>
            </div>

            <p>Oppure copia e incolla questo link nel tuo browser:</p>
            <p style="background: #e5e7eb; padding: 10px; border-radius: 4px; word-break: break-all;">
              ${inviteUrl}
            </p>

            <p><strong>⏰ Questo invito è valido per 7 giorni.</strong></p>

            <p style="color: #6b7280; font-size: 14px;">
              Studio Compliance Manager è un sistema di gestione adempimenti per studi medici e sanitari.
            </p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Studio Compliance Manager - Sistema di gestione adempimenti</p>
          </div>
        </div>
      </body>
    </html>
  `;

  const emailText = `
Ciao!

${inviterName} ti ha invitato a far parte di ${organizationName} su Studio Compliance Manager.

🏢 Organizzazione: ${organizationName}
👤 Ruolo: ${roleLabel}
${structureName ? `🏥 Struttura: ${structureName}` : ""}

Per accettare l'invito e creare il tuo account, clicca sul link qui sotto:
${inviteUrl}

⏰ Questo invito è valido per 7 giorni.

Studio Compliance Manager è un sistema di gestione adempimenti per studi medici e sanitari.

---
© ${new Date().getFullYear()} Studio Compliance Manager
  `;

  await emailTransporter.sendMail({
    from: process.env.EMAIL_FROM || "noreply@studiocompliance.local",
    to,
    subject: `✉️ Invito a ${organizationName} - Studio Compliance Manager`,
    text: emailText,
    html: emailHtml,
  });

  console.log(`📧 Email di invito inviata a: ${to} per ${organizationName}`);
}
