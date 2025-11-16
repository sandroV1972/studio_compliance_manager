const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("🔄 Resetting production database to clean state...\n");

  // 1. Delete ALL data (in correct order to respect foreign keys)
  console.log("1️⃣ Deleting all existing data...");

  await prisma.auditLog.deleteMany({});
  console.log("   ✅ Deleted audit logs");

  await prisma.document.deleteMany({});
  console.log("   ✅ Deleted documents");

  await prisma.deadline.deleteMany({});
  console.log("   ✅ Deleted deadlines");

  await prisma.roleAssignment.deleteMany({});
  console.log("   ✅ Deleted role assignments");

  await prisma.person.deleteMany({});
  console.log("   ✅ Deleted people");

  await prisma.structure.deleteMany({});
  console.log("   ✅ Deleted structures");

  await prisma.organizationUser.deleteMany({});
  console.log("   ✅ Deleted organization users");

  await prisma.inviteToken.deleteMany({});
  console.log("   ✅ Deleted invite tokens");

  await prisma.organization.deleteMany({});
  console.log("   ✅ Deleted organizations");

  await prisma.user.deleteMany({});
  console.log("   ✅ Deleted users");

  await prisma.documentTemplate.deleteMany({});
  console.log("   ✅ Deleted document templates");

  await prisma.deadlineTemplate.deleteMany({});
  console.log("   ✅ Deleted deadline templates");

  await prisma.roleTemplate.deleteMany({});
  console.log("   ✅ Deleted role templates");

  // 2. Create Super Admin
  console.log("\n2️⃣ Creating Super Admin...");

  const superAdminEmail = "admin@3jdigital.solutions";
  const superAdminPassword = await bcrypt.hash("Admin123!", 10);

  const superAdmin = await prisma.user.create({
    data: {
      email: superAdminEmail,
      password: superAdminPassword,
      name: "Amministratore Sistema",
      isSuperAdmin: true,
      emailVerified: new Date(),
      accountStatus: "APPROVED",
      needsOnboarding: false,
    },
  });

  console.log(`   ✅ Super Admin created: ${superAdmin.email}`);

  // 3. Create Global Role Templates
  console.log("\n3️⃣ Creating global role templates...");

  const globalRoles = [
    {
      key: "MEDICO",
      label: "Medico",
      description: "Medico generico o specialista",
    },
    {
      key: "ODONTOIATRA",
      label: "Odontoiatra",
      description: "Medico odontoiatra",
    },
    {
      key: "IGIENISTA_DENTALE",
      label: "Igienista Dentale",
      description: "Professionista sanitario igienista dentale",
    },
    {
      key: "ASSISTENTE_ALLA_POLTRONA",
      label: "Assistente alla Poltrona",
      description: "Assistente di studio odontoiatrico",
    },
    {
      key: "RSPP",
      label: "RSPP",
      description: "Responsabile Servizio Prevenzione e Protezione",
    },
    {
      key: "RLS",
      label: "RLS",
      description: "Rappresentante dei Lavoratori per la Sicurezza",
    },
    {
      key: "RECEPTIONIST",
      label: "Receptionist",
      description: "Addetto alla reception e segreteria",
    },
    {
      key: "ADDETTO_ANTINCENDIO",
      label: "Addetto Antincendio",
      description: "Addetto alla gestione delle emergenze antincendio",
    },
    {
      key: "ADDETTO_PRIMO_SOCCORSO",
      label: "Addetto Primo Soccorso",
      description: "Addetto al primo soccorso aziendale",
    },
    {
      key: "PREPOSTO",
      label: "Preposto",
      description: "Preposto alla sicurezza",
    },
    {
      key: "DIRIGENTE",
      label: "Dirigente",
      description: "Dirigente per la sicurezza",
    },
  ];

  for (const role of globalRoles) {
    await prisma.roleTemplate.create({
      data: {
        ownerType: "GLOBAL",
        ...role,
      },
    });
  }

  console.log(`   ✅ Created ${globalRoles.length} global role templates`);

  // 4. Verify final state
  console.log("\n4️⃣ Verifying database state...");

  const userCount = await prisma.user.count();
  const orgCount = await prisma.organization.count();
  const roleTemplateCount = await prisma.roleTemplate.count({
    where: { ownerType: "GLOBAL" },
  });

  console.log(`   👥 Users: ${userCount}`);
  console.log(`   🏢 Organizations: ${orgCount}`);
  console.log(`   👔 Global Role Templates: ${roleTemplateCount}`);

  console.log("\n✨ Production database reset completed!");
  console.log("\n📝 Login credentials:");
  console.log("   Email: admin@3jdigital.solutions");
  console.log("   Password: Admin123!");
  console.log(
    "\n⚠️  Note: Global deadline templates will be created when organizations are set up through the UI."
  );
}

main()
  .catch((e) => {
    console.error("❌ Error during reset:");
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });