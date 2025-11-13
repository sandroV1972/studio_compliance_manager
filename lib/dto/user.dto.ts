/**
 * User DTO Types
 */

import { User, OrganizationUser } from "@prisma/client";

export type UserWithRole = User & {
  organizationUser: OrganizationUser | null;
  isSuperAdmin: boolean;
};

export type UserWithOrganization = User & {
  organizationUser: {
    organization: {
      id: string;
      name: string;
      type: string;
      vatNumber: string | null;
      fiscalCode: string | null;
      address: string | null;
      city: string | null;
      province: string | null;
      postalCode: string | null;
      country: string | null;
      phone: string | null;
      email: string | null;
      pec: string | null;
      website: string | null;
      structures: Array<{
        id: string;
        name: string;
        code: string | null;
        address: string | null;
        city: string | null;
        province: string | null;
        active: boolean;
        _count: {
          personStructures: number;
          deadlineInstances: number;
        };
      }>;
    };
  } | null;
};

// Get Pending Users Input
export interface GetPendingUsersInput {
  // No additional input needed - Super Admin only operation
}

// Approve User Input
export interface ApproveUserInput {
  userId: string;
  adminUserId: string;
}

// Reject User Input
export interface RejectUserInput {
  userId: string;
  adminUserId: string;
}

// Update User (Admin) Input
export interface UpdateUserInput {
  userId: string;
  adminUserId: string;
  data: {
    name?: string;
    email?: string;
    isSuperAdmin?: boolean;
  };
}

// Delete User Input
export interface DeleteUserInput {
  userId: string;
  adminUserId: string;
}

// Update User Profile Input
export interface UpdateUserProfileInput {
  userId: string;
  data: {
    name?: string;
    currentPassword?: string;
    newPassword?: string;
  };
}

// Get User Organization Input
export interface GetUserOrganizationInput {
  userId: string;
}

// Get User Permissions Input
export interface GetUserPermissionsInput {
  userId: string;
}

// User Permissions Response
export interface UserPermissions {
  canViewTemplates: boolean;
  canManageGlobalTemplates: boolean;
  canManageOrgTemplates: boolean;
  canCreateDeadlines: boolean;
  canManageOrganization: boolean;
  canManageOrgUsers: boolean;
  role: string;
  isSuperAdmin: boolean;
  organizationId: string | null;
  structureId: string | null;
}
