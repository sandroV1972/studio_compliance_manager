/**
 * Template Globali Corretti - Compliance Italiana
 *
 * Questo file contiene i template di deadline corretti in base all'analisi normativa
 * Riferimento: COMPLIANCE_ANALYSIS.md
 */

export const correctedGlobalTemplates = [
  // ========================================
  // TEMPLATE DA MODIFICARE (Correzioni Critiche)
  // ========================================

  // ❌ ERRORE #3: Formazione Antincendio - Frequenza Errata
  // VECCHIO: recurrenceEvery: 3 (DM 10/03/1998)
  // NUOVO: recurrenceEvery: 5 (DM 02/09/2021 - GSA)
  {
    scope: "PERSON" as const,
    complianceType: "TRAINING" as const,
    title: "Formazione antincendio GSA - Aggiornamento quinquennale",
    description:
      "Aggiornamento formazione addetti antincendio secondo DM 02/09/2021",
    recurrenceUnit: "YEAR" as const,
    recurrenceEvery: 5, // ✅ CORRETTO: era 3, ora 5 anni
    firstDueOffsetDays: 0,
    anchor: "ASSIGNMENT_START" as const,
    legalReference: "DM 02/09/2021 (ex DM 10/03/1998)",
    sourceUrl: "https://www.vigilfuoco.it/aspx/page.aspx?IdPage=9621",
    country: "IT",
    notes:
      "Frequenza aggiornamento: 5 anni per tutti i livelli di rischio (1-2-3). Durata corso varia per livello: L1=2h, L2=5h, L3=8h.",
    requiredDocumentName: "Attestato aggiornamento antincendio GSA",
  },

  // ❌ ERRORE #6: Prova Evacuazione - Frequenza Annuale → Semestrale
  {
    scope: "STRUCTURE" as const,
    complianceType: "INSPECTION" as const,
    title: "Prova di evacuazione",
    description: "Simulazione evacuazione in caso di emergenza",
    recurrenceUnit: "MONTH" as const, // ✅ CORRETTO: da YEAR a MONTH
    recurrenceEvery: 6, // ✅ CORRETTO: 2 prove all'anno
    firstDueOffsetDays: 0,
    anchor: "LAST_COMPLETION" as const,
    legalReference: "D.M. 18/09/2002, DM 02/09/2021",
    sourceUrl: "https://www.vigilfuoco.it/",
    country: "IT",
    notes:
      "Frequenza semestrale (2 prove/anno) obbligatoria per strutture sanitarie e socio-sanitarie. Verificare normativa specifica per altre attività.",
    requiredDocumentName: "Verbale prova evacuazione",
  },

  // ❌ ERRORE #1: GDPR DPIA - Annuale → Biennale
  {
    scope: "STRUCTURE" as const,
    complianceType: "DATA_PROTECTION" as const,
    title: "GDPR - Valutazione Impatto Privacy (DPIA)",
    description: "Valutazione d'impatto sulla protezione dei dati personali",
    recurrenceUnit: "YEAR" as const,
    recurrenceEvery: 2, // ✅ CORRETTO: da 1 a 2 anni
    firstDueOffsetDays: 0,
    anchor: "LAST_COMPLETION" as const,
    legalReference: "Art. 35 GDPR (Reg. UE 2016/679)",
    sourceUrl: "https://www.garanteprivacy.it/regolamentoue",
    country: "IT",
    notes:
      "DPIA obbligatoria per trattamenti ad alto rischio. Revisione consigliata ogni 2 anni o quando cambiano significativamente i processi di trattamento dati.",
    requiredDocumentName: "Documento DPIA aggiornato",
  },

  // ❌ ERRORE #8: Visita Medica Periodica - Aggiornare note
  {
    scope: "PERSON" as const,
    complianceType: "OTHER" as const, // Non esiste HEALTH in enum
    title: "Visita medica periodica di sorveglianza sanitaria",
    description: "Sorveglianza sanitaria lavoratori esposti a rischi",
    recurrenceUnit: "YEAR" as const,
    recurrenceEvery: 1,
    firstDueOffsetDays: 0,
    anchor: "LAST_COMPLETION" as const,
    legalReference: "D.Lgs. 81/08 art. 41",
    sourceUrl:
      "https://www.inail.it/cs/internet/attivita/prevenzione-e-sicurezza/promozione-e-cultura-della-prevenzione/asseverazione-buone-prassi.html",
    country: "IT",
    notes:
      "Frequenza stabilita dal Medico Competente in base al rischio: annuale (rischio generico, radiazioni), biennale (videoterminali <50 anni, lavoro notturno), post-espositiva (amianto 10 anni). Il MC può modificare la periodicità.",
    requiredDocumentName: "Giudizio di idoneità alla mansione",
  },

  // ❌ ERRORE #9: DVR - Troppo frequente (annuale → biennale)
  {
    scope: "STRUCTURE" as const,
    complianceType: "DOCUMENT" as const,
    title: "Revisione DVR (Documento Valutazione Rischi)",
    description: "Revisione del Documento di Valutazione dei Rischi",
    recurrenceUnit: "YEAR" as const,
    recurrenceEvery: 2, // ✅ CORRETTO: da 1 a 2 anni (best practice)
    firstDueOffsetDays: 0,
    anchor: "LAST_COMPLETION" as const,
    legalReference: "D.Lgs. 81/08 art. 17, 28, 29",
    sourceUrl:
      "https://www.inail.it/cs/internet/attivita/prevenzione-e-sicurezza.html",
    country: "IT",
    notes:
      "Revisione obbligatoria in caso di: modifiche processo produttivo, infortuni significativi, nuove attrezzature/sostanze, esiti sorveglianza sanitaria. Revisione biennale consigliata come best practice.",
    requiredDocumentName: "DVR aggiornato con data e firma RSPP/Datore",
  },

  // ❌ ERRORE #16: ECM - Triennio obsoleto
  {
    scope: "PERSON" as const,
    complianceType: "TRAINING" as const,
    title: "Crediti ECM - Triennio 2023-2025",
    description: "Completamento crediti formativi ECM del triennio in corso",
    recurrenceUnit: "YEAR" as const,
    recurrenceEvery: 3,
    firstDueOffsetDays: 0,
    anchor: "LAST_COMPLETION" as const,
    legalReference: "Accordo Stato-Regioni 02/02/2017",
    sourceUrl: "https://ape.agenas.it/",
    country: "IT",
    notes:
      "Obbligo per professionisti sanitari: 150 crediti ECM per triennio (50/anno). Il triennio attuale è 2023-2025. Verificare eventuali esoneri/riduzioni per specifiche categorie.",
    requiredDocumentName: "Attestati ECM (min. 150 crediti triennio)",
  },

  // ========================================
  // TEMPLATE DA DIVIDERE
  // ========================================

  // ❌ ERRORE #2: Impianto Elettrico - DIVIDERE in 2 template
  // Template 1: Messa a Terra
  {
    scope: "STRUCTURE" as const,
    complianceType: "INSPECTION" as const,
    title: "Verifica impianto di messa a terra",
    description:
      "Verifica periodica dell'impianto di protezione contro le scariche atmosferiche e messa a terra",
    recurrenceUnit: "YEAR" as const,
    recurrenceEvery: 2, // ✅ 2 anni per strutture sanitarie
    firstDueOffsetDays: 0,
    anchor: "LAST_COMPLETION" as const,
    legalReference: "DPR 462/01, D.Lgs. 81/08 art. 86",
    sourceUrl:
      "https://www.inail.it/cs/internet/attivita/prevenzione-e-sicurezza.html",
    country: "IT",
    notes:
      "Frequenza: 2 anni per strutture sanitarie, 5 anni per altre attività. Verifica da ente abilitato (ARPA, organismi notificati).",
    requiredDocumentName: "Verbale di verifica messa a terra",
  },

  // Template 2: Impianto Elettrico Generale
  {
    scope: "STRUCTURE" as const,
    complianceType: "INSPECTION" as const,
    title: "Verifica impianto elettrico (DM 37/08)",
    description:
      "Verifica periodica di sicurezza dell'impianto elettrico generale",
    recurrenceUnit: "YEAR" as const,
    recurrenceEvery: 5,
    firstDueOffsetDays: 0,
    anchor: "LAST_COMPLETION" as const,
    legalReference: "DM 37/2008, D.Lgs. 81/08 art. 80-86",
    sourceUrl:
      "https://www.inail.it/cs/internet/attivita/prevenzione-e-sicurezza.html",
    country: "IT",
    notes:
      "Verifica di conformità e sicurezza dell'impianto elettrico. Frequenza: 5 anni per strutture sanitarie standard.",
    requiredDocumentName: "Dichiarazione di conformità impianto elettrico",
  },

  // ❌ ERRORE #7: Estintori - DIVIDERE in 3 template
  // Template 1: Sorveglianza Mensile
  {
    scope: "STRUCTURE" as const,
    complianceType: "INSPECTION" as const,
    title: "Sorveglianza estintori (mensile)",
    description:
      "Controllo visivo estintori: accessibilità, integrità, presenza cartellino",
    recurrenceUnit: "MONTH" as const,
    recurrenceEvery: 1,
    firstDueOffsetDays: 0,
    anchor: "LAST_COMPLETION" as const,
    legalReference: "UNI 9994-1:2013, D.M. 20/12/2012",
    sourceUrl: "https://www.vigilfuoco.it/",
    country: "IT",
    notes:
      "Controllo mensile da parte dell'utente o incaricato interno. Verificare: accessibilità, segnaletica, integrità fisica, presenza cartellino.",
    requiredDocumentName: "Registro controlli estintori",
  },

  // Template 2: Controllo Periodico Semestrale
  {
    scope: "STRUCTURE" as const,
    complianceType: "INSPECTION" as const,
    title: "Controllo periodico estintori (semestrale)",
    description:
      "Verifica tecnica semestrale estintori da parte di tecnico qualificato",
    recurrenceUnit: "MONTH" as const,
    recurrenceEvery: 6,
    firstDueOffsetDays: 0,
    anchor: "LAST_COMPLETION" as const,
    legalReference: "UNI 9994-1:2013, D.M. 20/12/2012",
    sourceUrl: "https://www.vigilfuoco.it/",
    country: "IT",
    notes:
      "Controllo tecnico semestrale obbligatorio da ditta abilitata. Include: verifica pressione, pesatura, controllo componenti, aggiornamento cartellino.",
    requiredDocumentName: "Rapporto controllo periodico estintori",
  },

  // Template 3: Revisione
  {
    scope: "STRUCTURE" as const,
    complianceType: "INSPECTION" as const,
    title: "Revisione estintori",
    description: "Revisione completa con smontaggio e verifica interna",
    recurrenceUnit: "YEAR" as const,
    recurrenceEvery: 5,
    firstDueOffsetDays: 0,
    anchor: "LAST_COMPLETION" as const,
    legalReference: "UNI 9994-1:2013",
    sourceUrl: "https://www.vigilfuoco.it/",
    country: "IT",
    notes:
      "Revisione con smontaggio: 3 anni (polvere/CO2), 5 anni (idrico), 6 anni (halocarbon). Include sostituzione agente estinguente.",
    requiredDocumentName: "Rapporto di revisione estintori",
  },

  // ========================================
  // NUOVI TEMPLATE DA AGGIUNGERE
  // ========================================

  // NUOVO #4: Sorveglianza Fisica Radioprotezione
  {
    scope: "STRUCTURE" as const,
    complianceType: "INSPECTION" as const,
    title: "Sorveglianza fisica della protezione radiologica",
    description:
      "Esame periodico della sorveglianza fisica da parte dell'Esperto di Radioprotezione",
    recurrenceUnit: "YEAR" as const,
    recurrenceEvery: 1,
    firstDueOffsetDays: 0,
    anchor: "LAST_COMPLETION" as const,
    legalReference: "D.Lgs. 101/2020 art. 132",
    sourceUrl: "https://www.gazzettaufficiale.it/eli/id/2020/08/12/20G00121/sg",
    country: "IT",
    notes:
      "Frequenza annuale per apparecchiature diagnostiche. Può essere semestrale per radioterapia o acceleratori lineari. L'Esperto di Radioprotezione verifica dosimetria, zonizzazione e procedure.",
    requiredDocumentName: "Relazione sorveglianza fisica",
  },

  // NUOVO #10: Verifica Registrazioni HACCP
  {
    scope: "STRUCTURE" as const,
    complianceType: "DOCUMENT" as const,
    title: "Verifica registrazioni HACCP",
    description:
      "Controllo periodico delle registrazioni di autocontrollo HACCP",
    recurrenceUnit: "MONTH" as const,
    recurrenceEvery: 1,
    firstDueOffsetDays: 0,
    anchor: "LAST_COMPLETION" as const,
    legalReference: "Reg. CE 852/2004",
    sourceUrl:
      "https://eur-lex.europa.eu/legal-content/IT/TXT/?uri=CELEX:32004R0852",
    country: "IT",
    notes:
      "Verifica mensile delle registrazioni HACCP: temperature, sanificazioni, check-list. Le registrazioni giornaliere sono a carico del personale.",
    requiredDocumentName: "Registro verifiche HACCP",
  },

  // NUOVO #15: Registro Trattamenti GDPR
  {
    scope: "STRUCTURE" as const,
    complianceType: "DATA_PROTECTION" as const,
    title: "Aggiornamento Registro Trattamenti GDPR",
    description:
      "Revisione e aggiornamento del Registro delle attività di trattamento",
    recurrenceUnit: "YEAR" as const,
    recurrenceEvery: 1,
    firstDueOffsetDays: 0,
    anchor: "LAST_COMPLETION" as const,
    legalReference: "Art. 30 GDPR (Reg. UE 2016/679)",
    sourceUrl: "https://www.garanteprivacy.it/regolamentoue",
    country: "IT",
    notes:
      "Obbligatorio per aziende >250 dipendenti o che trattano dati sensibili/sanitari. Deve contenere: finalità, categorie di interessati, categorie di dati, destinatari, trasferimenti extra-UE, misure di sicurezza.",
    requiredDocumentName: "Registro delle attività di trattamento GDPR",
  },

  // NUOVO #18: Aggiornamento Preposti
  {
    scope: "PERSON" as const,
    complianceType: "TRAINING" as const,
    title: "Aggiornamento preposti",
    description: "Aggiornamento biennale per preposti alla sicurezza",
    recurrenceUnit: "YEAR" as const,
    recurrenceEvery: 2,
    firstDueOffsetDays: 0,
    anchor: "LAST_COMPLETION" as const,
    legalReference: "Accordo Stato-Regioni 21/12/2011, D.Lgs. 81/08 art. 37",
    sourceUrl: "https://www.gazzettaufficiale.it/eli/id/2012/01/11/12A00108/sg",
    country: "IT",
    notes:
      "Aggiornamento obbligatorio: 6 ore ogni 2 anni per preposti. Per dirigenti: 6 ore ogni 5 anni.",
    requiredDocumentName: "Attestato aggiornamento preposto",
  },

  // ========================================
  // TEMPLATE UNA TANTUM (recurrenceUnit: null)
  // ========================================

  // NUOVO #21: Formazione Generale Lavoratori (Una Tantum)
  {
    scope: "PERSON" as const,
    complianceType: "TRAINING" as const,
    title: "Formazione generale lavoratori (4 ore)",
    description:
      "Corso di formazione generale sulla sicurezza - obbligatorio per tutti i lavoratori",
    recurrenceUnit: null, // ✅ UNA TANTUM
    recurrenceEvery: null,
    firstDueOffsetDays: 60,
    anchor: "HIRE_DATE" as const,
    legalReference: "D.Lgs. 81/08 art. 37, Acc. SR 21/12/2011",
    sourceUrl: "https://www.gazzettaufficiale.it/eli/id/2012/01/11/12A00108/sg",
    country: "IT",
    notes:
      "Formazione generale 4 ore obbligatoria per tutti i neoassunti entro 60 giorni. Valida per sempre, non ha scadenza di aggiornamento.",
    requiredDocumentName: "Attestato formazione generale lavoratori",
  },

  // NUOVO #22: Formazione Specifica Lavoratori - Rischio MEDIO (Una Tantum)
  {
    scope: "PERSON" as const,
    complianceType: "TRAINING" as const,
    title: "Formazione specifica lavoratori - Rischio MEDIO (8h)",
    description:
      "Corso di formazione specifica per settore sanitario a rischio medio",
    recurrenceUnit: null, // ✅ UNA TANTUM
    recurrenceEvery: null,
    firstDueOffsetDays: 60,
    anchor: "HIRE_DATE" as const,
    legalReference: "D.Lgs. 81/08 art. 37, Acc. SR 21/12/2011",
    sourceUrl: "https://www.gazzettaufficiale.it/eli/id/2012/01/11/12A00108/sg",
    country: "IT",
    notes:
      "Formazione specifica 8 ore per rischio medio (studi medici/odontoiatrici). Aggiornamento: 6 ore ogni 5 anni.",
    requiredDocumentName: "Attestato formazione specifica rischio medio",
  },

  // NUOVO #22b: Aggiornamento Formazione Specifica (Ricorrente)
  {
    scope: "PERSON" as const,
    complianceType: "TRAINING" as const,
    title: "Aggiornamento formazione specifica lavoratori (6h)",
    description: "Aggiornamento quinquennale formazione specifica",
    recurrenceUnit: "YEAR" as const,
    recurrenceEvery: 5,
    firstDueOffsetDays: 0,
    anchor: "LAST_COMPLETION" as const,
    legalReference: "D.Lgs. 81/08 art. 37, Acc. SR 21/12/2011",
    sourceUrl: "https://www.gazzettaufficiale.it/eli/id/2012/01/11/12A00108/sg",
    country: "IT",
    notes:
      "Aggiornamento obbligatorio 6 ore ogni 5 anni per tutti i livelli di rischio.",
    requiredDocumentName: "Attestato aggiornamento formazione specifica",
  },

  // NUOVO #5: Corso RLS Base (Una Tantum)
  {
    scope: "PERSON" as const,
    complianceType: "TRAINING" as const,
    title: "Corso RLS base (32 ore)",
    description:
      "Corso base per Rappresentante Lavoratori per la Sicurezza - aziende < 50 dipendenti",
    recurrenceUnit: null, // ✅ UNA TANTUM
    recurrenceEvery: null,
    firstDueOffsetDays: 0,
    anchor: "ASSIGNMENT_START" as const,
    legalReference: "D.Lgs. 81/08 art. 37 c.11",
    sourceUrl: "https://www.gazzettaufficiale.it/eli/id/2012/01/11/12A00108/sg",
    country: "IT",
    notes:
      "Corso base 32 ore per aziende con meno di 50 dipendenti. Per aziende ≥50 dipendenti: 44 ore totali (32+12). Una tantum all'assegnazione del ruolo.",
    requiredDocumentName: "Attestato corso RLS base",
  },

  // NUOVO #23: Corso RSPP Base (Una Tantum)
  {
    scope: "PERSON" as const,
    complianceType: "TRAINING" as const,
    title: "Corso RSPP Datore di Lavoro - Rischio MEDIO (32h)",
    description:
      "Corso base per Datori di Lavoro che svolgono il ruolo di RSPP - settore sanitario",
    recurrenceUnit: null, // ✅ UNA TANTUM
    recurrenceEvery: null,
    firstDueOffsetDays: 0,
    anchor: "ASSIGNMENT_START" as const,
    legalReference: "D.Lgs. 81/08 art. 34, Acc. SR 07/07/2016",
    sourceUrl:
      "https://www.gazzettaufficiale.it/eli/gu/2016/07/19/166/so/27/sg/pdf",
    country: "IT",
    notes:
      "Corso base 32 ore per RSPP Datore di Lavoro settore sanitario (rischio medio). Aggiornamento: 10 ore ogni 5 anni.",
    requiredDocumentName: "Attestato corso RSPP Datore di Lavoro",
  },

  // NUOVO #24: Corso Preposto Base (Una Tantum)
  {
    scope: "PERSON" as const,
    complianceType: "TRAINING" as const,
    title: "Corso Preposto base (8h)",
    description: "Corso base per Preposti alla sicurezza",
    recurrenceUnit: null, // ✅ UNA TANTUM
    recurrenceEvery: null,
    firstDueOffsetDays: 0,
    anchor: "ASSIGNMENT_START" as const,
    legalReference: "D.Lgs. 81/08 art. 37, Acc. SR 21/12/2011",
    sourceUrl: "https://www.gazzettaufficiale.it/eli/id/2012/01/11/12A00108/sg",
    country: "IT",
    notes:
      "Corso base 8 ore obbligatorio per Preposti. Aggiornamento: 6 ore ogni 2 anni (template separato).",
    requiredDocumentName: "Attestato corso Preposto",
  },

  // NUOVO #25: Corso Primo Soccorso Base (Una Tantum)
  {
    scope: "PERSON" as const,
    complianceType: "TRAINING" as const,
    title: "Corso Primo Soccorso base - Gruppo A (16h)",
    description:
      "Corso base per Addetti al Primo Soccorso - aziende Gruppo A (sanitario)",
    recurrenceUnit: null, // ✅ UNA TANTUM
    recurrenceEvery: null,
    firstDueOffsetDays: 0,
    anchor: "ASSIGNMENT_START" as const,
    legalReference: "D.Lgs. 81/08 art. 45, DM 388/2003",
    sourceUrl: "https://www.gazzettaufficiale.it/eli/id/2003/08/03/003G0408/sg",
    country: "IT",
    notes:
      "Corso base 16 ore per Gruppo A (aziende >5 dipendenti settore sanitario). Aggiornamento: 6 ore ogni 3 anni.",
    requiredDocumentName: "Attestato corso Primo Soccorso Gruppo A",
  },

  // NUOVO #26: Visita Medica Preassuntiva (Una Tantum)
  {
    scope: "PERSON" as const,
    complianceType: "OTHER" as const, // Non esiste HEALTH in enum
    title: "Visita medica preassuntiva",
    description: "Visita medica preassuntiva per idoneità alla mansione",
    recurrenceUnit: null, // ✅ UNA TANTUM
    recurrenceEvery: null,
    firstDueOffsetDays: -7, // 7 giorni PRIMA dell'assunzione
    anchor: "HIRE_DATE" as const,
    legalReference: "D.Lgs. 81/08 art. 41",
    sourceUrl:
      "https://www.inail.it/cs/internet/attivita/prevenzione-e-sicurezza.html",
    country: "IT",
    notes:
      "Visita medica obbligatoria PRIMA dell'assunzione per mansioni soggette a sorveglianza sanitaria. Il Medico Competente rilascia giudizio di idoneità.",
    requiredDocumentName: "Giudizio di idoneità preassuntiva",
  },
];
