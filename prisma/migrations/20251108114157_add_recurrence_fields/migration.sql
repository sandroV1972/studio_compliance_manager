-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_DeadlineInstance" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organizationId" TEXT NOT NULL,
    "templateId" TEXT,
    "structureId" TEXT,
    "personId" TEXT,
    "roleAssignmentId" TEXT,
    "title" TEXT NOT NULL,
    "dueDate" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "completedAt" DATETIME,
    "completionDocumentId" TEXT,
    "notes" TEXT,
    "isRecurring" BOOLEAN NOT NULL DEFAULT false,
    "recurrenceActive" BOOLEAN NOT NULL DEFAULT true,
    "recurrenceEndDate" DATETIME,
    "recurrenceGroupId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "DeadlineInstance_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "DeadlineInstance_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "DeadlineTemplate" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "DeadlineInstance_structureId_fkey" FOREIGN KEY ("structureId") REFERENCES "Structure" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "DeadlineInstance_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "DeadlineInstance_roleAssignmentId_fkey" FOREIGN KEY ("roleAssignmentId") REFERENCES "RoleAssignment" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_DeadlineInstance" ("completedAt", "completionDocumentId", "createdAt", "dueDate", "id", "notes", "organizationId", "personId", "roleAssignmentId", "status", "structureId", "templateId", "title", "updatedAt") SELECT "completedAt", "completionDocumentId", "createdAt", "dueDate", "id", "notes", "organizationId", "personId", "roleAssignmentId", "status", "structureId", "templateId", "title", "updatedAt" FROM "DeadlineInstance";
DROP TABLE "DeadlineInstance";
ALTER TABLE "new_DeadlineInstance" RENAME TO "DeadlineInstance";
CREATE INDEX "DeadlineInstance_organizationId_dueDate_idx" ON "DeadlineInstance"("organizationId", "dueDate");
CREATE INDEX "DeadlineInstance_status_dueDate_idx" ON "DeadlineInstance"("status", "dueDate");
CREATE INDEX "DeadlineInstance_templateId_idx" ON "DeadlineInstance"("templateId");
CREATE INDEX "DeadlineInstance_recurrenceGroupId_idx" ON "DeadlineInstance"("recurrenceGroupId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
