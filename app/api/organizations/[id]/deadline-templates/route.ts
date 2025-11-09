import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
    }

    const { id: organizationId } = await params;

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

    // Recupera tutti i template: globali + quelli dell'organizzazione
    const templates = await prisma.deadlineTemplate.findMany({
      where: {
        OR: [
          { ownerType: "GLOBAL", active: true },
          { ownerType: "ORG", organizationId: organizationId, active: true },
        ],
      },
      orderBy: [{ complianceType: "asc" }, { title: "asc" }],
    });

    return NextResponse.json({ templates });
  } catch (error) {
    console.error("Errore recupero template:", error);
    return NextResponse.json(
      { error: "Errore nel recupero dei template" },
      { status: 500 },
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
    }

    const { id: organizationId } = await params;

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

    // Validazione
    if (!title || !complianceType || !scope || !recurrenceUnit || !anchor) {
      return NextResponse.json(
        { error: "Campi obbligatori mancanti" },
        { status: 400 },
      );
    }

    // Crea il nuovo template
    const template = await prisma.deadlineTemplate.create({
      data: {
        title,
        complianceType,
        description: description || null,
        scope,
        ownerType: "ORG",
        organizationId,
        recurrenceUnit,
        recurrenceEvery: parseInt(recurrenceEvery) || 1,
        firstDueOffsetDays: parseInt(firstDueOffsetDays) || 0,
        anchor,
        requiredDocumentName: requiredDocumentName || null,
        active: true,
      },
    });

    return NextResponse.json({ template }, { status: 201 });
  } catch (error) {
    console.error("Errore creazione template:", error);
    return NextResponse.json(
      { error: "Errore nella creazione del template" },
      { status: 500 },
    );
  }
}
