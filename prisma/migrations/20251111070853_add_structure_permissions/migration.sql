-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_OrganizationUser" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organizationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'ADMIN',
    "structureId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "OrganizationUser_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "OrganizationUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "OrganizationUser_structureId_fkey" FOREIGN KEY ("structureId") REFERENCES "Structure" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_OrganizationUser" ("createdAt", "id", "organizationId", "role", "updatedAt", "userId") SELECT "createdAt", "id", "organizationId", "role", "updatedAt", "userId" FROM "OrganizationUser";
DROP TABLE "OrganizationUser";
ALTER TABLE "new_OrganizationUser" RENAME TO "OrganizationUser";
CREATE UNIQUE INDEX "OrganizationUser_userId_key" ON "OrganizationUser"("userId");
CREATE INDEX "OrganizationUser_userId_idx" ON "OrganizationUser"("userId");
CREATE INDEX "OrganizationUser_organizationId_role_idx" ON "OrganizationUser"("organizationId", "role");
CREATE INDEX "OrganizationUser_structureId_idx" ON "OrganizationUser"("structureId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
