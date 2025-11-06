import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { ArrowLeft, FileText, Calendar, Target, AlertCircle, Globe, Link2, FileCheck, Archive, Edit } from "lucide-react";
import { GlobalTemplateActions } from "@/components/admin/global-template-actions";

async function getTemplate(id: string) {
  const template = await prisma.deadlineTemplate.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          instances: true,
        },
      },
    },
  });

  return template;
}

export default async function GlobalTemplateDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();

  if (!session?.user?.isSuperAdmin) {
    redirect("/auth/login");
  }

  const { id } = await params;
  const template = await getTemplate(id);

  if (!template || template.ownerType !== "GLOBAL") {
    notFound();
  }

  const scopeLabels = {
    PERSON: "Persona",
    STRUCTURE: "Struttura",
    ROLE: "Ruolo",
  };

  const complianceLabels = {
    TRAINING: "Formazione",
    MAINTENANCE: "Manutenzione",
    INSPECTION: "Ispezione",
    DOCUMENT: "Documento",
    REPORTING: "Reportistica",
    WASTE: "Rifiuti",
    DATA_PROTECTION: "Protezione Dati",
    INSURANCE: "Assicurazione",
    OTHER: "Altro",
  };

  const recurrenceLabels = {
    DAY: "Giorni",
    MONTH: "Mesi",
    YEAR: "Anni",
  };

  const anchorLabels = {
    HIRE_DATE: "Data Assunzione",
    ASSIGNMENT_START: "Inizio Incarico",
    LAST_COMPLETION: "Ultimo Completamento",
    CUSTOM: "Personalizzato",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-blue-50/20">
      <div className="container mx-auto p-8 max-w-6xl">
        <div className="mb-6">
          <Link 
            href="/admin/global" 
            className="inline-flex items-center gap-2 text-sm font-medium text-purple-700 hover:text-purple-900 transition-colors group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            Torna ai Template Globali
          </Link>
        </div>

        <div className="mb-8 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                {template.title}
              </h1>
              {!template.active && (
                <span className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm font-medium flex items-center gap-1">
                  <Archive className="h-3 w-3" />
                  Archiviato
                </span>
              )}
            </div>
            <p className="text-muted-foreground">
              Template globale per tutte le organizzazioni
            </p>
          </div>
          <GlobalTemplateActions template={template} />
        </div>

        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card className="border-l-4 border-l-indigo-500 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Scope</CardTitle>
              <Target className="h-5 w-5 text-indigo-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-indigo-600">
                {scopeLabels[template.scope as keyof typeof scopeLabels]}
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Tipo Compliance</CardTitle>
              <AlertCircle className="h-5 w-5 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {complianceLabels[template.complianceType as keyof typeof complianceLabels]}
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Istanze Create</CardTitle>
              <FileCheck className="h-5 w-5 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {template._count.instances}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="shadow-md border-t-4 border-t-indigo-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-indigo-700">
                <FileText className="h-5 w-5" />
                Informazioni Generali
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {template.description && (
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Descrizione</p>
                  <p className="text-gray-800">{template.description}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Paese</p>
                  <p className="text-gray-800 font-semibold">{template.country || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Stato</p>
                  <p className="text-gray-800 font-semibold">{template.status}</p>
                </div>
              </div>

              {template.legalReference && (
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Riferimento Legale</p>
                  <p className="text-gray-800 font-mono text-sm bg-gray-50 p-2 rounded border">
                    {template.legalReference}
                  </p>
                </div>
              )}

              {template.sourceUrl && (
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">URL Fonte</p>
                  <a 
                    href={template.sourceUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1 text-sm"
                  >
                    <Link2 className="h-4 w-4" />
                    {template.sourceUrl}
                  </a>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-md border-t-4 border-t-purple-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-700">
                <Calendar className="h-5 w-5" />
                Ricorrenza e Scadenze
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Ricorrenza</p>
                  <p className="text-gray-800 font-semibold">
                    Ogni {template.recurrenceEvery} {recurrenceLabels[template.recurrenceUnit as keyof typeof recurrenceLabels]}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Anchor</p>
                  <p className="text-gray-800 font-semibold">
                    {anchorLabels[template.anchor as keyof typeof anchorLabels]}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Offset Prima Scadenza</p>
                <p className="text-gray-800 font-semibold">{template.firstDueOffsetDays} giorni</p>
              </div>

              {template.effectiveFrom && (
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Valido Da</p>
                  <p className="text-gray-800">{formatDate(template.effectiveFrom)}</p>
                </div>
              )}

              {template.effectiveTo && (
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Valido Fino A</p>
                  <p className="text-gray-800">{formatDate(template.effectiveTo)}</p>
                </div>
              )}

              {template.requiredDocumentName && (
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Documento Richiesto</p>
                  <p className="text-gray-800 font-mono text-sm bg-gray-50 p-2 rounded border">
                    {template.requiredDocumentName}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {template.notes && (
            <Card className="shadow-md border-t-4 border-t-amber-500 md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-700">
                  <FileText className="h-5 w-5" />
                  Note
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-800 whitespace-pre-wrap">{template.notes}</p>
              </CardContent>
            </Card>
          )}

          <Card className="shadow-md border-t-4 border-t-gray-500 md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-700">
                <Globe className="h-5 w-5" />
                Metadati
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">ID Template</p>
                <p className="text-gray-800 font-mono text-xs bg-gray-50 p-2 rounded border">
                  {template.id}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Owner Type</p>
                <p className="text-gray-800 font-semibold">{template.ownerType}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Creato il</p>
                <p className="text-gray-800">{formatDate(template.createdAt)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Ultimo Aggiornamento</p>
                <p className="text-gray-800">{formatDate(template.updatedAt)}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
