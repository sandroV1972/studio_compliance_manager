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
    const { searchParams } = new URL(request.url);
    const scope = searchParams.get("scope"); // STRUCTURE or PERSON

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

    // Recupera i template globali e quelli dell'organizzazione
    const where: any = {
      OR: [
        { ownerType: "GLOBAL" },
        {
          ownerType: "ORG",
          organizationId: organizationId,
        },
      ],
      active: true,
    };

    if (scope) {
      where.scope = scope;
    }

    const templates = await prisma.documentTemplate.findMany({
      where,
      orderBy: [{ category: "asc" }, { name: "asc" }],
    });

    return NextResponse.json({ templates });
  } catch (error) {
    console.error("Errore recupero template documenti:", error);
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
      scope,
      name,
      description,
      category,
      isMandatory,
      hasExpiry,
      reminderDays,
      fileFormats,
      maxSizeKB,
      notes,
      legalReference,
    } = body;

    // Validazioni
    if (!scope || !["STRUCTURE", "PERSON"].includes(scope)) {
      return NextResponse.json(
        { error: "Scope non valido (STRUCTURE o PERSON)" },
        { status: 400 },
      );
    }

    if (!name?.trim()) {
      return NextResponse.json(
        { error: "Il nome è obbligatorio" },
        { status: 400 },
      );
    }

    // Crea il template per l'organizzazione
    const template = await prisma.documentTemplate.create({
      data: {
        ownerType: "ORG",
        organizationId: organizationId,
        scope,
        name: name.trim(),
        description: description?.trim() || null,
        category: category?.trim() || null,
        isMandatory: isMandatory || false,
        hasExpiry: hasExpiry || false,
        reminderDays: reminderDays || null,
        fileFormats: fileFormats?.trim() || null,
        maxSizeKB: maxSizeKB || null,
        notes: notes?.trim() || null,
        legalReference: legalReference?.trim() || null,
      },
    });

    // Log audit
    await prisma.auditLog.create({
      data: {
        organizationId: organizationId,
        userId: session.user.id,
        action: "CREATE_DOCUMENT_TEMPLATE",
        entity: "DocumentTemplate",
        entityId: template.id,
        metadata: {
          name: template.name,
          scope: template.scope,
        },
      },
    });

    return NextResponse.json({ template });
  } catch (error) {
    console.error("Errore creazione template documento:", error);
    return NextResponse.json(
      { error: "Errore nella creazione del template" },
      { status: 500 },
    );
  }
}
