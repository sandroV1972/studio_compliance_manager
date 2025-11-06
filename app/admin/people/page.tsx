import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { UserCircle, Building2, MapPin, Calendar, Eye, Archive, Mail, Phone, Briefcase, TrendingUp, ArrowLeft } from "lucide-react";

async function getAllPeople() {
  const people = await prisma.person.findMany({
    include: {
      organization: true,
      structures: {
        include: {
          structure: true,
        },
      },
      roleAssignments: {
        include: {
          roleTemplate: true,
        },
      },
      _count: {
        select: {
          deadlineInstances: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return people;
}

export default async function AdminPeoplePage() {
  const session = await auth();

  if (!session?.user?.isSuperAdmin) {
    redirect("/auth/login");
  }

  const people = await getAllPeople();
  const activePeople = people.filter(p => p.active).length;
  const archivedPeople = people.filter(p => !p.active).length;
  const totalOrgs = new Set(people.map(p => p.organizationId)).size;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-blue-50/20">
      <div className="container mx-auto p-8 max-w-7xl">
        <div className="mb-6">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-sm font-medium text-purple-700 hover:text-purple-900 transition-colors group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            Torna alla Dashboard
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Gestione Persone
          </h1>
          <p className="text-muted-foreground mt-2">
            Tutte le persone registrate nel sistema ({people.length} totali)
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-4 mb-8">
          <Card className="border-l-4 border-l-indigo-500 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Totale Persone</CardTitle>
              <UserCircle className="h-5 w-5 text-indigo-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-indigo-600">{people.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Registrate nel sistema</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Attive</CardTitle>
              <TrendingUp className="h-5 w-5 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{activePeople}</div>
              <p className="text-xs text-muted-foreground mt-1">In servizio</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-amber-500 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Archiviate</CardTitle>
              <Archive className="h-5 w-5 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-amber-600">{archivedPeople}</div>
              <p className="text-xs text-muted-foreground mt-1">Non più attive</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Organizzazioni</CardTitle>
              <Building2 className="h-5 w-5 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">{totalOrgs}</div>
              <p className="text-xs text-muted-foreground mt-1">Uniche</p>
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl text-gray-800">Tutte le Persone</CardTitle>
            <CardDescription>
              Lista completa delle persone con dettagli organizzazione e ruoli
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {people.map((person) => (
                <div
                  key={person.id}
                  className="flex items-start justify-between border-l-4 border-l-indigo-400 bg-white p-5 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="bg-indigo-100 p-2 rounded-lg">
                        <UserCircle className="h-6 w-6 text-indigo-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-lg text-gray-800">
                            {person.firstName} {person.lastName}
                          </h3>
                          <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                            person.active
                              ? 'bg-green-100 text-green-700 border border-green-300'
                              : 'bg-gray-100 text-gray-600 border border-gray-300'
                          }`}>
                            {person.active ? 'Attiva' : 'Archiviata'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {person.fiscalCode}
                        </p>
                      </div>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 text-sm">
                      {person.email && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <Mail className="h-4 w-4 text-indigo-500" />
                          <span>{person.email}</span>
                        </div>
                      )}
                      {person.phone && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <Phone className="h-4 w-4 text-indigo-500" />
                          <span>{person.phone}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-gray-600">
                        <Building2 className="h-4 w-4 text-purple-500" />
                        <span className="font-medium">{person.organization.name}</span>
                      </div>
                      {person.hireDate && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <Briefcase className="h-4 w-4 text-green-500" />
                          <span>Assunto: {formatDate(person.hireDate)}</span>
                        </div>
                      )}
                      {person.birthDate && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar className="h-4 w-4 text-amber-500" />
                          <span>Nato: {formatDate(person.birthDate)}</span>
                        </div>
                      )}
                      {person.structures.length > 0 && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <MapPin className="h-4 w-4 text-blue-500" />
                          <span>{person.structures.length} strutture</span>
                        </div>
                      )}
                    </div>

                    {person.roleAssignments.length > 0 && (
                      <div className="mt-3 flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-medium text-gray-600">Ruoli:</span>
                        {person.roleAssignments.map((assignment) => (
                          <span
                            key={assignment.id}
                            className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full border border-purple-300"
                          >
                            {assignment.roleTemplate.label}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <span className="font-medium">Scadenze:</span>
                        <span className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded font-medium">
                          {person._count.deadlineInstances}
                        </span>
                      </span>
                      <span>Creata il {formatDate(person.createdAt)}</span>
                    </div>

                    {person.notes && (
                      <p className="mt-3 text-sm text-gray-600 italic bg-gray-50 p-3 rounded border-l-2 border-gray-300">
                        {person.notes}
                      </p>
                    )}
                  </div>

                  <Link
                    href={`/admin/people/${person.id}`}
                    className="ml-4 flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-800 font-medium transition-colors bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-lg"
                  >
                    <Eye className="h-4 w-4" />
                    Dettagli
                  </Link>
                </div>
              ))}

              {people.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Nessuna persona registrata
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
