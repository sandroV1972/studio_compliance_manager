import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function seedDocumentTemplates() {
  console.log("🌱 Seeding document templates...");

  // Template documenti per STRUTTURE
  const structureTemplates = [
    {
      scope: "STRUCTURE" as const,
      category: "Sicurezza sul Lavoro",
      name: "DVR - Documento di Valutazione dei Rischi",
      description:
        "Documento obbligatorio che identifica e valuta i rischi presenti nell'ambiente di lavoro",
      isMandatory: true,
      hasExpiry: false,
      legalReference: "D.Lgs. 81/2008 art. 17, 28, 29",
      fileFormats: "PDF",
    },
    {
      scope: "STRUCTURE",
      category: "Sicurezza sul Lavoro",
      name: "DUVRI - Documento Unico di Valutazione dei Rischi da Interferenze",
      description:
        "Documento per la gestione dei rischi derivanti da interferenze tra più imprese",
      isMandatory: false,
      hasExpiry: false,
      legalReference: "D.Lgs. 81/2008 art. 26",
      fileFormats: "PDF",
    },
    {
      scope: "STRUCTURE",
      category: "Sicurezza sul Lavoro",
      name: "Piano di Emergenza ed Evacuazione",
      description:
        "Piano che definisce le procedure per gestire situazioni di emergenza",
      isMandatory: true,
      hasExpiry: false,
      legalReference: "D.Lgs. 81/2008 - D.M. 10/03/1998",
      fileFormats: "PDF",
    },
    {
      scope: "STRUCTURE",
      category: "Antincendio",
      name: "CPI - Certificato Prevenzione Incendi",
      description: "Certificato di conformità antincendio rilasciato dai VVF",
      isMandatory: true,
      hasExpiry: true,
      reminderDays: 60,
      legalReference: "D.P.R. 151/2011",
      fileFormats: "PDF",
    },
    {
      scope: "STRUCTURE",
      category: "Antincendio",
      name: "Registro Controlli Antincendio",
      description:
        "Registro delle verifiche periodiche degli impianti e attrezzature antincendio",
      isMandatory: true,
      hasExpiry: false,
      legalReference: "D.M. 01/09/2021",
      fileFormats: "PDF",
    },
    {
      scope: "STRUCTURE",
      category: "Radioprotezione",
      name: "Nulla Osta Radioprotezione",
      description:
        "Autorizzazione per l'utilizzo di apparecchiature radiologiche",
      isMandatory: true,
      hasExpiry: true,
      reminderDays: 90,
      legalReference: "D.Lgs. 101/2020",
      fileFormats: "PDF",
    },
    {
      scope: "STRUCTURE",
      category: "Radioprotezione",
      name: "Relazione Esperto Qualificato",
      description:
        "Relazione tecnica dell'esperto qualificato in radioprotezione",
      isMandatory: true,
      hasExpiry: true,
      reminderDays: 30,
      legalReference: "D.Lgs. 101/2020 art. 130",
      fileFormats: "PDF",
    },
    {
      scope: "STRUCTURE",
      category: "Radioprotezione",
      name: "Piano di Garanzia della Qualità (QA/QC)",
      description:
        "Piano per il controllo della qualità delle apparecchiature radiologiche",
      isMandatory: true,
      hasExpiry: false,
      legalReference: "D.Lgs. 101/2020",
      fileFormats: "PDF",
    },
    {
      scope: "STRUCTURE",
      category: "Assicurazioni",
      name: "Polizza RCT/O - Responsabilità Civile",
      description:
        "Assicurazione per responsabilità civile verso terzi e opere",
      isMandatory: true,
      hasExpiry: true,
      reminderDays: 30,
      legalReference: "Art. 2043 c.c.",
      fileFormats: "PDF",
    },
    {
      scope: "STRUCTURE",
      category: "Sanitario",
      name: "Autorizzazione Sanitaria",
      description:
        "Autorizzazione rilasciata dalla ASL per l'esercizio dell'attività sanitaria",
      isMandatory: true,
      hasExpiry: true,
      reminderDays: 60,
      legalReference: "D.P.R. 14/01/1997",
      fileFormats: "PDF",
    },
    {
      scope: "STRUCTURE",
      category: "Sanitario",
      name: "Accreditamento Regionale",
      description: "Accreditamento istituzionale presso il SSN/SSR",
      isMandatory: false,
      hasExpiry: true,
      reminderDays: 90,
      fileFormats: "PDF",
    },
    {
      scope: "STRUCTURE",
      category: "Privacy",
      name: "Registro Trattamenti Dati (GDPR)",
      description: "Registro delle attività di trattamento dei dati personali",
      isMandatory: true,
      hasExpiry: false,
      legalReference: "GDPR art. 30 - Reg. UE 2016/679",
      fileFormats: "PDF,DOC,DOCX",
    },
    {
      scope: "STRUCTURE",
      category: "Privacy",
      name: "DPIA - Valutazione Impatto Privacy",
      description:
        "Valutazione d'impatto sulla protezione dei dati per trattamenti a rischio elevato",
      isMandatory: false,
      hasExpiry: false,
      legalReference: "GDPR art. 35",
      fileFormats: "PDF,DOC,DOCX",
    },
    {
      scope: "STRUCTURE",
      category: "Ambiente e Rifiuti",
      name: "Registri Carico/Scarico Rifiuti",
      description: "Registro di carico e scarico dei rifiuti prodotti",
      isMandatory: true,
      hasExpiry: false,
      legalReference: "D.Lgs. 152/2006 art. 190",
      fileFormats: "PDF",
    },
    {
      scope: "STRUCTURE",
      category: "Impianti",
      name: "Certificato Impianto Elettrico",
      description:
        "Dichiarazione di conformità dell'impianto elettrico (DM 37/2008)",
      isMandatory: true,
      hasExpiry: false,
      legalReference: "DM 37/2008",
      fileFormats: "PDF",
    },
    {
      scope: "STRUCTURE",
      category: "Impianti",
      name: "Libretto Climatizzazione",
      description: "Libretto di impianto per climatizzazione estiva/invernale",
      isMandatory: true,
      hasExpiry: false,
      legalReference: "D.P.R. 74/2013",
      fileFormats: "PDF",
    },
  ];

  // Template documenti per PERSONE
  const personTemplates = [
    {
      scope: "PERSON" as const,
      category: "Assicurazioni",
      name: "Polizza RC Professionale",
      description:
        "Assicurazione per responsabilità civile professionale sanitaria",
      isMandatory: true,
      hasExpiry: true,
      reminderDays: 30,
      legalReference: "Legge 24/2017 (Legge Gelli-Bianco)",
      fileFormats: "PDF",
    },
    {
      scope: "PERSON",
      category: "Formazione Obbligatoria",
      name: "Attestato Formazione Sicurezza - Formazione Generale",
      description: "Formazione generale sulla sicurezza sul lavoro (4 ore)",
      isMandatory: true,
      hasExpiry: false,
      legalReference: "Accordo Stato-Regioni 21/12/2011",
      fileFormats: "PDF",
    },
    {
      scope: "PERSON",
      category: "Formazione Obbligatoria",
      name: "Attestato Formazione Sicurezza - Rischio Specifico",
      description: "Formazione specifica sui rischi dell'attività lavorativa",
      isMandatory: true,
      hasExpiry: true,
      reminderDays: 180,
      legalReference: "Accordo Stato-Regioni 21/12/2011",
      notes: "Aggiornamento quinquennale di 6 ore",
      fileFormats: "PDF",
    },
    {
      scope: "PERSON",
      category: "Formazione Obbligatoria",
      name: "Attestato RLS - Rappresentante Lavoratori Sicurezza",
      description:
        "Formazione per Rappresentante dei Lavoratori per la Sicurezza",
      isMandatory: false,
      hasExpiry: true,
      reminderDays: 90,
      legalReference: "D.Lgs. 81/2008 art. 37",
      notes: "Aggiornamento annuale",
      fileFormats: "PDF",
    },
    {
      scope: "PERSON",
      category: "Formazione Obbligatoria",
      name: "Attestato Addetto Antincendio",
      description: "Formazione per addetti alla prevenzione incendi",
      isMandatory: false,
      hasExpiry: true,
      reminderDays: 180,
      legalReference: "D.M. 02/09/2021",
      notes: "Aggiornamento quinquennale",
      fileFormats: "PDF",
    },
    {
      scope: "PERSON",
      category: "Formazione Obbligatoria",
      name: "Attestato Primo Soccorso",
      description: "Formazione per addetti al primo soccorso aziendale",
      isMandatory: false,
      hasExpiry: true,
      reminderDays: 90,
      legalReference: "D.M. 388/2003",
      notes: "Aggiornamento triennale",
      fileFormats: "PDF",
    },
    {
      scope: "PERSON",
      category: "Formazione Sanitaria",
      name: "ECM - Educazione Continua in Medicina",
      description: "Attestati corsi ECM per professionisti sanitari",
      isMandatory: true,
      hasExpiry: true,
      reminderDays: 180,
      legalReference: "D.Lgs. 502/1992",
      notes: "150 crediti ECM ogni 3 anni",
      fileFormats: "PDF",
    },
    {
      scope: "PERSON",
      category: "Formazione Sanitaria",
      name: "Attestato Radioprotezione per Operatori",
      description:
        "Corso di formazione in radioprotezione per lavoratori esposti",
      isMandatory: false,
      hasExpiry: true,
      reminderDays: 180,
      legalReference: "D.Lgs. 101/2020 art. 111",
      notes: "Aggiornamento quinquennale",
      fileFormats: "PDF",
    },
    {
      scope: "PERSON",
      category: "Sorveglianza Sanitaria",
      name: "Idoneità Sanitaria al Lavoro",
      description: "Certificato di idoneità rilasciato dal medico competente",
      isMandatory: true,
      hasExpiry: true,
      reminderDays: 30,
      legalReference: "D.Lgs. 81/2008 art. 41",
      notes: "Periodicità definita dal medico competente",
      fileFormats: "PDF",
    },
    {
      scope: "PERSON",
      category: "Sorveglianza Sanitaria",
      name: "Certificato Esposizione Raggi X",
      description:
        "Certificato sanitario per lavoratori esposti a radiazioni ionizzanti",
      isMandatory: false,
      hasExpiry: true,
      reminderDays: 90,
      legalReference: "D.Lgs. 101/2020",
      notes: "Controlli periodici secondo classificazione",
      fileFormats: "PDF",
    },
    {
      scope: "PERSON",
      category: "Privacy e GDPR",
      name: "Nomina Autorizzato Trattamento Dati",
      description:
        "Lettera di nomina come autorizzato al trattamento dati personali",
      isMandatory: true,
      hasExpiry: false,
      legalReference: "GDPR art. 29",
      fileFormats: "PDF,DOC,DOCX",
    },
    {
      scope: "PERSON",
      category: "Privacy e GDPR",
      name: "Attestato Formazione Privacy/GDPR",
      description: "Formazione sulla protezione dei dati personali",
      isMandatory: true,
      hasExpiry: true,
      reminderDays: 365,
      legalReference: "GDPR art. 32",
      notes: "Aggiornamento annuale consigliato",
      fileFormats: "PDF",
    },
    {
      scope: "PERSON",
      category: "Contrattuale",
      name: "Contratto di Lavoro",
      description: "Copia del contratto di lavoro firmato",
      isMandatory: true,
      hasExpiry: false,
      fileFormats: "PDF",
    },
    {
      scope: "PERSON",
      category: "Contrattuale",
      name: "Curriculum Vitae",
      description: "CV aggiornato del collaboratore",
      isMandatory: true,
      hasExpiry: false,
      fileFormats: "PDF,DOC,DOCX",
    },
    {
      scope: "PERSON",
      category: "Professionale",
      name: "Iscrizione Ordine Professionale",
      description: "Certificato di iscrizione all'Ordine/Albo professionale",
      isMandatory: true,
      hasExpiry: true,
      reminderDays: 60,
      legalReference: "D.Lgs. 233/1946 (Ordini e Collegi)",
      fileFormats: "PDF",
    },
    {
      scope: "PERSON",
      category: "Professionale",
      name: "Certificato Casellario Giudiziale",
      description: "Certificato penale del casellario giudiziale",
      isMandatory: false,
      hasExpiry: true,
      reminderDays: 180,
      notes: "Validità 6 mesi",
      fileFormats: "PDF",
    },
  ];

  // Inserisci i template per le strutture
  for (const template of structureTemplates) {
    await prisma.documentTemplate.upsert({
      where: {
        // Usiamo una combinazione di campi per identificare univocamente
        id: `struct_${template.name.toLowerCase().replace(/\s+/g, "_")}`,
      },
      update: {},
      create: {
        id: `struct_${template.name.toLowerCase().replace(/\s+/g, "_")}`,
        ownerType: "GLOBAL",
        scope: template.scope as any,
        category: template.category,
        name: template.name,
        description: template.description,
        isMandatory: template.isMandatory,
        hasExpiry: template.hasExpiry,
        legalReference: template.legalReference,
        fileFormats: template.fileFormats,
        reminderDays: template.reminderDays,
      },
    });
  }

  console.log(
    `✅ Created ${structureTemplates.length} structure document templates`,
  );

  // Inserisci i template per le persone
  for (const template of personTemplates) {
    await prisma.documentTemplate.upsert({
      where: {
        id: `person_${template.name.toLowerCase().replace(/\s+/g, "_")}`,
      },
      update: {},
      create: {
        id: `person_${template.name.toLowerCase().replace(/\s+/g, "_")}`,
        ownerType: "GLOBAL",
        scope: template.scope as any,
        category: template.category,
        name: template.name,
        description: template.description,
        isMandatory: template.isMandatory,
        hasExpiry: template.hasExpiry,
        legalReference: template.legalReference,
        fileFormats: template.fileFormats,
        reminderDays: template.reminderDays,
      },
    });
  }

  console.log(`✅ Created ${personTemplates.length} person document templates`);
  console.log("✨ Document templates seeding completed!");
}
