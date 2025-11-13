/**
 * UserService
 * Gestisce utenti, ruoli, permessi
 */

import { PrismaClient, User } from "@prisma/client";
import { prisma as defaultPrisma } from "@/lib/prisma";
import * as bcrypt from "bcryptjs";
import {
  ValidationError,
  NotFoundError,
  ForbiddenError,
  BusinessLogicError,
} from "@/lib/errors/service-errors";
import {
  ApproveUserInput,
  RejectUserInput,
  UpdateUserInput,
  DeleteUserInput,
  UpdateUserProfileInput,
  GetUserOrganizationInput,
  GetUserPermissionsInput,
  UserWithOrganization,
  UserPermissions,
} from "@/lib/dto/user.dto";
import {
  canViewTemplates,
  canManageGlobalTemplates,
  canManageOrgTemplates,
  canCreateDeadlines,
  canManageOrganization,
  canManageOrgUsers,
  getUserRoleLabel,
} from "@/lib/permissions";
import { getCurrentUserWithRole } from "@/lib/auth-utils";
import { sendApprovalEmail } from "@/lib/email";

export class UserService {
  constructor(private readonly db: PrismaClient = defaultPrisma) {}

  /**
   * Ottiene lista di utenti in attesa di approvazione
   */
  async getPendingUsers(): Promise<
    Array<{
      id: string;
      email: string;
      name: string | null;
      emailVerified: Date | null;
      createdAt: Date;
    }>
  > {
    const users = await this.db.user.findMany({
      where: {
        accountStatus: "PENDING_APPROVAL",
      },
      select: {
        id: true,
        email: true,
        name: true,
        emailVerified: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return users;
  }

  /**
   * Approva un utente
   */
  async approveUser(input: ApproveUserInput): Promise<User> {
    const { userId, adminUserId } = input;

    // Verifica che l'utente esista
    const user = await this.db.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError("Utente non trovato", "USER");
    }

    // Verifica che l'utente sia in stato PENDING_APPROVAL
    if (user.accountStatus !== "PENDING_APPROVAL") {
      throw new BusinessLogicError(
        "L'utente non è in attesa di approvazione",
        "INVALID_STATUS",
      );
    }

    // Approva l'utente
    const approvedUser = await this.db.user.update({
      where: { id: userId },
      data: {
        accountStatus: "APPROVED",
        needsOnboarding: true,
      },
    });

    // Invia email di approvazione
    try {
      await sendApprovalEmail(approvedUser.email, approvedUser.name || "");
    } catch (emailError) {
      console.error("Errore invio email approvazione:", emailError);
      // Non bloccare l'operazione se l'email fallisce
    }

    // Audit log
    await this.createAuditLog(
      null, // No organizationId for user approval
      adminUserId,
      "APPROVE_USER",
      userId,
      { email: approvedUser.email, name: approvedUser.name },
    );

    return approvedUser;
  }

  /**
   * Rifiuta un utente
   */
  async rejectUser(input: RejectUserInput): Promise<User> {
    const { userId, adminUserId } = input;

    // Verifica che l'utente esista
    const user = await this.db.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError("Utente non trovato", "USER");
    }

    // Verifica che l'utente sia in stato PENDING_APPROVAL
    if (user.accountStatus !== "PENDING_APPROVAL") {
      throw new BusinessLogicError(
        "L'utente non è in attesa di approvazione",
        "INVALID_STATUS",
      );
    }

    // Rifiuta l'utente
    const rejectedUser = await this.db.user.update({
      where: { id: userId },
      data: {
        accountStatus: "REJECTED",
      },
    });

    // Audit log
    await this.createAuditLog(
      null, // No organizationId for user rejection
      adminUserId,
      "REJECT_USER",
      userId,
      { email: rejectedUser.email, name: rejectedUser.name },
    );

    return rejectedUser;
  }

  /**
   * Aggiorna un utente (admin)
   */
  async updateUser(input: UpdateUserInput): Promise<User> {
    const { userId, adminUserId, data } = input;

    // Verifica che l'utente esista
    const user = await this.db.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError("Utente non trovato", "USER");
    }

    // Validazione email se fornita
    if (data.email !== undefined && data.email.trim().length === 0) {
      throw new ValidationError("L'email non può essere vuota");
    }

    // Prepara i dati per l'update (solo campi forniti)
    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.isSuperAdmin !== undefined)
      updateData.isSuperAdmin = data.isSuperAdmin;

