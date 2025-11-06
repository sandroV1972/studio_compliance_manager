const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      isSuperAdmin: true,
    },
  });

  console.log('\n=== UTENTI NEL DATABASE ===\n');
  users.forEach((user, index) => {
    console.log(`${index + 1}. ${user.email}`);
    console.log(`   Nome: ${user.name || 'N/A'}`);
    console.log(`   SuperAdmin: ${user.isSuperAdmin ? 'SÌ' : 'NO'}`);
    console.log(`   ID: ${user.id}\n`);
  });

  if (users.length > 0) {
    console.log('\nAggiorno il primo utente come SuperAdmin...\n');
    
    const updated = await prisma.user.update({
      where: { id: users[0].id },
      data: { isSuperAdmin: true },
    });

    console.log(`✅ Utente ${updated.email} è ora SuperAdmin!`);
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
