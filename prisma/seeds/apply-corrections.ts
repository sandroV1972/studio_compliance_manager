/**
 * Script di migrazione per applicare le correzioni ai template globali
 *
 * Questo script:
 * 1. Corregge i template esistenti con errori
 * 2. Aggiunge i nuovi template mancanti
 * 3. Marca i template obsoleti come inattivi
 *
 * Eseguire con: npx tsx prisma/seeds/apply-corrections.ts
 */

import { PrismaClient } from "@prisma/client";
import { correctedGlobalTemplates } from "./corrected-templates";

const prisma = new PrismaClient();

async function main() {
  console.log("🔧 Applicazione correzioni ai template globali...\n");

  // ========================================
  // 1. CORREGGERE TEMPLATE ESISTENTI
  // ========================================

  console.log("📝 Fase 1: Correzione template esistenti\n");

  // Correzione #3: Formazione Antincendio (3 → 5 anni)
  const antincendio = await prisma.deadlineTemplate.updateMany({
    where: {
      ownerType: "GLOBAL",
      title: { contains: "Antincendio" },
      recurrenceEvery: 3,
    },
    data: {
      recurrenceEvery: 5,
      legalReference: "DM 02/09/2021 (ex DM 10/03/1998)",
      notes:
        "Frequenza aggiornamento: 5 anni per tutti i livelli di rischio (1-2-3). Durata corso varia per livello: L1=2h, L2=5h, L3=8h.",
    },
  });
  console.log(
    `✅ Antincendio: aggiornato ${antincendio.count} template (3→5 anni)`,
  );

  // Correzione #6: Prova Evacuazione (annuale → semestrale)
  const evacuazione = await prisma.deadlineTemplate.updateMany({
    where: {
      ownerType: "GLOBAL",
      title: { contains: "evacuazione" },
      recurrenceUnit: "YEAR",
      recurrenceEvery: 1,
    },
    data: {
      recurrenceUnit: "MONTH",
      recurrenceEvery: 6,
      legalReference: "D.M. 18/09/2002, DM 02/09/2021",
      notes:
        "Frequenza semestrale (2 prove/anno) obbligatoria per strutture sanitarie e socio-sanitarie. Verificare normativa specifica per altre attività.",
    },
  });
  console.log(
    `✅ Prova evacuazione: aggiornato ${evacuazione.count} template (annuale→semestrale)`,
  );

  // Correzione #1: GDPR DPIA (1 → 2 anni)
  const dpia = await prisma.deadlineTemplate.updateMany({
    where: {
      ownerType: "GLOBAL",
      title: { contains: "DPIA" },
      recurrenceEvery: 1,
    },
    data: {
      recurrenceEvery: 2,
      notes:
        "DPIA obbligatoria per trattamenti ad alto rischio. Revisione consigliata ogni 2 anni o quando cambiano significativamente i processi di trattamento dati.",
    },
  });
  console.log(`✅ GDPR DPIA: aggiornato ${dpia.count} template (1→2 anni)`);

  // Correzione #8: Visita Medica - Aggiornare notes
  const visitaMedica = await prisma.deadlineTemplate.updateMany({
    where: {
      ownerType: "GLOBAL",
      title: { contains: "Visita medica periodica" },
    },
    data: {
      notes:
        "Frequenza stabilita dal Medico Competente in base al rischio: annuale (rischio generico, radiazioni), biennale (videoterminali <50 anni, lavoro notturno), post-espositiva (amianto 10 anni). Il MC può modificare la periodicità.",
    },
  });
  console.log(
    `✅ Visita medica: aggiornato ${visitaMedica.count} template (notes)`,
  );

  // Correzione #9: DVR (1 → 2 anni)
  const dvr = await prisma.deadlineTemplate.updateMany({
    where: {
      ownerType: "GLOBAL",
      title: { contains: "DVR" },
      recurrenceEvery: 1,
    },
    data: {
      recurrenceEvery: 2,
      notes:
        "Revisione obbligatoria in caso di: modifiche processo produttivo, infortuni significativi, nuove attrezzature/sostanze, esiti sorveglianza sanitaria. Revisione biennale consigliata come best practice.",
    },
  });
  console.log(`✅ DVR: aggiornato ${dvr.count} template (1→2 anni)`);

  // Correzione #16: ECM - Aggiornare triennio
  const ecm = await prisma.deadlineTemplate.updateMany({
    where: {
      ownerType: "GLOBAL",
      title: { contains: "ECM" },
    },
    data: {
      title: "Crediti ECM - Triennio 2023-2025",
      notes:
        "Obbligo per professionisti sanitari: 150 crediti ECM per triennio (50/anno). Il triennio attuale è 2023-2025. Verificare eventuali esoneri/riduzioni per specifiche categorie.",
    },
  });
  console.log(`✅ ECM: aggiornato ${ecm.count} template (triennio 2023-2025)`);

  // ========================================
  // 2. DISATTIVARE TEMPLATE OBSOLETI
  // ========================================

  console.log("\n📝 Fase 2: Disattivazione template obsoleti\n");

  // Disattivare il vecchio template "Impianto elettrico" (sarà sostituito da 2 template)
  const impiantoElettricoOld = await prisma.deadlineTemplate.updateMany({
    where: {
      ownerType: "GLOBAL",
      title: { contains: "Impianto elettrico" },
      NOT: {
        OR: [
          { title: { contains: "messa a terra" } },
          { title: { contains: "DM 37" } },
        ],
      },
    },
    data: {
      active: false,
      notes:
        "[OBSOLETO] Questo template è stato diviso in due: 'Verifica impianto di messa a terra' (2 anni) e 'Verifica impianto elettrico DM 37/08' (5 anni).",
    },
  });
  console.log(
    `✅ Impianto elettrico vecchio: disattivato ${impiantoElettricoOld.count} template`,
  );

  // Disattivare il vecchio template generico "Verifica estintori"
  const estintoriOld = await prisma.deadlineTemplate.updateMany({
    where: {
      ownerType: "GLOBAL",
      title: "Verifica estintori",
    },
    data: {
      active: false,
      notes:
        "[OBSOLETO] Questo template è stato diviso in tre: 'Sorveglianza estintori (mensile)', 'Controllo periodico estintori (semestrale)', 'Revisione estintori' (5 anni).",
    },
  });
  console.log(
    `✅ Estintori vecchio: disattivato ${estintoriOld.count} template`,
  );

  // ========================================
  // 3. AGGIUNGERE NUOVI TEMPLATE
  // ========================================

  console.log("\n📝 Fase 3: Aggiunta nuovi template\n");

  let addedCount = 0;
  let skippedCount = 0;

  for (const template of correctedGlobalTemplates) {
    // Verifica se il template esiste già
    const existing = await prisma.deadlineTemplate.findFirst({
      where: {
        ownerType: "GLOBAL",
        title: template.title,
      },
    });

    if (existing) {
      // Template già esistente - aggiorna solo se è uno dei template corretti
      const isCorrection = [
        "Formazione antincendio GSA",
        "Prova di evacuazione",
        "GDPR - Valutazione Impatto Privacy",
        "Visita medica periodica",
        "Revisione DVR",
        "Crediti ECM",
      ].some((t) => template.title.includes(t));

      if (isCorrection) {
        await prisma.deadlineTemplate.update({
          where: { id: existing.id },
          data: {
            ...template,
            ownerType: "GLOBAL",
            active: true,
          },
        });
        console.log(`✅ Aggiornato: ${template.title}`);
        addedCount++;
      } else {
        console.log(`⏭️  Già esistente (skipped): ${template.title}`);
        skippedCount++;
      }
    } else {
      // Template nuovo - crea
      await prisma.deadlineTemplate.create({
        data: {
          ...template,
          ownerType: "GLOBAL",
          active: true,
        },
      });
      console.log(`✅ Creato: ${template.title}`);
      addedCount++;
    }
  }

  console.log(
    `\n✅ Template aggiunti/aggiornati: ${addedCount}, skipped: ${skippedCount}`,
  );

  // ========================================
  // 4. RIEPILOGO
  // ========================================

  console.log("\n" + "=".repeat(60));
  console.log("📊 RIEPILOGO CORREZIONI");
  console.log("=".repeat(60));

  const totalActive = await prisma.deadlineTemplate.count({
    where: { ownerType: "GLOBAL", active: true },
  });

  const totalInactive = await prisma.deadlineTemplate.count({
    where: { ownerType: "GLOBAL", active: false },
  });

  const oneTantum = await prisma.deadlineTemplate.count({
    where: {
      ownerType: "GLOBAL",
      active: true,
      recurrenceUnit: null,
    },
  });

  console.log(`\n✅ Template globali attivi: ${totalActive}`);
  console.log(`⚠️  Template globali disattivati: ${totalInactive}`);
  console.log(`🔹 Template una tantum: ${oneTantum}`);
  console.log(`🔁 Template ricorrenti: ${totalActive - oneTantum}\n`);

  console.log("🎉 Correzioni completate con successo!");
}

main()
  .catch((e) => {
    console.error("❌ Errore durante l'applicazione delle correzioni:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
