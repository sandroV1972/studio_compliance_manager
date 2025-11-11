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
  ArrowLeft,
  Calendar,
  Repeat,
  Plus,
  Pencil,
  Eye,
  Globe,
  MapPin,
  Building2,
} from "lucide-react";
import Link from "next/link";
import { NewTemplateModal } from "@/components/deadline-templates/new-template-modal";
import { EditTemplateModal } from "@/components/deadline-templates/edit-template-modal";
import { ViewTemplateModal } from "@/components/deadline-templates/view-template-modal";

interface DeadlineTemplate {
  id: string;
  title: string;
  complianceType: string;
  description: string | null;
  scope: string;
  ownerType: string;
  recurrenceUnit: string;
  recurrenceEvery: number;
  firstDueOffsetDays: number;
  requiredDocumentName: string | null;
  region: string | null;
}

export default function DeadlineTemplatesPage() {
  const [templates, setTemplates] = useState<DeadlineTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [organizationId, setOrganizationId] = useState<string>("");
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");

  useEffect(() => {
    loadOrganization();
  }, []);

  useEffect(() => {
    if (organizationId) {
      loadTemplates();
    }
  }, [organizationId]);

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

  const loadTemplates = async () => {
    try {
      const response = await fetch(
        `/api/organizations/${organizationId}/deadline-templates`,
      );
      if (!response.ok) throw new Error("Errore nel caricamento");
      const data = await response.json();
      setTemplates(data.templates || []);
    } catch (error) {
      console.error("Errore caricamento templates:", error);
    } finally {
      setLoading(false);
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

  const getRecurrenceText = (unit: string, every: number) => {
    const units: Record<string, string> = {
      DAY: every === 1 ? "giorno" : "giorni",
      MONTH: every === 1 ? "mese" : "mesi",
      YEAR: every === 1 ? "anno" : "anni",
    };

    return `Ogni ${every} ${units[unit] || unit.toLowerCase()}`;
  };

  const getTemplateBadge = (template: DeadlineTemplate) => {
    if (template.ownerType === "ORG") {
      return (
        <Badge variant="outline" className="border-purple-300 text-purple-700">
          <Building2 className="h-3 w-3 mr-1" />
          Organizzazione
        </Badge>
      );
    }

    // Template GLOBAL
    if (template.region) {
      return (
        <Badge variant="outline" className="border-indigo-300 text-indigo-700">
          <MapPin className="h-3 w-3 mr-1" />
          Regionale: {template.region}
        </Badge>
      );
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
    {} as Record<string, DeadlineTemplate[]>,
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
          <Link href="/structures/${structureId}/deadlines">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Indietro
            </Button>
          </Link>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">
              Gestione Adempimenti
            </h2>
            <p className="text-muted-foreground">
              Visualizza e gestisci i template di adempimenti
            </p>
          </div>
        </div>
        <Button onClick={() => setIsNewModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nuovo Adempimento
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Template Adempimenti (01)</CardTitle>
          <CardDescription>
            {templates.length} template disponibili per la creazione di scadenze
            ricorrenti
          </CardDescription>
        </CardHeader>
        <CardContent>
          {templates.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Nessun template trovato
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
                          <div key={template.id} className="relative">
                            {/* BUTTON - Visualizza per GLOBAL, Modifica per ORG */}
                            <div
                              style={{
                                position: "absolute",
                                top: "1rem",
                                right: "1rem",
                                zIndex: 10,
                              }}
                            >
                              {template.ownerType === "GLOBAL" ? (
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
                                    boxShadow:
                                      "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.background =
                                      "#f3f4f6";
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.background = "white";
                                  }}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setSelectedTemplateId(template.id);
                                    setTimeout(() => {
                                      setIsViewModalOpen(true);
                                    }, 100);
                                  }}
                                >
                                  <Eye
                                    style={{ width: "1rem", height: "1rem" }}
                                  />
                                  <span>Visualizza</span>
                                </button>
                              ) : (
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
                                    boxShadow:
                                      "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.background =
                                      "#f3f4f6";
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.background = "white";
                                  }}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setSelectedTemplateId(template.id);
                                    setTimeout(() => {
                                      setIsEditModalOpen(true);
                                    }, 100);
                                  }}
                                >
                                  <Pencil
                                    style={{ width: "1rem", height: "1rem" }}
                                  />
                                  <span>Modifica</span>
                                </button>
                              )}
                            </div>

                            {/* CARD */}
                            <div
                              className="p-4 border rounded-lg transition-colors bg-white hover:bg-gray-50"
                              style={{ paddingRight: "9rem" }}
                            >
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <h4 className="font-medium text-gray-900">
                                    {template.title}
                                  </h4>
                                  {getScopeBadge(template.scope)}
                                  {getTemplateBadge(template)}
                                </div>
                                {template.description && (
                                  <p className="text-sm text-gray-600 mb-2">
                                    {template.description}
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
                                  <div className="flex items-center gap-1">
                                    <Calendar className="h-4 w-4" />
                                    Prima scadenza dopo{" "}
                                    {template.firstDueOffsetDays} giorni
                                  </div>
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

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-medium text-blue-900 mb-2">
          Informazioni sui Template di Adempimenti
        </h3>
        <ul className="text-sm text-blue-800 space-y-2">
          <li>
            <strong>Template Globali:</strong> I template con badge "Globale"
            sono predefiniti dal sistema per garantire conformità alle normative
            nazionali. Solo l'amministratore del sito può modificarli per
            mantenerli aggiornati con i cambiamenti normativi.
          </li>
          <li>
            <strong>Template Organizzazione:</strong> Puoi creare template
            personalizzati specifici per la tua organizzazione (usa il pulsante
            "Nuovo Adempimento"). Questi template possono essere modificati ed
            eliminati in qualsiasi momento.
          </li>
          <li>
            <strong>Scadenze Personalizzate:</strong> Per creare scadenze
            specifiche non ricorrenti o personalizzate, vai alla sezione
            Scadenze della struttura o persona interessata.
          </li>
          <li>
            <strong>Usa i Template:</strong> I template servono per generare
            automaticamente scadenze ricorrenti. Visualizza i dettagli dei
            template globali per vedere riferimenti normativi e informazioni
            sulla compliance.
          </li>
        </ul>
      </div>

      {/* Modali */}
      <NewTemplateModal
        organizationId={organizationId}
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        onSuccess={loadTemplates}
      />

      {selectedTemplateId && (
        <>
          <EditTemplateModal
            organizationId={organizationId}
            templateId={selectedTemplateId}
            isOpen={isEditModalOpen}
            onClose={() => {
              setIsEditModalOpen(false);
              setSelectedTemplateId("");
            }}
            onSuccess={loadTemplates}
          />
          <ViewTemplateModal
            organizationId={organizationId}
            templateId={selectedTemplateId}
            isOpen={isViewModalOpen}
            onClose={() => {
              setIsViewModalOpen(false);
              setSelectedTemplateId("");
            }}
          />
        </>
      )}
    </div>
  );
}
