import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { Users, Building2, UserCircle, MapPin, Calendar, Search, FileText, Shield, Settings } from "lucide-react";

async function getAdminDashboardData() {
  const [totalUsers, totalOrganizations, totalPeople, totalStructures, totalDeadlines, totalTemplates, recentAuditLogs] = await Promise.all([
    prisma.user.count(),
    prisma.organization.count(),
    prisma.person.count(),
    prisma.structure.count(),
    prisma.deadlineInstance.count(),
    prisma.deadlineTemplate.count({ where: { ownerType: "GLOBAL" } }),
    prisma.auditLog.count(),
  ]);

  const recentUsers = await prisma.user.findMany({
    take: 5,
    orderBy: {
      createdAt: "desc",
    },
    include: {
      organizationUsers: {
        include: {
          organization: true,
        },
      },
    },
  });

  const recentOrganizations = await prisma.organization.findMany({
    take: 5,
    orderBy: {
      createdAt: "desc",
    },
    include: {
      users: {
        include: {
          user: {
            select: {
              email: true,
              name: true,
            },
          },
        },
      },
      _count: {
        select: {
          people: true,
          structures: true,
        },
      },
    },
  });

  return {
    stats: {
      totalUsers,
      totalOrganizations,
      totalPeople,
      totalStructures,
      totalDeadlines,
      totalTemplates,
      recentAuditLogs,
    },
    recentUsers,
    recentOrganizations,
  };
}

export default async function AdminDashboardPage() {
  const session = await auth();

  if (!session?.user?.isSuperAdmin) {
    redirect("/auth/login");
  }

  const data = await getAdminDashboardData();

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard Amministratore</h2>
        <p className="text-muted-foreground">
          Panoramica completa del sistema e gestione avanzata
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Link href="/admin/users">
          <Card className="hover:bg-accent transition-colors cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Utenti Totali</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground mt-1">Gestisci tutti gli utenti →</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/organizations">
          <Card className="hover:bg-accent transition-colors cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Organizzazioni</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.stats.totalOrganizations}</div>
              <p className="text-xs text-muted-foreground mt-1">Vedi tutte le organizzazioni →</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/people">
          <Card className="hover:bg-accent transition-colors cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Personale</CardTitle>
              <UserCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.stats.totalPeople}</div>
              <p className="text-xs text-muted-foreground mt-1">Gestisci tutte le persone →</p>
            </CardContent>
          </Card>
        </Link>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Strutture</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.stats.totalStructures}</div>
            <p className="text-xs text-muted-foreground mt-1">Totale strutture operative</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scadenze</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.stats.totalDeadlines}</div>
            <p className="text-xs text-muted-foreground mt-1">Totale scadenze attive</p>
          </CardContent>
        </Card>

        <Link href="/admin/global">
          <Card className="hover:bg-accent transition-colors cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Template Globali</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.stats.totalTemplates}</div>
              <p className="text-xs text-muted-foreground mt-1">Gestisci template →</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/audit">
          <Card className="hover:bg-accent transition-colors cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Audit Log</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.stats.recentAuditLogs}</div>
              <p className="text-xs text-muted-foreground mt-1">Vedi log attività →</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/settings">
          <Card className="hover:bg-accent transition-colors cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Impostazioni</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Sistema</div>
              <p className="text-xs text-muted-foreground mt-1">Configurazione →</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Link href="/admin/search">
          <Card className="hover:bg-accent transition-colors cursor-pointer border-2 border-blue-200">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Search className="h-5 w-5 text-blue-600" />
                <CardTitle>Ricerca Globale</CardTitle>
              </div>
              <CardDescription>
                Cerca utenti, organizzazioni, personale e strutture in tutto il sistema
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/admin/global">
          <Card className="hover:bg-accent transition-colors cursor-pointer border-2 border-purple-200">
            <CardHeader>
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-purple-600" />
                <CardTitle>Template Globali</CardTitle>
              </div>
              <CardDescription>
                Gestisci template di scadenze e ruoli disponibili per tutte le organizzazioni
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/admin/audit">
          <Card className="hover:bg-accent transition-colors cursor-pointer border-2 border-orange-200">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-orange-600" />
                <CardTitle>Audit Log</CardTitle>
              </div>
              <CardDescription>
                Visualizza tutte le azioni critiche e modifiche effettuate nel sistema
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Utenti Recenti</CardTitle>
                <CardDescription>Ultimi 5 utenti registrati</CardDescription>
              </div>
              <Link href="/admin/users" className="text-sm text-blue-600 hover:underline">
                Vedi tutti →
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.recentUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between border-b pb-4 last:border-0">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{user.name || user.email}</p>
                      {user.isSuperAdmin && (
                        <span className="text-xs px-2 py-0.5 rounded bg-red-100 text-red-800">
                          Super Admin
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                    <p className="text-xs text-muted-foreground">
                      {user.organizationUsers.length} organizzazioni • Registrato il {formatDate(user.createdAt)}
                    </p>
                  </div>
                  <Link
                    href={`/admin/users/${user.id}`}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Dettagli →
                  </Link>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Organizzazioni Recenti</CardTitle>
                <CardDescription>Ultime 5 organizzazioni create</CardDescription>
              </div>
              <Link href="/admin/organizations" className="text-sm text-blue-600 hover:underline">
                Vedi tutte →
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.recentOrganizations.map((org) => (
                <div key={org.id} className="flex items-center justify-between border-b pb-4 last:border-0">
                  <div>
                    <p className="font-medium">{org.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {org.users.length} utenti • {org._count.people} persone • {org._count.structures} strutture
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Creata il {formatDate(org.createdAt)}
                    </p>
                  </div>
                  <Link
                    href={`/admin/organizations/${org.id}`}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Dettagli →
                  </Link>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
