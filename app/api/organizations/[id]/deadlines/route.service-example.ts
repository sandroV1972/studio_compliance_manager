/**
 * ESEMPIO: Versione refactorata con Service Layer
 *
 * Questa è la versione della route POST /api/organizations/[id]/deadlines
 * che usa il DeadlineService invece di avere tutta la logica inline.
 *
 * Confronta con route.ts per vedere la differenza!
 */

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getCurrentUserWithRole } from "@/lib/auth-utils";
import { canCreateDeadlines, hasAccessToOrganization } from "@/lib/permissions";
import { deadlineService } from "@/lib/services/deadline-service";
import { handleServiceError } from "@/lib/api/handle-service-error";
import { createApiLogger } from "@/lib/logger";

/**
 * POST /api/organizations/[id]/deadlines
 * Crea una nuova deadline
 *
 * CONFRONTO CON VERSIONE PRECEDENTE:
 * - PRIMA: ~150 righe di codice con logica complessa
 * - DOPO: ~50 righe, solo responsabilità HTTP
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: organizationId } = await params;
  const logger = createApiLogger(
    "POST",
    `/api/organizations/${organizationId}/deadlines`,
  );

  try {
    // ========== AUTENTICAZIONE ==========
    const session = await auth();
    if (!session?.user?.id) {
      logger.warn({ msg: "Unauthorized create deadline attempt" });
      return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
    }

    logger.info({
      msg: "Creating deadline",
      userId: session.user.id,
      organizationId,
    });

    // ========== AUTORIZZAZIONE ==========
    const user = await getCurrentUserWithRole();
    if (!user) {
      return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
    }

    // Verifica accesso all'organizzazione
    if (!hasAccessToOrganization(user, organizationId)) {
      logger.warn({
        msg: "Access denied to organization",
        userId: session.user.id,
        organizationId,
      });
      return NextResponse.json({ error: "Accesso negato" }, { status: 403 });
    }

    // Verifica permesso di creazione scadenze
    if (!canCreateDeadlines(user)) {
      logger.warn({
        msg: "Permission denied to create deadlines",
        userId: session.user.id,
      });
      return NextResponse.json(
        {
          error:
            "Non hai i permessi per creare scadenze. Solo amministratori e responsabili possono creare scadenze.",
        },
        { status: 403 },
      );
    }

    // ========== PARSING INPUT ==========
    const body = await request.json();

    // ========== BUSINESS LOGIC (delegata al service) ==========
    const deadline = await deadlineService.createDeadline({
      organizationId,
      userId: session.user.id,
      data: body,
    });

    // ========== RESPONSE ==========
    logger.info({
      msg: "Deadline created successfully",
      deadlineId: deadline.id,
    });

    return NextResponse.json({ deadline }, { status: 201 });
  } catch (error) {
    // ========== ERROR HANDLING ==========
    return handleServiceError(error, logger);
  }
}

/**
 * VANTAGGI DI QUESTO APPROCCIO:
 *
 * 1. LEGGIBILITÀ ✅
 *    - Chiaro cosa fa ogni sezione (auth, authz, business logic, response)
 *    - Facile capire il flusso della richiesta
 *
 * 2. TESTABILITÀ ✅
 *    - Posso testare deadlineService.createDeadline() senza mockare HTTP
 *    - Test più veloci e affidabili
 *
 * 3. RIUSABILITÀ ✅
 *    - Stessa logica usabile da API, Server Actions, cron jobs, CLI
 *
 * 4. MANUTENIBILITÀ ✅
 *    - Modifiche alla business logic solo in deadlineService
 *    - Modifiche all'API solo se cambia HTTP contract
 *
 * 5. SEPARAZIONE RESPONSABILITÀ ✅
 *    - Route: HTTP (auth, authz, parsing, response)
 *    - Service: Business Logic (validazione, calcoli, database)
 */
