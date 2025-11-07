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

    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const month = searchParams.get("month");
    const year = searchParams.get("year");

    // Verifica che l'utente abbia accesso a questa organizzazione
    const orgUser = await prisma.organizationUser.findFirst({
      where: {
        organizationId: id,
        userId: session.user.id,
      },
    });

    if (!orgUser && !session.user.isSuperAdmin) {
      return NextResponse.json({ error: "Accesso negato" }, { status: 403 });
    }

    // Costruisci i filtri per data se specificati
    let dateFilter = {};
    if (month && year) {
      const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
      const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59);
      dateFilter = {
        dueDate: {
          gte: startDate,
          lte: endDate,
        },
      };
    }

    // Recupera le scadenze dell'organizzazione
    const deadlines = await prisma.deadlineInstance.findMany({
      where: {
        organizationId: id,
        ...dateFilter,
      },
      include: {
        person: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        structure: {
          select: {
            id: true,
            name: true,
          },
        },
        template: {
          select: {
            id: true,
            title: true,
            complianceType: true,
          },
        },
      },
      orderBy: {
        dueDate: "asc",
      },
    });

    // Calcola statistiche
    const now = new Date();
    const stats = {
      total: deadlines.length,
      pending: deadlines.filter((d) => d.status === "PENDING").length,
      overdue: deadlines.filter(
        (d) => d.status === "PENDING" && new Date(d.dueDate) < now,
      ).length,
      completed: deadlines.filter((d) => d.status === "DONE").length,
      upcoming: deadlines.filter(
        (d) =>
          d.status === "PENDING" &&
          new Date(d.dueDate) >= now &&
          new Date(d.dueDate) <=
            new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
      ).length,
    };

    return NextResponse.json({
      deadlines,
      stats,
    });
  } catch (error) {
    console.error("Errore recupero scadenze:", error);
    return NextResponse.json(
      { error: "Errore nel recupero delle scadenze" },
      { status: 500 },
    );
  }
}
