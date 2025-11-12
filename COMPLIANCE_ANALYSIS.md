# Analisi Normativa - Global Deadline Templates

## Executive Summary

Questa analisi verifica la correttezza normativa dei 32 template globali di scadenze rispetto alla legislazione italiana vigente. Sono stati identificati **8 errori critici** e **12 miglioramenti consigliati**.

---

## 🚨 Errori Critici da Correggere

### 1. ❌ GDPR DPIA - Frequenza Annuale Non Richiesta

**Template Attuale:**

```typescript
{
  title: "GDPR - Valutazione Impatto Privacy (DPIA)",
  recurrenceUnit: "YEAR",
  recurrenceEvery: 1,
  anchor: "LAST_COMPLETION"
}
```

**Problema:** La DPIA non è obbligatoria annualmente per legge.

**Normativa:** Art. 35 GDPR (Regolamento UE 2016/679)

- DPIA obbligatoria SOLO per trattamenti ad alto rischio
- Revisione necessaria quando:
  - Cambiano i processi
  - Emergono nuove minacce
  - Ogni 2-3 anni come best practice

**Correzione Suggerita:**

```typescript
{
  title: "GDPR - Valutazione Impatto Privacy (DPIA)",
  recurrenceUnit: "YEAR",
  recurrenceEvery: 2,  // Cambio da 1 a 2 anni
  anchor: "LAST_COMPLETION",
  notes: "DPIA obbligatoria per trattamenti ad alto rischio. Revisione consigliata ogni 2 anni o quando cambiano significativamente i processi di trattamento dati."
}
```

---

### 2. ❌ Impianto Elettrico ≠ Messa a Terra

**Template Attuale (ERRATO):**

```typescript
{
  title: "Impianto elettrico - Verifica periodica",
  description: "Verifica periodica impianto elettrico e messa a terra",
  recurrenceUnit: "YEAR",
  recurrenceEvery: 5,
  legalReference: "DPR 462/01"
}
```

**Problema:** Sono DUE obblighi SEPARATI con frequenze e normative diverse.

**Normativa:**

- **DPR 462/2001**: Verifica impianto messa a terra
- **DM 37/2008**: Conformità impianti elettrici
- **D.Lgs. 81/2008 art. 86**: Manutenzione impianti elettrici

**Frequenze Diverse:**

| Tipo Struttura                | Messa a Terra | Impianto Elettrico |
| ----------------------------- | ------------- | ------------------ |
| Strutture mediche             | 2 anni        | 5 anni             |
| Luoghi con rischio esplosione | 2 anni        | 2 anni             |
| Cantieri                      | Annuale       | Annuale            |
| Altre attività                | 5 anni        | 5 anni             |

**Correzione Suggerita: DIVIDERE IN 2 TEMPLATE**

**Template 1 - Messa a Terra:**

```typescript
{
  scope: "STRUCTURE",
  complianceType: "INSPECTION",
  title: "Verifica impianto di messa a terra",
  description: "Verifica periodica dell'impianto di protezione contro le scariche atmosferiche e messa a terra",
  recurrenceUnit: "YEAR",
  recurrenceEvery: 2,  // Per strutture sanitarie
  anchor: "LAST_COMPLETION",
  legalReference: "DPR 462/01, D.Lgs. 81/08 art. 86",
  notes: "Frequenza: 2 anni per strutture sanitarie, 5 anni per altre attività. Verifica da ente abilitato (ARPA, organismi notificati).",
  requiredDocumentName: "Verbale di verifica messa a terra",
  regions: null,  // Nazionale
}
```

**Template 2 - Impianto Elettrico:**

```typescript
{
  scope: "STRUCTURE",
  complianceType: "INSPECTION",
  title: "Verifica impianto elettrico (DM 37/08)",
  description: "Verifica periodica di sicurezza dell'impianto elettrico generale",
  recurrenceUnit: "YEAR",
  recurrenceEvery: 5,
  anchor: "LAST_COMPLETION",
  legalReference: "DM 37/2008, D.Lgs. 81/08 art. 80-86",
  notes: "Verifica di conformità e sicurezza dell'impianto elettrico. Frequenza: 5 anni per strutture sanitarie standard.",
  requiredDocumentName: "Dichiarazione di conformità impianto elettrico",
  regions: null,
}
```

---

### 3. ❌ Formazione Antincendio - Frequenza Errata

**Template Attuale:**

```typescript
{
  title: "Formazione antincendio",
  recurrenceUnit: "YEAR",
  recurrenceEvery: 3,
  legalReference: "D.M. 10/03/1998"
}
```

**Problema:** La normativa è stata AGGIORNATA nel 2022.

**Nuova Normativa:** DM 2 settembre 2021 (GSA - Gestione Sicurezza Antincendio)

**Nuove Frequenze:**

- **Rischio basso (livello 1):** 5 anni
- **Rischio medio (livello 2):** 5 anni
- **Rischio alto (livello 3):** 5 anni
- **AGGIORNAMENTO obbligatorio:** 5 anni

**Correzione Suggerita:**

```typescript
{
  scope: "PERSON",
  complianceType: "TRAINING",
  title: "Formazione antincendio GSA",
  description: "Corso di formazione per addetti antincendio secondo DM 02/09/2021",
  recurrenceUnit: "YEAR",
  recurrenceEvery: 5,  // Cambio da 3 a 5 anni
  anchor: "LAST_COMPLETION",
  legalReference: "DM 02/09/2021 (ex DM 10/03/1998)",
  notes: "Frequenza aggiornamento: 5 anni per tutti i livelli di rischio (1-2-3). Durata corso varia per livello: L1=4h, L2=8h, L3=16h.",
  requiredDocumentName: "Attestato formazione antincendio",
  regions: null,
}
```

---

### 4. ❌ Radioprotezione - Manca Template per Sorveglianza Fisica

**Template Esistenti:**

- ✅ Formazione Esperto Qualificato (6 anni)
- ✅ Corso radioprotezione lavoratori (5 anni)
- ❌ **MANCA: Sorveglianza Fisica Protezione Radiologica**

**Normativa:** D.Lgs. 101/2020 art. 132

**Obbligo:** Esame della Sorveglianza Fisica da parte dell'Esperto di Radioprotezione

**Frequenze:**

- **Apparecchiature diagnostiche:** Annuale
- **Acceleratori lineari/radioterapia:** Semestrale o annuale
- **Sorgenti sigillate:** Variabile in base all'attività

**Nuovo Template da Aggiungere:**

```typescript
{
  scope: "STRUCTURE",
  complianceType: "INSPECTION",
  title: "Sorveglianza fisica della protezione radiologica",
  description: "Esame periodico della sorveglianza fisica da parte dell'Esperto di Radioprotezione",
  recurrenceUnit: "YEAR",
  recurrenceEvery: 1,
  anchor: "LAST_COMPLETION",
  legalReference: "D.Lgs. 101/2020 art. 132",
  notes: "Frequenza annuale per apparecchiature diagnostiche. Può essere semestrale per radioterapia o acceleratori lineari. L'Esperto di Radioprotezione verifica dosimetria, zonizzazione e procedure.",
  requiredDocumentName: "Relazione sorveglianza fisica",
  regions: null,
}
```

---

### 5. ⚠️ Corso RLS - Separare Base da Aggiornamento

**Template Attuale:**

```typescript
{
  title: "Corso RLS (Rappresentante Lavoratori Sicurezza)",
  description: "Corso base 32 ore",
  recurrenceUnit: "YEAR",
  recurrenceEvery: 1,  // Solo aggiornamento
}
```

**Problema:** Il template attuale copre solo l'aggiornamento, manca il corso BASE (una tantum).

**Normativa:** D.Lgs. 81/2008 art. 37 comma 11

**Durate Corrette:**

- **Corso base:** 32 ore (aziende <50 dip.) o 44 ore (aziende ≥50 dip.)
- **Aggiornamento annuale:** 4 ore (<50 dip.) o 8 ore (≥50 dip.)

**Correzione Suggerita: AGGIUNGERE template corso base**

**Template 1 - Corso Base (DA AGGIUNGERE):**

```typescript
{
  scope: "PERSON",
  complianceType: "TRAINING",
  title: "Corso RLS base (32 ore)",
  description: "Corso base per Rappresentante Lavoratori per la Sicurezza - aziende < 50 dipendenti",
  recurrenceUnit: null,  // ✅ Una tantum - NON ricorrente
  recurrenceEvery: null,
  anchor: "ASSIGNMENT_START",  // Si attiva quando viene assegnato il ruolo RLS
  legalReference: "D.Lgs. 81/08 art. 37 c.11",
  notes: "Corso base 32 ore per aziende con meno di 50 dipendenti. Per aziende ≥50 dipendenti: 44 ore totali (32+12). Una tantum all'assegnazione del ruolo.",
  requiredDocumentName: "Attestato corso RLS base",
}
```

**Template 2 - Aggiornamento (quello esistente è CORRETTO):**

```typescript
{
  scope: "PERSON",
  complianceType: "TRAINING",
  title: "Aggiornamento RLS annuale",
  description: "Aggiornamento annuale per RLS",
  recurrenceUnit: "YEAR",
  recurrenceEvery: 1,
  anchor: "LAST_COMPLETION",
  legalReference: "D.Lgs. 81/08 art. 37 c.11",
  notes: "Aggiornamento annuale: 4 ore per aziende <50 dipendenti, 8 ore per aziende ≥50 dipendenti.",
  requiredDocumentName: "Attestato aggiornamento RLS",
}
```

**Nota:** Il corso BASE usa `recurrenceUnit: null` perché è una tantum (si fa solo quando viene nominato RLS). L'aggiornamento è annuale ricorrente.

---

### 6. ❌ Prova Evacuazione - Frequenza Non Definita

**Template Attuale:**

```typescript
{
  title: "Prova di evacuazione",
  description: "Simulazione evacuazione in caso di emergenza",
  recurrenceUnit: "YEAR",
  recurrenceEvery: 1,
  legalReference: "D.Lgs. 81/08"
}
```

**Problema:** La frequenza SEMESTRALE (2 volte/anno) è obbligatoria per molte strutture.

**Normativa:**

- **D.M. 26/08/1992:** Scuole - 2 prove/anno
- **D.M. 18/09/2002:** Strutture sanitarie - 2 prove/anno
- **DM 02/09/2021:** Attività soggette a CPI - almeno 1 prova/anno

**Correzione Suggerita:**

```typescript
{
  scope: "STRUCTURE",
  complianceType: "INSPECTION",
  title: "Prova di evacuazione",
  description: "Simulazione evacuazione in caso di emergenza",
  recurrenceUnit: "MONTH",  // Cambio da YEAR a MONTH
  recurrenceEvery: 6,        // 2 prove all'anno
  anchor: "LAST_COMPLETION",
  legalReference: "D.M. 18/09/2002, DM 02/09/2021",
  notes: "Frequenza semestrale (2 prove/anno) obbligatoria per strutture sanitarie e socio-sanitarie. Verificare normativa specifica per altre attività.",
  requiredDocumentName: "Verbale prova evacuazione",
  regions: null,
}
```

---

### 7. ❌ Estintori - Controllo Periodico NON È SOLO ANNUALE

**Template Attuale:**

```typescript
{
  title: "Verifica estintori",
  description: "Controllo e manutenzione estintori",
  recurrenceUnit: "YEAR",
  recurrenceEvery: 1,
  legalReference: "UNI 9994-1"
}
```

**Problema:** Ci sono DUE tipi di controllo con frequenze diverse.

**Normativa:** UNI 9994-1:2013 + D.M. 20/12/2012

**Tipi di Controllo:**

