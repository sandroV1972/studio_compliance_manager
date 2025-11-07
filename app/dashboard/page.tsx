import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/login");
  }

  // Recupera l'organizzazione dell'utente (1 user = 1 org)
  const orgUser = await prisma.organizationUser.findUnique({
    where: {
      userId: session.user.id,
    },
    include: {
      organization: {
        include: {
          structures: {
            where: {
              active: true,
            },
            orderBy: {
              createdAt: "asc",
            },
          },
        },
      },
    },
  });

  // Se non ha organizzazioni, reindirizza alla pagina di onboarding
  if (!orgUser) {
    redirect("/onboarding");
  }

  // Reindirizza alla pagina delle strutture
  redirect("/structures");
}
