-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Document" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organizationId" TEXT NOT NULL,
    "templateId" TEXT,
    "ownerType" TEXT NOT NULL DEFAULT 'DEADLINE',
    "ownerId" TEXT NOT NULL,
    "deadlineId" TEXT,
    "fileName" TEXT NOT NULL,
    "fileType" TEXT,
    "fileSize" INTEGER,
    "storagePath" TEXT NOT NULL,
    "uploadedById" TEXT,
    "expiryDate" DATETIME,
    "isExpired" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Document_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Document_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Document_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "DocumentTemplate" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Document_deadlineId_fkey" FOREIGN KEY ("deadlineId") REFERENCES "DeadlineInstance" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Document" ("createdAt", "expiryDate", "fileName", "fileSize", "fileType", "id", "isExpired", "notes", "organizationId", "ownerId", "ownerType", "storagePath", "templateId", "updatedAt", "uploadedById") SELECT "createdAt", "expiryDate", "fileName", "fileSize", "fileType", "id", "isExpired", "notes", "organizationId", "ownerId", "ownerType", "storagePath", "templateId", "updatedAt", "uploadedById" FROM "Document";
DROP TABLE "Document";
ALTER TABLE "new_Document" RENAME TO "Document";
CREATE INDEX "Document_organizationId_ownerType_ownerId_idx" ON "Document"("organizationId", "ownerType", "ownerId");
CREATE INDEX "Document_templateId_idx" ON "Document"("templateId");
CREATE INDEX "Document_expiryDate_idx" ON "Document"("expiryDate");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
