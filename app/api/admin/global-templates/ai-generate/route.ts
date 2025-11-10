import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import Anthropic from "@anthropic-ai/sdk";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.isSuperAdmin) {
      return NextResponse.json({ error: "Non autorizzato" }, { status: 403 });
    }

    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: "Prompt mancante" }, { status: 400 });
    }

    // Verifica che la chiave API sia configurata
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: "Chiave API Anthropic non configurata" },
        { status: 500 },
      );
    }

    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const systemPrompt = `Sei un assistente esperto in normative italiane per la compliance sanitaria e dei luoghi di lavoro.
Il tuo compito è analizzare la descrizione fornita dall'utente e generare i parametri per un template di adempimento normativo.

Devi rispondere SOLO con un oggetto JSON valido (senza markdown, senza spiegazioni) con i seguenti campi:
{
  "title": "Titolo breve e chiaro dell'adempimento",
  "description": "Descrizione dettagliata dell'adempimento",
  "complianceType": "uno tra: TRAINING, MAINTENANCE, INSPECTION, DOCUMENT, REPORTING, WASTE, DATA_PROTECTION, INSURANCE, OTHER",
  "scope": "uno tra: PERSON, STRUCTURE, ROLE",
  "recurrenceUnit": "uno tra: DAY, MONTH, YEAR",
  "recurrenceEvery": numero intero positivo,
  "firstDueOffsetDays": numero di giorni dalla data di riferimento per la prima scadenza,
  "requiredDocumentName": "nome del documento richiesto (se applicabile)",
  "legalReference": "riferimento normativo completo (legge, decreto, articolo)",
  "sourceUrl": "URL della fonte normativa (se disponibile)",
  "region": "nome della regione italiana se l'adempimento è regionale, altrimenti stringa vuota",
  "notes": "eventuali note aggiuntive"
}

Regole:
- Usa le tue conoscenze delle normative italiane per completare i campi
- Se non sei sicuro di un campo, usa un valore ragionevole basato sul contesto
- Per legalReference, cerca di fornire riferimenti normativi italiani reali
- Per region, usa i nomi standard delle regioni italiane (es: "Lombardia", "Lazio", ecc.)
- Per complianceType, scegli la categoria più appropriata
- Per scope, considera se l'adempimento si applica a persone, strutture o ruoli
- Sii preciso e professionale`;

    const message = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 2000,
      temperature: 0.3,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    // Estrai il testo dalla risposta
    const responseText =
      message.content[0].type === "text" ? message.content[0].text : "";

    // Parse la risposta JSON
    let generatedData;
    try {
      // Rimuovi eventuali markdown code blocks
      const cleanedText = responseText
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();
      generatedData = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error("Errore nel parsing della risposta AI:", responseText);
      return NextResponse.json(
        { error: "Errore nel parsing della risposta AI" },
        { status: 500 },
      );
    }

    return NextResponse.json(generatedData);
  } catch (error) {
    console.error("Errore generazione AI:", error);
    return NextResponse.json(
      { error: "Errore nella generazione AI" },
      { status: 500 },
    );
  }
}
