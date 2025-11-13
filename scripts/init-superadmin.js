#!/usr/bin/env node
/**
 * Initialize Super Admin
 * Crea il super admin se non esiste (primo avvio)
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function initSuperAdmin() {
  try {
    const email = process.env.SUPER_ADMIN_EMAIL;
    const password = process.env.SUPER_ADMIN_PASSWORD;
    const name = process.env.SUPER_ADMIN_NAME || 'Super Admin';

    if (!email || !password) {
      console.log('⚠️  SUPER_ADMIN_EMAIL or SUPER_ADMIN_PASSWORD not set');
      console.log('   Skipping super admin creation');
      return;
    }

    // Verifica se esiste già
    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existing) {
      console.log('✓ Super admin already exists:', email);
      
      // Aggiorna se non è super admin
      if (!existing.isSuperAdmin) {
        await prisma.user.update({
          where: { id: existing.id },
          data: { 
            isSuperAdmin: true,
            accountStatus: 'APPROVED',
            emailVerified: new Date(),
          },
        });
        console.log('✓ User promoted to super admin');
      }
      return;
    }

    // Crea super admin
    const hashedPassword = await bcrypt.hash(password, 10);

    const superAdmin = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        name,
        isSuperAdmin: true,
        accountStatus: 'APPROVED',
        emailVerified: new Date(),
      },
    });

    console.log('✓ Super admin created successfully!');
    console.log('  Email:', superAdmin.email);
    console.log('  Name:', superAdmin.name);
    console.log('');
    console.log('⚠️  Please login and change the password immediately!');
    
  } catch (error) {
    console.error('✗ Error creating super admin:', error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run
initSuperAdmin()
  .then(() => {
    console.log('');
    console.log('============================================');
    console.log('Super admin initialization completed');
    console.log('============================================');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Super admin initialization failed:', error);
    process.exit(1);
  });
