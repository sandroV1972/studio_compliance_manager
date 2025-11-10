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

    const { id: structureId } = await params;
    const { searchParams } = new URL(request.url);
    const upcoming = searchParams.get("upcoming") === "true";

    // Verifica che l'utente abbia accesso a questa struttura
    const structure = await prisma.structure.findUnique({
      where: { id: structureId },
      select: { organizationId: true },
    });

    if (!structure) {
      return NextResponse.json(
        { error: "Struttura non trovata" },
        { status: 404 },
      );
    }

    const orgUser = await prisma.organizationUser.findFirst({
      where: {
        organizationId: structure.organizationId,
        userId: session.user.id,
      },
    });

    if (!orgUser && !session.user.isSuperAdmin) {
      return NextResponse.json({ error: "Accesso negato" }, { status: 403 });
    }

    // Query base per le scadenze della struttura
    const whereClause: any = {
      structureId: structureId,
      status: { not: "CANCELLED" },
    };

    // Se richieste solo le prossime scadenze
    if (upcoming) {
      whereClause.dueDate = { gte: new Date() };
      whereClause.status = { in: ["PENDING", "OVERDUE"] };
    }

    const deadlines = await prisma.deadlineInstance.findMany({
      where: whereClause,
      include: {
        template: {
          select: {
            title: true,
            complianceType: true,
          },
        },
      },
      orderBy: { dueDate: "asc" },
    });

    return NextResponse.json(deadlines);
  } catch (error) {
    console.error("Errore recupero scadenze struttura:", error);
    return NextResponse.json(
      { error: "Errore nel recupero delle scadenze" },
      { status: 500 },
    );
  }
}
