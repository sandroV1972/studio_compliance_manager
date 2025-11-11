import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendVerificationEmail } from "@/lib/email";
import { nanoid } from "nanoid";
import {
  checkRateLimit,
  RateLimitConfigs,
  getIdentifier,
  getRateLimitErrorMessage,
} from "@/lib/rate-limit";
import { loginSchema } from "@/lib/validation/auth";
import { validateRequest } from "@/lib/validation/validate";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validazione con Zod
    const validation = validateRequest(loginSchema, body);
    if (!validation.success) {
      return validation.error;
    }

    const { email } = validation.data;

    // Applica rate limiting
    const identifier = getIdentifier(request, email);
    const rateLimit = checkRateLimit(
      identifier,
      RateLimitConfigs.resendVerification,
    );

    if (!rateLimit.success) {
      return NextResponse.json(
        {
          error: getRateLimitErrorMessage(rateLimit.retryAfter!),
          retryAfter: rateLimit.retryAfter,
        },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": rateLimit.limit.toString(),
            "X-RateLimit-Remaining": rateLimit.remaining.toString(),
            "X-RateLimit-Reset": new Date(rateLimit.reset).toISOString(),
            "Retry-After": rateLimit.retryAfter!.toString(),
          },
        },
      );
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
