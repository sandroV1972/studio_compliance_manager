import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";
import { seedDocumentTemplates } from "./seeds/document-templates";
import { seedProvinceRegionMapping } from "./seeds/province-region-mapping";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  const superAdminEmail = "admin@studiocompliance.it";
  const superAdminPassword = await bcrypt.hash("Admin123!", 10);

  const superAdmin = await prisma.user.upsert({
    where: { email: superAdminEmail },
    update: {},
    create: {
      email: superAdminEmail,
      password: superAdminPassword,
      name: "Super Admin",
      isSuperAdmin: true,
      emailVerified: new Date(),
    },
  });

  console.log("✅ Super Admin created:", superAdmin.email);

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
    await prisma.roleTemplate.upsert({
      where: {
        ownerType_key: {
          ownerType: "GLOBAL",
          key: role.key,
        },
      },
      update: {},
      create: {
        ownerType: "GLOBAL",
        ...role,
      },
    });
  }

  console.log("✅ Global Role Templates created");

  const globalDeadlineTemplates = [
    {
      scope: "PERSON",
      complianceType: "TRAINING",
      title: "Formazione Lavoratori - Aggiornamento quinquennale",
      description: "Aggiornamento formazione generale e specifica (6 ore)",
      recurrenceUnit: "YEAR",
      recurrenceEvery: 5,
      firstDueOffsetDays: 0,
      anchor: "HIRE_DATE",
      legalReference: "D.Lgs. 81/08 art. 37; Accordi Stato-Regioni",
      sourceUrl:
        "https://www.apcampus.it/news/quando-devo-fare-gli-aggiornamenti-previsti-dal-d-lgs-8108",
      country: "IT",
      notes:
        "Obbligatorio per tutti i lavoratori. Monte ore: 6 ore per aggiornamento quinquennale.",
    },
    {
      scope: "PERSON",
      complianceType: "TRAINING",
      title: "Formazione Preposti - Aggiornamento biennale",
      description: "Aggiornamento formazione preposti alla sicurezza",
      recurrenceUnit: "YEAR",
      recurrenceEvery: 2,
      firstDueOffsetDays: 0,
      anchor: "ASSIGNMENT_START",
      legalReference: "D.Lgs. 81/08 art. 37; Accordi Stato-Regioni",
      sourceUrl:
        "https://www.apcampus.it/news/quando-devo-fare-gli-aggiornamenti-previsti-dal-d-lgs-8108",
      country: "IT",
      notes:
        "Per lavoratori con funzioni di preposto. Monte ore: 6 ore biennali.",
    },
    {
      scope: "PERSON",
      complianceType: "TRAINING",
      title: "Formazione Dirigenti - Aggiornamento quinquennale",
      description: "Aggiornamento formazione dirigenti per la sicurezza",
      recurrenceUnit: "YEAR",
      recurrenceEvery: 5,
      firstDueOffsetDays: 0,
      anchor: "ASSIGNMENT_START",
      legalReference: "D.Lgs. 81/08 art. 37; Accordi Stato-Regioni",
      sourceUrl:
        "https://www.apcampus.it/news/quando-devo-fare-gli-aggiornamenti-previsti-dal-d-lgs-8108",
      country: "IT",
      notes:
        "Per dirigenti con responsabilità in materia di sicurezza. Monte ore: 6 ore quinquennali.",
    },
    {
      scope: "PERSON",
      complianceType: "TRAINING",
      title: "Datore di Lavoro RSPP - Aggiornamento quinquennale",
      description:
        "Aggiornamento formazione RSPP per datore di lavoro (rischio alto)",
      recurrenceUnit: "YEAR",
      recurrenceEvery: 5,
      firstDueOffsetDays: 0,
      anchor: "ASSIGNMENT_START",
      legalReference: "D.Lgs. 81/08 art. 34; Accordi Stato-Regioni",
      sourceUrl:
        "https://www.apcampus.it/news/quando-devo-fare-gli-aggiornamenti-previsti-dal-d-lgs-8108",
      country: "IT",
      notes:
        "Per datore di lavoro che svolge direttamente i compiti di RSPP. Rischio alto (odontoiatria): 14 ore quinquennali.",
    },
    {
      scope: "PERSON",
      complianceType: "TRAINING",
      title: "RLS - Aggiornamento annuale",
      description:
        "Aggiornamento formazione Rappresentante Lavoratori Sicurezza",
      recurrenceUnit: "YEAR",
      recurrenceEvery: 1,
      firstDueOffsetDays: 0,
      anchor: "ASSIGNMENT_START",
      legalReference: "D.Lgs. 81/08 art. 37; Accordi Stato-Regioni",
      sourceUrl:
        "https://www.apcampus.it/news/quando-devo-fare-gli-aggiornamenti-previsti-dal-d-lgs-8108",
      country: "IT",
      notes:
        "Obbligatorio annuale. Monte ore: 4 ore (< 50 dipendenti) o 8 ore (≥ 50 dipendenti).",
    },
    {
      scope: "PERSON",
      complianceType: "TRAINING",
      title: "Addetti Antincendio - Aggiornamento quinquennale",
      description: "Aggiornamento formazione addetti antincendio (L1/L2/L3)",
      recurrenceUnit: "YEAR",
      recurrenceEvery: 5,
      firstDueOffsetDays: 0,
      anchor: "ASSIGNMENT_START",
      legalReference: "DM 2/9/2021",
      sourceUrl:
        "https://www.apcampus.it/news/quando-devo-fare-gli-aggiornamenti-previsti-dal-d-lgs-8108",
      country: "IT",
      notes:
        "Livello 1: 2 ore; Livello 2: 5 ore; Livello 3: 8 ore. Verificare livello di rischio dello studio.",
    },
    {
      scope: "PERSON",
      complianceType: "TRAINING",
      title: "Addetti Primo Soccorso - Aggiornamento triennale",
      description: "Aggiornamento formazione addetti primo soccorso aziendale",
      recurrenceUnit: "YEAR",
      recurrenceEvery: 3,
      firstDueOffsetDays: 0,
      anchor: "ASSIGNMENT_START",
      legalReference: "DM 388/2003",
      sourceUrl:
        "https://www.polesconsulting.it/durata-e-validita-della-formazione-in-materia-di-sicurezza-sul-lavoro/",
      country: "IT",
      notes:
        "Gruppo A: 6 ore; Gruppi B/C: 4 ore. Verificare classificazione dello studio.",
    },
    {
      scope: "STRUCTURE",
      complianceType: "DOCUMENT",
      title: "DVR - Riesame e Aggiornamento",
      description: "Riesame periodico del Documento di Valutazione dei Rischi",
      recurrenceUnit: "YEAR",
      recurrenceEvery: 1,
      firstDueOffsetDays: 0,
      anchor: "CUSTOM",
      legalReference: "D.Lgs. 81/08 art. 29",
      sourceUrl:
        "https://www.sicurezzasaluteigienelavoro.it/home/sicurezza-salute-igiene-sui-luoghi-di-lavoro/sicurezza-salute-lavoratori/scadenze-sicurezza-sul-lavoro",
      country: "IT",
      notes:
        "Aggiornare entro 30 giorni da modifiche significative. Rischi fisici (art.181): ogni 4 anni; cancerogeni/mutageni (art.236) e biologico (art.271): ogni 3 anni.",
    },
    {
      scope: "STRUCTURE",
      complianceType: "INSPECTION",
      title: "Impianto elettrico - Verifica periodica",
      description: "Verifica periodica impianto elettrico e messa a terra",
      recurrenceUnit: "YEAR",
      recurrenceEvery: 5,
      firstDueOffsetDays: 0,
      anchor: "LAST_COMPLETION",
      legalReference: "DPR 462/01",
      sourceUrl:
        "https://www.sicurezzasaluteigienelavoro.it/home/sicurezza-salute-igiene-sui-luoghi-di-lavoro/sicurezza-salute-lavoratori/scadenze-sicurezza-sul-lavoro",
      country: "IT",
      notes:
        "Verifica quinquennale obbligatoria. Frequenza può variare in base alla classificazione dell'impianto.",
      requiredDocumentName: "Rapporto di verifica impianto elettrico",
    },
    {
      scope: "STRUCTURE",
      complianceType: "MAINTENANCE",
      title: "Estintori - Controllo semestrale",
      description: "Controllo semestrale estintori portatili",
      recurrenceUnit: "MONTH",
      recurrenceEvery: 6,
      firstDueOffsetDays: 0,
      anchor: "LAST_COMPLETION",
      legalReference: "UNI 9994-1",
      sourceUrl:
        "https://www.sicurezzasaluteigienelavoro.it/home/sicurezza-salute-igiene-sui-luoghi-di-lavoro/sicurezza-salute-lavoratori/scadenze-sicurezza-sul-lavoro",
      country: "IT",
      notes:
        "Controllo semestrale secondo norma tecnica. Revisioni e collaudi secondo piano specifico.",
      requiredDocumentName: "Rapporto controllo estintori",
    },
    {
      scope: "STRUCTURE",
      complianceType: "INSPECTION",
      title: "Illuminazione emergenza - Prove funzionali",
      description: "Test funzionale illuminazione di emergenza",
      recurrenceUnit: "MONTH",
      recurrenceEvery: 12,
      firstDueOffsetDays: 0,
      anchor: "LAST_COMPLETION",
      legalReference: "Norme tecniche di buona pratica",
      country: "IT",
      notes:
        "Test funzionale mensile consigliato; prova autonomia annuale obbligatoria. Mantenere registro prove.",
      requiredDocumentName: "Registro prove illuminazione emergenza",
    },
    {
      scope: "STRUCTURE",
      complianceType: "INSPECTION",
      title: "Sorveglianza fisica radioprotezione - Visita ER",
      description: "Visita annuale Esperto di Radioprotezione",
      recurrenceUnit: "YEAR",
      recurrenceEvery: 1,
      firstDueOffsetDays: 0,
      anchor: "LAST_COMPLETION",
      legalReference: "D.Lgs. 101/2020 art. 130-131",
      sourceUrl:
        "https://www.aio.it/radioprotezione-nuovo-decreto-consente-di-concordare-i-controlli-di-qualita-con-lesperto/",
      country: "IT",
      notes:
        "Visita almeno annuale dell'Esperto di Radioprotezione. Verificare nomina ER valida.",
      requiredDocumentName: "Rapporto visita ER",
    },
    {
      scope: "STRUCTURE",
      complianceType: "INSPECTION",
      title: "Controlli di qualità apparecchi RX",
      description: "Controlli di qualità su apparecchiature radiologiche",
      recurrenceUnit: "YEAR",
      recurrenceEvery: 1,
      firstDueOffsetDays: 0,
      anchor: "LAST_COMPLETION",
      legalReference: "D.Lgs. 101/2020 come modificato dal D.Lgs. 203/2022",
      sourceUrl:
        "https://www.odontoiatria33.it/normative/23086/radioprotezione-in-vigore-le-modifiche-al-decreto-101.html",
      country: "IT",
      notes:
        "Periodicità definita dallo Specialista di Fisica Medica/ER. Di norma annuale o secondo norme specifiche per tipo apparecchio (endorale/OPG/CBCT).",
      requiredDocumentName: "Rapporto CQ apparecchi RX",
    },
    {
      scope: "PERSON",
      complianceType: "REPORTING",
      title: "Notifica pratica radiologica",
      description: "Notifica inizio/variazioni/cessazione pratica radiologica",
      recurrenceUnit: "YEAR",
      recurrenceEvery: 1,
      firstDueOffsetDays: 0,
      anchor: "CUSTOM",
      legalReference: "D.Lgs. 101/2020",
      sourceUrl:
        "https://blog.dentaltrey.it/le-novita-introdotte-dal-decreto-d-lgs-101-20-in-materia-di-radioprotezione-in-odontoiatria",
      country: "IT",
      notes:
        "Inizio attività: almeno 10 giorni prima. Cessazione: entro 30 giorni. Variazioni amministrative: entro 30 giorni.",
    },
    {
      scope: "PERSON",
      complianceType: "REPORTING",
      title: "Registrazione dati esposizioni mediche",
      description: "Invio dati esposizioni mediche alla Regione",
      recurrenceUnit: "YEAR",
      recurrenceEvery: 4,
      firstDueOffsetDays: 0,
      anchor: "LAST_COMPLETION",
      legalReference: "D.Lgs. 101/2020 art. 168, All. XXIX",
      sourceUrl:
        "https://www.cemirad.com/radioprotezione/novita-introdotte-dal-d-lgs-101-20-per-gli-studi-odontoiatrici/",
      country: "IT",
      notes:
        "Prima trasmissione entro 3 anni dall'entrata in vigore, poi ogni 4 anni. Tracciare DAP/tempo, genere e fascia età.",
    },
    {
      scope: "STRUCTURE",
      complianceType: "INSPECTION",
      title: "LDR - Verifica Livelli Diagnostici di Riferimento",
      description: "Verifica quadriennale livelli diagnostici di riferimento",
      recurrenceUnit: "YEAR",
      recurrenceEvery: 4,
      firstDueOffsetDays: 0,
      anchor: "LAST_COMPLETION",
      legalReference: "D.Lgs. 101/2020 art. 158, All. XXVI",
      sourceUrl:
        "https://blog.dentaltrey.it/le-novita-introdotte-dal-decreto-d-lgs-101-20-in-materia-di-radioprotezione-in-odontoiatria",
      country: "IT",
      notes:
        "Verifica quadriennale dei livelli diagnostici di riferimento per le pratiche radiologiche.",
    },
    {
      scope: "PERSON",
      complianceType: "TRAINING",
      title: "Formazione radioprotezione lavoratori esposti",
      description: "Formazione radioprotezione ex artt. 110-111",
      recurrenceUnit: "YEAR",
      recurrenceEvery: 5,
      firstDueOffsetDays: 0,
      anchor: "HIRE_DATE",
      legalReference: "D.Lgs. 101/2020; correttivo 203/2022",
      sourceUrl:
        "https://www.cemirad.com/normative-studi-medici/modifiche-al-d-lgs-101-20-odontoiatria-e-controlli-di-qualita/",
      country: "IT",
      notes:
        "Formazione erogata dall'Esperto di Radioprotezione con requisiti formatore. Aggiornamento quinquennale.",
    },
    {
      scope: "PERSON",
      complianceType: "TRAINING",
      title: "ECM Radioprotezione per odontoiatri",
      description: "Crediti ECM in radioprotezione (quota % triennale)",
      recurrenceUnit: "YEAR",
      recurrenceEvery: 3,
      firstDueOffsetDays: 0,
      anchor: "CUSTOM",
      legalReference: "D.Lgs. 101/2020 art. 162",
      sourceUrl:
        "https://www.cemirad.com/radioprotezione/novita-introdotte-dal-d-lgs-101-20-per-gli-studi-odontoiatrici/",
      country: "IT",
      notes:
        "Almeno il 15% dei crediti ECM triennali deve essere in radioprotezione per odontoiatri e medici radiologi.",
    },
    {
      scope: "PERSON",
      complianceType: "INSPECTION",
      title: "Dosimetria personale",
      description: "Lettura dosimetro personale e classificazione esposti",
      recurrenceUnit: "MONTH",
      recurrenceEvery: 2,
      firstDueOffsetDays: 0,
      anchor: "LAST_COMPLETION",
      legalReference: "D.Lgs. 101/2020",
      country: "IT",
      notes:
        "Frequenza lettura secondo contratto con servizio dosimetrico (mensile/bimestrale). Allegare report dosimetrici.",
      requiredDocumentName: "Report dosimetrico",
    },
    {
      scope: "PERSON",
      complianceType: "WASTE",
      title: "Registro carico/scarico rifiuti - Annotazioni",
      description: "Annotazioni registro rifiuti sanitari pericolosi",
      recurrenceUnit: "DAY",
      recurrenceEvery: 5,
      firstDueOffsetDays: 0,
      anchor: "CUSTOM",
      legalReference: "DPR 254/2003; D.Lgs. 152/2006",
      sourceUrl: "https://www.cnr.it/it/registro-carico-scarico",
      country: "IT",
      notes:
        "Annotazioni entro 5 giorni da carico/scarico per CER 18.01.03* / 18.02.02*. Conservare per 3 anni. Vidimazione CCIAA.",
    },
    {
      scope: "STRUCTURE",
      complianceType: "WASTE",
      title: "Deposito temporaneo rifiuti sanitari",
      description: "Verifica tempi massimi deposito temporaneo",
      recurrenceUnit: "MONTH",
      recurrenceEvery: 1,
      firstDueOffsetDays: 0,
      anchor: "CUSTOM",
      legalReference: "DPR 254/2003",
      sourceUrl:
        "https://www.sipram.it/la-corretta-gestione-dei-rifiuti-sanitari/",
      country: "IT",
      notes:
        ">200L: max 5 giorni dalla chiusura contenitore; ≤200L: max 30 giorni. Amalgama Hg: fino a 1 anno.",
    },
    {
      scope: "PERSON",
      complianceType: "REPORTING",
      title: "RENTRI - Iscrizione obbligatoria",
      description:
        "Iscrizione al Registro Elettronico Nazionale Tracciabilità Rifiuti",
      recurrenceUnit: "YEAR",
      recurrenceEvery: 1,
      firstDueOffsetDays: 0,
      anchor: "CUSTOM",
      legalReference: "D.Lgs. 213/2022; DM 59/2023",
      sourceUrl: "https://www.rifiutoo.com/rentri/soggetti-obbligati/",
      country: "IT",
      notes:
        "Piccoli studi (fino a 10 dip.): finestra 15/12/2025-13/02/2026. FIR digitale dal 13/02/2025.",
    },
    {
      scope: "PERSON",
      complianceType: "TRAINING",
      title: "BLSD/DAE - Retraining",
      description: "Retraining periodico Basic Life Support and Defibrillation",
      recurrenceUnit: "YEAR",
      recurrenceEvery: 2,
      firstDueOffsetDays: 0,
      anchor: "LAST_COMPLETION",
      country: "IT",
      notes:
        "Periodicità 2-3 anni secondo Regione/Provider. Se presente DAE, verificare anche scadenza piastre/batterie.",
    },
    {
      scope: "PERSON",
      complianceType: "INSPECTION",
      title: "Sorveglianza sanitaria - Visita periodica",
      description: "Visita medica periodica del Medico Competente",
      recurrenceUnit: "YEAR",
      recurrenceEvery: 1,
      firstDueOffsetDays: 0,
      anchor: "HIRE_DATE",
      legalReference: "D.Lgs. 81/08 art. 41",
      country: "IT",
      notes:
        "Periodicità stabilita dal Medico Competente. Include visite preassuntive, periodiche e a richiesta. Allegare giudizi di idoneità.",
      requiredDocumentName: "Giudizio idoneità",
    },
    {
      scope: "STRUCTURE",
      complianceType: "MAINTENANCE",
      title: "Autoclave - Test e manutenzione",
      description: "Test di routine e manutenzione autoclave/sterilizzazione",
      recurrenceUnit: "YEAR",
      recurrenceEvery: 1,
      firstDueOffsetDays: 0,
      anchor: "LAST_COMPLETION",
      country: "IT",
      notes:
        "Bowie-Dick/Helix quotidiano, test biologico settimanale, manutenzione annuale. Mantenere registri cicli e validazioni.",
      requiredDocumentName: "Registro sterilizzazione e manutenzione",
    },
    {
      scope: "STRUCTURE",
      complianceType: "MAINTENANCE",
      title: "Manutenzione impianti aspirazione/compressori",
      description: "Manutenzione programmata impianti tecnici",
      recurrenceUnit: "YEAR",
      recurrenceEvery: 1,
      firstDueOffsetDays: 0,
      anchor: "LAST_COMPLETION",
      country: "IT",
      notes:
        "Secondo libretto fabbricante (trimestrale/annuale). Include aspirazione, compressori, elettromedicali.",
      requiredDocumentName: "Rapporto manutenzione",
    },
    {
      scope: "PERSON",
      complianceType: "DATA_PROTECTION",
      title: "Privacy/GDPR - Formazione e riesame",
      description: "Formazione privacy e riesame registro trattamenti",
      recurrenceUnit: "YEAR",
      recurrenceEvery: 1,
      firstDueOffsetDays: 0,
      anchor: "HIRE_DATE",
      legalReference: "GDPR (Reg. UE 2016/679)",
      country: "IT",
      notes:
        "Formazione annuale consigliata. DPIA e informative aggiornate on-change. Nomine responsabili esterni.",
    },
    {
      scope: "PERSON",
      complianceType: "TRAINING",
      title: "ECM generali - Crediti triennali",
      description: "Educazione Continua in Medicina - crediti triennali",
      recurrenceUnit: "YEAR",
      recurrenceEvery: 3,
      firstDueOffsetDays: 0,
      anchor: "CUSTOM",
      legalReference: "Normativa ECM nazionale",
      country: "IT",
      notes:
        "Numero crediti richiesti per triennio vigente (es. 150 crediti). Configurare per professionista sanitario.",
    },
    {
      scope: "PERSON",
      complianceType: "INSURANCE",
      title: "Assicurazione RC professionale - Rinnovo",
      description:
        "Rinnovo polizza assicurazione responsabilità civile professionale",
      recurrenceUnit: "YEAR",
      recurrenceEvery: 1,
      firstDueOffsetDays: 30,
      anchor: "LAST_COMPLETION",
      legalReference: "Legge Gelli-Bianco (L. 24/2017)",
      country: "IT",
      notes:
        "Obbligatoria per professionisti sanitari. Verificare massimali adeguati.",
      requiredDocumentName: "Polizza RC professionale",
    },
  ];

  for (const template of globalDeadlineTemplates) {
    await prisma.deadlineTemplate.create({
      data: {
        ownerType: "GLOBAL",
        scope: template.scope as any,
        complianceType: template.complianceType as any,
        title: template.title,
        description: template.description,
        recurrenceUnit: template.recurrenceUnit as any,
        recurrenceEvery: template.recurrenceEvery,
        firstDueOffsetDays: template.firstDueOffsetDays,
        anchor: template.anchor as any,
        legalReference: template.legalReference,
        sourceUrl: template.sourceUrl,
        country: template.country,
        notes: template.notes,
        requiredDocumentName: template.requiredDocumentName,
        active: true,
        status: "ACTIVE",
      },
    });
  }

  console.log(
    `✅ ${globalDeadlineTemplates.length} Global Deadline Templates created`,
  );

  const demoUserEmail = "demo@studiodentistico.it";
  const demoUserPassword = await bcrypt.hash("Demo123!", 10);

  const demoUser = await prisma.user.upsert({
    where: { email: demoUserEmail },
    update: {},
    create: {
      email: demoUserEmail,
      password: demoUserPassword,
      name: "Dr. Mario Rossi",
      emailVerified: new Date(),
    },
  });

  const demoOrg = await prisma.organization.create({
    data: {
      name: "Studio Dentistico Rossi",
      type: "STUDIO_DENTISTICO",
      vatNumber: "IT12345678901",
      fiscalCode: "RSSMRA70A01H501Z",
      address: "Via Roma 123",
      city: "Milano",
      province: "MI",
      postalCode: "20100",
      country: "IT",
      phone: "+39 02 1234567",
      email: "info@studiodentisticorossi.it",
      pec: "studiodentisticorossi@pec.it",
      timezone: "Europe/Rome",
      notificationsEnabled: true,
      users: {
        create: {
          userId: demoUser.id,
          role: "OWNER",
        },
      },
    },
  });

  console.log("✅ Demo Organization created:", demoOrg.name);

  const structure1 = await prisma.structure.create({
    data: {
      organizationId: demoOrg.id,
      name: "Sede Principale",
      code: "SEDE01",
      address: "Via Roma 123",
      city: "Milano",
      province: "MI",
      postalCode: "20100",
      phone: "+39 02 1234567",
      email: "info@studiodentisticorossi.it",
      active: true,
    },
  });

  console.log("✅ Demo Structure created:", structure1.name);

  const person1 = await prisma.person.create({
    data: {
      organizationId: demoOrg.id,
      firstName: "Mario",
      lastName: "Rossi",
      fiscalCode: "RSSMRA70A01H501Z",
      email: "mario.rossi@studiodentisticorossi.it",
      phone: "+39 333 1234567",
      hireDate: new Date("2020-01-15"),
      active: true,
      structures: {
        create: {
          structureId: structure1.id,
          isPrimary: true,
          startDate: new Date("2020-01-15"),
        },
      },
    },
  });

  const person2 = await prisma.person.create({
    data: {
      organizationId: demoOrg.id,
      firstName: "Laura",
      lastName: "Bianchi",
      fiscalCode: "BNCLRA85M50F205X",
      email: "laura.bianchi@studiodentisticorossi.it",
      phone: "+39 333 7654321",
      hireDate: new Date("2021-03-01"),
      active: true,
      structures: {
        create: {
          structureId: structure1.id,
          isPrimary: true,
          startDate: new Date("2021-03-01"),
        },
      },
    },
  });

  console.log("✅ Demo People created");

  const odontiatraRole = await prisma.roleTemplate.findFirst({
    where: { key: "ODONTOIATRA", ownerType: "GLOBAL" },
  });

  const assistenteRole = await prisma.roleTemplate.findFirst({
    where: { key: "ASSISTENTE_ALLA_POLTRONA", ownerType: "GLOBAL" },
  });

  if (odontiatraRole) {
    await prisma.roleAssignment.create({
      data: {
        personId: person1.id,
        roleTemplateId: odontiatraRole.id,
        structureId: structure1.id,
        startDate: new Date("2020-01-15"),
      },
    });
  }

  if (assistenteRole) {
    await prisma.roleAssignment.create({
      data: {
        personId: person2.id,
        roleTemplateId: assistenteRole.id,
        structureId: structure1.id,
        startDate: new Date("2021-03-01"),
      },
    });
  }

  console.log("✅ Demo Role Assignments created");

  // Seed province-region mapping
  await seedProvinceRegionMapping();

  // Seed document templates
  await seedDocumentTemplates();

  console.log("\n🎉 Seeding completed successfully!");
  console.log("\n📝 Login credentials:");
  console.log("Super Admin:");
  console.log(`  Email: ${superAdminEmail}`);
  console.log("  Password: Admin123!");
  console.log("\nDemo User:");
  console.log(`  Email: ${demoUserEmail}`);
  console.log("  Password: Demo123!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
