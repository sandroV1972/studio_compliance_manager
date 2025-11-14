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
    if (!validation.success || !validation.data) {
      return validation.error;
    }

    const { email, password, name } = validation.data;
    const { inviteToken } = body;

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

    // Registrazione con invito
    if (inviteToken) {
      const invite = await prisma.inviteToken.findUnique({
        where: { token: inviteToken },
        include: { organization: true, structure: true },
      });

      if (!invite) {
        return NextResponse.json(
          { error: "Invito non trovato" },
          { status: 404 },
        );
      }

      if (invite.usedAt) {
        return NextResponse.json(
          { error: "Questo invito è già stato utilizzato" },
          { status: 400 },
        );
      }

      if (new Date() > invite.expiresAt) {
        return NextResponse.json(
          { error: "Questo invito è scaduto" },
          { status: 400 },
        );
      }

      if (invite.email.toLowerCase() !== email.toLowerCase()) {
        return NextResponse.json(
          { error: "Questo invito è destinato a un altro indirizzo email" },
          { status: 400 },
        );
      }

      // Crea utente e associazione in una transazione
      const result = await prisma.$transaction(async (tx) => {
        // Crea l'utente con status APPROVED (nessuna verifica email necessaria)
        const user = await tx.user.create({
          data: {
            email,
            password: hashedPassword,
            name,
            accountStatus: "APPROVED",
            emailVerified: true,
            needsOnboarding: false,
          } as any,
        });

        // Crea l'associazione all'organizzazione
        await tx.organizationUser.create({
          data: {
            userId: user.id,
            organizationId: invite.organizationId,
            role: invite.role,
            structureId: invite.structureId,
          },
        });

        // Marca il token come usato
        await tx.inviteToken.update({
          where: { id: invite.id },
          data: {
            usedAt: new Date(),
            usedByUserId: user.id,
          },
        });

        return user;
      });

      console.log("=== USER REGISTERED VIA INVITE ===");
      console.log("User:", result.email);
      console.log("Organization:", invite.organization.name);
      console.log("Role:", invite.role);
      console.log("Structure:", invite.structure?.name || "N/A");
      console.log("===================================");

      return NextResponse.json(
        {
          message: `Benvenuto in ${invite.organization.name}! Il tuo account è stato creato con successo.`,
          userId: result.id,
        },
        { status: 201 },
      );
    }

    // Registrazione standard (senza invito)
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const user = await prisma.user.create({
      data: {
        email,
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
