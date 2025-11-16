const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  console.log("🔍 Investigating production database...\n");

  // Check organization details
  const orgs = await prisma.organization.findMany({
    include: {
      _count: {
        select: {
          users: true,
          structures: true,
        },
      },
    },
  });

  console.log(`🏢 Organizations (${orgs.length}):`);
  orgs.forEach((org, index) => {
    console.log(`\n  ${index + 1}. ${org.name} (ID: ${org.id})`);
    console.log(`     VAT: ${org.vatNumber || "N/A"}`);
    console.log(`     Users: ${org._count.users}`);
    console.log(`     Structures: ${org._count.structures}`);
    console.log(`     Created: ${org.createdAt.toISOString()}`);
  });

  // Check structures
  const structures = await prisma.structure.findMany({
    include: {
      organization: {
        select: { name: true },
      },
      _count: {
        select: {
          people: true,
          deadlines: true,
        },
      },
    },
  });

  console.log(`\n🏗️  Structures (${structures.length}):`);
  structures.forEach((str, index) => {
    console.log(`\n  ${index + 1}. ${str.name}`);
    console.log(`     Organization: ${str.organization.name}`);
    console.log(`     People: ${str._count.people}`);
    console.log(`     Deadlines: ${str._count.deadlines}`);
    console.log(`     Created: ${str.createdAt.toISOString()}`);
  });

  // Check organization users
  const orgUsers = await prisma.organizationUser.findMany({
    include: {
      user: {
        select: { email: true, name: true },
      },
      organization: {
        select: { name: true },
      },
    },
  });

  console.log(`\n👥 Organization-User Relations (${orgUsers.length}):`);
  orgUsers.forEach((ou, index) => {
    console.log(
      `\n  ${index + 1}. ${ou.user.email} (${ou.user.name || "N/A"})`
    );
    console.log(`     Organization: ${ou.organization.name}`);
    console.log(`     Role: ${ou.role}`);
    console.log(`     Created: ${ou.createdAt.toISOString()}`);
  });

  // Check if there's any data that looks like production data
  const people = await prisma.person.count();
  const deadlines = await prisma.deadline.count();
  const documents = await prisma.document.count();

  console.log(`\n📊 Data Summary:`);
  console.log(`   People: ${people}`);
  console.log(`   Deadlines: ${deadlines}`);
  console.log(`   Documents: ${documents}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });