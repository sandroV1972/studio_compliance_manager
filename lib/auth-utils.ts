/**
 * Utility functions for authentication and authorization
 */

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UserWithOrgRole } from "@/lib/permissions";

/**
 * Get current user with organization role information
 * Used for permission checks
 */
export async function getCurrentUserWithRole(): Promise<UserWithOrgRole | null> {
  const session = await auth();
  if (!session?.user?.id) return null;

  // Get user with organization role
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      isSuperAdmin: true,
      organizationUsers: {
        select: {
          role: true,
          structureId: true,
          organizationId: true,
        },
        take: 1, // Un utente ha una sola organizzazione
      },
    },
  });

  if (!user) return null;

  return {
    id: user.id,
    isSuperAdmin: user.isSuperAdmin,
    organizationUser: user.organizationUsers[0] || null,
  };
}

/**
 * Get user's organization ID
 */
export async function getUserOrganizationId(): Promise<string | null> {
  const user = await getCurrentUserWithRole();
  return user?.organizationUser?.organizationId || null;
}

/**
 * Get user's structure ID (for MANAGER/OPERATOR)
 */
export async function getUserStructureId(): Promise<string | null> {
  const user = await getCurrentUserWithRole();
  return user?.organizationUser?.structureId || null;
}
