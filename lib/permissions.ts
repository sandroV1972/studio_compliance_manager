/**
 * Sistema di permessi per Studio Compliance Manager
 *
 * Gerarchia ruoli:
 * - SUPER_ADMIN: Accesso completo sistema, gestisce template GLOBAL
 * - ADMIN/OWNER: Admin organizzazione, gestisce template ORG e utenti
 * - MANAGER: Manager struttura, gestisce scadenze ma non template
 * - OPERATOR: Operatore, carica documenti e visualizza
 */

import { OrgUserRole } from "@prisma/client";

export type UserWithOrgRole = {
  id: string;
  isSuperAdmin: boolean;
  organizationUser?: {
    role: OrgUserRole;
    structureId: string | null;
    organizationId: string;
  } | null;
};

/**
 * Verifica se l'utente è Super Admin
 */
export function isSuperAdmin(user: UserWithOrgRole): boolean {
  return user.isSuperAdmin === true;
}

/**
 * Verifica se l'utente è Admin dell'organizzazione
 */
export function isOrgAdmin(user: UserWithOrgRole): boolean {
  if (isSuperAdmin(user)) return true;
  return (
    user.organizationUser?.role === "ADMIN" ||
    user.organizationUser?.role === "OWNER" // Legacy support
  );
}

/**
 * Verifica se l'utente è Manager di una struttura
 */
export function isStructureManager(user: UserWithOrgRole): boolean {
  return user.organizationUser?.role === "MANAGER";
}

/**
 * Verifica se l'utente è Operatore
 */
export function isOperator(user: UserWithOrgRole): boolean {
  return user.organizationUser?.role === "OPERATOR";
}

/**
 * PERMESSI TEMPLATE
 */

/**
 * Può visualizzare i template (GLOBAL + ORG)
 */
export function canViewTemplates(user: UserWithOrgRole): boolean {
  if (isSuperAdmin(user)) return true;
  if (isOrgAdmin(user)) return true;
  if (isStructureManager(user)) return true;
  return false;
}

/**
 * Può gestire (creare/modificare/eliminare) template GLOBAL
 */
export function canManageGlobalTemplates(user: UserWithOrgRole): boolean {
  return isSuperAdmin(user);
}

/**
 * Può gestire (creare/modificare/eliminare) template ORG
 */
export function canManageOrgTemplates(user: UserWithOrgRole): boolean {
  if (isSuperAdmin(user)) return true;
  return isOrgAdmin(user);
}

/**
 * PERMESSI SCADENZE
 */

/**
 * Può creare scadenze (manuali o da template)
 */
export function canCreateDeadlines(user: UserWithOrgRole): boolean {
  if (isSuperAdmin(user)) return true;
  if (isOrgAdmin(user)) return true;
  if (isStructureManager(user)) return true;
  return false;
}

/**
 * Può modificare una specifica scadenza
 */
export function canEditDeadline(
  user: UserWithOrgRole,
  deadlineStructureId?: string | null,
): boolean {
  if (isSuperAdmin(user)) return true;
  if (isOrgAdmin(user)) return true;

  // Manager può modificare solo scadenze della propria struttura
  if (isStructureManager(user)) {
    return (
      deadlineStructureId != null &&
      user.organizationUser?.structureId === deadlineStructureId
    );
  }

  return false;
}

/**
 * Può eliminare una scadenza
 */
export function canDeleteDeadline(
  user: UserWithOrgRole,
  deadlineStructureId?: string | null,
): boolean {
  // Stesso permesso di modifica
  return canEditDeadline(user, deadlineStructureId);
}

/**
 * Può aggiornare lo stato di una scadenza (PENDING -> DONE)
 */
export function canUpdateDeadlineStatus(
  user: UserWithOrgRole,
  deadlineStructureId?: string | null,
): boolean {
  if (isSuperAdmin(user)) return true;
  if (isOrgAdmin(user)) return true;

  // Manager e Operator possono aggiornare stato nella propria struttura
  if (isStructureManager(user) || isOperator(user)) {
    return (
      deadlineStructureId != null &&
      user.organizationUser?.structureId === deadlineStructureId
    );
  }

  return false;
}

/**
 * PERMESSI DOCUMENTI
 */

/**
 * Può visualizzare documenti
 */
export function canViewDocuments(
  user: UserWithOrgRole,
  documentStructureId?: string | null,
): boolean {
  if (isSuperAdmin(user)) return true;
  if (isOrgAdmin(user)) return true;

  // Manager e Operator possono vedere documenti della propria struttura
  if (isStructureManager(user) || isOperator(user)) {
    if (!documentStructureId) return true; // Se non specificata struttura, può vedere
    return user.organizationUser?.structureId === documentStructureId;
  }

  return false;
}

/**
 * Può caricare documenti
 */
