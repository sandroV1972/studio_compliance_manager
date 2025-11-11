import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateTemplateSchema } from "@/lib/validation/template";
import { validateRequest } from "@/lib/validation/validate";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string; templateId: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
    }

    const { id: organizationId, templateId } = await params;

    // Verifica che l'utente abbia accesso a questa organizzazione
    const orgUser = await prisma.organizationUser.findFirst({
      where: {
        organizationId: organizationId,
        userId: session.user.id,
      },
    });

    if (!orgUser && !session.user.isSuperAdmin) {
      return NextResponse.json({ error: "Accesso negato" }, { status: 403 });
    }

    // Recupera il template
    const template = await prisma.deadlineTemplate.findUnique({
      where: { id: templateId },
    });

    if (!template) {
      return NextResponse.json(
        { error: "Template non trovato" },
        { status: 404 },
      );
    }

    // Verifica che il template appartenga a questa organizzazione o sia GLOBAL
    if (
      template.ownerType === "ORG" &&
      template.organizationId !== organizationId
    ) {
      return NextResponse.json(
        { error: "Non hai i permessi per accedere a questo template" },
        { status: 403 },
      );
    }

    return NextResponse.json({ template });
  } catch (error) {
    console.error("Errore recupero template:", error);
    return NextResponse.json(
      { error: "Errore nel recupero del template" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; templateId: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
    }

    const { id: organizationId, templateId } = await params;

    // Verifica che l'utente abbia accesso a questa organizzazione
    const orgUser = await prisma.organizationUser.findFirst({
      where: {
        organizationId: organizationId,
        userId: session.user.id,
      },
    });

    if (!orgUser && !session.user.isSuperAdmin) {
      return NextResponse.json({ error: "Accesso negato" }, { status: 403 });
    }

    // Recupera il template esistente
    const existingTemplate = await prisma.deadlineTemplate.findUnique({
      where: { id: templateId },
    });

    if (!existingTemplate) {
      return NextResponse.json(
        { error: "Template non trovato" },
        { status: 404 },
      );
    }

    // NUOVA LOGICA: Solo SuperAdmin può modificare template GLOBAL
    if (existingTemplate.ownerType === "GLOBAL" && !session.user.isSuperAdmin) {
      return NextResponse.json(
        {
          error:
            "Solo l'amministratore del sito può modificare i template globali. Per adempimenti personalizzati, crea una scadenza personalizzata.",
        },
        { status: 403 },
      );
    }

    // Verifica che i template ORG appartengano all'organizzazione corretta
    if (
      existingTemplate.ownerType === "ORG" &&
      existingTemplate.organizationId !== organizationId
    ) {
      return NextResponse.json(
        {
          error: "Non hai i permessi per modificare questo template.",
        },
        { status: 403 },
      );
    }

    const body = await request.json();

    // Validazione con Zod
    const validation = validateRequest(updateTemplateSchema, body);
    if (!validation.success || !validation.data) {
      return validation.error;
    }

    const validatedData = validation.data;

    // Prepara i dati per l'update (solo campi forniti)
    const updateData: any = {};
    if (validatedData.title !== undefined)
      updateData.title = validatedData.title;
    if (validatedData.complianceType !== undefined)
      updateData.complianceType = validatedData.complianceType;
    if (validatedData.description !== undefined)
      updateData.description = validatedData.description || null;
    if (validatedData.scope !== undefined)
      updateData.scope = validatedData.scope;
    if (validatedData.recurrenceUnit !== undefined)
      updateData.recurrenceUnit = validatedData.recurrenceUnit;
    if (validatedData.recurrenceEvery !== undefined)
      updateData.recurrenceEvery = validatedData.recurrenceEvery;
    if (validatedData.firstDueOffsetDays !== undefined)
      updateData.firstDueOffsetDays = validatedData.firstDueOffsetDays;
    if (validatedData.anchor !== undefined)
      updateData.anchor = validatedData.anchor;
    if (validatedData.requiredDocumentName !== undefined)
      updateData.requiredDocumentName =
        validatedData.requiredDocumentName || null;
    if (validatedData.active !== undefined)
      updateData.active = validatedData.active;

    // Aggiorna il template
    const updatedTemplate = await prisma.deadlineTemplate.update({
      where: { id: templateId },
      data: updateData,
    });

    return NextResponse.json({ template: updatedTemplate });
  } catch (error) {
    console.error("Errore aggiornamento template:", error);
    return NextResponse.json(
      { error: "Errore nell'aggiornamento del template" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; templateId: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
    }

    const { id: organizationId, templateId } = await params;

    // Verifica che l'utente abbia accesso a questa organizzazione
    const orgUser = await prisma.organizationUser.findFirst({
      where: {
        organizationId: organizationId,
        userId: session.user.id,
      },
    });

    if (!orgUser && !session.user.isSuperAdmin) {
      return NextResponse.json({ error: "Accesso negato" }, { status: 403 });
    }

    // Recupera il template esistente
    const existingTemplate = await prisma.deadlineTemplate.findUnique({
      where: { id: templateId },
    });

    if (!existingTemplate) {
      return NextResponse.json(
        { error: "Template non trovato" },
        { status: 404 },
      );
    }

    // NUOVA LOGICA: Solo SuperAdmin può eliminare template GLOBAL
    if (existingTemplate.ownerType === "GLOBAL" && !session.user.isSuperAdmin) {
      return NextResponse.json(
        {
          error:
            "Solo l'amministratore del sito può eliminare i template globali.",
        },
        { status: 403 },
      );
    }

    // Verifica che i template ORG appartengano all'organizzazione corretta
    if (
      existingTemplate.ownerType === "ORG" &&
      existingTemplate.organizationId !== organizationId
    ) {
      return NextResponse.json(
        {
          error: "Non hai i permessi per eliminare questo template.",
        },
        { status: 403 },
      );
    }

    // Soft delete - imposta active a false invece di eliminare fisicamente
    await prisma.deadlineTemplate.update({
      where: { id: templateId },
      data: { active: false },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Errore eliminazione template:", error);
    return NextResponse.json(
      { error: "Errore nell'eliminazione del template" },
      { status: 500 },
    );
  }
}
