-- CreateEnum
CREATE TYPE "OrgUserRole" AS ENUM ('OWNER', 'ADMIN', 'MANAGER', 'OPERATOR');

-- CreateEnum
CREATE TYPE "OrganizationType" AS ENUM ('STUDIO_MEDICO', 'STUDIO_DENTISTICO', 'MEDICO_SINGOLO');

-- CreateEnum
CREATE TYPE "TemplateOwnerType" AS ENUM ('GLOBAL', 'ORG');

-- CreateEnum
CREATE TYPE "DeadlineScope" AS ENUM ('ROLE', 'STRUCTURE', 'PERSON');

-- CreateEnum
CREATE TYPE "RecurrenceUnit" AS ENUM ('DAY', 'MONTH', 'YEAR');

-- CreateEnum
CREATE TYPE "AnchorType" AS ENUM ('ASSIGNMENT_START', 'HIRE_DATE', 'LAST_COMPLETION', 'CUSTOM');

-- CreateEnum
CREATE TYPE "ComplianceType" AS ENUM ('TRAINING', 'MAINTENANCE', 'INSPECTION', 'DOCUMENT', 'REPORTING', 'WASTE', 'DATA_PROTECTION', 'INSURANCE', 'OTHER');

-- CreateEnum
CREATE TYPE "DeadlineStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'OVERDUE', 'CANCELLED');

-- CreateEnum
CREATE TYPE "DocumentOwner" AS ENUM ('DEADLINE', 'PERSON', 'STRUCTURE', 'ORGANIZATION');

-- CreateEnum
CREATE TYPE "DocumentScope" AS ENUM ('STRUCTURE', 'PERSON');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('EMAIL');

