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
        accountStatus: "APPROVED",
      },
    });

    console.log("=== USER APPROVED ===");
    console.log("User:", user.email);
    console.log("Approved by:", session.user.email);
    console.log("====================");

    return NextResponse.json({
      message: "Utente approvato con successo",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    console.error("Error approving user:", error);
    return NextResponse.json(
      { error: "Errore nell'approvazione dell'utente" },
      { status: 500 }
    );
  }
}
