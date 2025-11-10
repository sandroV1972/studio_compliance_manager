/*
  Warnings:

  - You are about to drop the column `region` on the `DeadlineTemplate` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_DeadlineTemplate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ownerType" TEXT NOT NULL DEFAULT 'GLOBAL',
    "organizationId" TEXT,
    "scope" TEXT NOT NULL,
    "complianceType" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "recurrenceUnit" TEXT NOT NULL,
    "recurrenceEvery" INTEGER NOT NULL,
    "firstDueOffsetDays" INTEGER NOT NULL DEFAULT 0,
    "anchor" TEXT NOT NULL,
    "roleTemplateId" TEXT,
    "requiredDocumentName" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "legalReference" TEXT,
    "sourceUrl" TEXT,
    "effectiveFrom" DATETIME,
    "effectiveTo" DATETIME,
    "country" TEXT DEFAULT 'IT',
    "regions" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "DeadlineTemplate_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "DeadlineTemplate_roleTemplateId_fkey" FOREIGN KEY ("roleTemplateId") REFERENCES "RoleTemplate" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_DeadlineTemplate" ("active", "anchor", "complianceType", "country", "createdAt", "description", "effectiveFrom", "effectiveTo", "firstDueOffsetDays", "id", "legalReference", "notes", "organizationId", "ownerType", "recurrenceEvery", "recurrenceUnit", "requiredDocumentName", "roleTemplateId", "scope", "sourceUrl", "status", "title", "updatedAt") SELECT "active", "anchor", "complianceType", "country", "createdAt", "description", "effectiveFrom", "effectiveTo", "firstDueOffsetDays", "id", "legalReference", "notes", "organizationId", "ownerType", "recurrenceEvery", "recurrenceUnit", "requiredDocumentName", "roleTemplateId", "scope", "sourceUrl", "status", "title", "updatedAt" FROM "DeadlineTemplate";
DROP TABLE "DeadlineTemplate";
ALTER TABLE "new_DeadlineTemplate" RENAME TO "DeadlineTemplate";
CREATE INDEX "DeadlineTemplate_ownerType_active_scope_idx" ON "DeadlineTemplate"("ownerType", "active", "scope");
CREATE INDEX "DeadlineTemplate_organizationId_idx" ON "DeadlineTemplate"("organizationId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