-- CreateEnum
CREATE TYPE "NotificationStatus" AS ENUM ('PENDING', 'SENT', 'FAILED', 'CANCELLED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "name" TEXT,
    "password" TEXT,
    "image" TEXT,
    "isSuperAdmin" BOOLEAN NOT NULL DEFAULT false,
    "accountStatus" TEXT NOT NULL DEFAULT 'PENDING_VERIFICATION',
    "emailVerificationToken" TEXT,
    "emailVerificationExpires" TIMESTAMP(3),
    "needsOnboarding" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "PasswordResetToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "OrganizationType" NOT NULL DEFAULT 'STUDIO_MEDICO',
    "vatNumber" TEXT,
    "fiscalCode" TEXT,
    "address" TEXT,
    "city" TEXT,
    "province" TEXT,
    "postalCode" TEXT,
    "country" TEXT NOT NULL DEFAULT 'IT',
    "phone" TEXT,
    "email" TEXT,
    "pec" TEXT,
    "website" TEXT,
    "timezone" TEXT NOT NULL DEFAULT 'Europe/Rome',
    "notificationsEnabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrganizationUser" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "OrgUserRole" NOT NULL DEFAULT 'ADMIN',
    "structureId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrganizationUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Structure" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "address" TEXT,
    "city" TEXT,
    "province" TEXT,
    "postalCode" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "pec" TEXT,
    "website" TEXT,
    "vatNumber" TEXT,
    "fiscalCode" TEXT,
    "responsiblePersonId" TEXT,
    "legalRepName" TEXT,
    "licenseNumber" TEXT,
    "licenseExpiry" TIMESTAMP(3),
    "insurancePolicy" TEXT,
    "insuranceExpiry" TIMESTAMP(3),
    "notes" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Structure_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Person" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "fiscalCode" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "hireDate" TIMESTAMP(3),
    "birthDate" TIMESTAMP(3),
    "notes" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Person_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PersonStructure" (
    "id" TEXT NOT NULL,
    "personId" TEXT NOT NULL,
    "structureId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PersonStructure_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoleTemplate" (
    "id" TEXT NOT NULL,
    "ownerType" "TemplateOwnerType" NOT NULL DEFAULT 'GLOBAL',
    "organizationId" TEXT,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RoleTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeadlineTemplate" (
    "id" TEXT NOT NULL,
    "ownerType" "TemplateOwnerType" NOT NULL DEFAULT 'GLOBAL',
    "organizationId" TEXT,
    "scope" "DeadlineScope" NOT NULL,
    "complianceType" "ComplianceType" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "recurrenceUnit" "RecurrenceUnit",
    "recurrenceEvery" INTEGER,
    "firstDueOffsetDays" INTEGER NOT NULL DEFAULT 0,
    "anchor" "AnchorType" NOT NULL,
    "roleTemplateId" TEXT,
    "requiredDocumentName" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "legalReference" TEXT,
    "sourceUrl" TEXT,
    "effectiveFrom" TIMESTAMP(3),
    "effectiveTo" TIMESTAMP(3),
    "country" TEXT DEFAULT 'IT',
    "regions" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DeadlineTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeadlineInstance" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "templateId" TEXT,
    "structureId" TEXT,
    "personId" TEXT,
    "roleAssignmentId" TEXT,
    "title" TEXT NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "status" "DeadlineStatus" NOT NULL DEFAULT 'PENDING',
    "completedAt" TIMESTAMP(3),
    "completionDocumentId" TEXT,
    "notes" TEXT,
    "isRecurring" BOOLEAN NOT NULL DEFAULT false,
    "recurrenceActive" BOOLEAN NOT NULL DEFAULT true,
    "recurrenceEndDate" TIMESTAMP(3),
    "recurrenceGroupId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DeadlineInstance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoleAssignment" (
    "id" TEXT NOT NULL,
    "personId" TEXT NOT NULL,
    "roleTemplateId" TEXT NOT NULL,
    "structureId" TEXT,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RoleAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentTemplate" (
    "id" TEXT NOT NULL,
    "ownerType" "TemplateOwnerType" NOT NULL DEFAULT 'GLOBAL',
    "organizationId" TEXT,
    "scope" "DocumentScope" NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "isMandatory" BOOLEAN NOT NULL DEFAULT false,
    "hasExpiry" BOOLEAN NOT NULL DEFAULT false,
    "reminderDays" INTEGER,
    "fileFormats" TEXT,
    "maxSizeKB" INTEGER,
    "notes" TEXT,
    "legalReference" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DocumentTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "templateId" TEXT,
    "ownerType" "DocumentOwner" NOT NULL DEFAULT 'DEADLINE',
    "ownerId" TEXT NOT NULL,
    "deadlineId" TEXT,
    "fileName" TEXT NOT NULL,
    "fileType" TEXT,
    "fileSize" INTEGER,
    "storagePath" TEXT NOT NULL,
    "uploadedById" TEXT,
    "expiryDate" TIMESTAMP(3),
    "isExpired" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "deadlineId" TEXT NOT NULL,
    "sendTo" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL DEFAULT 'EMAIL',
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "sentAt" TIMESTAMP(3),
    "status" "NotificationStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeadlineReminder" (
    "id" TEXT NOT NULL,
    "deadlineId" TEXT NOT NULL,
    "daysBefore" INTEGER NOT NULL,
    "message" TEXT,
    "notified" BOOLEAN NOT NULL DEFAULT false,
    "notifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DeadlineReminder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "entity" TEXT,
    "entityId" TEXT,
    "ip" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InviteToken" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "role" "OrgUserRole" NOT NULL,
    "structureId" TEXT,
    "invitedBy" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "usedByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InviteToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProvinceRegionMapping" (
    "id" TEXT NOT NULL,
    "provinceCode" TEXT NOT NULL,
    "provinceName" TEXT NOT NULL,
    "regionName" TEXT NOT NULL,
    "country" TEXT NOT NULL DEFAULT 'IT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProvinceRegionMapping_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "PasswordResetToken_token_key" ON "PasswordResetToken"("token");

-- CreateIndex
CREATE INDEX "PasswordResetToken_token_idx" ON "PasswordResetToken"("token");

-- CreateIndex
CREATE INDEX "PasswordResetToken_userId_used_idx" ON "PasswordResetToken"("userId", "used");

-- CreateIndex
CREATE UNIQUE INDEX "OrganizationUser_userId_key" ON "OrganizationUser"("userId");

-- CreateIndex
CREATE INDEX "OrganizationUser_userId_idx" ON "OrganizationUser"("userId");

-- CreateIndex
CREATE INDEX "OrganizationUser_organizationId_role_idx" ON "OrganizationUser"("organizationId", "role");

-- CreateIndex
CREATE INDEX "OrganizationUser_structureId_idx" ON "OrganizationUser"("structureId");

-- CreateIndex
CREATE INDEX "Structure_organizationId_idx" ON "Structure"("organizationId");

-- CreateIndex
CREATE INDEX "Structure_responsiblePersonId_idx" ON "Structure"("responsiblePersonId");

-- CreateIndex
CREATE INDEX "Person_organizationId_idx" ON "Person"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "PersonStructure_personId_structureId_key" ON "PersonStructure"("personId", "structureId");

-- CreateIndex
CREATE INDEX "RoleTemplate_ownerType_active_idx" ON "RoleTemplate"("ownerType", "active");

-- CreateIndex
CREATE UNIQUE INDEX "RoleTemplate_ownerType_key_key" ON "RoleTemplate"("ownerType", "key");

-- CreateIndex
CREATE INDEX "DeadlineTemplate_ownerType_active_scope_idx" ON "DeadlineTemplate"("ownerType", "active", "scope");

-- CreateIndex
CREATE INDEX "DeadlineTemplate_organizationId_idx" ON "DeadlineTemplate"("organizationId");

-- CreateIndex
CREATE INDEX "DeadlineInstance_organizationId_dueDate_idx" ON "DeadlineInstance"("organizationId", "dueDate");

-- CreateIndex
CREATE INDEX "DeadlineInstance_status_dueDate_idx" ON "DeadlineInstance"("status", "dueDate");

-- CreateIndex
CREATE INDEX "DeadlineInstance_templateId_idx" ON "DeadlineInstance"("templateId");

-- CreateIndex
CREATE INDEX "DeadlineInstance_recurrenceGroupId_idx" ON "DeadlineInstance"("recurrenceGroupId");

-- CreateIndex
CREATE INDEX "RoleAssignment_personId_idx" ON "RoleAssignment"("personId");

-- CreateIndex
CREATE INDEX "RoleAssignment_roleTemplateId_idx" ON "RoleAssignment"("roleTemplateId");

-- CreateIndex
CREATE INDEX "DocumentTemplate_ownerType_scope_active_idx" ON "DocumentTemplate"("ownerType", "scope", "active");

-- CreateIndex
CREATE INDEX "DocumentTemplate_organizationId_idx" ON "DocumentTemplate"("organizationId");

-- CreateIndex
CREATE INDEX "Document_organizationId_ownerType_ownerId_idx" ON "Document"("organizationId", "ownerType", "ownerId");

-- CreateIndex
CREATE INDEX "Document_templateId_idx" ON "Document"("templateId");

-- CreateIndex
CREATE INDEX "Document_expiryDate_idx" ON "Document"("expiryDate");

-- CreateIndex
CREATE INDEX "Notification_status_scheduledAt_idx" ON "Notification"("status", "scheduledAt");

-- CreateIndex
CREATE INDEX "Notification_deadlineId_idx" ON "Notification"("deadlineId");

-- CreateIndex
CREATE INDEX "DeadlineReminder_deadlineId_idx" ON "DeadlineReminder"("deadlineId");

-- CreateIndex
CREATE INDEX "DeadlineReminder_notified_idx" ON "DeadlineReminder"("notified");

-- CreateIndex
CREATE INDEX "AuditLog_organizationId_createdAt_idx" ON "AuditLog"("organizationId", "createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_userId_createdAt_idx" ON "AuditLog"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "InviteToken_token_key" ON "InviteToken"("token");

-- CreateIndex
CREATE INDEX "InviteToken_token_idx" ON "InviteToken"("token");

-- CreateIndex
CREATE INDEX "InviteToken_email_idx" ON "InviteToken"("email");

-- CreateIndex
CREATE INDEX "InviteToken_organizationId_idx" ON "InviteToken"("organizationId");

-- CreateIndex
CREATE INDEX "InviteToken_usedAt_idx" ON "InviteToken"("usedAt");

-- CreateIndex
CREATE UNIQUE INDEX "ProvinceRegionMapping_provinceCode_key" ON "ProvinceRegionMapping"("provinceCode");

-- CreateIndex
CREATE INDEX "ProvinceRegionMapping_provinceCode_idx" ON "ProvinceRegionMapping"("provinceCode");

-- CreateIndex
CREATE INDEX "ProvinceRegionMapping_regionName_idx" ON "ProvinceRegionMapping"("regionName");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationUser" ADD CONSTRAINT "OrganizationUser_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationUser" ADD CONSTRAINT "OrganizationUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationUser" ADD CONSTRAINT "OrganizationUser_structureId_fkey" FOREIGN KEY ("structureId") REFERENCES "Structure"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Structure" ADD CONSTRAINT "Structure_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Person" ADD CONSTRAINT "Person_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PersonStructure" ADD CONSTRAINT "PersonStructure_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PersonStructure" ADD CONSTRAINT "PersonStructure_structureId_fkey" FOREIGN KEY ("structureId") REFERENCES "Structure"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoleTemplate" ADD CONSTRAINT "RoleTemplate_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeadlineTemplate" ADD CONSTRAINT "DeadlineTemplate_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeadlineTemplate" ADD CONSTRAINT "DeadlineTemplate_roleTemplateId_fkey" FOREIGN KEY ("roleTemplateId") REFERENCES "RoleTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeadlineInstance" ADD CONSTRAINT "DeadlineInstance_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeadlineInstance" ADD CONSTRAINT "DeadlineInstance_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "DeadlineTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeadlineInstance" ADD CONSTRAINT "DeadlineInstance_structureId_fkey" FOREIGN KEY ("structureId") REFERENCES "Structure"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeadlineInstance" ADD CONSTRAINT "DeadlineInstance_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeadlineInstance" ADD CONSTRAINT "DeadlineInstance_roleAssignmentId_fkey" FOREIGN KEY ("roleAssignmentId") REFERENCES "RoleAssignment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoleAssignment" ADD CONSTRAINT "RoleAssignment_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoleAssignment" ADD CONSTRAINT "RoleAssignment_roleTemplateId_fkey" FOREIGN KEY ("roleTemplateId") REFERENCES "RoleTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoleAssignment" ADD CONSTRAINT "RoleAssignment_structureId_fkey" FOREIGN KEY ("structureId") REFERENCES "Structure"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentTemplate" ADD CONSTRAINT "DocumentTemplate_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "DocumentTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_deadlineId_fkey" FOREIGN KEY ("deadlineId") REFERENCES "DeadlineInstance"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_deadlineId_fkey" FOREIGN KEY ("deadlineId") REFERENCES "DeadlineInstance"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeadlineReminder" ADD CONSTRAINT "DeadlineReminder_deadlineId_fkey" FOREIGN KEY ("deadlineId") REFERENCES "DeadlineInstance"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InviteToken" ADD CONSTRAINT "InviteToken_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InviteToken" ADD CONSTRAINT "InviteToken_structureId_fkey" FOREIGN KEY ("structureId") REFERENCES "Structure"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InviteToken" ADD CONSTRAINT "InviteToken_invitedBy_fkey" FOREIGN KEY ("invitedBy") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
