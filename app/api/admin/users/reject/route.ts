import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.isSuperAdmin) {
      return NextResponse.json(
        { error: "Non autorizzato" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "ID utente mancante" },
        { status: 400 }
      );
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        accountStatus: "REJECTED",
      },
    });

    console.log("=== USER REJECTED ===");
    console.log("User:", user.email);
    console.log("Rejected by:", session.user.email);
    console.log("====================");

    return NextResponse.json({
      message: "Utente rifiutato",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    console.error("Error rejecting user:", error);
    return NextResponse.json(
      { error: "Errore nel rifiuto dell'utente" },
      { status: 500 }
    );
  }
}
