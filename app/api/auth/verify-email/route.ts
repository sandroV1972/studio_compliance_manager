import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { error: "Token mancante" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findFirst({
      where: {
        emailVerificationToken: token,
        emailVerificationExpires: {
          gt: new Date(),
        },
      } as any,
    });

    if (!user) {
      return NextResponse.json(
        { error: "Token non valido o scaduto" },
        { status: 400 }
      );
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: new Date(),
        accountStatus: "PENDING_APPROVAL",
        emailVerificationToken: null,
        emailVerificationExpires: null,
      } as any,
    });

    return NextResponse.json({
      message: "Email verificata con successo! Il tuo account è in attesa di approvazione da parte dell'amministratore.",
      success: true,
    });
  } catch (error) {
    console.error("Email verification error:", error);
    return NextResponse.json(
      { error: "Errore durante la verifica dell'email" },
      { status: 500 }
    );
  }
}
