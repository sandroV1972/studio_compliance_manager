import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { ArrowLeft, Eye } from "lucide-react";
import { AddGlobalTemplateButton } from "@/components/admin/add-global-template-button";

async function getGlobalTemplates() {
  const templates = await prisma.deadlineTemplate.findMany({
    where: {
      ownerType: "GLOBAL",
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      _count: {
        select: {
          instances: true,
        },
      },
    },
  });

  const stats = {
    total: templates.length,
    active: templates.filter(t => t.active).length,
    inactive: templates.filter(t => !t.active).length,
    byScope: {
      PERSON: templates.filter(t => t.scope === "PERSON").length,
      STRUCTURE: templates.filter(t => t.scope === "STRUCTURE").length,
    },
    byComplianceType: templates.reduce((acc, t) => {
      acc[t.complianceType] = (acc[t.complianceType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
  };

  return { templates, stats };
}

export default async function AdminGlobalTemplatesPage() {
  const session = await auth();

  if (!session?.user?.isSuperAdmin) {
    redirect("/auth/login");
  }

  const { templates, stats } = await getGlobalTemplates();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-blue-50/20">
      <div className="container mx-auto p-8 max-w-7xl space-y-8">
        <div className="mb-6">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-sm font-medium text-purple-700 hover:text-purple-900 transition-colors group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            Torna alla Dashboard
          </Link>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Template Globali
            </h1>
            <p className="text-muted-foreground mt-2">
              Gestione template di scadenze per tutte le organizzazioni
            </p>
          </div>
          <AddGlobalTemplateButton />
        </div>

        <div className="grid gap-6 md:grid-cols-4">
          <Card className="border-l-4 border-l-indigo-500 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Totale Template</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-indigo-600">{stats.total}</div>
              <p className="text-xs text-muted-foreground mt-1">Template configurati</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Attivi</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{stats.active}</div>
              <p className="text-xs text-muted-foreground mt-1">In uso</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-amber-500 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Persone</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-amber-600">{stats.byScope.PERSON}</div>
              <p className="text-xs text-muted-foreground mt-1">Scope persona</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Strutture</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">{stats.byScope.STRUCTURE}</div>
              <p className="text-xs text-muted-foreground mt-1">Scope struttura</p>
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl text-gray-800">Distribuzione per Tipo di Compliance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-3">
              {Object.entries(stats.byComplianceType).map(([type, count]) => (
                <div key={type} className="flex items-center justify-between p-4 border-2 rounded-lg hover:border-indigo-300 transition-colors bg-gradient-to-br from-white to-gray-50">
                  <span className="text-sm font-semibold text-gray-700">{type}</span>
                  <span className="text-2xl font-bold text-indigo-600">{count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl text-gray-800">Tutti i Template</CardTitle>
            <CardDescription>
              {templates.length} template globali configurati
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
            {templates.map((template) => (
              <Link
                key={template.id}
                href={`/admin/global/${template.id}`}
                className="flex items-start justify-between border-l-4 border-l-indigo-400 bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-all hover:border-l-purple-500 cursor-pointer group"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-gray-800 group-hover:text-indigo-600 transition-colors">{template.title}</p>
                    <span className={`text-xs px-3 py-1 rounded-full font-medium ${template.active ? 'bg-green-100 text-green-700 border border-green-300' : 'bg-gray-100 text-gray-600 border border-gray-300'}`}>
                      {template.active ? 'Attivo' : 'Inattivo'}
                    </span>
                    <span className="text-xs px-3 py-1 rounded-full bg-blue-100 text-blue-700 border border-blue-300 font-medium">
                      {template.scope}
                    </span>
                    <span className="text-xs px-3 py-1 rounded-full bg-purple-100 text-purple-700 border border-purple-300 font-medium">
                      {template.complianceType}
                    </span>
                  </div>
                  {template.description && (
                    <p className="text-sm text-gray-600 mt-2">{template.description}</p>
                  )}
                  <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <span className="font-medium">Ricorrenza:</span> ogni {template.recurrenceEvery} {template.recurrenceUnit}
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="font-medium">Anchor:</span> {template.anchor}
                    </span>
                    {template.legalReference && (
                      <span className="flex items-center gap-1">
                        <span className="font-medium">Rif. legale:</span> {template.legalReference}
                      </span>
                    )}
                    <span className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded font-medium">
                      {template._count.instances} istanze
                    </span>
                  </div>
                  {template.effectiveFrom && (
                    <p className="text-xs text-gray-500 mt-2">
                      Valido da: {formatDate(template.effectiveFrom)}
                      {template.effectiveTo && ` fino a: ${formatDate(template.effectiveTo)}`}
                    </p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">
                    Creato il {formatDate(template.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                  <Eye className="h-5 w-5 text-gray-400 group-hover:text-indigo-600 transition-colors" />
                  <span className="text-sm font-medium text-gray-400 group-hover:text-indigo-600 transition-colors">Dettagli</span>
                </div>
              </Link>
            ))}
              {templates.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-8">Nessun template globale configurato</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
