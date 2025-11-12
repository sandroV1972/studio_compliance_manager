import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCurrentUserWithRole } from "@/lib/auth-utils";
import { canManageOrgUsers } from "@/lib/permissions";
import { sendInviteEmail } from "@/lib/email";
import { z } from "zod";

const inviteSchema = z.object({
  email: z.string().email("Email non valida"),
  role: z.enum(["ADMIN", "MANAGER", "OPERATOR"], {
    errorMap: () => ({ message: "Ruolo non valido" }),
  }),
  structureId: z.string().optional(),
});

/**
 * POST /api/invites
 * Crea un nuovo invito per un utente
 */
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
    }

    // Verifica permessi: solo ADMIN/OWNER possono invitare
    const userWithRole = await getCurrentUserWithRole();
    if (!userWithRole || !canManageOrgUsers(userWithRole)) {
      return NextResponse.json(
        { error: "Non hai i permessi per invitare utenti" },
        { status: 403 },
      );
    }

    const organizationId = userWithRole.organizationUser?.organizationId;
    if (!organizationId) {
      return NextResponse.json(
        { error: "Devi prima creare un'organizzazione" },
        { status: 400 },
      );
    }

    // Valida input
    const body = await request.json();
    const validation = inviteSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Dati non validi",
          details: validation.error.format(),
        },
        { status: 400 },
      );
    }

    const { email, role, structureId } = validation.data;

    // Verifica che structureId sia fornita per MANAGER/OPERATOR
    if ((role === "MANAGER" || role === "OPERATOR") && !structureId) {
      return NextResponse.json(
        { error: "La struttura è obbligatoria per i ruoli MANAGER e OPERATOR" },
        { status: 400 },
      );
    }

    // Verifica che la struttura appartenga all'organizzazione
    if (structureId) {
      const structure = await prisma.structure.findFirst({
        where: {
          id: structureId,
          organizationId,
        },
      });

      if (!structure) {
        return NextResponse.json(
          {
            error: "Struttura non trovata o non appartiene all'organizzazione",
          },
          { status: 404 },
        );
      }
    }

    // Verifica se l'utente esiste già
    const existingUser = await prisma.user.findUnique({
      where: { email },
      include: {
        organizationUsers: true,
      },
    });

    if (existingUser) {
      // Se l'utente esiste ed è già nella stessa organizzazione
      if (
        existingUser.organizationUsers.some(
          (ou) => ou.organizationId === organizationId,
        )
      ) {
        return NextResponse.json(
          { error: "Questo utente è già parte della tua organizzazione" },
          { status: 409 },
        );
      }

      // Se l'utente è in un'altra organizzazione
      if (existingUser.organizationUsers.length > 0) {
        return NextResponse.json(
          { error: "Questo utente fa già parte di un'altra organizzazione" },
          { status: 409 },
        );
      }
    }

    // Verifica se c'è già un invito pending per questa email
    const existingInvite = await prisma.inviteToken.findFirst({
      where: {
        email,
        organizationId,
        usedAt: null,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    if (existingInvite) {
      return NextResponse.json(
        { error: "C'è già un invito pendente per questa email" },
        { status: 409 },
      );
    }

    // Crea l'invito
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // Scade dopo 7 giorni

    const invite = await prisma.inviteToken.create({
      data: {
        email,
        organizationId,
        role,
        structureId: structureId || null,
        invitedBy: session.user.id,
        expiresAt,
      },
      include: {
        organization: true,
        structure: true,
        inviter: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    // Invia email di invito
    const inviteUrl = `${process.env.NEXTAUTH_URL}/auth/register?invite=${invite.token}`;

    await sendInviteEmail({
      to: email,
      organizationName: invite.organization.name,
      inviterName: invite.inviter.name || invite.inviter.email,
      inviteUrl,
      role,
      structureName: invite.structure?.name,
    });

    return NextResponse.json({
      message: "Invito creato e inviato con successo",
      invite: {
        id: invite.id,
        email: invite.email,
        role: invite.role,
        expiresAt: invite.expiresAt,
      },
    });
  } catch (error) {
    console.error("Errore creazione invito:", error);
    return NextResponse.json(
      { error: "Errore nella creazione dell'invito" },
      { status: 500 },
    );
  }
}

/**
 * GET /api/invites
 * Ottiene lista inviti dell'organizzazione
 */
export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
    }

    // Verifica permessi
    const userWithRole = await getCurrentUserWithRole();
    if (!userWithRole || !canManageOrgUsers(userWithRole)) {
      return NextResponse.json(
        { error: "Non hai i permessi per visualizzare gli inviti" },
        { status: 403 },
      );
    }

    const organizationId = userWithRole.organizationUser?.organizationId;
    if (!organizationId) {
      return NextResponse.json(
        { error: "Organizzazione non trovata" },
        { status: 404 },
      );
    }

    // Ottieni inviti pendenti (non usati e non scaduti)
    const invites = await prisma.inviteToken.findMany({
      where: {
        organizationId,
        usedAt: null,
        expiresAt: {
          gt: new Date(),
        },
      },
      include: {
        structure: {
          select: {
            id: true,
            name: true,
          },
        },
        inviter: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ invites });
  } catch (error) {
    console.error("Errore recupero inviti:", error);
    return NextResponse.json(
      { error: "Errore nel recupero degli inviti" },
      { status: 500 },
    );
  }
}
