import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, Users, Calendar, Plus, MapPin } from "lucide-react";
import Link from "next/link";
import { StructuresLayoutWrapper } from "@/components/structures/structures-layout-wrapper";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { getCurrentUserWithRole } from "@/lib/auth-utils";
import { canCreateStructures } from "@/lib/permissions";

interface Structure {
  id: string;
  name: string;
  city: string | null;
  address: string | null;
  active: boolean;
  _count: {
    personStructures: number;
    deadlineInstances: number;
  };
}

interface Organization {
  id: string;
  name: string;
  structures: Structure[];
}

export default async function StructuresListPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/login");
  }

  // Get user with role for permission checks
  const userWithRole = await getCurrentUserWithRole();
  const canCreateNewStructures = userWithRole
    ? canCreateStructures(userWithRole)
    : false;

  // Fetch organization server-side using Prisma
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
            include: {
              _count: {
                select: {
                  personStructures: true,
                  deadlineInstances: true,
                },
              },
            },
            orderBy: {
              createdAt: "asc",
            },
          },
        },
      },
    },
  });

  const organization = orgUser?.organization || null;

  if (!organization) {
    return (
      <StructuresLayoutWrapper>
        <div className="container mx-auto p-6">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Benvenuto!</CardTitle>
              <CardDescription>
                Non hai ancora un'organizzazione. Completa l'onboarding per
                iniziare.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/onboarding">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Crea Organizzazione
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </StructuresLayoutWrapper>
    );
  }

  if (organization.structures.length === 0) {
    return (
      <StructuresLayoutWrapper>
        <div className="container mx-auto p-6">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Benvenuto, {organization.name}!</CardTitle>
              <CardDescription>
                {canCreateNewStructures
                  ? "Non hai ancora nessuna struttura. Creane una per iniziare."
                  : "Non ci sono strutture disponibili. Contatta l'amministratore."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {canCreateNewStructures && (
                <Link href="/structures/new">
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Crea la tua prima struttura
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        </div>
      </StructuresLayoutWrapper>
    );
  }

  return (
    <StructuresLayoutWrapper>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">
              Benvenuto, {organization.name}
            </h2>
            <p className="text-muted-foreground">
              Seleziona la struttura su cui vuoi lavorare
            </p>
          </div>
          {canCreateNewStructures && (
            <Link href="/structures/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Nuova Struttura
              </Button>
            </Link>
          )}
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {organization.structures.map((structure) => (
            <Card
              key={structure.id}
              className="hover:shadow-lg transition-shadow"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-purple-600" />
                    <CardTitle className="text-lg">{structure.name}</CardTitle>
                  </div>
                  {structure.active && (
                    <span className="text-xs px-2 py-1 rounded bg-green-100 text-green-800">
                      Attiva
                    </span>
                  )}
                </div>
                {structure.city && (
                  <CardDescription className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {structure.city}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="space-y-1">
                    <div className="flex items-center justify-center">
                      <Users className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="text-2xl font-bold">
                      {structure._count.personStructures}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Personale
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-center">
                      <Calendar className="h-4 w-4 text-orange-600" />
                    </div>
                    <div className="text-2xl font-bold">
                      {structure._count.deadlineInstances}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Scadenze
                    </div>
                  </div>
                </div>

                {structure.address && (
                  <p className="text-xs text-muted-foreground truncate">
                    📍 {structure.address}
                  </p>
                )}

                <Link href={`/structures/${structure.id}`} className="block">
                  <Button className="w-full" variant="outline">
                    Apri Struttura
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </StructuresLayoutWrapper>
  );
}
