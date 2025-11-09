import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string; personId: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
    }

    const { id: organizationId, personId } = await params;

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

    // Verifica che la persona appartenga all'organizzazione
    const person = await prisma.person.findFirst({
      where: {
        id: personId,
        organizationId: organizationId,
      },
    });

    if (!person) {
      return NextResponse.json(
        { error: "Persona non trovata" },
        { status: 404 },
      );
    }

    // Recupera i documenti
    const documents = await prisma.document.findMany({
      where: {
        organizationId: organizationId,
        ownerType: "PERSON",
        ownerId: personId,
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
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ documents });
  } catch (error) {
    console.error("Errore recupero documenti persona:", error);
    return NextResponse.json(
      { error: "Errore nel recupero dei documenti" },
      { status: 500 },
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string; personId: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
    }

    const { id: organizationId, personId } = await params;

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

    // Verifica che la persona appartenga all'organizzazione
    const person = await prisma.person.findFirst({
      where: {
        id: personId,
        organizationId: organizationId,
      },
    });

    if (!person) {
      return NextResponse.json(
        { error: "Persona non trovata" },
        { status: 404 },
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const templateId = formData.get("templateId") as string | null;
    const expiryDate = formData.get("expiryDate") as string | null;
    const notes = formData.get("notes") as string | null;

    if (!file) {
      return NextResponse.json(
        { error: "File è obbligatorio" },
        { status: 400 },
      );
    }

    // Verifica il template se fornito
    if (templateId) {
      const template = await prisma.documentTemplate.findUnique({
        where: { id: templateId },
      });

      if (!template || template.scope !== "PERSON") {
        return NextResponse.json(
          { error: "Template non valido per persone" },
          { status: 400 },
        );
      }

      // Verifica formato file se specificato nel template
      if (template.fileFormats) {
        const allowedFormats = template.fileFormats
          .split(",")
          .map((f) => f.trim().toLowerCase());
        const fileExtension = file.name.split(".").pop()?.toLowerCase();
        if (fileExtension && !allowedFormats.includes(fileExtension)) {
          return NextResponse.json(
            {
              error: `Formato file non valido. Formati accettati: ${template.fileFormats}`,
            },
            { status: 400 },
          );
        }
      }

      // Verifica dimensione file se specificato nel template
      if (template.maxSizeKB && file.size > template.maxSizeKB * 1024) {
        return NextResponse.json(
          {
            error: `File troppo grande. Dimensione massima: ${template.maxSizeKB}KB`,
          },
          { status: 400 },
        );
      }
    }

    // Crea directory se non esiste
    const uploadDir = join(
      process.cwd(),
      "uploads",
      organizationId,
      "people",
      personId,
    );
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Genera nome file univoco
    const timestamp = Date.now();
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const fileName = `${timestamp}_${sanitizedFileName}`;
    const filePath = join(uploadDir, fileName);

    // Salva il file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Calcola se il documento è scaduto
    const isExpired = expiryDate ? new Date(expiryDate) < new Date() : false;

    // Salva nel database
    const document = await prisma.document.create({
      data: {
        organizationId: organizationId,
        templateId: templateId || null,
        ownerType: "PERSON",
        ownerId: personId,
        fileName: file.name,
        fileType: file.type || null,
        fileSize: file.size,
        storagePath: filePath,
        uploadedById: session.user.id,
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
        action: "UPLOAD_DOCUMENT",
        entity: "Document",
        entityId: document.id,
        metadata: {
          fileName: file.name,
          personId: personId,
          templateId: templateId,
        },
      },
    });

    return NextResponse.json({ document });
  } catch (error) {
    console.error("Errore upload documento persona:", error);
    return NextResponse.json(
      { error: "Errore nell'upload del documento" },
      { status: 500 },
    );
  }
}
