const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🗺️  Seeding province-region mapping...');

  const { seedProvinceRegionMapping } = require('./prisma/seeds/province-region-mapping.ts');
  await seedProvinceRegionMapping();

  console.log('✅ Done!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