1. **Sorveglianza (controllo visivo):** MENSILE (dall'utente)
2. **Controllo periodico (tecnico):** SEMESTRALE (da tecnico)
3. **Revisione (smontaggio):** VARIABILE (3-5 anni)
4. **Collaudo (prova pressione):** 12 anni

**Correzione Suggerita: CREARE 3 TEMPLATE SEPARATI**

**Template 1 - Sorveglianza Mensile:**

```typescript
{
  scope: "STRUCTURE",
  complianceType: "INSPECTION",
  title: "Sorveglianza estintori (mensile)",
  description: "Controllo visivo estintori: accessibilità, integrità, presenza cartellino",
  recurrenceUnit: "MONTH",
  recurrenceEvery: 1,
  anchor: "LAST_COMPLETION",
  legalReference: "UNI 9994-1:2013, D.M. 20/12/2012",
  notes: "Controllo mensile da parte dell'utente o incaricato interno. Verificare: accessibilità, segnaletica, integrità fisica, presenza cartellino.",
  requiredDocumentName: "Registro controlli estintori",
}
```

**Template 2 - Controllo Periodico Semestrale:**

```typescript
{
  scope: "STRUCTURE",
  complianceType: "INSPECTION",
  title: "Controllo periodico estintori (semestrale)",
  description: "Verifica tecnica semestrale estintori da parte di tecnico qualificato",
  recurrenceUnit: "MONTH",
  recurrenceEvery: 6,  // Semestrale
  anchor: "LAST_COMPLETION",
  legalReference: "UNI 9994-1:2013, D.M. 20/12/2012",
  notes: "Controllo tecnico semestrale obbligatorio da ditta abilitata. Include: verifica pressione, pesatura, controllo componenti, aggiornamento cartellino.",
  requiredDocumentName: "Rapporto controllo periodico estintori",
}
```

**Template 3 - Revisione (da aggiungere):**

```typescript
{
  scope: "STRUCTURE",
  complianceType: "INSPECTION",
  title: "Revisione estintori",
  description: "Revisione completa con smontaggio e verifica interna",
  recurrenceUnit: "YEAR",
  recurrenceEvery: 5,  // Varia per tipo
  anchor: "LAST_COMPLETION",
  legalReference: "UNI 9994-1:2013",
  notes: "Revisione con smontaggio: 3 anni (polvere/CO2), 5 anni (idrico), 6 anni (halocarbon). Include sostituzione agente estinguente.",
  requiredDocumentName: "Rapporto di revisione estintori",
}
```

---

### 8. ❌ Sorveglianza Sanitaria - Periodicità Generica

**Template Attuale:**

```typescript
{
  title: "Visita medica periodica",
  description: "Sorveglianza sanitaria lavoratori",
  recurrenceUnit: "YEAR",
  recurrenceEvery: 1,
  legalReference: "D.Lgs. 81/08 art. 41"
}
```

**Problema:** La frequenza varia significativamente per tipo di rischio.

**Normativa:** D.Lgs. 81/2008 art. 41

**Frequenze per Rischio:**

- **Rischio generico:** Annuale
- **Radiazioni ionizzanti:** Annuale + controlli straordinari
- **Movimentazione manuale carichi:** Annuale
- **Videoterminali:** 2 anni (5 anni se <50 anni e idoneità)
- **Notturni:** Biennale (annuale >50 anni)
- **Amianto:** Annuale + 10 anni post-esposizione

**Correzione Suggerita:** Modificare il note per chiarire la variabilità

```typescript
{
  scope: "PERSON",
  complianceType: "HEALTH",
  title: "Visita medica periodica di sorveglianza sanitaria",
  description: "Sorveglianza sanitaria lavoratori esposti a rischi",
  recurrenceUnit: "YEAR",
  recurrenceEvery: 1,  // Default annuale
  anchor: "LAST_COMPLETION",
  legalReference: "D.Lgs. 81/08 art. 41",
  notes: "Frequenza stabilita dal Medico Competente in base al rischio: annuale (rischio generico, radiazioni), biennale (videoterminali <50 anni, lavoro notturno), post-espositiva (amianto 10 anni). Il MC può modificare la periodicità.",
  requiredDocumentName: "Giudizio di idoneità alla mansione",
}
```

---

## ⚠️ Miglioramenti Consigliati

### 9. 📋 DVR - Revisione Troppo Frequente

**Template Attuale:**

```typescript
{
  title: "Rielaborazione DVR",
  recurrenceUnit: "YEAR",
  recurrenceEvery: 1,
}
```

**Osservazione:** Il DVR va aggiornato "quando necessario", non annualmente.

**Normativa:** D.Lgs. 81/2008 art. 29 comma 3

**Aggiornamento Obbligatorio SOLO quando:**

- Modifiche del processo produttivo
- Infortuni significativi
- Risultati sorveglianza sanitaria
- Nuove attrezzature/sostanze

**Suggerimento:** Cambiare in biennale o rendere "on-demand"

```typescript
{
  scope: "STRUCTURE",
  complianceType: "DOCUMENTATION",
  title: "Revisione DVR (Documento Valutazione Rischi)",
  description: "Revisione del Documento di Valutazione dei Rischi",
  recurrenceUnit: "YEAR",
  recurrenceEvery: 2,  // Cambio da 1 a 2 anni (best practice)
  anchor: "LAST_COMPLETION",
  legalReference: "D.Lgs. 81/08 art. 17, 28, 29",
  notes: "Revisione obbligatoria in caso di: modifiche processo produttivo, infortuni significativi, nuove attrezzature/sostanze, esiti sorveglianza sanitaria. Revisione biennale consigliata come best practice.",
  requiredDocumentName: "DVR aggiornato con data e firma RSPP/Datore",
}
```

---

### 10. 📋 HACCP - Manca Template Controllo Registrazioni

**Template Esistente:**

- ✅ Aggiornamento manuale HACCP (2 anni)

**Manca:** Verifica registrazioni HACCP (giornaliera/settimanale)

**Normativa:** Reg. CE 852/2004

**Nuovo Template da Aggiungere:**

```typescript
{
  scope: "STRUCTURE",
  complianceType: "DOCUMENTATION",
  title: "Verifica registrazioni HACCP",
  description: "Controllo periodico delle registrazioni di autocontrollo HACCP",
  recurrenceUnit: "MONTH",
  recurrenceEvery: 1,
  anchor: "LAST_COMPLETION",
  legalReference: "Reg. CE 852/2004",
  notes: "Verifica mensile delle registrazioni HACCP: temperature, sanificazioni, check-list. Le registrazioni giornaliere sono a carico del personale.",
  requiredDocumentName: "Registro verifiche HACCP",
  regions: null,
}
```

---

### 11. 📋 Rifiuti Sanitari - Frequenza Registro Non Specificata

**Template Attuale:**

```typescript
{
  title: "Registro rifiuti sanitari",
  description: "Aggiornamento registro carico/scarico",
  recurrenceUnit: "YEAR",
  recurrenceEvery: 1,
}
```

**Osservazione:** Il registro si compila **ogni movimento**, non annualmente.

**Normativa:** D.Lgs. 152/2006 art. 190

**Obbligo Reale:**

- Annotazione entro 10 giorni da produzione/trasporto
- Conservazione 5 anni
- **Vidimazione annuale** da CCIAA

**Correzione Suggerita:**

```typescript
{
  scope: "STRUCTURE",
  complianceType: "DOCUMENTATION",
  title: "Vidimazione registro rifiuti sanitari",
  description: "Vidimazione annuale del registro di carico e scarico rifiuti sanitari",
  recurrenceUnit: "YEAR",
  recurrenceEvery: 1,
  anchor: "LAST_COMPLETION",
  legalReference: "D.Lgs. 152/2006 art. 190",
  notes: "Vidimazione annuale obbligatoria presso CCIAA o telematicamente. Le annotazioni di carico/scarico vanno effettuate entro 10 giorni lavorativi da ogni movimento. Conservazione 5 anni.",
  requiredDocumentName: "Registro rifiuti vidimato",
}
```

---

### 12. 📋 Manca: Denuncia INAIL Apparecchi di Sollevamento

**Template Mancante:** Verifica apparecchi di sollevamento (gru, montacarichi, ascensori)

**Normativa:** D.Lgs. 81/2008 Allegato VII

**Obbligo:**

- Denuncia INAIL entro 60gg da installazione
- Verifica annuale per portata >200kg
- Verifica biennale per portata ≤200kg

**Nuovo Template da Aggiungere:**

```typescript
{
  scope: "STRUCTURE",
  complianceType: "INSPECTION",
  title: "Verifica apparecchi di sollevamento",
  description: "Verifica periodica apparecchi di sollevamento e ascensori",
  recurrenceUnit: "YEAR",
  recurrenceEvery: 1,
  anchor: "LAST_COMPLETION",
  legalReference: "D.Lgs. 81/08 Allegato VII, DPR 162/99",
  notes: "Verifica annuale per apparecchi con portata >200kg (gru, montacarichi). Verifica biennale per portata ≤200kg. Obbligo denuncia INAIL entro 60gg da installazione.",
  requiredDocumentName: "Verbale verifica INAIL apparecchi sollevamento",
}
```

---

### 13. 📋 Manca: Libro Unico del Lavoro (LUL)

**Template Mancante:** Tenuta Libro Unico del Lavoro

**Normativa:** Art. 39 D.L. 112/2008

**Obbligo:** Registrazione entro fine mese successivo

**Nuovo Template da Aggiungere:**

```typescript
{
  scope: "STRUCTURE",
  complianceType: "DOCUMENTATION",
  title: "Tenuta Libro Unico del Lavoro (LUL)",
  description: "Registrazione mensile presenze e retribuzioni nel Libro Unico del Lavoro",
  recurrenceUnit: "MONTH",
  recurrenceEvery: 1,
  anchor: "LAST_COMPLETION",
  legalReference: "Art. 39 D.L. 112/2008",
  notes: "Registrazione entro il giorno 16 del mese successivo. Include: presenze, assenze, retribuzioni, straordinari. Può essere tenuto su supporto cartaceo o informatico.",
  requiredDocumentName: "Libro Unico del Lavoro",
}
```

---

### 14. 📋 Assicurazione RC - Scope STRUCTURE invece di PERSON

**Template Attuale:**

```typescript
{
  scope: "PERSON",  // ❌ ERRATO
  complianceType: "OTHER",
  title: "Rinnovo assicurazione RC professionale",
}
```

**Problema:** L'assicurazione RC è della STRUTTURA, non della singola persona.

**Correzione Suggerita:**

```typescript
{
  scope: "STRUCTURE",  // ✅ CORRETTO
  complianceType: "OTHER",
  title: "Rinnovo assicurazione RC professionale",
  description: "Rinnovo polizza assicurativa responsabilità civile professionale",
  recurrenceUnit: "YEAR",
  recurrenceEvery: 1,
  anchor: "LAST_COMPLETION",
  legalReference: "Legge 24/2017 (Gelli-Bianco)",
  notes: "Assicurazione obbligatoria per strutture sanitarie. Verificare massimali e coperture secondo Legge Gelli-Bianco.",
  requiredDocumentName: "Polizza RC professionale",
}
```

---

### 15. 📋 Privacy - Manca Template Registro Trattamenti

**Template Esistente:**

- ✅ GDPR DPIA (annuale - da cambiare a biennale)
- ✅ Informativa privacy (annuale)

**Manca:** Registro delle attività di trattamento

**Normativa:** Art. 30 GDPR

**Obbligo:** Tenuta e aggiornamento registro trattamenti (obbligatorio >250 dip. o trattamenti sensibili)

**Nuovo Template da Aggiungere:**

```typescript
{
  scope: "STRUCTURE",
  complianceType: "DOCUMENTATION",
  title: "Aggiornamento Registro Trattamenti GDPR",
  description: "Revisione e aggiornamento del Registro delle attività di trattamento",
  recurrenceUnit: "YEAR",
  recurrenceEvery: 1,
  anchor: "LAST_COMPLETION",
  legalReference: "Art. 30 GDPR (Reg. UE 2016/679)",
  notes: "Obbligatorio per aziende >250 dipendenti o che trattano dati sensibili/sanitari. Deve contenere: finalità, categorie di interessati, categorie di dati, destinatari, trasferimenti extra-UE, misure di sicurezza.",
  requiredDocumentName: "Registro delle attività di trattamento GDPR",
}
```

---

### 16. 📋 ECM - Triennio 2023-2025

**Template Attuale:**

```typescript
{
  title: "Crediti ECM - Triennio 2020-2022",  // ❌ OBSOLETO
}
```

**Problema:** Il triennio 2020-2022 è concluso.

**Correzione Suggerita:**

```typescript
{
  scope: "PERSON",
  complianceType: "TRAINING",
  title: "Crediti ECM - Triennio 2023-2025",  // ✅ AGGIORNATO
  description: "Completamento crediti formativi ECM del triennio in corso",
  recurrenceUnit: "YEAR",
  recurrenceEvery: 3,
  anchor: "LAST_COMPLETION",
  legalReference: "Accordo Stato-Regioni 02/02/2017",
  notes: "Obbligo per professionisti sanitari: 150 crediti ECM per triennio (50/anno). Il triennio attuale è 2023-2025. Verificare eventuali esoneri/riduzioni per specifiche categorie.",
  requiredDocumentName: "Attestati ECM (min. 150 crediti triennio)",
}
```

---

### 17. 📋 Attrezzature - Manca Verifica PLE/Carrelli Elevatori

**Template Mancante:** Verifica attrezzature (carrelli, PLE, gru)

**Normativa:** D.Lgs. 81/2008 art. 71 + Allegato VII

**Obbligo:**

- Verifica INAIL annuale
- Patentino operatori

**Nuovo Template da Aggiungere:**

```typescript
{
  scope: "STRUCTURE",
  complianceType: "INSPECTION",
  title: "Verifica attrezzature di lavoro (PLE, carrelli, gru)",
  description: "Verifica periodica attrezzature di lavoro secondo Allegato VII",
  recurrenceUnit: "YEAR",
  recurrenceEvery: 1,
  anchor: "LAST_COMPLETION",
  legalReference: "D.Lgs. 81/08 art. 71 e Allegato VII",
  notes: "Verifica annuale obbligatoria per: carrelli elevatori, piattaforme di lavoro elevabili (PLE), gru a torre, ponti sviluppabili. Deve essere effettuata da ente abilitato (INAIL, ASL, organismi notificati).",
  requiredDocumentName: "Verbale verifica attrezzature di lavoro",
}
```

---

### 18. 📋 Formazione Dirigenti/Preposti - Aggiornamento Quinquennale

**Template Attuale:**

```typescript
{
  title: "Aggiornamento formazione dirigenti",
  recurrenceUnit: "YEAR",
  recurrenceEvery: 5,
}
```

**Osservazione:** Corretto, ma manca il template per PREPOSTI (obbligo diverso).

**Normativa:** Accordo Stato-Regioni 21/12/2011

**Nuovo Template da Aggiungere:**

```typescript
{
  scope: "PERSON",
  complianceType: "TRAINING",
  title: "Aggiornamento formazione preposti",
  description: "Aggiornamento biennale per preposti alla sicurezza",
  recurrenceUnit: "YEAR",
  recurrenceEvery: 2,  // BIENNALE per preposti (non quinquennale)
  anchor: "LAST_COMPLETION",
  legalReference: "Accordo Stato-Regioni 21/12/2011, D.Lgs. 81/08 art. 37",
  notes: "Aggiornamento obbligatorio: 6 ore ogni 2 anni per preposti. Per dirigenti: 6 ore ogni 5 anni.",
  requiredDocumentName: "Attestato aggiornamento preposto",
}
```

---

### 19. 📋 Verifica Gruppi Elettrogeni

**Template Mancante:** Manutenzione/Verifica Gruppi Elettrogeni

**Normativa:** CEI 64-8 + D.Lgs. 81/2008

**Obbligo:** Manutenzione semestrale/annuale per gruppi elettrogeni di emergenza

**Nuovo Template da Aggiungere:**

```typescript
{
  scope: "STRUCTURE",
  complianceType: "INSPECTION",
  title: "Manutenzione gruppo elettrogeno di emergenza",
  description: "Verifica e manutenzione periodica gruppo elettrogeno",
  recurrenceUnit: "MONTH",
  recurrenceEvery: 6,  // Semestrale
  anchor: "LAST_COMPLETION",
  legalReference: "CEI 64-8, D.Lgs. 81/08",
  notes: "Manutenzione semestrale obbligatoria per gruppi elettrogeni di emergenza. Include: prova avviamento, controllo olio/filtri, test sotto carico, verifica autonomia.",
  requiredDocumentName: "Rapporto manutenzione gruppo elettrogeno",
}
```

---

### 20. 📋 Controllo Legionella - Valutazione Rischio

**Template Mancante:** Valutazione rischio Legionella (DGR regionale)

**Normativa:** Linee Guida Legionella 2015 + DGR regionali

**Obbligo:**

- Valutazione rischio: Biennale
- Campionamenti: 2-4 volte/anno

**Nuovo Template da Aggiungere:**

```typescript
{
  scope: "STRUCTURE",
  complianceType: "INSPECTION",
  title: "Valutazione rischio Legionella",
  description: "Valutazione del rischio Legionella negli impianti idrici",
  recurrenceUnit: "YEAR",
  recurrenceEvery: 2,
  anchor: "LAST_COMPLETION",
  legalReference: "Linee Guida Legionella 2015, DGR regionali",
  notes: "Valutazione biennale del rischio Legionella. Campionamenti: 2 volte/anno per rischio medio, 4 volte/anno per rischio alto. Verificare DGR regionale specifica.",
  requiredDocumentName: "Rapporto valutazione rischio Legionella",
  regions: null,  // Varia per regione
}
```

---

## 💡 Template Una Tantum vs Ricorrenti

### Differenza Fondamentale

Il sistema supporta **DUE tipi di template**:

#### 1. Template Ricorrenti (con `recurrenceUnit` e `recurrenceEvery`)

Template che creano scadenze ripetute nel tempo:

```typescript
{
  title: "Aggiornamento RLS annuale",
  recurrenceUnit: "YEAR",   // ✅ Ricorrente
  recurrenceEvery: 1,
  anchor: "LAST_COMPLETION", // Ogni anno dalla data di completamento
}
```

**Esempio comportamento:**

- Persona nominata RLS il 01/01/2024
- Corso completato il 15/01/2024
- Sistema crea automaticamente la scadenza successiva: 15/01/2025
- E così via ogni anno

#### 2. Template Una Tantum (con `recurrenceUnit: null`)

Template che creano UNA SOLA scadenza al momento dell'evento scatenante:

```typescript
{
  title: "Corso RLS base (32 ore)",
  recurrenceUnit: null,      // ✅ Una tantum
  recurrenceEvery: null,
  anchor: "ASSIGNMENT_START", // Solo quando viene assegnato il ruolo
}
```

**Esempio comportamento:**

- Persona nominata RLS il 01/01/2024
- Sistema crea UNA scadenza: 01/01/2024 (+ firstDueOffsetDays)
- Dopo il completamento: NESSUNA nuova scadenza automatica
- Serve solo per tracciare che il corso base è stato fatto

### Anchor Types per Template Una Tantum

| Anchor             | Quando si attiva                         | Caso d'uso                                 |
| ------------------ | ---------------------------------------- | ------------------------------------------ |
| `ASSIGNMENT_START` | Assegnazione ruolo (RLS, RSPP, Preposto) | Corsi base per ruoli                       |
| `HIRE_DATE`        | Assunzione dipendente                    | Formazione lavoratori, visita preassuntiva |
| `CUSTOM`           | Data personalizzata                      | Evento specifico one-time                  |

### Template che DOVREBBERO essere Una Tantum

**Corsi Base (non aggiornamenti):**

- ✅ Corso RLS base (32h) - `recurrenceUnit: null`
- ✅ Corso RSPP base (16h-48h) - `recurrenceUnit: null`
- ✅ Corso Preposto base (8h) - `recurrenceUnit: null`
- ✅ Corso Addetto Antincendio base - `recurrenceUnit: null`
- ✅ Corso Primo Soccorso base (12h-16h) - `recurrenceUnit: null`
- ✅ Formazione generale lavoratori (4h) - `recurrenceUnit: null` + `anchor: HIRE_DATE`

**Aggiornamenti (sempre ricorrenti):**

- ✅ Aggiornamento RLS - `recurrenceUnit: "YEAR"`, `recurrenceEvery: 1`
- ✅ Aggiornamento RSPP - `recurrenceUnit: "YEAR"`, `recurrenceEvery: 5`
- ✅ Aggiornamento Preposto - `recurrenceUnit: "YEAR"`, `recurrenceEvery: 2`
- ✅ Aggiornamento Antincendio - `recurrenceUnit: "YEAR"`, `recurrenceEvery: 5`
- ✅ Aggiornamento Primo Soccorso - `recurrenceUnit: "YEAR"`, `recurrenceEvery: 3`

### Esempio Completo: Percorso RLS

```typescript
// 1. Template CORSO BASE (una tantum)
{
  scope: "PERSON",
  complianceType: "TRAINING",
  title: "Corso RLS base (32 ore)",
  recurrenceUnit: null,  // 🔹 NON RICORRENTE
  recurrenceEvery: null,
  anchor: "ASSIGNMENT_START",  // Si attiva quando nominato RLS
  notes: "Corso base obbligatorio all'assegnazione del ruolo RLS. Una tantum.",
}

// 2. Template AGGIORNAMENTO (ricorrente)
{
  scope: "PERSON",
  complianceType: "TRAINING",
  title: "Aggiornamento RLS annuale",
  recurrenceUnit: "YEAR",  // 🔁 RICORRENTE
  recurrenceEvery: 1,
  anchor: "LAST_COMPLETION",  // Ogni anno dalla data completamento
  notes: "Aggiornamento annuale obbligatorio per mantenere il ruolo.",
}
```

**Timeline esempio:**

```
01/01/2024 - Persona nominata RLS
01/01/2024 - Sistema crea scadenza: "Corso RLS base" (una tantum)
15/01/2024 - Corso base completato ✅
15/01/2024 - Sistema crea prima scadenza ricorrente: "Aggiornamento RLS" per 15/01/2025
15/01/2025 - Aggiornamento completato ✅
15/01/2025 - Sistema crea automaticamente: "Aggiornamento RLS" per 15/01/2026
... e così via ogni anno
```

### Migrazione Schema Prisma

Lo schema attuale **già supporta** template una tantum:

```prisma
model DeadlineTemplate {
  // ...
  recurrenceUnit       RecurrenceUnit?  // ✅ Nullable
  recurrenceEvery      Int?             // ✅ Nullable (dovrebbe essere)
  // ...
}
```

**VERIFICA NECESSARIA:** Il campo `recurrenceEvery` deve essere nullable nello schema:

```prisma
// Se attualmente è:
recurrenceEvery      Int

// Deve diventare:
recurrenceEvery      Int?  // Nullable per template una tantum
```

---

## 📊 Riepilogo Modifiche

### Azioni Immediate (Errori Critici)

| #   | Template               | Azione                                                        | Priorità   |
| --- | ---------------------- | ------------------------------------------------------------- | ---------- |
| 1   | GDPR DPIA              | Cambiare da 1 a 2 anni                                        | 🔴 Alta    |
| 2   | Impianto elettrico     | **DIVIDERE in 2 template** (messa a terra + elettrico)        | 🔴 Critica |
| 3   | Formazione antincendio | Cambiare da 3 a 5 anni + aggiornare normativa                 | 🔴 Alta    |
| 4   | Radioprotezione        | **AGGIUNGERE** template sorveglianza fisica                   | 🔴 Alta    |
| 5   | Corso RLS              | **DIVIDERE** base + aggiornamento con durate corrette         | 🔴 Alta    |
| 6   | Prova evacuazione      | Cambiare da annuale a semestrale                              | 🔴 Alta    |
| 7   | Estintori              | **DIVIDERE in 3 template** (sorveglianza/controllo/revisione) | 🔴 Critica |
| 8   | Visita medica          | Aggiornare notes con frequenze variabili                      | 🟡 Media   |

### Template da Aggiungere

| #   | Nuovo Template                      | Normativa          | Ricorrente?   | Priorità |
| --- | ----------------------------------- | ------------------ | ------------- | -------- |
| 4   | Sorveglianza fisica radioprotezione | D.Lgs. 101/2020    | ✅ Annuale    | 🔴 Alta  |
| 5   | Corso RLS base                      | D.Lgs. 81/08       | ❌ Una tantum | 🟡 Media |
| 10  | Verifica registrazioni HACCP        | Reg. CE 852/2004   | ✅ Mensile    | 🟡 Media |
| 12  | Verifica apparecchi sollevamento    | D.Lgs. 81/08       | ✅ Annuale    | 🟢 Bassa |
| 13  | Libro Unico Lavoro (LUL)            | D.L. 112/2008      | ✅ Mensile    | 🟢 Bassa |
| 15  | Registro Trattamenti GDPR           | Art. 30 GDPR       | ✅ Annuale    | 🟡 Media |
| 17  | Verifica PLE/carrelli               | D.Lgs. 81/08       | ✅ Annuale    | 🟡 Media |
| 18  | Aggiornamento preposti              | Acc. SR 21/12/2011 | ✅ Biennale   | 🟡 Media |
| 19  | Gruppo elettrogeno                  | CEI 64-8           | ✅ Semestrale | 🟢 Bassa |
| 20  | Rischio Legionella                  | Linee Guida 2015   | ✅ Biennale   | 🟡 Media |
| 21  | Formazione generale lavoratori      | D.Lgs. 81/08       | ❌ Una tantum | 🔴 Alta  |
| 22  | Formazione specifica lavoratori     | D.Lgs. 81/08       | ❌ Una tantum | 🔴 Alta  |
| 23  | Corso RSPP base                     | D.Lgs. 81/08       | ❌ Una tantum | 🟡 Media |
| 24  | Corso Preposto base                 | D.Lgs. 81/08       | ❌ Una tantum | 🟡 Media |
| 25  | Corso Primo Soccorso base           | D.Lgs. 81/08       | ❌ Una tantum | 🟡 Media |
| 26  | Visita medica preassuntiva          | D.Lgs. 81/08       | ❌ Una tantum | 🟡 Media |

---

## 📚 Template Una Tantum Mancanti (Alta Priorità)

### 21. Formazione Generale Lavoratori (4 ore)

**Normativa:** D.Lgs. 81/2008 art. 37 + Accordo Stato-Regioni 21/12/2011

**Obbligo:** Obbligatoria per TUTTI i lavoratori entro 60 giorni dall'assunzione

**Template da Aggiungere:**

```typescript
{
  scope: "PERSON",
  complianceType: "TRAINING",
  title: "Formazione generale lavoratori (4 ore)",
  description: "Corso di formazione generale sulla sicurezza - obbligatorio per tutti i lavoratori",
  recurrenceUnit: null,  // ❌ Una tantum
  recurrenceEvery: null,
  firstDueOffsetDays: 60,  // 60 giorni dall'assunzione
  anchor: "HIRE_DATE",  // Si attiva all'assunzione
  legalReference: "D.Lgs. 81/08 art. 37, Acc. SR 21/12/2011",
  notes: "Formazione generale 4 ore obbligatoria per tutti i neoassunti entro 60 giorni. Valida per sempre, non ha scadenza di aggiornamento.",
  requiredDocumentName: "Attestato formazione generale lavoratori",
  regions: null,
}
```

---

### 22. Formazione Specifica Lavoratori (Rischio Basso/Medio/Alto)

**Normativa:** D.Lgs. 81/2008 art. 37 + Accordo Stato-Regioni 21/12/2011

**Obbligo:** Obbligatoria per tutti i lavoratori, durata varia per settore di rischio

**Durate:**

- **Rischio BASSO:** 4 ore
- **Rischio MEDIO:** 8 ore (es. studi medici)
- **Rischio ALTO:** 12 ore (es. ospedali con reparti radiologici)

**Aggiornamento:** 6 ore ogni 5 anni (ricorrente)

**Template da Aggiungere (3 varianti per rischio):**

```typescript
// Variante 1: Rischio BASSO (4h)
{
  scope: "PERSON",
  complianceType: "TRAINING",
  title: "Formazione specifica lavoratori - Rischio BASSO (4h)",
  description: "Corso di formazione specifica per settore a rischio basso",
  recurrenceUnit: null,  // ❌ Una tantum
  recurrenceEvery: null,
  firstDueOffsetDays: 60,
  anchor: "HIRE_DATE",
  legalReference: "D.Lgs. 81/08 art. 37, Acc. SR 21/12/2011",
  notes: "Formazione specifica 4 ore per rischio basso. Aggiornamento: 6 ore ogni 5 anni (vedi template separato).",
  requiredDocumentName: "Attestato formazione specifica rischio basso",
}

// Variante 2: Rischio MEDIO (8h) - PER STUDI MEDICI
{
  scope: "PERSON",
  complianceType: "TRAINING",
  title: "Formazione specifica lavoratori - Rischio MEDIO (8h)",
  description: "Corso di formazione specifica per settore sanitario a rischio medio",
  recurrenceUnit: null,  // ❌ Una tantum
  recurrenceEvery: null,
  firstDueOffsetDays: 60,
  anchor: "HIRE_DATE",
  legalReference: "D.Lgs. 81/08 art. 37, Acc. SR 21/12/2011",
  notes: "Formazione specifica 8 ore per rischio medio (studi medici/odontoiatrici). Aggiornamento: 6 ore ogni 5 anni.",
  requiredDocumentName: "Attestato formazione specifica rischio medio",
}

// Template AGGIORNAMENTO (ricorrente - da aggiungere anche questo)
{
  scope: "PERSON",
  complianceType: "TRAINING",
  title: "Aggiornamento formazione specifica lavoratori (6h)",
  description: "Aggiornamento quinquennale formazione specifica",
  recurrenceUnit: "YEAR",  // ✅ Ricorrente
  recurrenceEvery: 5,
  anchor: "LAST_COMPLETION",
  legalReference: "D.Lgs. 81/08 art. 37, Acc. SR 21/12/2011",
  notes: "Aggiornamento obbligatorio 6 ore ogni 5 anni per tutti i livelli di rischio.",
  requiredDocumentName: "Attestato aggiornamento formazione specifica",
}
```

---

### 23. Corso RSPP Base (16h-48h)

**Normativa:** D.Lgs. 81/2008 art. 32 + Accordo Stato-Regioni 07/07/2016

**Obbligo:** Obbligatorio per chi assume il ruolo di RSPP (Datore di Lavoro o esterno)

**Durate per Settore ATECO:**

- **Rischio BASSO:** 16 ore
- **Rischio MEDIO:** 32 ore (studi medici)
- **Rischio ALTO:** 48 ore

**Aggiornamento:** 6-10-14 ore ogni 5 anni (già presente nei template)

**Template da Aggiungere:**

```typescript
// Variante per studi medici (rischio medio)
{
  scope: "PERSON",
  complianceType: "TRAINING",
  title: "Corso RSPP Datore di Lavoro - Rischio MEDIO (32h)",
  description: "Corso base per Datori di Lavoro che svolgono il ruolo di RSPP - settore sanitario",
  recurrenceUnit: null,  // ❌ Una tantum
  recurrenceEvery: null,
  anchor: "ASSIGNMENT_START",  // All'assegnazione del ruolo RSPP
  legalReference: "D.Lgs. 81/08 art. 34, Acc. SR 07/07/2016",
  notes: "Corso base 32 ore per RSPP Datore di Lavoro settore sanitario (rischio medio). Aggiornamento: 10 ore ogni 5 anni.",
  requiredDocumentName: "Attestato corso RSPP Datore di Lavoro",
}
```

---

### 24. Corso Preposto Base (8h)

**Normativa:** D.Lgs. 81/2008 art. 37 + Accordo Stato-Regioni 21/12/2011

**Obbligo:** Obbligatorio per chi viene nominato Preposto

**Durata:** 8 ore + aggiornamento 6 ore ogni 2 anni

**Template da Aggiungere:**

```typescript
{
  scope: "PERSON",
  complianceType: "TRAINING",
  title: "Corso Preposto base (8h)",
  description: "Corso base per Preposti alla sicurezza",
  recurrenceUnit: null,  // ❌ Una tantum
  recurrenceEvery: null,
  anchor: "ASSIGNMENT_START",  // All'assegnazione del ruolo Preposto
  legalReference: "D.Lgs. 81/08 art. 37, Acc. SR 21/12/2011",
  notes: "Corso base 8 ore obbligatorio per Preposti. Aggiornamento: 6 ore ogni 2 anni (template separato).",
  requiredDocumentName: "Attestato corso Preposto",
}
```

---

### 25. Corso Primo Soccorso Base (12h-16h)

**Normativa:** D.Lgs. 81/2008 art. 45 + DM 388/2003

**Obbligo:** Obbligatorio per addetti al primo soccorso

**Durate:**

- **Gruppo A:** 16 ore (aziende >5 dip. settore sanitario)
- **Gruppo B/C:** 12 ore (altre aziende)

**Aggiornamento:** 4-6 ore ogni 3 anni (già presente nei template)

**Template da Aggiungere:**

```typescript
// Variante per studi medici (Gruppo A)
{
  scope: "PERSON",
  complianceType: "TRAINING",
  title: "Corso Primo Soccorso base - Gruppo A (16h)",
  description: "Corso base per Addetti al Primo Soccorso - aziende Gruppo A (sanitario)",
  recurrenceUnit: null,  // ❌ Una tantum
  recurrenceEvery: null,
  anchor: "ASSIGNMENT_START",  // All'assegnazione del ruolo
  legalReference: "D.Lgs. 81/08 art. 45, DM 388/2003",
  notes: "Corso base 16 ore per Gruppo A (aziende >5 dipendenti settore sanitario). Aggiornamento: 6 ore ogni 3 anni.",
  requiredDocumentName: "Attestato corso Primo Soccorso Gruppo A",
}
```

---

### 26. Visita Medica Preassuntiva

**Normativa:** D.Lgs. 81/2008 art. 41

**Obbligo:** Obbligatoria PRIMA dell'assunzione per mansioni con sorveglianza sanitaria

**Template da Aggiungere:**

```typescript
{
  scope: "PERSON",
  complianceType: "HEALTH",
  title: "Visita medica preassuntiva",
  description: "Visita medica preassuntiva per idoneità alla mansione",
  recurrenceUnit: null,  // ❌ Una tantum
  recurrenceEvery: null,
  firstDueOffsetDays: -7,  // 7 giorni PRIMA dell'assunzione (negativo!)
  anchor: "HIRE_DATE",
  legalReference: "D.Lgs. 81/08 art. 41",
  notes: "Visita medica obbligatoria PRIMA dell'assunzione per mansioni soggette a sorveglianza sanitaria. Il Medico Competente rilascia giudizio di idoneità.",
  requiredDocumentName: "Giudizio di idoneità preassuntiva",
}
```

**Nota importante:** `firstDueOffsetDays: -7` indica che la scadenza è 7 giorni PRIMA della data di assunzione, per ricordare di fare la visita prima che il dipendente inizi a lavorare.

---

## 🎯 Prossimi Passi Consigliati

### Fase 1: Correzioni Critiche (Questa Settimana)

1. ✅ Dividere template "Impianto elettrico" in 2 template separati
2. ✅ Dividere template "Estintori" in 3 template (sorveglianza/controllo/revisione)
3. ✅ Aggiungere template "Sorveglianza fisica radioprotezione"
4. ✅ Correggere frequenza formazione antincendio (3→5 anni)
5. ✅ Correggere frequenza prova evacuazione (annuale→semestrale)

### Fase 2: Miglioramenti High-Priority (Prossime 2 Settimane)

1. Dividere template RLS (base + aggiornamento)
2. Cambiare DPIA da 1 a 2 anni
3. Aggiornare triennio ECM (2020-2022 → 2023-2025)
4. Aggiungere template Registro Trattamenti GDPR
5. Aggiungere template Verifica PLE/carrelli

### Fase 3: Completamento (Prossimo Mese)

1. Aggiungere tutti i template mancanti
2. Rivedere notes per chiarezza
3. Verificare scope (PERSON vs STRUCTURE)
4. Testare su database di staging

---

## 📚 Fonti Normative

### Sicurezza sul Lavoro

- D.Lgs. 81/2008 - Testo Unico Sicurezza
- Accordo Stato-Regioni 21/12/2011 - Formazione
- DM 02/09/2021 - GSA Antincendio

### Impianti

- DPR 462/2001 - Messa a terra
- DM 37/2008 - Impianti elettrici
- UNI 9994-1:2013 - Estintori

### Privacy

- Regolamento UE 2016/679 (GDPR)
- D.Lgs. 196/2003 (Codice Privacy aggiornato)

### Radioprotezione

- D.Lgs. 101/2020 - Radioprotezioni ionizzanti

### Ambiente

- D.Lgs. 152/2006 - Codice Ambiente (rifiuti)

### Sanità

- Legge 24/2017 (Gelli-Bianco) - RC professionale
- Reg. CE 852/2004 - HACCP

---

## ⚠️ Disclaimer

Questa analisi è basata sulla normativa italiana vigente al 2025. Le frequenze e gli obblighi possono variare in base a:

- Dimensione della struttura
- Tipo di attività svolta
- Regione/ASL di competenza
- Valutazione del Medico Competente (per sorveglianza sanitaria)
- Valutazione dei rischi specifica

**Si consiglia di verificare con RSPP, Medico Competente e consulenti legali prima di implementare le modifiche.**
