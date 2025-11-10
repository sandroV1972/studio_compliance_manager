import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/email";
import { NextResponse } from "next/server";
import crypto from "crypto";
import {
  checkRateLimit,
  RateLimitConfigs,
  getIdentifier,
  getRateLimitErrorMessage,
} from "@/lib/rate-limit";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: "Email richiesta" }, { status: 400 });
    }

    // Applica rate limiting
    const identifier = getIdentifier(request, email);
    const rateLimit = checkRateLimit(
      identifier,
      RateLimitConfigs.forgotPassword,
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

    // Verifica se l'utente esiste
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    // Per motivi di sicurezza, restituisci sempre successo anche se l'email non esiste
    // Questo previene l'enumerazione degli account
    if (!user) {
      console.log(
        `⚠️ Tentativo di reset password per email non esistente: ${email}`,
      );
      return NextResponse.json({
        message:
          "Se l'email esiste nel sistema, riceverai le istruzioni per il reset della password.",
      });
    }

    // Verifica che l'utente abbia una password (non solo OAuth)
    if (!user.password) {
      console.log(`⚠️ Tentativo di reset password per account OAuth: ${email}`);
      return NextResponse.json({
        message:
          "Se l'email esiste nel sistema, riceverai le istruzioni per il reset della password.",
      });
    }

    // Genera un token sicuro
    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 ora

    // Invalida tutti i token precedenti non utilizzati per questo utente
    await prisma.passwordResetToken.updateMany({
      where: {
        userId: user.id,
        used: false,
      },
      data: {
        used: true,
      },
    });

    // Crea nuovo token
    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        token,
        expires,
        used: false,
      },
    });

    // Invia email con il link di reset
    const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${token}`;

    await sendPasswordResetEmail(user.email, user.name || "Utente", resetUrl);

    console.log(`✅ Token di reset password generato per: ${user.email}`);

    return NextResponse.json({
      message:
        "Se l'email esiste nel sistema, riceverai le istruzioni per il reset della password.",
    });
  } catch (error) {
    console.error("Errore durante la richiesta di reset password:", error);
    return NextResponse.json(
      { error: "Errore durante l'elaborazione della richiesta" },
      { status: 500 },
    );
  }
}
