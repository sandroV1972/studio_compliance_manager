import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCurrentUserWithRole } from "@/lib/auth-utils";
import { canManageOrgUsers } from "@/lib/permissions";
import { createApiLogger } from "@/lib/logger";

/**
 * GET /api/organizations/[id]/users
 * Ottiene la lista degli utenti dell'organizzazione
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
    }

    const { id: organizationId } = await params;

    const logger = createApiLogger(
      "GET",
      `/api/organizations/${organizationId}/users`,
      session.user.id,
      organizationId,
    );

    // Verifica che l'utente appartenga all'organizzazione
    const userWithRole = await getCurrentUserWithRole();
    if (
      !userWithRole ||
      userWithRole.organizationUser?.organizationId !== organizationId
    ) {
      return NextResponse.json(
        { error: "Non hai accesso a questa organizzazione" },
        { status: 403 },
      );
    }

    logger.info({ msg: "Fetching organization users" });

    // Ottieni tutti gli utenti dell'organizzazione
    const organizationUsers = await prisma.organizationUser.findMany({
      where: {
        organizationId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        structure: {
          select: {
            id: true,
            name: true,
            city: true,
          },
        },
      },
      orderBy: [
        {
          role: "asc", // OWNER prima, poi ADMIN, MANAGER, OPERATOR
        },
        {
          user: {
            name: "asc",
          },
        },
      ],
    });

    logger.info({
      msg: "Organization users retrieved successfully",
      userCount: organizationUsers.length,
    });

    return NextResponse.json({
      users: organizationUsers,
    });
  } catch (error) {
    const logger = createApiLogger("GET", "/api/organizations/[id]/users");
    logger.error({
      msg: "Error fetching organization users",
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      { error: "Errore nel recupero degli utenti" },
      { status: 500 },
    );
  }
}
