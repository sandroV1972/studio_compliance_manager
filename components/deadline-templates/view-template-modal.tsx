"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, Eye, ExternalLink } from "lucide-react";

interface ViewTemplateModalProps {
  organizationId: string;
  templateId: string;
  isOpen: boolean;
  onClose: () => void;
}

interface TemplateData {
  id: string;
  title: string;
  complianceType: string;
  description: string | null;
  scope: string;
  ownerType: string;
  recurrenceUnit: string;
  recurrenceEvery: number;
  firstDueOffsetDays: number;
  anchor: string;
  requiredDocumentName: string | null;
  legalReference: string | null;
  sourceUrl: string | null;
  country: string | null;
  region: string | null;
}

export function ViewTemplateModal({
  organizationId,
  templateId,
  isOpen,
  onClose,
}: ViewTemplateModalProps) {
  const [loading, setLoading] = useState(true);
  const [template, setTemplate] = useState<TemplateData | null>(null);

  useEffect(() => {
    if (isOpen && templateId) {
      loadTemplate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, templateId, organizationId]);

  const loadTemplate = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/organizations/${organizationId}/deadline-templates/${templateId}`,
      );
      if (!response.ok) throw new Error("Errore caricamento template");

      const data = await response.json();
      setTemplate(data.template);
    } catch (error) {
      console.error("Errore caricamento template:", error);
      alert("Errore nel caricamento del template");
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const getComplianceTypeLabel = (type: string) => {
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
    return labels[type] || type;
  };

  const getScopeLabel = (scope: string) => {
    return scope === "PERSON" ? "Persona" : "Struttura";
  };

  const getRecurrenceText = (unit: string, every: number) => {
    const units: Record<string, string> = {
      DAY: every === 1 ? "giorno" : "giorni",
      MONTH: every === 1 ? "mese" : "mesi",
      YEAR: every === 1 ? "anno" : "anni",
    };
    return `Ogni ${every} ${units[unit] || unit.toLowerCase()}`;
  };

  const getAnchorLabel = (anchor: string) => {
    const labels: Record<string, string> = {
      HIRE_DATE: "Data assunzione",
      ASSIGNMENT_START: "Inizio incarico",
      LAST_COMPLETION: "Ultimo completamento",
      CUSTOM: "Personalizzato",
    };
    return labels[anchor] || anchor;
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Eye className="h-6 w-6" />
            Visualizza Adempimento
          </DialogTitle>
          <DialogDescription>
            Informazioni dettagliate sul template di adempimento
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
            <span className="ml-2">Caricamento...</span>
          </div>
        ) : template ? (
          <div className="space-y-6">
            {/* Badge Tipo Template */}
            {template.ownerType === "GLOBAL" && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                <Badge className="bg-green-500 text-white mb-2">
                  Template Globale
                </Badge>
                <p className="text-sm text-green-800">
                  Questo è un template predefinito dal sistema. Solo
                  l'amministratore del sito può modificarlo per garantire
                  conformità alle normative nazionali.
                </p>
              </div>
            )}

            {/* Titolo */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Titolo</Label>
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
                <p className="text-gray-900 font-medium">{template.title}</p>
              </div>
            </div>

            {/* Tipo Compliance */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Tipo Compliance</Label>
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
                <Badge className="bg-blue-500 text-white">
                  {getComplianceTypeLabel(template.complianceType)}
                </Badge>
              </div>
            </div>

            {/* Descrizione */}
            {template.description && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Descrizione</Label>
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
                  <p className="text-sm text-gray-700">
                    {template.description}
                  </p>
                </div>
              </div>
            )}

            {/* Riferimento Normativo */}
            {template.legalReference && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Riferimento Normativo
                </Label>
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <p className="text-sm text-blue-900 font-medium">
                    {template.legalReference}
                  </p>
                </div>
              </div>
            )}

            {/* Fonte Normativa (URL) */}
            {template.sourceUrl && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Fonte Normativa</Label>
                <a
                  href={template.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-3 bg-gray-50 border border-gray-200 rounded-md hover:bg-gray-100 transition-colors"
                >
                  <ExternalLink className="h-4 w-4 text-indigo-600" />
                  <span className="text-sm text-indigo-600 hover:underline">
                    Visualizza normativa
                  </span>
                </a>
              </div>
            )}

            {/* Ambito, Paese e Regione */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Ambito</Label>
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
                  <Badge variant="outline">
                    {getScopeLabel(template.scope)}
                  </Badge>
                </div>
              </div>
              {template.country && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Paese</Label>
                  <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
                    <p className="text-sm text-gray-700">
                      {template.country === "IT" ? "Italia" : template.country}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Applicabilità Regionale */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Applicabilità</Label>
              <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-md">
                {template.region ? (
                  <div className="flex items-center gap-2">
                    <Badge className="bg-indigo-500 text-white">
                      Regionale
                    </Badge>
                    <span className="text-sm text-indigo-900 font-medium">
                      {template.region}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Badge className="bg-green-500 text-white">Nazionale</Badge>
                    <span className="text-sm text-green-900">
                      Valido per tutta Italia
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Ricorrenza */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Ricorrenza</Label>
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
                <p className="text-gray-900">
                  {getRecurrenceText(
                    template.recurrenceUnit,
                    template.recurrenceEvery,
                  )}
                </p>
              </div>
            </div>

            {/* Punto di Riferimento */}
            {template.scope === "PERSON" && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Punto di Riferimento
                </Label>
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
                  <p className="text-sm text-gray-700">
                    {getAnchorLabel(template.anchor)}
                  </p>
                </div>
              </div>
            )}

            {/* Prima scadenza */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Prima scadenza dopo (giorni)
              </Label>
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
                <p className="text-gray-900">{template.firstDueOffsetDays}</p>
              </div>
            </div>

            {/* Documento richiesto */}
            {template.requiredDocumentName && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Documento Richiesto
                </Label>
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-md">
                  <Badge className="bg-amber-500 text-white">
                    {template.requiredDocumentName}
                  </Badge>
                </div>
              </div>
            )}

            {/* Info Box */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-800">
                Per creare scadenze personalizzate basate su questo template,
                vai alla sezione Scadenze della struttura o persona interessata
                e seleziona "Genera da Template".
              </p>
            </div>
          </div>
        ) : (
          <p className="text-center text-gray-500 py-8">Template non trovato</p>
        )}

        <DialogFooter>
          <Button type="button" onClick={onClose}>
            Chiudi
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
