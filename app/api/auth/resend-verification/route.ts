import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendVerificationEmail } from "@/lib/email";
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

    const verificationUrl = `${process.env.NEXTAUTH_URL}/auth/verify-email?token=${verificationToken}`;

    // Invia email di verifica
    try {
      await sendVerificationEmail(
        email,
        user.name || "Utente",
        verificationUrl,
      );
      console.log("✅ Email di verifica reinviata a:", email);
    } catch (emailError) {
      console.error("❌ Errore invio email:", emailError);
      return NextResponse.json(
        { error: "Errore durante l'invio dell'email" },
        { status: 500 },
      );
    }

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
