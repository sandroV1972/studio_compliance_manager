"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertTriangle,
  FileText,
  Calendar,
  Download,
  TrendingUp,
  Upload,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface CriticalDeadline {
  id: string;
  title: string;
  dueDate: string;
  daysRemaining: number;
  status: string;
  hasDocuments: boolean;
  requiredDocumentName: string | null;
  person: { id: string; firstName: string; lastName: string } | null;
  structure: { id: string; name: string } | null;
  template: {
    id: string;
    title: string;
    complianceType: string;
  } | null;
}

export default function ReportsPage() {
  const params = useParams();
  const structureId = params.id as string;
  const [organizationId, setOrganizationId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [criticalDeadlines, setCriticalDeadlines] = useState<
    CriticalDeadline[]
  >([]);
  const [selectedPeriod, setSelectedPeriod] = useState<"30" | "60" | "90">(
    "60",
  );

  useEffect(() => {
    loadOrganization();
  }, []);

  useEffect(() => {
    if (organizationId) {
      loadCriticalDeadlines();
    }
  }, [organizationId, selectedPeriod]);

  const loadOrganization = async () => {
    try {
      const response = await fetch("/api/user/organization");
      if (!response.ok) return;
      const data = await response.json();
      setOrganizationId(data.id);
    } catch (error) {
      console.error("Errore:", error);
    }
  };

  const loadCriticalDeadlines = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/organizations/${organizationId}/deadlines?structureId=${structureId}`,
      );
      if (!response.ok) {
        throw new Error("Errore nel caricamento");
      }
      const data = await response.json();

      // Filtra e processa le scadenze critiche
      const now = new Date();
      const periodDays = parseInt(selectedPeriod);
      const periodEnd = new Date(
        now.getTime() + periodDays * 24 * 60 * 60 * 1000,
      );

      // Filtra TUTTE le scadenze nel periodo che sono PENDING
      // Non solo quelle che richiedono documenti
      const allDeadlinesInPeriod = data.deadlines
        .filter((deadline: any) => {
          const dueDate = new Date(deadline.dueDate);
          const isInPeriod = dueDate >= now && dueDate <= periodEnd;
          return isInPeriod && deadline.status === "PENDING";
        })
        .map((deadline: any) => {
          const dueDate = new Date(deadline.dueDate);
          const daysRemaining = Math.ceil(
            (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
          );

          return {
            id: deadline.id,
            title: deadline.title,
            dueDate: deadline.dueDate,
            daysRemaining,
            status: deadline.status,
            hasDocuments: (deadline._count?.documents || 0) > 0,
            requiredDocumentName: deadline.template?.requiredDocumentName,
            person: deadline.person,
            structure: deadline.structure,
            template: deadline.template,
          };
        })
        .sort((a: CriticalDeadline, b: CriticalDeadline) => {
          // Prima ordina per scadenze che richiedono documenti
          const aRequires = !!a.requiredDocumentName;
          const bRequires = !!b.requiredDocumentName;
          if (aRequires && !bRequires) return -1;
          if (!aRequires && bRequires) return 1;

          // Poi per presenza documenti (senza documenti prima)
          if (aRequires && bRequires) {
            if (!a.hasDocuments && b.hasDocuments) return -1;
            if (a.hasDocuments && !b.hasDocuments) return 1;
          }

          // Infine per giorni rimanenti
          return a.daysRemaining - b.daysRemaining;
        });

      setCriticalDeadlines(allDeadlinesInPeriod);
    } catch (error) {
      console.error("Errore:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("it-IT", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getUrgencyColor = (daysRemaining: number, hasDocuments: boolean) => {
    if (!hasDocuments) {
      if (daysRemaining <= 7) return "bg-red-600";
      if (daysRemaining <= 15) return "bg-orange-500";
      return "bg-yellow-500";
    }
    return "bg-green-500";
  };

  const getUrgencyLabel = (daysRemaining: number, hasDocuments: boolean) => {
    if (!hasDocuments) {
      if (daysRemaining <= 7) return "URGENTE";
      if (daysRemaining <= 15) return "ALTA PRIORITÀ";
      return "ATTENZIONE RICHIESTA";
    }
    return "DOCUMENTO PRESENTE";
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Caricamento...</div>
      </div>
    );
  }

  // Scadenze che richiedono documenti
  const deadlinesRequiringDocs = criticalDeadlines.filter(
    (d) => d.requiredDocumentName,
  );
  const deadlinesWithoutDocs = deadlinesRequiringDocs.filter(
    (d) => !d.hasDocuments,
  );
  const deadlinesWithDocs = deadlinesRequiringDocs.filter(
    (d) => d.hasDocuments,
  );

  // Scadenze che NON richiedono documenti
  const deadlinesWithoutDocRequirement = criticalDeadlines.filter(
    (d) => !d.requiredDocumentName,
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Report e Analisi</h2>
        <p className="text-muted-foreground">
          Monitora le scadenze critiche e gestisci i documenti mancanti
        </p>
      </div>

      {/* Tabs per diverse viste */}
      <Tabs defaultValue="critical" className="space-y-4">
        <TabsList>
          <TabsTrigger value="critical" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Scadenze Critiche
          </TabsTrigger>
          <TabsTrigger value="export" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Esportazioni
          </TabsTrigger>
          <TabsTrigger value="planning" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Pianificazione
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: Scadenze Critiche */}
        <TabsContent value="critical" className="space-y-4">
          {/* Filtro periodo */}
          <Card>
            <CardHeader>
              <CardTitle>Periodo di Analisi</CardTitle>
              <CardDescription>
                Seleziona il periodo per visualizzare le scadenze imminenti
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Button
                  variant={selectedPeriod === "30" ? "default" : "outline"}
                  onClick={() => setSelectedPeriod("30")}
                >
                  Prossimi 30 giorni
                </Button>
                <Button
                  variant={selectedPeriod === "60" ? "default" : "outline"}
                  onClick={() => setSelectedPeriod("60")}
                >
                  Prossimi 60 giorni
                </Button>
                <Button
                  variant={selectedPeriod === "90" ? "default" : "outline"}
                  onClick={() => setSelectedPeriod("90")}
                >
                  Prossimi 90 giorni
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Statistiche */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="border-l-4 border-l-red-500">
              <CardHeader className="pb-3">
                <CardDescription>Documenti Mancanti</CardDescription>
                <CardTitle className="text-3xl">
                  {deadlinesWithoutDocs.length}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Scadenze senza documenti obbligatori
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-green-500">
              <CardHeader className="pb-3">
                <CardDescription>Documenti Presenti</CardDescription>
                <CardTitle className="text-3xl">
                  {deadlinesWithDocs.length}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Scadenze con documenti caricati
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-blue-500">
              <CardHeader className="pb-3">
                <CardDescription>Totale Scadenze</CardDescription>
                <CardTitle className="text-3xl">
                  {criticalDeadlines.length}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Nei prossimi {selectedPeriod} giorni
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Lista scadenze senza documenti */}
          {deadlinesWithoutDocs.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  Documenti Mancanti - Azione Richiesta
                </CardTitle>
                <CardDescription>
                  Queste scadenze richiedono documenti obbligatori non ancora
                  caricati
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {deadlinesWithoutDocs.map((deadline) => (
                    <div
                      key={deadline.id}
                      className="relative flex items-start justify-between p-4 border rounded-lg bg-red-50 border-red-200"
                    >
                      {/* Fascia urgenza */}
                      <div
                        className={`absolute top-0 right-0 bottom-0 w-2 ${getUrgencyColor(
                          deadline.daysRemaining,
                          deadline.hasDocuments,
                        )}`}
                      />

                      <div className="flex-1 pr-4">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="font-medium text-lg">
                            {deadline.title}
                          </div>
                          <Badge
                            className={`${getUrgencyColor(
                              deadline.daysRemaining,
                              deadline.hasDocuments,
                            )} text-white`}
                          >
                            {getUrgencyLabel(
                              deadline.daysRemaining,
                              deadline.hasDocuments,
                            )}
                          </Badge>
                        </div>

                        {deadline.template && (
                          <div className="text-sm text-muted-foreground">
                            {deadline.template.title} -{" "}
                            {deadline.template.complianceType}
                          </div>
                        )}

                        {deadline.person && (
                          <div className="text-sm text-muted-foreground">
                            Persona: {deadline.person.firstName}{" "}
                            {deadline.person.lastName}
                          </div>
                        )}

                        <div className="flex items-center gap-4 mt-2 text-sm">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">
                              {formatDate(deadline.dueDate)}
                            </span>
                            <span className="text-muted-foreground">
                              (tra {deadline.daysRemaining}{" "}
                              {deadline.daysRemaining === 1
                                ? "giorno"
                                : "giorni"}
                              )
                            </span>
                          </div>
                        </div>

                        {deadline.requiredDocumentName && (
                          <div className="flex items-center gap-2 mt-3 p-2 bg-white rounded border border-red-300">
                            <FileText className="h-4 w-4 text-red-600" />
                            <span className="text-sm font-medium text-red-700">
                              Documento richiesto:{" "}
                              {deadline.requiredDocumentName}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-2">
                        <Button
                          size="sm"
                          className="bg-red-600 hover:bg-red-700"
                          onClick={() => {
                            window.location.href = `/structures/${structureId}/deadlines`;
                          }}
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Carica Documento
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Lista scadenze con documenti */}
          {deadlinesWithDocs.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-700">
                  Documenti Presenti
                </CardTitle>
                <CardDescription>
                  Scadenze con documenti obbligatori già caricati
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {deadlinesWithDocs.map((deadline) => (
                    <div
                      key={deadline.id}
                      className="relative flex items-start justify-between p-4 border rounded-lg bg-green-50 border-green-200"
                    >
                      <div
                        className={`absolute top-0 right-0 bottom-0 w-2 bg-green-500`}
                      />

                      <div className="flex-1 pr-4">
                        <div className="font-medium text-lg">
                          {deadline.title}
                        </div>

                        {deadline.template && (
                          <div className="text-sm text-muted-foreground">
                            {deadline.template.title} -{" "}
                            {deadline.template.complianceType}
                          </div>
                        )}

                        <div className="flex items-center gap-2 mt-2 text-sm">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>{formatDate(deadline.dueDate)}</span>
                          <span className="text-muted-foreground">
                            (tra {deadline.daysRemaining}{" "}
                            {deadline.daysRemaining === 1 ? "giorno" : "giorni"}
                            )
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Lista altre scadenze (senza requisito documenti) */}
          {deadlinesWithoutDocRequirement.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-700">
                  Altre Scadenze
                </CardTitle>
                <CardDescription>
                  Scadenze che non richiedono documenti obbligatori
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {deadlinesWithoutDocRequirement.map((deadline) => (
                    <div
                      key={deadline.id}
                      className="relative flex items-start justify-between p-4 border rounded-lg bg-blue-50 border-blue-200"
                    >
                      <div
                        className={`absolute top-0 right-0 bottom-0 w-2 bg-blue-500`}
                      />

                      <div className="flex-1 pr-4">
                        <div className="font-medium text-lg">
                          {deadline.title}
                        </div>

                        {deadline.template && (
                          <div className="text-sm text-muted-foreground">
                            {deadline.template.title} -{" "}
                            {deadline.template.complianceType}
                          </div>
                        )}

                        {deadline.person && (
                          <div className="text-sm text-muted-foreground">
                            Persona: {deadline.person.firstName}{" "}
                            {deadline.person.lastName}
                          </div>
                        )}

                        <div className="flex items-center gap-2 mt-2 text-sm">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>{formatDate(deadline.dueDate)}</span>
                          <span className="text-muted-foreground">
                            (tra {deadline.daysRemaining}{" "}
                            {deadline.daysRemaining === 1 ? "giorno" : "giorni"}
                            )
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {criticalDeadlines.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                Nessuna scadenza nei prossimi {selectedPeriod} giorni
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* TAB 2: Esportazioni */}
        <TabsContent value="export">
          <Card>
            <CardHeader>
              <CardTitle>Report per Esportazione</CardTitle>
              <CardDescription>
                Genera report da condividere o archiviare
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Funzionalità in arrivo...</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 3: Pianificazione */}
        <TabsContent value="planning">
          <Card>
            <CardHeader>
              <CardTitle>Pianificazione Carico di Lavoro</CardTitle>
              <CardDescription>
                Visualizza il carico di lavoro nei prossimi mesi
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Funzionalità in arrivo...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
