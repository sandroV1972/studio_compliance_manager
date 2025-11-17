import { NextRequest, NextResponse } from "next/server";
import { emailTransporter } from "@/lib/email";

/**
 * API endpoint per testare l'invio email
 * GET /api/test-email?to=email@example.com
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const destinationEmail = searchParams.get("to");

    if (!destinationEmail) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Parametro 'to' mancante. Usa: /api/test-email?to=email@example.com",
        },
        { status: 400 },
      );
    }

    // Verifica configurazione SMTP
    const config = {
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      user: process.env.SMTP_USER,
      from: process.env.EMAIL_FROM,
    };

    console.log("📧 Test invio email tramite SMTP");
    console.log("Configurazione:", config);
    console.log("Destinatario:", destinationEmail);

    // Step 1: Verifica connessione SMTP
    console.log("🔍 Verifica connessione SMTP...");
    await emailTransporter.verify();
    console.log("✅ Connessione SMTP verificata");

    // Step 2: Invia email di test
    console.log("📨 Invio email di test...");
    const info = await emailTransporter.sendMail({
      from: process.env.EMAIL_FROM || "noreply@studiocompliance.local",
      to: destinationEmail,
      subject: "🧪 Test Email - Studio Compliance Manager",
      text: `Questa è un'email di test inviata dall'endpoint /api/test-email

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

    <p>Questa è un'email di test inviata dall'endpoint <code>/api/test-email</code></p>

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

    console.log("✅ Email inviata con successo!");
    console.log("Message ID:", info.messageId);
    console.log("Response:", info.response);

    return NextResponse.json({
      success: true,
      message: "Email di test inviata con successo",
      details: {
        messageId: info.messageId,
        response: info.response,
        destination: destinationEmail,
        configuration: config,
      },
    });
  } catch (error: any) {
    console.error("❌ Errore durante il test email:");
    console.error("Tipo:", error.name);
    console.error("Messaggio:", error.message);
    if (error.code) {
      console.error("Codice:", error.code);
    }
    if (error.response) {
      console.error("Response:", error.response);
    }

    return NextResponse.json(
      {
        success: false,
        error: error.message,
        errorType: error.name,
        errorCode: error.code,
        errorResponse: error.response,
      },
      { status: 500 },
    );
  }
}
