import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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

    // Verifica che il template appartenga a questa organizzazione o sia GLOBAL
    // I template GLOBAL possono essere modificati dagli admin per aggiornare le normative
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
    const {
      title,
      complianceType,
      description,
      scope,
      recurrenceUnit,
      recurrenceEvery,
      firstDueOffsetDays,
      anchor,
      requiredDocumentName,
    } = body;

    // Validazione campi obbligatori
    if (!title || !complianceType || !scope || !recurrenceUnit || !anchor) {
      return NextResponse.json(
        { error: "Campi obbligatori mancanti" },
        { status: 400 },
      );
    }

    // Aggiorna il template
    const updatedTemplate = await prisma.deadlineTemplate.update({
      where: { id: templateId },
      data: {
        title,
        complianceType,
        description: description || null,
        scope,
        recurrenceUnit,
        recurrenceEvery: parseInt(recurrenceEvery) || 1,
        firstDueOffsetDays: parseInt(firstDueOffsetDays) || 0,
        anchor,
        requiredDocumentName: requiredDocumentName || null,
      },
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

    // Verifica che il template appartenga a questa organizzazione o sia GLOBAL
    // I template GLOBAL possono essere eliminati dagli admin
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
