import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { Users, Building2, Shield, Eye, Calendar } from "lucide-react";

async function getAllUsers() {
  const users = await prisma.user.findMany({
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

  return users;
}

export default async function AdminUsersPage() {
  const session = await auth();

  if (!session?.user?.isSuperAdmin) {
    redirect("/auth/login");
  }

  const users = await getAllUsers();
  const superAdmins = users.filter(u => u.isSuperAdmin).length;
  const totalOrgs = users.reduce((sum, user) => sum + user.organizationUsers.length, 0);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Gestione Utenti</h2>
          <p className="text-muted-foreground">
            Tutti gli utenti del sistema ({users.length} totali)
          </p>
        </div>
        <Link
          href="/admin/users/pending"
          className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium transition-colors"
        >
          <Calendar className="h-4 w-4" />
          Utenti in Attesa
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Totale Utenti</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Super Admin</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{superAdmins}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Associazioni Org</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrgs}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Media Org/Utente</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.length > 0 ? (totalOrgs / users.length).toFixed(1) : 0}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tutti gli Utenti</CardTitle>
          <CardDescription>
            Lista completa degli utenti registrati con ruoli e organizzazioni
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Utente</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Ruolo Sistema</TableHead>
                <TableHead>Organizzazioni</TableHead>
                <TableHead>Data Registrazione</TableHead>
                <TableHead className="text-right">Azioni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    Nessun utente trovato
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{user.name || "N/A"}</p>
                        {user.isSuperAdmin && (
                          <span className="text-xs px-2 py-0.5 rounded bg-red-100 text-red-800 font-semibold">
                            ⭐ Super Admin
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </TableCell>
                    <TableCell>
                      {user.isSuperAdmin ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-100 text-red-800 text-xs font-medium">
                          <Shield className="h-3 w-3" />
                          Super Admin
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gray-100 text-gray-800 text-xs font-medium">
                          <Users className="h-3 w-3" />
                          Utente
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {user.organizationUsers.length === 0 ? (
                        <span className="text-sm text-muted-foreground">Nessuna</span>
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {user.organizationUsers.slice(0, 2).map((orgUser) => (
                            <Link
                              key={orgUser.id}
                              href={`/admin/organizations/${orgUser.organizationId}`}
                              className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-800 hover:bg-blue-200"
                            >
                              {orgUser.organization.name}
                              {orgUser.role === 'OWNER' && ' 👑'}
                              {orgUser.role === 'ADMIN' && ' 🔧'}
                            </Link>
                          ))}
                          {user.organizationUsers.length > 2 && (
                            <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-700">
                              +{user.organizationUsers.length - 2}
                            </span>
                          )}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {formatDate(user.createdAt)}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Link
                        href={`/admin/users/${user.id}`}
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
