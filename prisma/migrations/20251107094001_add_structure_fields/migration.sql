-- AlterTable
ALTER TABLE "Structure" ADD COLUMN "fiscalCode" TEXT;
ALTER TABLE "Structure" ADD COLUMN "insuranceExpiry" DATETIME;
ALTER TABLE "Structure" ADD COLUMN "insurancePolicy" TEXT;
ALTER TABLE "Structure" ADD COLUMN "legalRepName" TEXT;
ALTER TABLE "Structure" ADD COLUMN "licenseExpiry" DATETIME;
ALTER TABLE "Structure" ADD COLUMN "licenseNumber" TEXT;
ALTER TABLE "Structure" ADD COLUMN "pec" TEXT;
ALTER TABLE "Structure" ADD COLUMN "responsiblePersonId" TEXT;
ALTER TABLE "Structure" ADD COLUMN "vatNumber" TEXT;
ALTER TABLE "Structure" ADD COLUMN "website" TEXT;

-- CreateIndex
CREATE INDEX "Structure_responsiblePersonId_idx" ON "Structure"("responsiblePersonId");
