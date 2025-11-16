const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  console.log("🔍 Checking production database status...\n");

  // Check users
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      isSuperAdmin: true,
      accountStatus: true,
      emailVerified: true,
      needsOnboarding: true,
      createdAt: true,
    },
    orderBy: { createdAt: "asc" },
  });

  console.log(`👥 Users (${users.length}):`);
  users.forEach((user, index) => {
    console.log(`\n  ${index + 1}. ${user.email}`);
    console.log(`     Name: ${user.name || 'N/A'}`);
    console.log(`     Super Admin: ${user.isSuperAdmin}`);
    console.log(`     Account Status: ${user.accountStatus}`);
    console.log(`     Email Verified: ${user.emailVerified ? 'Yes' : 'No'}`);
    console.log(`     Needs Onboarding: ${user.needsOnboarding}`);
    console.log(`     Created: ${user.createdAt.toISOString()}`);
  });

  // Check deadline templates
  const deadlineTemplates = await prisma.deadlineTemplate.count({
    where: { ownerType: "GLOBAL" },
  });
  console.log(`\n📅 Global Deadline Templates: ${deadlineTemplates}`);

  // Check role templates
  const roleTemplates = await prisma.roleTemplate.count({
    where: { ownerType: "GLOBAL" },
  });
  console.log(`👔 Global Role Templates: ${roleTemplates}`);

  // Check document templates
  const documentTemplates = await prisma.documentTemplate.count();
  console.log(`📄 Document Templates: ${documentTemplates}`);

  // Check organizations
  const organizations = await prisma.organization.findMany({
    select: {
      id: true,
      name: true,
      createdAt: true,
      _count: {
        select: {
          users: true,
          structures: true,
        },
      },
    },
  });

  console.log(`\n🏢 Organizations (${organizations.length}):`);
  organizations.forEach((org, index) => {
    console.log(`\n  ${index + 1}. ${org.name}`);
    console.log(`     Users: ${org._count.users}`);
    console.log(`     Structures: ${org._count.structures}`);
    console.log(`     Created: ${org.createdAt.toISOString()}`);
  });

  // Check for duplicate templates
  const duplicateCheck = await prisma.$queryRaw`
    SELECT "ownerType", "key", COUNT(*) as count
    FROM "DeadlineTemplate"
    WHERE "ownerType" = 'GLOBAL'
    GROUP BY "ownerType", "key"
    HAVING COUNT(*) > 1
  `;

  if (Array.isArray(duplicateCheck) && duplicateCheck.length > 0) {
    console.log(`\n⚠️  Duplicate Deadline Templates found:`);
    duplicateCheck.forEach((dup) => {
      console.log(`   ${dup.key}: ${dup.count} duplicates`);
    });
  } else {
    console.log(`\n✅ No duplicate deadline templates found`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
