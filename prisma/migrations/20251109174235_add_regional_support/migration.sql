-- AlterTable
ALTER TABLE "DeadlineTemplate" ADD COLUMN "region" TEXT;

-- CreateTable
CREATE TABLE "ProvinceRegionMapping" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "provinceCode" TEXT NOT NULL,
    "provinceName" TEXT NOT NULL,
    "regionName" TEXT NOT NULL,
    "country" TEXT NOT NULL DEFAULT 'IT',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "ProvinceRegionMapping_provinceCode_key" ON "ProvinceRegionMapping"("provinceCode");

-- CreateIndex
CREATE INDEX "ProvinceRegionMapping_provinceCode_idx" ON "ProvinceRegionMapping"("provinceCode");

-- CreateIndex
CREATE INDEX "ProvinceRegionMapping_regionName_idx" ON "ProvinceRegionMapping"("regionName");

-- CreateIndex
CREATE INDEX "DeadlineTemplate_region_idx" ON "DeadlineTemplate"("region");
