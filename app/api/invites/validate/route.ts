import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/invites/validate?token=xxx
 * Valida un token di invito
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { error: "Token mancante", valid: false },
        { status: 400 },
      );
    }

    // Trova l'invito
    const invite = await prisma.inviteToken.findUnique({
      where: { token },
      include: {
        organization: {
          select: {
            name: true,
          },
        },
        structure: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!invite) {
      return NextResponse.json({
        valid: false,
        error: "Token non valido",
      });
    }

    // Verifica se è già stato usato
    if (invite.usedAt) {
      return NextResponse.json({
        valid: false,
        error: "Questo invito è già stato utilizzato",
      });
    }

    // Verifica se è scaduto
    if (new Date() > invite.expiresAt) {
      return NextResponse.json({
        valid: false,
        error: "Questo invito è scaduto",
      });
    }

    // Invito valido
    return NextResponse.json({
      valid: true,
      invite: {
        email: invite.email,
        organizationName: invite.organization.name,
        role: invite.role,
        structureName: invite.structure?.name,
      },
    });
  } catch (error) {
    console.error("Errore validazione token:", error);
    return NextResponse.json(
      { error: "Errore nella validazione del token", valid: false },
      { status: 500 },
    );
  }
}
