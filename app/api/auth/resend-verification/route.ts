import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { nanoid } from "nanoid";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email richiesta" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Utente non trovato" },
        { status: 404 },
      );
    }

    // Controlla se l'email è già verificata
    if (user.emailVerified) {
      return NextResponse.json(
        { message: "Email già verificata" },
        { status: 200 },
      );
    }

    // Genera nuovo token di verifica
    const verificationToken = nanoid(32);
    const verificationExpires = new Date();
    verificationExpires.setHours(verificationExpires.getHours() + 24); // Valido per 24 ore

    // Aggiorna il token nel database
    await prisma.user.update({
      where: { email },
      data: {
        emailVerificationToken: verificationToken,
        emailVerificationExpires: verificationExpires,
      },
    });

    // TODO: Invia email (per ora solo log)
    const verificationUrl = `${process.env.NEXTAUTH_URL}/auth/verify-email?token=${verificationToken}`;

    console.log("========================================");
    console.log("📧 EMAIL DI VERIFICA");
    console.log("========================================");
    console.log("A:", email);
    console.log("Oggetto: Verifica il tuo indirizzo email");
    console.log("Link:", verificationUrl);
    console.log("Token:", verificationToken);
    console.log("Scadenza:", verificationExpires.toLocaleString("it-IT"));
    console.log("========================================");

    // Quando implementerai nodemailer, usa questo:
    /*
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT || "587"),
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: "Verifica il tuo indirizzo email - Studio Compliance Manager",
      html: `
        <h2>Verifica il tuo indirizzo email</h2>
        <p>Ciao ${user.name},</p>
        <p>Clicca sul link qui sotto per verificare il tuo indirizzo email:</p>
        <a href="${verificationUrl}">${verificationUrl}</a>
        <p>Questo link è valido per 24 ore.</p>
        <p>Se non hai richiesto questa email, puoi ignorarla.</p>
      `,
    });
    */

    return NextResponse.json({
      message: "Email di verifica inviata con successo",
      // In dev mostra il link
      ...(process.env.NODE_ENV === "development" && { verificationUrl }),
    });
  } catch (error) {
    console.error("Resend verification error:", error);
    return NextResponse.json(
      { error: "Errore durante l'invio dell'email di verifica" },
      { status: 500 },
    );
  }
}
