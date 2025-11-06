import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { EditUserForm } from "@/components/admin/edit-user-form";
import { Mail, Building2, Shield, Calendar, ArrowLeft, UserCircle, Crown, ExternalLink } from "lucide-react";

async function getUserDetails(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      organizationUsers: {
        include: {
          organization: true,
        },
      },
    },
  });

  return user;
}

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();

  if (!session?.user?.isSuperAdmin) {
    redirect("/auth/login");
  }

  const resolvedParams = await params;
  const user = await getUserDetails(resolvedParams.id);

  if (!user) {
    redirect("/admin/users");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-blue-50/20">
      <div className="container mx-auto p-8 max-w-7xl">
        <div className="mb-6">
          <Link 
            href="/admin/users" 
            className="inline-flex items-center gap-2 text-sm font-medium text-purple-700 hover:text-purple-900 transition-colors group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            Torna agli utenti
          </Link>
        </div>

        <div className="space-y-6">
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl shadow-lg p-8 text-white">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-white/20 backdrop-blur-sm p-4 rounded-full">
                  <UserCircle className="h-12 w-12" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold mb-2">{user.name}</h1>
                  <div className="flex items-center gap-4 text-purple-100">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      <span>{user.email}</span>
                    </div>
                    {user.isSuperAdmin && (
                      <div className="flex items-center gap-2 bg-yellow-400/20 px-3 py-1 rounded-full">
                        <Crown className="h-4 w-4 text-yellow-300" />
                        <span className="text-yellow-100 font-semibold">Super Admin</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <Card className="border-l-4 border-l-purple-500 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Organizzazioni</CardTitle>
                <Building2 className="h-5 w-5 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-600">{user.organizationUsers.length}</div>
                <p className="text-xs text-muted-foreground mt-1">Associazioni attive</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-indigo-500 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Ruolo</CardTitle>
                <Shield className="h-5 w-5 text-indigo-500" />
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold text-indigo-600">
                  {user.isSuperAdmin ? "Super Admin" : "Utente"}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Livello di accesso</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Registrato</CardTitle>
                <Calendar className="h-5 w-5 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold text-blue-600">{formatDate(user.createdAt)}</div>
                <p className="text-xs text-muted-foreground mt-1">Data creazione</p>
              </CardContent>
            </Card>
          </div>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl text-gray-800">Modifica Utente</CardTitle>
              <CardDescription>
                Aggiorna le informazioni dell'utente
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EditUserForm user={user} />
            </CardContent>
          </Card>

          {user.organizationUsers.length > 0 && (
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl text-gray-800">Organizzazioni Associate</CardTitle>
                <CardDescription>
                  Lista delle organizzazioni a cui l'utente ha accesso
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {user.organizationUsers.map((orgUser) => (
                    <div 
                      key={orgUser.id} 
                      className="flex items-center justify-between p-4 border-l-4 border-l-purple-400 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center gap-3">
                        <div className="bg-purple-100 p-2 rounded-lg">
                          <Building2 className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">{orgUser.organization.name}</p>
                          <p className="text-sm text-gray-500">
                            Ruolo: <span className="font-medium text-purple-600">{orgUser.role}</span>
                          </p>
                        </div>
                      </div>
                      <Link
                        href={`/admin/organizations/${orgUser.organizationId}`}
                        className="flex items-center gap-2 text-sm text-purple-600 hover:text-purple-800 font-medium transition-colors"
                      >
                        Visualizza
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="shadow-sm bg-gray-50">
            <CardHeader>
              <CardTitle className="text-xl text-gray-800">Informazioni Sistema</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 text-sm">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600 font-medium">ID Utente:</span>
                  <span className="text-gray-800 font-mono">{user.id}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600 font-medium">Email Verificata:</span>
                  <span className={`font-semibold ${user.emailVerified ? 'text-green-600' : 'text-amber-600'}`}>
                    {user.emailVerified ? 'Sì' : 'No'}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600 font-medium">Data Creazione:</span>
                  <span className="text-gray-800">{formatDate(user.createdAt)}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-600 font-medium">Ultimo Aggiornamento:</span>
                  <span className="text-gray-800">{formatDate(user.updatedAt)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