    const updatedUser = await this.db.user.update({
      where: { id: userId },
      data: updateData,
    });

    // Audit log
    await this.createAuditLog(
      null, // No organizationId for user update
      adminUserId,
      "UPDATE_USER",
      userId,
      { changes: updateData },
    );

    return updatedUser;
  }

  /**
   * Elimina un utente (hard delete)
   */
  async deleteUser(input: DeleteUserInput): Promise<void> {
    const { userId, adminUserId } = input;

    // Verifica che l'utente esista
    const user = await this.db.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError("Utente non trovato", "USER");
    }

    // Audit log prima della cancellazione
    await this.createAuditLog(
      null, // No organizationId for user deletion
      adminUserId,
      "DELETE_USER",
      userId,
      { email: user.email, name: user.name },
    );

    // Elimina l'utente (hard delete)
    await this.db.user.delete({
      where: { id: userId },
    });
  }

  /**
   * Aggiorna profilo utente
   */
  async updateUserProfile(input: UpdateUserProfileInput): Promise<User> {
    const { userId, data } = input;

    // Verifica che l'utente esista
    const user = await this.db.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError("Utente non trovato", "USER");
    }

    const updateData: any = {};

    // Aggiorna nome se fornito
    if (data.name !== undefined) {
      updateData.name = data.name;
    }

    // Aggiorna password se fornita
    if (data.newPassword && data.currentPassword) {
      if (!user.password) {
        throw new BusinessLogicError(
          "Password non impostata per questo utente",
          "PASSWORD_NOT_SET",
        );
      }

      // Verifica password corrente
      const isValid = await bcrypt.compare(data.currentPassword, user.password);
      if (!isValid) {
        throw new ValidationError("Password attuale non corretta");
      }

      // Hash nuova password
      updateData.password = await bcrypt.hash(data.newPassword, 10);
    }

    const updatedUser = await this.db.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        isSuperAdmin: true,
        accountStatus: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
        password: true,
        needsOnboarding: true,
      },
    });

    return updatedUser;
  }

  /**
   * Ottiene organizzazione dell'utente con strutture
   */
  async getUserOrganization(
    input: GetUserOrganizationInput,
  ): Promise<UserWithOrganization["organizationUser"] | null> {
    const { userId } = input;

    const orgUser = await this.db.organizationUser.findUnique({
      where: {
        userId,
      },
      include: {
        organization: {
          include: {
            structures: {
              where: {
                active: true,
              },
              include: {
                _count: {
                  select: {
                    personStructures: true,
                    deadlineInstances: true,
                  },
                },
              },
              orderBy: {
                name: "asc",
              },
            },
          },
        },
      },
    });

    if (!orgUser) {
      return null;
    }

    return orgUser;
  }

  /**
   * Ottiene permessi dell'utente
   */
  async getUserPermissions(
    input: GetUserPermissionsInput,
  ): Promise<UserPermissions> {
    const { userId } = input;

    const user = await getCurrentUserWithRole();

    if (!user) {
      throw new NotFoundError("Utente non trovato", "USER");
    }

    const permissions: UserPermissions = {
      canViewTemplates: canViewTemplates(user),
      canManageGlobalTemplates: canManageGlobalTemplates(user),
      canManageOrgTemplates: canManageOrgTemplates(user),
      canCreateDeadlines: canCreateDeadlines(user),
      canManageOrganization: canManageOrganization(user),
      canManageOrgUsers: canManageOrgUsers(user),
      role: getUserRoleLabel(user),
      isSuperAdmin: user.isSuperAdmin,
      organizationId: user.organizationUser?.organizationId || null,
      structureId: user.organizationUser?.structureId || null,
    };

    return permissions;
  }

  /**
   * Helper: Crea audit log
   */
  private async createAuditLog(
    organizationId: string | null,
    userId: string,
    action: string,
    entityId: string,
    metadata?: any,
  ): Promise<void> {
    await this.db.auditLog.create({
      data: {
        organizationId,
        userId,
        action,
        entity: "User",
        entityId,
        metadata: metadata || {},
      },
    });
  }
}

// Export singleton instance
export const userService = new UserService();
