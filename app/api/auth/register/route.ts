import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendVerificationEmail } from "@/lib/email";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import {
  checkRateLimit,
  RateLimitConfigs,
  getIdentifier,
  getRateLimitErrorMessage,
} from "@/lib/rate-limit";
import { registerSchema } from "@/lib/validation/auth";
import { validateRequest } from "@/lib/validation/validate";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validazione con Zod
    const validation = validateRequest(registerSchema, body);
    if (!validation.success) {
      return validation.error;
    }

    const { email, password, name } = validation.data;

    // Applica rate limiting
    const identifier = getIdentifier(request, email);
    const rateLimit = checkRateLimit(identifier, RateLimitConfigs.register);

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

    // Email già normalizzata da Zod (toLowerCase)
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email già registrata" },
        { status: 400 },
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const user = await prisma.user.create({
      data: {
        email, // già normalizzata da Zod
        password: hashedPassword,
        name,
        accountStatus: "PENDING_VERIFICATION",
        emailVerificationToken: verificationToken,
        emailVerificationExpires: verificationExpires,
      } as any,
    });

    const verificationUrl = `${process.env.NEXTAUTH_URL}/auth/verify-email?token=${verificationToken}`;

    // Invia email di verifica
    try {
      await sendVerificationEmail(
        user.email,
        user.name || "Utente",
        verificationUrl,
      );
      console.log("✅ Email di verifica inviata a:", user.email);
    } catch (emailError) {
      console.error("❌ Errore invio email:", emailError);
      // Non blocchiamo la registrazione se l'email fallisce
      // L'utente potrà comunque richiedere un nuovo invio
    }

    return NextResponse.json(
      {
        message:
          "Registrazione completata! Controlla la tua email per verificare l'account.",
        userId: user.id,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Errore durante la registrazione" },
      { status: 500 },
    );
  }
}
