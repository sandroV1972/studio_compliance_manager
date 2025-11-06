import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email richiesta" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        accountStatus: true,
        isSuperAdmin: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Utente non trovato" },
        { status: 404 },
      );
    }

    // Restituisci informazioni sullo stato dell'account
    const response: {
      exists: boolean;
      accountStatus: string;
      canLogin: boolean;
      message?: string;
    } = {
      exists: true,
      accountStatus: user.accountStatus || "UNKNOWN",
      canLogin: false,
    };

    if (user.isSuperAdmin) {
      response.canLogin = true;
      response.message = "Account SuperAdmin attivo";
    } else if (user.accountStatus === "APPROVED") {
      response.canLogin = true;
      response.message = "Account attivo";
    } else if (user.accountStatus === "PENDING_VERIFICATION") {
      response.message =
        "Email non verificata. Controlla la tua casella di posta.";
    } else if (user.accountStatus === "PENDING_APPROVAL") {
      response.message =
        "Account in attesa di approvazione. Verrai contattato quando l'account sarà attivato.";
    } else if (user.accountStatus === "REJECTED") {
      response.message =
        "Account rifiutato. Contatta l'amministratore per maggiori informazioni.";
    } else {
      response.message = "Account non autorizzato.";
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error("Check account error:", error);
    return NextResponse.json(
      { error: "Errore durante la verifica dell'account" },
      { status: 500 },
    );
  }
}
