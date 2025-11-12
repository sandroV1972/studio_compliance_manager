import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCurrentUserWithRole } from "@/lib/auth-utils";
import { canManageOrgUsers } from "@/lib/permissions";
import { withCSRFProtection } from "@/lib/csrf";
import { createApiLogger } from "@/lib/logger";

/**
 * DELETE /api/invites/[id]
 * Revoca un invito pendente
 */
export const DELETE = withCSRFProtection(
  async (
    _request: Request,
    { params }: { params: Promise<{ id: string }> },
  ) => {
    try {
      const session = await auth();
      if (!session?.user?.id) {
        return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
      }

      // Verifica permessi
      const userWithRole = await getCurrentUserWithRole();
      if (!userWithRole || !canManageOrgUsers(userWithRole)) {
        return NextResponse.json(
          { error: "Non hai i permessi per revocare inviti" },
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

      const { id } = await params;

      const logger = createApiLogger(
        "DELETE",
        `/api/invites/${id}`,
        session.user.id,
        organizationId,
      );

      // Trova l'invito
      const invite = await prisma.inviteToken.findUnique({
        where: { id },
      });

      if (!invite) {
        return NextResponse.json(
          { error: "Invito non trovato" },
          { status: 404 },
        );
      }

      // Verifica che l'invito appartenga all'organizzazione dell'utente
      if (invite.organizationId !== organizationId) {
        return NextResponse.json(
          { error: "Non puoi revocare inviti di altre organizzazioni" },
          { status: 403 },
        );
      }

      // Verifica che l'invito non sia già stato usato
      if (invite.usedAt) {
        return NextResponse.json(
          { error: "Questo invito è già stato utilizzato" },
          { status: 400 },
        );
      }

      // Elimina l'invito
      await prisma.inviteToken.delete({
        where: { id },
      });

      logger.info({
        msg: "Invite revoked successfully",
        inviteId: id,
        inviteEmail: invite.email,
      });

      return NextResponse.json({
        message: "Invito revocato con successo",
      });
    } catch (error) {
      const logger = createApiLogger("DELETE", "/api/invites/[id]");
      logger.error({
        msg: "Error revoking invite",
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      return NextResponse.json(
        { error: "Errore nella revoca dell'invito" },
        { status: 500 },
      );
    }
  },
);
