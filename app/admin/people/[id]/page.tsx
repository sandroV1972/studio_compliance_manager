import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { EditPersonForm } from "@/components/admin/edit-person-form";
import {
  MapPin,
  Calendar,
  FileText,
  ArrowLeft,
  Briefcase,
  Mail,
  Phone,
  Hash,
  Cake,
  UserCheck,
} from "lucide-react";

async function getPersonDetails(personId: string) {
  const person = await prisma.person.findUnique({
    where: { id: personId },
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
      deadlineInstances: {
        include: {
          template: true,
        },
        orderBy: {
          dueDate: "asc",
        },
      },
    },
  });

  return person;
}

export default async function PersonDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await auth();

  if (!session?.user?.isSuperAdmin) {
    redirect("/auth/login");
  }

  const person = await getPersonDetails(params.id);

  if (!person) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-blue-50/20">
      <div className="container mx-auto p-8 max-w-7xl">
        <div className="mb-6">
          <Link
            href="/admin/people"
            className="inline-flex items-center gap-2 text-sm font-medium text-purple-700 hover:text-purple-900 transition-colors group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            Torna alle Persone
          </Link>
        </div>

        <div className="mb-8 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                {person.firstName} {person.lastName}
              </h1>
              {!person.active && (
                <span className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm font-medium">
                  Archiviato
                </span>
              )}
            </div>
            <p className="text-muted-foreground">
              {person.organization?.name || "Nessuna organizzazione"}
            </p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
          <Card className="border-l-4 border-l-indigo-500 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Scadenze Totali
              </CardTitle>
              <FileText className="h-5 w-5 text-indigo-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-indigo-600">
                {person.deadlineInstances.length}
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Ruoli Assegnati
              </CardTitle>
              <Briefcase className="h-5 w-5 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {person.roleAssignments.length}
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Strutture
              </CardTitle>
              <MapPin className="h-5 w-5 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">
                {person.structures.length}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="shadow-md border-t-4 border-t-indigo-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-indigo-700">
                <UserCheck className="h-5 w-5" />
                Informazioni Personali
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {person.email && (
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Email</p>
                    <p className="text-gray-800">{person.email}</p>
                  </div>
                </div>
              )}

              {person.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Telefono
                    </p>
                    <p className="text-gray-800">{person.phone}</p>
                  </div>
                </div>
              )}

              {person.fiscalCode && (
                <div className="flex items-center gap-3">
                  <Hash className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Codice Fiscale
                    </p>
                    <p className="text-gray-800 font-mono">
                      {person.fiscalCode}
                    </p>
                  </div>
                </div>
              )}

              {person.birthDate && (
                <div className="flex items-center gap-3">
                  <Cake className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Data di Nascita
                    </p>
                    <p className="text-gray-800">
                      {formatDate(person.birthDate)}
                    </p>
                  </div>
                </div>
              )}

              {person.hireDate && (
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Data Assunzione
                    </p>
                    <p className="text-gray-800">
                      {formatDate(person.hireDate)}
                    </p>
                  </div>
                </div>
              )}

              {person.notes && (
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Note</p>
                  <p className="text-gray-800 whitespace-pre-wrap">
                    {person.notes}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-md border-t-4 border-t-purple-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-700">
                <Briefcase className="h-5 w-5" />
                Ruoli e Strutture
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {person.roleAssignments.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">
                    Ruoli Assegnati
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {person.roleAssignments.map((assignment) => (
                      <span
                        key={assignment.id}
                        className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium border border-purple-300"
                      >
                        {assignment.roleTemplate.label}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {person.structures.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">
                    Strutture
                  </p>
                  <div className="space-y-2">
                    {person.structures.map((ps) => (
                      <div
                        key={ps.id}
                        className="p-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-200"
                      >
                        <p className="font-semibold text-gray-800">
                          {ps.structure.name}
                        </p>
                        {ps.structure.address && (
                          <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                            <MapPin className="h-3 w-3" />
                            {ps.structure.address}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {person.roleAssignments.length === 0 &&
                person.structures.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Nessun ruolo o struttura assegnata
                  </p>
                )}
            </CardContent>
          </Card>
        </div>

        {person.deadlineInstances.length > 0 && (
          <Card className="shadow-md border-t-4 border-t-green-500 mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-700">
                <FileText className="h-5 w-5" />
                Scadenze ({person.deadlineInstances.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {person.deadlineInstances.slice(0, 10).map((instance) => (
                  <div
                    key={instance.id}
                    className="p-4 bg-white rounded-lg border border-gray-200 hover:border-green-300 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800">
                          {instance.title}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Scadenza: {formatDate(instance.dueDate)}
                          </span>
                          <span
                            className={`px-2 py-1 rounded-full font-medium ${
                              instance.status === "COMPLETED"
                                ? "bg-green-100 text-green-700"
                                : instance.status === "OVERDUE"
                                  ? "bg-red-100 text-red-700"
                                  : instance.status === "CANCELLED"
                                    ? "bg-gray-100 text-gray-700"
                                    : "bg-amber-100 text-amber-700"
                            }`}
                          >
                            {instance.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {person.deadlineInstances.length > 10 && (
                  <p className="text-sm text-muted-foreground text-center py-2">
                    ... e altre {person.deadlineInstances.length - 10} scadenze
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="shadow-md border-t-4 border-t-gray-500 mt-6">
          <CardHeader>
            <CardTitle className="text-gray-700">Azioni</CardTitle>
          </CardHeader>
          <CardContent>
            <EditPersonForm person={person} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
