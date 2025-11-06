import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { Building2, Users, UserCircle, MapPin, Calendar, Eye } from "lucide-react";

async function getAllOrganizations() {
  const organizations = await prisma.organization.findMany({
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
              isSuperAdmin: true,
            },
          },
        },
      },
      _count: {
        select: {
          people: true,
          structures: true,
          deadlineInstances: true,
        },
      },
    },
  });

  return organizations;
}

export default async function AdminOrganizationsPage() {
  const session = await auth();

  if (!session?.user?.isSuperAdmin) {
    redirect("/auth/login");
  }

  const organizations = await getAllOrganizations();

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Gestione Organizzazioni</h2>
          <p className="text-muted-foreground">
            Tutte le organizzazioni del sistema ({organizations.length} totali)
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Totale Organizzazioni</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{organizations.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Totale Utenti</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {organizations.reduce((sum, org) => sum + org.users.length, 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Totale Personale</CardTitle>
            <UserCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {organizations.reduce((sum, org) => sum + org._count.people, 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Totale Strutture</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {organizations.reduce((sum, org) => sum + org._count.structures, 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tutte le Organizzazioni</CardTitle>
          <CardDescription>
            Lista completa delle organizzazioni registrate con dettagli e statistiche
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Organizzazione</TableHead>
                <TableHead className="text-center">Utenti</TableHead>
                <TableHead className="text-center">Personale</TableHead>
                <TableHead className="text-center">Strutture</TableHead>
                <TableHead className="text-center">Scadenze</TableHead>
                <TableHead>Data Creazione</TableHead>
                <TableHead className="text-right">Azioni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {organizations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    Nessuna organizzazione trovata
                  </TableCell>
                </TableRow>
              ) : (
                organizations.map((org) => (
                  <TableRow key={org.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{org.name}</p>
                        {org.users.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {org.users.slice(0, 3).map((orgUser) => (
                              <span
                                key={orgUser.id}
                                className="text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-700"
                              >
                                {orgUser.user.name || orgUser.user.email.split('@')[0]}
                                {orgUser.role === 'OWNER' && ' 👑'}
                                {orgUser.user.isSuperAdmin && ' ⭐'}
                              </span>
                            ))}
                            {org.users.length > 3 && (
                              <span className="text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-700">
                                +{org.users.length - 3}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-800 font-semibold text-sm">
                        {org.users.length}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-100 text-green-800 font-semibold text-sm">
                        {org._count.people}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-orange-100 text-orange-800 font-semibold text-sm">
                        {org._count.structures}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 text-purple-800 font-semibold text-sm">
                        {org._count.deadlineInstances}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {formatDate(org.createdAt)}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Link
                        href={`/admin/organizations/${org.id}`}
                        className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline"
                      >
                        <Eye className="h-4 w-4" />
                        Dettagli
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
