import { prisma } from "@/lib/prisma";
import { sendPasswordChangeConfirmationEmail } from "@/lib/email";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import {
  checkRateLimit,
  RateLimitConfigs,
  getIdentifier,
  getRateLimitErrorMessage,
} from "@/lib/rate-limit";
import { resetPasswordSchema } from "@/lib/validation/auth";
import { validateRequest } from "@/lib/validation/validate";

// GET - Verifica la validità del token
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { error: "Token richiesto", valid: false },
        { status: 400 },
      );
    }

    // Cerca il token nel database
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
    });

    if (!resetToken) {
      return NextResponse.json({
        valid: false,
        error: "Token non valido o scaduto",
      });
    }

    // Verifica se il token è già stato usato
    if (resetToken.used) {
      return NextResponse.json({
        valid: false,
        error: "Questo link è già stato utilizzato",
      });
    }

    // Verifica se il token è scaduto
    if (new Date() > resetToken.expires) {
      return NextResponse.json({
        valid: false,
        error: "Questo link è scaduto. Richiedi un nuovo reset password",
      });
    }

    return NextResponse.json({
      valid: true,
    });
  } catch (error) {
    console.error("Errore durante la verifica del token:", error);
    return NextResponse.json(
      { error: "Errore durante la verifica", valid: false },
      { status: 500 },
    );
  }
}

// POST - Reset della password
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validazione con Zod
    const validation = validateRequest(resetPasswordSchema, body);
    if (!validation.success || !validation.data) {
      return validation.error;
    }

    const { token, password } = validation.data;

    // Applica rate limiting basato sul token
    const identifier = getIdentifier(request, token);
    const rateLimit = checkRateLimit(
      identifier,
      RateLimitConfigs.resetPassword,
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

    // Cerca il token nel database
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
    });

    if (!resetToken) {
      return NextResponse.json(
        { error: "Token non valido o scaduto" },
        { status: 400 },
      );
    }

    // Verifica se il token è già stato usato
    if (resetToken.used) {
      return NextResponse.json(
        { error: "Questo link è già stato utilizzato" },
        { status: 400 },
      );
    }

    // Verifica se il token è scaduto
    if (new Date() > resetToken.expires) {
      return NextResponse.json(
        { error: "Questo link è scaduto. Richiedi un nuovo reset password" },
        { status: 400 },
      );
    }

    // Ottieni l'utente
    const user = await prisma.user.findUnique({
      where: { id: resetToken.userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Utente non trovato" },
        { status: 404 },
      );
    }

    // Hash della nuova password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Aggiorna la password dell'utente e marca il token come usato
    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword },
      }),
      prisma.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { used: true },
      }),
      // Invalida tutti gli altri token non usati per questo utente
      prisma.passwordResetToken.updateMany({
        where: {
          userId: user.id,
          used: false,
          id: { not: resetToken.id },
        },
        data: { used: true },
      }),
    ]);

    // Invia email di conferma
    await sendPasswordChangeConfirmationEmail(
      user.email,
      user.name || "Utente",
    );

    console.log(`✅ Password reimpostata con successo per: ${user.email}`);

    return NextResponse.json({
      message: "Password aggiornata con successo",
    });
  } catch (error) {
    console.error("Errore durante il reset della password:", error);
    return NextResponse.json(
      { error: "Errore durante il reset della password" },
      { status: 500 },
    );
  }
}
