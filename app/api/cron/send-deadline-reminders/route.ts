import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendDeadlineReminderEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

/**
 * Endpoint cron per l'invio automatico dei reminder delle scadenze.
 * Dovrebbe essere chiamato giornalmente alle 8:00 AM.
 *
 * Per configurare con un servizio cron esterno (es. cron-job.org, EasyCron, Vercel Cron):
 * - URL: https://your-domain.com/api/cron/send-deadline-reminders
 * - Method: POST
 * - Header: Authorization: Bearer YOUR_CRON_SECRET
 * - Schedule: 0 8 * * * (ogni giorno alle 8:00 AM)
 */
export async function POST(request: Request) {
  try {
    // Verifica del token di sicurezza per il cron job
    const authHeader = request.headers.get("authorization");
    const expectedToken = process.env.CRON_SECRET;

    if (!expectedToken) {
      console.error("CRON_SECRET non configurato");
      return NextResponse.json(
        { error: "Cron job non configurato" },
        { status: 500 },
      );
    }

    if (authHeader !== `Bearer ${expectedToken}`) {
      console.error("Tentativo di accesso non autorizzato al cron job");
      return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
    }

    console.log("🔄 Inizio processo di invio reminder scadenze...");

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Trova tutte le scadenze attive con reminders non ancora inviati
    const deadlines = await prisma.deadlineInstance.findMany({
      where: {
        status: "PENDING",
        dueDate: {
          gte: today, // Solo scadenze future
        },
        reminders: {
          some: {
            notified: false,
          },
        },
      },
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
        reminders: {
          where: {
            notified: false,
          },
          orderBy: {
            daysBefore: "desc",
          },
        },
      },
    });

    console.log(
      `📋 Trovate ${deadlines.length} scadenze con reminder da processare`,
    );

    let emailsSent = 0;
    let errors = 0;

    for (const deadline of deadlines) {
      const dueDate = new Date(deadline.dueDate);
      dueDate.setHours(0, 0, 0, 0);

      const daysUntilDue = Math.ceil(
        (dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
      );

      console.log(
        `📅 Scadenza "${deadline.title}" - Mancano ${daysUntilDue} giorni`,
      );

      for (const reminder of deadline.reminders) {
        // Verifica se è il momento di inviare questo reminder
        if (reminder.daysBefore === daysUntilDue) {
          try {
            // Determina il destinatario (persona o struttura)
            let recipientEmail: string | null = null;
            let recipientName: string = "";

            if (deadline.person && deadline.person.email) {
              recipientEmail = deadline.person.email;
              recipientName = `${deadline.person.firstName} ${deadline.person.lastName}`;
            } else if (deadline.structure && deadline.structure.email) {
              recipientEmail = deadline.structure.email;
              recipientName = deadline.structure.name;
            }

            if (!recipientEmail) {
              console.warn(
                `⚠️ Nessuna email trovata per scadenza "${deadline.title}" (Reminder ID: ${reminder.id})`,
              );
              continue;
            }

            // Invia l'email di reminder
            await sendDeadlineReminderEmail(
              recipientEmail,
              recipientName,
              deadline.title,
              deadline.dueDate,
              reminder.daysBefore,
              reminder.message || undefined,
            );

            // Marca il reminder come inviato
            await prisma.deadlineReminder.update({
              where: {
                id: reminder.id,
              },
              data: {
                notified: true,
                notifiedAt: new Date(),
              },
            });

            emailsSent++;
            console.log(
              `✅ Reminder inviato a ${recipientEmail} per "${deadline.title}" (${reminder.daysBefore} giorni prima)`,
            );
          } catch (error) {
            errors++;
            console.error(
              `❌ Errore invio reminder per scadenza "${deadline.title}":`,
              error,
            );
          }
        }
      }
    }

    const result = {
      success: true,
      timestamp: new Date().toISOString(),
      stats: {
        deadlinesProcessed: deadlines.length,
        emailsSent,
        errors,
      },
    };

    console.log("✅ Processo completato:", result);

    return NextResponse.json(result);
  } catch (error) {
    console.error("❌ Errore generale nel processo di invio reminder:", error);
    return NextResponse.json(
      {
        error: "Errore nel processo di invio reminder",
        details: error instanceof Error ? error.message : "Errore sconosciuto",
      },
      { status: 500 },
    );
  }
}

// Endpoint GET per verificare lo stato del cron job (solo per testing)
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const expectedToken = process.env.CRON_SECRET;

  if (!expectedToken) {
    return NextResponse.json(
      { error: "Cron job non configurato" },
      { status: 500 },
    );
  }

  if (authHeader !== `Bearer ${expectedToken}`) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Conta i reminder in attesa di invio
  const pendingReminders = await prisma.deadlineReminder.count({
    where: {
      notified: false,
      deadline: {
        status: "PENDING",
        dueDate: {
          gte: today,
        },
      },
    },
  });

  // Conta i reminder inviati oggi
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const sentToday = await prisma.deadlineReminder.count({
    where: {
      notified: true,
      notifiedAt: {
        gte: todayStart,
        lte: todayEnd,
      },
    },
  });

  return NextResponse.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    stats: {
      pendingReminders,
      sentToday,
    },
    info: "Endpoint cron per l'invio automatico dei reminder delle scadenze",
    schedule: "Giornalmente alle 8:00 AM",
  });
}
