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

    const structure = await prisma.structure.findUnique({
      where: {
        id,
      },
      include: {
        _count: {
          select: {
            personStructures: true,
            deadlineInstances: true,
          },
        },
      },
    });

    if (!structure) {
      return NextResponse.json(
        { error: "Struttura non trovata" },
        { status: 404 },
      );
    }

    return NextResponse.json(structure);
  } catch (error) {
    console.error("Errore recupero struttura:", error);
    return NextResponse.json(
      { error: "Errore nel recupero della struttura" },
      { status: 500 },
    );
  }
}
