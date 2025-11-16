const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  console.log("🧹 Cleaning up production database...\n");

  // 1. Delete demo users and organization
  console.log("1️⃣ Removing demo data...");

  // Delete demo organization (this will cascade delete related structures, etc.)
  const deletedOrg = await prisma.organization.deleteMany({
    where: {
      name: "Studio Dentistico Rossi"
    }
  });
  console.log(`   ✅ Deleted ${deletedOrg.count} demo organization(s)`);

  // Delete demo users
  const deletedUsers = await prisma.user.deleteMany({
    where: {
      OR: [
        { email: "admin@studiocompliance.it" },
        { email: "demo@studiodentistico.it" }
      ]
    }
  });
  console.log(`   ✅ Deleted ${deletedUsers.count} demo user(s)`);

  // 2. Remove duplicate global deadline templates
  console.log("\n2️⃣ Removing duplicate deadline templates...");

  // Get all global deadline templates grouped by title
  const allTemplates = await prisma.deadlineTemplate.findMany({
    where: { ownerType: "GLOBAL" },
    orderBy: { createdAt: "asc" }, // Keep the oldest ones
  });

  const seen = new Map();
  const toDelete = [];

  allTemplates.forEach(template => {
    const key = template.title;
    if (seen.has(key)) {
      // This is a duplicate, mark for deletion
      toDelete.push(template.id);
    } else {
      // First occurrence, keep it
      seen.set(key, template.id);
    }
  });

  if (toDelete.length > 0) {
    const deletedTemplates = await prisma.deadlineTemplate.deleteMany({
      where: {
        id: { in: toDelete }
      }
    });
    console.log(`   ✅ Deleted ${deletedTemplates.count} duplicate deadline template(s)`);
  } else {
    console.log(`   ℹ️  No duplicate deadline templates found`);
  }

  // 3. Verify cleanup
  console.log("\n3️⃣ Verifying cleanup...");

  const userCount = await prisma.user.count();
  const orgCount = await prisma.organization.count();
  const deadlineTemplateCount = await prisma.deadlineTemplate.count({ where: { ownerType: "GLOBAL" } });

  console.log(`   👥 Users: ${userCount}`);
  console.log(`   🏢 Organizations: ${orgCount}`);
  console.log(`   📅 Global Deadline Templates: ${deadlineTemplateCount}`);

  console.log("\n✨ Cleanup completed!");
}

main()
  .catch((e) => {
    console.error("❌ Error during cleanup:");
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });