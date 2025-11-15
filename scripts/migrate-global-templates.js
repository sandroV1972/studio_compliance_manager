#!/usr/bin/env node
/**
 * Migrate Global Templates from SQLite to PostgreSQL
 * Recupera i template globali dal vecchio database SQLite e li importa in PostgreSQL
 */

const { PrismaClient } = require('@prisma/client');
const sqlite3 = require('better-sqlite3');
const path = require('path');

const prisma = new PrismaClient();

async function migrateGlobalTemplates() {
  try {
    console.log('🔄 Starting global templates migration from SQLite to PostgreSQL...\n');

    // Apri database SQLite
    const sqlitePath = path.join(__dirname, '../prisma/dev.db');
    const sqliteDb = sqlite3(sqlitePath, { readonly: true });

    // 1. Migra RoleTemplate
    console.log('📋 Migrating RoleTemplate...');
    const roleTemplates = sqliteDb.prepare(`
      SELECT * FROM RoleTemplate WHERE ownerType = 'GLOBAL'
    `).all();

    let roleCount = 0;
    for (const template of roleTemplates) {
      // Verifica se esiste già
      const existing = await prisma.roleTemplate.findFirst({
        where: {
          ownerType: 'GLOBAL',
          key: template.key,
        },
      });

      if (!existing) {
        await prisma.roleTemplate.create({
          data: {
            id: template.id,
            ownerType: template.ownerType,
            organizationId: template.organizationId,
            key: template.key,
            label: template.label,
            description: template.description,
            active: Boolean(template.active),
            createdAt: new Date(template.createdAt),
            updatedAt: new Date(template.updatedAt),
          },
        });
        roleCount++;
      }
    }
    console.log(`✓ Migrated ${roleCount} RoleTemplate (${roleTemplates.length - roleCount} already existed)\n`);

    // 2. Migra DeadlineTemplate
    console.log('📋 Migrating DeadlineTemplate...');
    const deadlineTemplates = sqliteDb.prepare(`
      SELECT * FROM DeadlineTemplate WHERE ownerType = 'GLOBAL'
    `).all();

    let deadlineCount = 0;
    for (const template of deadlineTemplates) {
      // Verifica se esiste già
      const existing = await prisma.deadlineTemplate.findUnique({
        where: { id: template.id },
      });

      if (!existing) {
        await prisma.deadlineTemplate.create({
          data: {
            id: template.id,
            ownerType: template.ownerType,
            organizationId: template.organizationId,
            scope: template.scope,
            complianceType: template.complianceType,
            title: template.title,
            description: template.description,
            recurrenceUnit: template.recurrenceUnit,
            recurrenceEvery: template.recurrenceEvery,
            firstDueOffsetDays: template.firstDueOffsetDays,
            anchor: template.anchor,
            roleTemplateId: template.roleTemplateId,
            requiredDocumentName: template.requiredDocumentName,
            active: Boolean(template.active),
            status: template.status,
            legalReference: template.legalReference,
            sourceUrl: template.sourceUrl,
            effectiveFrom: template.effectiveFrom ? new Date(template.effectiveFrom) : null,
            effectiveTo: template.effectiveTo ? new Date(template.effectiveTo) : null,
            country: template.country,
            regions: template.regions,
            notes: template.notes,
            createdAt: new Date(template.createdAt),
            updatedAt: new Date(template.updatedAt),
          },
        });
        deadlineCount++;
      }
    }
    console.log(`✓ Migrated ${deadlineCount} DeadlineTemplate (${deadlineTemplates.length - deadlineCount} already existed)\n`);

    // 3. Migra DocumentTemplate
    console.log('📋 Migrating DocumentTemplate...');
    const documentTemplates = sqliteDb.prepare(`
      SELECT * FROM DocumentTemplate WHERE ownerType = 'GLOBAL'
    `).all();

    let documentCount = 0;
    for (const template of documentTemplates) {
      // Verifica se esiste già
      const existing = await prisma.documentTemplate.findUnique({
        where: { id: template.id },
      });

      if (!existing) {
        await prisma.documentTemplate.create({
          data: {
            id: template.id,
            ownerType: template.ownerType,
            organizationId: template.organizationId,
            scope: template.scope,
            name: template.name,
            description: template.description,
            category: template.category,
            isMandatory: Boolean(template.isMandatory),
            hasExpiry: Boolean(template.hasExpiry),
            reminderDays: template.reminderDays,
            fileFormats: template.fileFormats,
            maxSizeKB: template.maxSizeKB,
            notes: template.notes,
            legalReference: template.legalReference,
            active: Boolean(template.active),
            createdAt: new Date(template.createdAt),
            updatedAt: new Date(template.updatedAt),
          },
        });
        documentCount++;
      }
    }
    console.log(`✓ Migrated ${documentCount} DocumentTemplate (${documentTemplates.length - documentCount} already existed)\n`);

    // Chiudi database SQLite
    sqliteDb.close();

    console.log('============================================');
    console.log('✅ Migration completed successfully!');
    console.log('============================================');
    console.log(`   RoleTemplate:     ${roleCount} migrated`);
    console.log(`   DeadlineTemplate: ${deadlineCount} migrated`);
    console.log(`   DocumentTemplate: ${documentCount} migrated`);
    console.log(`   Total:            ${roleCount + deadlineCount + documentCount} templates`);
    console.log('============================================\n');

  } catch (error) {
    console.error('✗ Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run
migrateGlobalTemplates()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });