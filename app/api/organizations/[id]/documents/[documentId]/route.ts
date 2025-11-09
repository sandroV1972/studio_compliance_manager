import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { unlink } from "fs/promises";
import { readFile } from "fs/promises";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string; documentId: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
    }

    const { id: organizationId, documentId } = await params;

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

    // Recupera il documento
    const document = await prisma.document.findFirst({
      where: {
        id: documentId,
        organizationId: organizationId,
      },
    });

    if (!document) {
      return NextResponse.json(
        { error: "Documento non trovato" },
        { status: 404 },
      );
    }

    // Leggi il file dal disco
    try {
      const fileBuffer = await readFile(document.storagePath);

      return new NextResponse(fileBuffer, {
        headers: {
          "Content-Type": document.fileType || "application/octet-stream",
          "Content-Disposition": `attachment; filename="${document.fileName}"`,
        },
      });
    } catch (error) {
      console.error("Errore lettura file:", error);
      return NextResponse.json(
        { error: "File non trovato sul disco" },
        { status: 404 },
      );
    }
  } catch (error) {
    console.error("Errore download documento:", error);
    return NextResponse.json(
      { error: "Errore nel download del documento" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; documentId: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
    }

    const { id: organizationId, documentId } = await params;

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

    // Verifica che il documento esista e appartenga all'organizzazione
    const existingDocument = await prisma.document.findFirst({
      where: {
        id: documentId,
        organizationId: organizationId,
      },
    });

    if (!existingDocument) {
      return NextResponse.json(
        { error: "Documento non trovato" },
        { status: 404 },
      );
    }

    const body = await request.json();
    const { expiryDate, notes } = body;

    // Calcola se il documento è scaduto
    const isExpired = expiryDate ? new Date(expiryDate) < new Date() : false;

    // Aggiorna il documento
    const updatedDocument = await prisma.document.update({
      where: {
        id: documentId,
      },
      data: {
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        isExpired: isExpired,
        notes: notes?.trim() || null,
      },
      include: {
        documentTemplate: true,
        uploadedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Log audit
    await prisma.auditLog.create({
      data: {
        organizationId: organizationId,
        userId: session.user.id,
        action: "UPDATE_DOCUMENT",
        entity: "Document",
        entityId: documentId,
        metadata: {
          fileName: existingDocument.fileName,
          changes: { expiryDate, notes },
        },
      },
    });

    return NextResponse.json({ document: updatedDocument });
  } catch (error) {
    console.error("Errore aggiornamento documento:", error);
    return NextResponse.json(
      { error: "Errore nell'aggiornamento del documento" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; documentId: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
    }

    const { id: organizationId, documentId } = await params;

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

    // Verifica che il documento esista e appartenga all'organizzazione
    const existingDocument = await prisma.document.findFirst({
      where: {
        id: documentId,
        organizationId: organizationId,
      },
    });

    if (!existingDocument) {
      return NextResponse.json(
        { error: "Documento non trovato" },
        { status: 404 },
      );
    }

    // Elimina il file dal disco
    try {
      await unlink(existingDocument.storagePath);
    } catch (error) {
      console.error("Errore eliminazione file dal disco:", error);
      // Continua comunque con l'eliminazione dal database
    }

    // Elimina il documento dal database
    await prisma.document.delete({
      where: {
        id: documentId,
      },
    });

    // Log audit
    await prisma.auditLog.create({
      data: {
        organizationId: organizationId,
        userId: session.user.id,
        action: "DELETE_DOCUMENT",
        entity: "Document",
        entityId: documentId,
        metadata: {
          fileName: existingDocument.fileName,
          ownerType: existingDocument.ownerType,
          ownerId: existingDocument.ownerId,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Errore eliminazione documento:", error);
    return NextResponse.json(
      { error: "Errore nell'eliminazione del documento" },
      { status: 500 },
    );
  }
}
