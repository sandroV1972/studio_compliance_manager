/*
  Warnings:

  - A unique constraint covering the columns `[ownerType,key]` on the table `RoleTemplate` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "RoleTemplate_ownerType_organizationId_key_key";

-- CreateIndex
CREATE UNIQUE INDEX "RoleTemplate_ownerType_key_key" ON "RoleTemplate"("ownerType", "key");
