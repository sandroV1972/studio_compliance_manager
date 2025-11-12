/**
 * Script di test per DeadlineService
 *
 * Esegui con: npx tsx scripts/test-deadline-service.ts
 *
 * NOTA: Questo è un test manuale per vedere il service in azione.
 * Per test automatizzati, usa Jest/Vitest.
 */

import { deadlineService } from "../lib/services/deadline-service";

async function main() {
  console.log("🚀 Testing DeadlineService...\n");

  try {
    // ========== TEST 1: Validazione Input ==========
    console.log("TEST 1: Validazione input non valido");
    try {
      await deadlineService.createDeadline({
        organizationId: "test-org-id",
        userId: "test-user-id",
        data: {
          title: "", // Invalid: titolo vuoto
          dueDate: new Date(),
        } as any,
      });
      console.log("❌ FAILED: Avrebbe dovuto lanciare ValidationError\n");
    } catch (error: any) {
      if (error.name === "ValidationError") {
        console.log("✅ PASSED: ValidationError lanciato correttamente");
        console.log(`   Messaggio: ${error.message}\n`);
      } else {
        console.log("❌ FAILED: Errore inatteso:", error.message, "\n");
      }
    }

    // ========== TEST 2: Template Non Trovato ==========
    console.log("TEST 2: Template non esistente");
    try {
      await deadlineService.createDeadline({
        organizationId: "test-org-id",
        userId: "test-user-id",
        data: {
          title: "Test Deadline",
          dueDate: new Date(),
          templateId: "non-existing-template-id",
        },
      });
      console.log("❌ FAILED: Avrebbe dovuto lanciare NotFoundError\n");
    } catch (error: any) {
      if (error.name === "NotFoundError") {
        console.log("✅ PASSED: NotFoundError lanciato correttamente");
        console.log(`   Messaggio: ${error.message}`);
        console.log(`   Status Code: ${error.statusCode}\n`);
      } else {
        console.log("❌ FAILED: Errore inatteso:", error.message, "\n");
      }
    }

    // ========== TEST 3: Lettura Deadline Non Esistente ==========
    console.log("TEST 3: Lettura deadline non esistente");
    try {
      await deadlineService.getDeadline(
        "non-existing-deadline-id",
        "test-org-id",
      );
      console.log("❌ FAILED: Avrebbe dovuto lanciare NotFoundError\n");
    } catch (error: any) {
      if (error.name === "NotFoundError") {
        console.log("✅ PASSED: NotFoundError lanciato correttamente");
        console.log(`   Messaggio: ${error.message}`);
        console.log(`   Resource: ${error.resource}\n`);
      } else {
        console.log("❌ FAILED: Errore inatteso:", error.message, "\n");
      }
    }

    // ========== TEST 4: Service con Database Reale (Opzionale) ==========
    console.log("TEST 4: Test con database reale");
    console.log("   Skipping - richiede setup database");
    console.log(
      "   Per testare con dati reali, usa gli ID di organizzazione, user e template esistenti\n",
    );

    console.log("✨ Tutti i test completati!\n");
    console.log("NOTA: Questi sono test manuali di base.");
    console.log(
      "Per test completi, implementa unit tests con Jest/Vitest e mock di Prisma.\n",
    );
  } catch (error) {
    console.error("💥 Errore inatteso durante i test:", error);
  }
}

// Esegui i test
main()
  .then(() => {
    console.log("🎉 Test script terminato");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Errore fatale:", error);
    process.exit(1);
  });