export function canUploadDocuments(
  user: UserWithOrgRole,
  targetStructureId?: string | null,
): boolean {
  if (isSuperAdmin(user)) return true;
  if (isOrgAdmin(user)) return true;

  // Manager e Operator possono caricare nella propria struttura
  if (isStructureManager(user) || isOperator(user)) {
    if (!targetStructureId) return false; // Deve specificare struttura
    return user.organizationUser?.structureId === targetStructureId;
  }

  return false;
}

/**
 * Può eliminare documenti
 */
export function canDeleteDocuments(
  user: UserWithOrgRole,
  documentStructureId?: string | null,
): boolean {
  if (isSuperAdmin(user)) return true;
  if (isOrgAdmin(user)) return true;

  // Manager può eliminare documenti della propria struttura
  if (isStructureManager(user)) {
    return (
      documentStructureId != null &&
      user.organizationUser?.structureId === documentStructureId
    );
  }

  // Operator NON può eliminare
  return false;
}

/**
 * PERMESSI ORGANIZZAZIONE
 */

/**
 * Può modificare i dati dell'organizzazione
 */
export function canManageOrganization(user: UserWithOrgRole): boolean {
  if (isSuperAdmin(user)) return true;
  return isOrgAdmin(user);
}

/**
 * PERMESSI UTENTI
 */

/**
 * Può gestire tutti gli utenti del sistema
 */
export function canManageAllUsers(user: UserWithOrgRole): boolean {
  return isSuperAdmin(user);
}

/**
 * Può gestire utenti dell'organizzazione
 */
export function canManageOrgUsers(user: UserWithOrgRole): boolean {
  if (isSuperAdmin(user)) return true;
  return isOrgAdmin(user);
}

/**
 * Può gestire utenti di una specifica struttura
 */
export function canManageStructureUsers(
  user: UserWithOrgRole,
  targetStructureId: string,
): boolean {
  if (isSuperAdmin(user)) return true;
  if (isOrgAdmin(user)) return true;

  // Manager può gestire utenti della propria struttura (limitato)
  if (isStructureManager(user)) {
    return user.organizationUser?.structureId === targetStructureId;
  }

  return false;
}

/**
 * PERMESSI STRUTTURE
 */

/**
 * Può creare strutture
 */
export function canCreateStructures(user: UserWithOrgRole): boolean {
  if (isSuperAdmin(user)) return true;
  return isOrgAdmin(user);
}

/**
 * Può modificare una struttura
 */
export function canEditStructure(
  user: UserWithOrgRole,
  structureId?: string,
): boolean {
  if (isSuperAdmin(user)) return true;
  if (isOrgAdmin(user)) return true;

  // Manager può modificare info base della propria struttura (limitato)
  if (isStructureManager(user) && structureId) {
    return user.organizationUser?.structureId === structureId;
  }

  return false;
}

/**
 * Può eliminare strutture
 */
export function canDeleteStructures(user: UserWithOrgRole): boolean {
  if (isSuperAdmin(user)) return true;
  return isOrgAdmin(user);
}

/**
 * PERMESSI REPORT
 */

/**
 * Può visualizzare report dell'organizzazione
 */
export function canViewOrgReports(user: UserWithOrgRole): boolean {
  if (isSuperAdmin(user)) return true;
  return isOrgAdmin(user);
}

/**
 * Può visualizzare report di una struttura
 */
export function canViewStructureReports(
  user: UserWithOrgRole,
  structureId?: string,
): boolean {
  if (isSuperAdmin(user)) return true;
  if (isOrgAdmin(user)) return true;

  // Manager può vedere report della propria struttura
  if (isStructureManager(user) && structureId) {
    return user.organizationUser?.structureId === structureId;
  }

  return false;
}

/**
 * Helper: Ottiene il ruolo più alto dell'utente (per display)
 */
export function getUserRoleLabel(user: UserWithOrgRole): string {
  if (isSuperAdmin(user)) return "Super Admin";

  switch (user.organizationUser?.role) {
    case "OWNER":
    case "ADMIN":
      return "Amministratore";
    case "MANAGER":
      return "Responsabile Struttura";
    case "OPERATOR":
      return "Operatore";
    default:
      return "Utente";
  }
}

/**
 * Helper: Verifica se l'utente ha accesso a una specifica organizzazione
 */
export function hasAccessToOrganization(
  user: UserWithOrgRole,
  organizationId: string,
): boolean {
  if (isSuperAdmin(user)) return true;
  return user.organizationUser?.organizationId === organizationId;
}

/**
 * Helper: Verifica se l'utente ha accesso a una specifica struttura
 */
export function hasAccessToStructure(
  user: UserWithOrgRole,
  structureId: string,
): boolean {
  if (isSuperAdmin(user)) return true;
  if (isOrgAdmin(user)) return true;

  // Manager/Operator hanno accesso solo alla propria struttura
  return user.organizationUser?.structureId === structureId;
}
