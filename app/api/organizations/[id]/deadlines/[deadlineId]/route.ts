import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string; deadlineId: string }> },
) {
  try {
    console.log("[GET Deadline] Inizio richiesta");
    const session = await auth();
    console.log("[GET Deadline] Session:", { userId: session?.user?.id });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
    }

    const { id: organizationId, deadlineId } = await params;
    console.log("[GET Deadline] Params:", { organizationId, deadlineId });

    // Verifica che l'utente abbia accesso a questa organizzazione
    console.log("[GET Deadline] Ricerca org user...");
    const orgUser = await prisma.organizationUser.findFirst({
      where: {
        organizationId: organizationId,
        userId: session.user.id,
      },
    });
    console.log("[GET Deadline] Org user trovato:", {
      found: !!orgUser,
      isSuperAdmin: session.user.isSuperAdmin,
    });

    if (!orgUser && !session.user.isSuperAdmin) {
      console.log("[GET Deadline] Accesso negato");
      return NextResponse.json({ error: "Accesso negato" }, { status: 403 });
    }

    // Recupera la scadenza
    console.log("[GET Deadline] Ricerca scadenza...");
    console.log("[GET Deadline] deadlineId:", deadlineId);
    console.log("[GET Deadline] organizationId:", organizationId);

    // Prima recupera solo la scadenza senza include
    const deadlineBasic = await prisma.deadlineInstance.findUnique({
      where: {
        id: deadlineId,
      },
    });

    console.log("[GET Deadline] Deadline base trovata:", !!deadlineBasic);

    if (!deadlineBasic || deadlineBasic.organizationId !== organizationId) {
      console.log(
        "[GET Deadline] Scadenza non trovata o non appartiene all'organizzazione",
      );
      return NextResponse.json(
        { error: "Scadenza non trovata" },
        { status: 404 },
      );
    }

    // Ora carica le relazioni separatamente
    const [person, structure, template, reminders] = await Promise.all([
      deadlineBasic.personId
        ? prisma.person.findUnique({ where: { id: deadlineBasic.personId } })
        : Promise.resolve(null),
      deadlineBasic.structureId
        ? prisma.structure.findUnique({
            where: { id: deadlineBasic.structureId },
          })
        : Promise.resolve(null),
      deadlineBasic.templateId
        ? prisma.deadlineTemplate.findUnique({
            where: { id: deadlineBasic.templateId },
          })
        : Promise.resolve(null),
      prisma.deadlineReminder.findMany({
        where: { deadlineId: deadlineId },
        orderBy: { daysBefore: "desc" },
      }),
    ]);

    const deadline = {
      ...deadlineBasic,
      person,
      structure,
      template,
      reminders,
    };

    console.log("[GET Deadline] Scadenza trovata:", {
      found: !!deadline,
      id: deadline?.id,
    });

    if (!deadline) {
      console.log("[GET Deadline] Scadenza non trovata");
      return NextResponse.json(
        { error: "Scadenza non trovata" },
        { status: 404 },
      );
    }

    console.log("[GET Deadline] Ritorno scadenza con successo");
    return NextResponse.json({ deadline });
  } catch (error) {
    console.error("[GET Deadline] Errore recupero scadenza:", error);
    console.error(
      "[GET Deadline] Stack trace:",
      error instanceof Error ? error.stack : "N/A",
    );
    return NextResponse.json(
      { error: "Errore nel recupero della scadenza" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; deadlineId: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
    }

    const { id: organizationId, deadlineId } = await params;

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

    // Verifica che la scadenza esista e appartenga all'organizzazione
    const existingDeadline = await prisma.deadlineInstance.findFirst({
      where: {
        id: deadlineId,
        organizationId: organizationId,
      },
    });

    if (!existingDeadline) {
      return NextResponse.json(
        { error: "Scadenza non trovata" },
        { status: 404 },
      );
    }

    const body = await request.json();
    const { title, dueDate, personId, structureId, notes, status, reminders } =
      body;

    // Validazioni
    if (title !== undefined && !title?.trim()) {
      return NextResponse.json(
        { error: "Il titolo è obbligatorio" },
        { status: 400 },
      );
    }

    if (dueDate !== undefined && !dueDate) {
      return NextResponse.json(
        { error: "La data di scadenza è obbligatoria" },
        { status: 400 },
      );
    }

    // Se personId o structureId vengono aggiornati, verifica che appartengano all'organizzazione
    if (personId !== undefined && personId !== null) {
      const person = await prisma.person.findFirst({
        where: {
          id: personId,
          organizationId: organizationId,
        },
      });

      if (!person) {
        return NextResponse.json(
          {
            error:
              "Persona non trovata o non appartiene a questa organizzazione",
          },
          { status: 404 },
        );
      }
    }

    if (structureId !== undefined && structureId !== null) {
      const structure = await prisma.structure.findFirst({
        where: {
          id: structureId,
          organizationId: organizationId,
        },
      });

      if (!structure) {
        return NextResponse.json(
          {
            error:
              "Struttura non trovata o non appartiene a questa organizzazione",
          },
          { status: 404 },
        );
      }
    }

    // Prepara i dati da aggiornare
    const updateData: any = {};

    if (title !== undefined) updateData.title = title.trim();
    if (dueDate !== undefined) updateData.dueDate = new Date(dueDate);
    if (personId !== undefined) updateData.personId = personId;
    if (structureId !== undefined) updateData.structureId = structureId;
    if (notes !== undefined) updateData.notes = notes?.trim() || null;
    if (status !== undefined) {
      updateData.status = status;
      if (status === "DONE" && !existingDeadline.completedAt) {
        updateData.completedAt = new Date();
      } else if (status === "PENDING") {
        updateData.completedAt = null;
      }
    }

    // Gestisci i reminders se presenti
    if (reminders !== undefined) {
      // Elimina i vecchi reminders e crea i nuovi
      await prisma.deadlineReminder.deleteMany({
        where: {
          deadlineId: deadlineId,
        },
      });

      if (reminders.length > 0) {
        await prisma.deadlineReminder.createMany({
          data: reminders.map(
            (reminder: { daysBefore: number; message?: string }) => ({
              deadlineId: deadlineId,
              daysBefore: reminder.daysBefore,
              message: reminder.message?.trim() || null,
            }),
          ),
        });
      }
    }

    // Aggiorna la scadenza
    const updatedDeadline = await prisma.deadlineInstance.update({
      where: {
        id: deadlineId,
      },
      data: updateData,
      include: {
        person: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        structure: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        reminders: true,
        template: true,
      },
    });

    // Auto-rigenerazione: se la scadenza è ricorrente e viene completata, genera la prossima
    if (
      status === "DONE" &&
      existingDeadline.isRecurring &&
      existingDeadline.recurrenceActive &&
      existingDeadline.templateId
    ) {
      const template = await prisma.deadlineTemplate.findUnique({
        where: { id: existingDeadline.templateId },
      });

      if (template) {
        // Calcola la data della prossima occorrenza
        const currentDueDate = new Date(existingDeadline.dueDate);
        const nextDueDate = new Date(currentDueDate);

        switch (template.recurrenceUnit) {
          case "DAY":
            nextDueDate.setDate(
              nextDueDate.getDate() + template.recurrenceEvery,
            );
            break;
          case "MONTH":
            nextDueDate.setMonth(
              nextDueDate.getMonth() + template.recurrenceEvery,
            );
            break;
          case "YEAR":
            nextDueDate.setFullYear(
              nextDueDate.getFullYear() + template.recurrenceEvery,
            );
            break;
        }

        // Verifica se la prossima occorrenza rientra nel limite (se c'è)
        const shouldGenerate =
          !existingDeadline.recurrenceEndDate ||
          nextDueDate <= new Date(existingDeadline.recurrenceEndDate);

        if (shouldGenerate) {
          // Verifica quante occorrenze future esistono già per questo gruppo
          const futureOccurrences = await prisma.deadlineInstance.count({
            where: {
              recurrenceGroupId: existingDeadline.recurrenceGroupId,
              status: "PENDING",
              dueDate: {
                gt: new Date(),
              },
            },
          });

          // Genera la prossima solo se abbiamo meno di 3 occorrenze future
          if (futureOccurrences < 3) {
            await prisma.deadlineInstance.create({
              data: {
                organizationId: existingDeadline.organizationId,
                templateId: existingDeadline.templateId,
                title: existingDeadline.title,
                dueDate: nextDueDate,
                status: "PENDING",
                personId: existingDeadline.personId,
                structureId: existingDeadline.structureId,
                notes: existingDeadline.notes,
                isRecurring: true,
                recurrenceActive: true,
                recurrenceEndDate: existingDeadline.recurrenceEndDate,
                recurrenceGroupId: existingDeadline.recurrenceGroupId,
              },
            });
          }
        }
      }
    }

    // Log audit
    await prisma.auditLog.create({
      data: {
        organizationId: organizationId,
        userId: session.user.id,
        action: "UPDATE_DEADLINE",
        entity: "DeadlineInstance",
        entityId: deadlineId,
        metadata: {
          changes: updateData,
        },
      },
    });

    return NextResponse.json({ deadline: updatedDeadline });
  } catch (error) {
    console.error("Errore aggiornamento scadenza:", error);
    return NextResponse.json(
      { error: "Errore nell'aggiornamento della scadenza" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; deadlineId: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
    }

    const { id: organizationId, deadlineId } = await params;

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

    // Verifica che la scadenza esista e appartenga all'organizzazione
    const existingDeadline = await prisma.deadlineInstance.findFirst({
      where: {
        id: deadlineId,
        organizationId: organizationId,
      },
    });

    if (!existingDeadline) {
      return NextResponse.json(
        { error: "Scadenza non trovata" },
        { status: 404 },
      );
    }

    // Elimina la scadenza (i reminders verranno eliminati in cascata)
    await prisma.deadlineInstance.delete({
      where: {
        id: deadlineId,
      },
    });

    // Log audit
    await prisma.auditLog.create({
      data: {
        organizationId: organizationId,
        userId: session.user.id,
        action: "DELETE_DEADLINE",
        entity: "DeadlineInstance",
        entityId: deadlineId,
        metadata: {
          title: existingDeadline.title,
          dueDate: existingDeadline.dueDate,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Errore eliminazione scadenza:", error);
    return NextResponse.json(
      { error: "Errore nell'eliminazione della scadenza" },
      { status: 500 },
    );
  }
}
