const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("🔄 Creating super admin user...\n");

  // Create Super Admin
  const superAdminEmail = "admin@3jdigital.solutions";
  const superAdminPassword = await bcrypt.hash("Admin123!", 10);

  const superAdmin = await prisma.user.upsert({
    where: { email: superAdminEmail },
    update: {},
    create: {
      email: superAdminEmail,
      password: superAdminPassword,
      name: "Amministratore Sistema",
      isSuperAdmin: true,
      emailVerified: new Date(),
      accountStatus: "APPROVED",
      needsOnboarding: false,
    },
  });

  console.log(`✅ Super Admin created: ${superAdmin.email}`);
  console.log(`\n📝 Login credentials:`);
  console.log(`   Email: admin@3jdigital.solutions`);
  console.log(`   Password: Admin123!`);
  console.log(`\n✨ Setup completed!`);
}

main()
  .catch((e) => {
    console.error("❌ Error:", e.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });