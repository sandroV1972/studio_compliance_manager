"use client";

import { useEffect, useState } from "react";
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
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Calendar,
  Repeat,
  Plus,
  Pencil,
  Globe,
  MapPin,
  Archive,
  ArchiveRestore,
} from "lucide-react";
import { EditGlobalTemplateModal } from "@/components/admin/edit-global-template-modal";
import { CreateGlobalTemplateModal } from "@/components/admin/create-global-template-modal";

interface GlobalTemplate {
  id: string;
  title: string;
  complianceType: string;
  description: string | null;
  scope: string;
  recurrenceUnit: string | null;
  recurrenceEvery: number | null;
  firstDueOffsetDays: number | null;
  requiredDocumentName: string | null;
  regions: string | null; // JSON string array
  legalReference: string | null;
  sourceUrl: string | null;
  active: boolean;
}

export default function GlobalTemplatesPage() {
  const [templates, setTemplates] = useState<GlobalTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showArchived, setShowArchived] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");

  useEffect(() => {
    loadTemplates();
  }, [showArchived]);

  const loadTemplates = async () => {
    try {
      const url = showArchived
        ? "/api/admin/global-templates?includeArchived=true"
        : "/api/admin/global-templates";
      const response = await fetch(url);
      if (!response.ok) throw new Error("Errore nel caricamento");
      const data = await response.json();
      setTemplates(data.templates || []);
    } catch (error) {
      console.error("Errore caricamento templates:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleArchive = async (templateId: string, archive: boolean) => {
    try {
      const response = await fetch(
        `/api/admin/global-templates/${templateId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ active: !archive }),
        },
      );

      if (!response.ok) throw new Error("Errore nell'archiviazione");
      await loadTemplates();
    } catch (error) {
      console.error("Errore:", error);
      alert("Errore nell'archiviazione del template");
    }
  };

  const getComplianceTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      TRAINING: "bg-blue-500",
      MAINTENANCE: "bg-orange-500",
      INSPECTION: "bg-purple-500",
      DOCUMENT: "bg-green-500",
      REPORTING: "bg-yellow-500",
      WASTE: "bg-red-500",
      DATA_PROTECTION: "bg-indigo-500",
      INSURANCE: "bg-pink-500",
      OTHER: "bg-gray-500",
    };

    const labels: Record<string, string> = {
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

    return (
      <Badge className={`${colors[type] || "bg-gray-500"} text-white`}>
        {labels[type] || type}
      </Badge>
    );
  };

  const getScopeBadge = (scope: string) => {
    return scope === "PERSON" ? (
      <Badge variant="outline" className="border-blue-300 text-blue-700">
        Persona
      </Badge>
    ) : (
      <Badge variant="outline" className="border-purple-300 text-purple-700">
        Struttura
      </Badge>
    );
  };

  const getRecurrenceText = (unit: string | null, every: number | null) => {
    if (!unit || !every) {
      return "Non specificato";
    }

    const units: Record<string, string> = {
      DAY: every === 1 ? "giorno" : "giorni",
      MONTH: every === 1 ? "mese" : "mesi",
      YEAR: every === 1 ? "anno" : "anni",
    };

    return `Ogni ${every} ${units[unit] || unit.toLowerCase()}`;
  };

  const getRegionBadge = (regionsJson: string | null) => {
    if (!regionsJson) {
      return (
        <Badge variant="outline" className="border-green-300 text-green-700">
          <Globe className="h-3 w-3 mr-1" />
          Nazionale
        </Badge>
      );
    }

    try {
      const regions = JSON.parse(regionsJson);
      if (Array.isArray(regions) && regions.length > 0) {
        if (regions.length === 1) {
          return (
            <Badge
              variant="outline"
              className="border-indigo-300 text-indigo-700"
            >
              <MapPin className="h-3 w-3 mr-1" />
              {regions[0]}
            </Badge>
          );
        } else if (regions.length === 20) {
          // Tutte le regioni selezionate = nazionale
          return (
            <Badge
              variant="outline"
              className="border-green-300 text-green-700"
            >
              <Globe className="h-3 w-3 mr-1" />
              Nazionale
            </Badge>
          );
        } else {
          return (
            <Badge
              variant="outline"
              className="border-indigo-300 text-indigo-700"
            >
              <MapPin className="h-3 w-3 mr-1" />
              {regions.length} regioni
            </Badge>
          );
        }
      }
    } catch (e) {
      // Se il parsing fallisce, considera nazionale
      console.error("Error parsing regions:", e);
    }

    return (
      <Badge variant="outline" className="border-green-300 text-green-700">
        <Globe className="h-3 w-3 mr-1" />
        Nazionale
      </Badge>
    );
  };

  const groupedTemplates = templates.reduce(
    (acc, template) => {
      const type = template.complianceType;
      if (!acc[type]) {
        acc[type] = [];
      }
      acc[type].push(template);
      return acc;
    },
    {} as Record<string, GlobalTemplate[]>,
  );

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Caricamento...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              Template Globali
            </h2>
            <p className="text-muted-foreground">
              Gestione template di adempimenti validi per tutte le
              organizzazioni
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant={showArchived ? "default" : "outline"}
            onClick={() => setShowArchived(!showArchived)}
          >
            {showArchived ? (
              <>
                <ArchiveRestore className="mr-2 h-4 w-4" />
                Nascondi Archiviati
              </>
            ) : (
              <>
                <Archive className="mr-2 h-4 w-4" />
                Mostra Archiviati
              </>
            )}
          </Button>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nuovo Template Globale
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Template Globali ({templates.length})</CardTitle>
          <CardDescription>
            Questi template sono visibili a tutte le organizzazioni secondo la
            loro applicabilit� (nazionale/regionale)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {templates.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              {showArchived
                ? "Nessun template archiviato trovato"
                : "Nessun template trovato"}
            </p>
          ) : (
            <Accordion type="multiple" className="w-full">
              {Object.entries(groupedTemplates).map(
                ([complianceType, typeTemplates]) => (
                  <AccordionItem key={complianceType} value={complianceType}>
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center gap-3">
                        {getComplianceTypeBadge(complianceType)}
                        <span className="text-sm text-gray-600">
                          {typeTemplates.length} template
                          {typeTemplates.length !== 1 ? "s" : ""}
                        </span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="grid gap-3 pt-2">
                        {typeTemplates.map((template) => (
                          <div
                            key={template.id}
                            className={`relative ${
                              !template.active ? "opacity-50" : ""
                            }`}
                          >
                            {/* BUTTONS */}
                            <div
                              style={{
                                position: "absolute",
                                top: "1rem",
                                right: "1rem",
                                zIndex: 10,
                                display: "flex",
                                gap: "0.5rem",
                              }}
                            >
                              <button
                                type="button"
                                style={{
                                  padding: "0.5rem 1rem",
                                  border: "1px solid #d1d5db",
                                  borderRadius: "0.375rem",
                                  background: "white",
                                  cursor: "pointer",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "0.5rem",
                                  fontSize: "0.875rem",
                                  fontWeight: "500",
                                  boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.background = "#f3f4f6";
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.background = "white";
                                }}
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setSelectedTemplateId(template.id);
                                  setIsEditModalOpen(true);
                                }}
                              >
                                <Pencil
                                  style={{ width: "1rem", height: "1rem" }}
                                />
                                <span>Modifica</span>
                              </button>

                              {template.active ? (
                                <button
                                  type="button"
                                  style={{
                                    padding: "0.5rem 1rem",
                                    border: "1px solid #f97316",
                                    borderRadius: "0.375rem",
                                    background: "white",
                                    color: "#f97316",
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "0.5rem",
                                    fontSize: "0.875rem",
                                    fontWeight: "500",
                                  }}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleArchive(template.id, true);
                                  }}
                                >
                                  <Archive
                                    style={{ width: "1rem", height: "1rem" }}
                                  />
                                  <span>Archivia</span>
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  style={{
                                    padding: "0.5rem 1rem",
                                    border: "1px solid #10b981",
                                    borderRadius: "0.375rem",
                                    background: "white",
                                    color: "#10b981",
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "0.5rem",
                                    fontSize: "0.875rem",
                                    fontWeight: "500",
                                  }}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleArchive(template.id, false);
                                  }}
                                >
                                  <ArchiveRestore
                                    style={{ width: "1rem", height: "1rem" }}
                                  />
                                  <span>Ripristina</span>
                                </button>
                              )}
                            </div>

                            {/* CARD */}
                            <div
                              className="p-4 border rounded-lg transition-colors bg-white hover:bg-gray-50"
                              style={{ paddingRight: "18rem" }}
                            >
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <h4 className="font-medium text-gray-900">
                                    {template.title}
                                  </h4>
                                  {getScopeBadge(template.scope)}
                                  {getRegionBadge(template.regions)}
                                  {!template.active && (
                                    <Badge variant="secondary">
                                      Archiviato
                                    </Badge>
                                  )}
                                </div>
                                {template.description && (
                                  <p className="text-sm text-gray-600 mb-2">
                                    {template.description}
                                  </p>
                                )}
                                {template.legalReference && (
                                  <p className="text-sm text-blue-700 font-medium mb-2">
                                    Rif. Normativo: {template.legalReference}
                                  </p>
                                )}
                                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                                  <div className="flex items-center gap-1">
                                    <Repeat className="h-4 w-4" />
                                    {getRecurrenceText(
                                      template.recurrenceUnit,
                                      template.recurrenceEvery,
                                    )}
                                  </div>
                                  {template.firstDueOffsetDays !== null && (
                                    <div className="flex items-center gap-1">
                                      <Calendar className="h-4 w-4" />
                                      Prima scadenza dopo{" "}
                                      {template.firstDueOffsetDays} giorni
                                    </div>
                                  )}
                                  {template.requiredDocumentName && (
                                    <Badge
                                      variant="outline"
                                      className="border-amber-300 text-amber-700"
                                    >
                                      Richiede: {template.requiredDocumentName}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ),
              )}
            </Accordion>
          )}
        </CardContent>
      </Card>

      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
        <h3 className="font-medium text-indigo-900 mb-2">
          Informazioni sui Template Globali
        </h3>
        <ul className="text-sm text-indigo-800 space-y-2">
          <li>
            <strong>Template Nazionali:</strong> Visibili a tutte le
            organizzazioni italiane, indipendentemente dalla regione.
          </li>
          <li>
            <strong>Template Regionali:</strong> Visibili solo alle
            organizzazioni che hanno strutture nella regione specificata.
          </li>
          <li>
            <strong>Riferimenti Normativi:</strong> Inserisci sempre il
            riferimento normativo e il link alla fonte per garantire
            tracciabilit� e compliance.
          </li>
          <li>
            <strong>Archiviazione:</strong> I template archiviati non sono pi�
            visibili alle organizzazioni ma rimangono nel sistema per
            tracciabilit� storica.
          </li>
        </ul>
      </div>

      {selectedTemplateId && (
        <EditGlobalTemplateModal
          templateId={selectedTemplateId}
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedTemplateId("");
          }}
          onSuccess={loadTemplates}
        />
      )}

      <CreateGlobalTemplateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={loadTemplates}
      />
    </div>
  );
}
