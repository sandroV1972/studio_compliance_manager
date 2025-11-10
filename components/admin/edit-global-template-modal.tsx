"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Save,
  Loader2,
  Trash2,
  FileText,
  Calendar,
  Target,
  AlertCircle,
  Globe,
  MapPin,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

// Lista delle regioni italiane
const ITALIAN_REGIONS = [
  "Abruzzo",
  "Basilicata",
  "Calabria",
  "Campania",
  "Emilia-Romagna",
  "Friuli-Venezia Giulia",
  "Lazio",
  "Liguria",
  "Lombardia",
  "Marche",
  "Molise",
  "Piemonte",
  "Puglia",
  "Sardegna",
  "Sicilia",
  "Toscana",
  "Trentino-Alto Adige",
  "Umbria",
  "Valle d'Aosta",
  "Veneto",
];

interface EditGlobalTemplateModalProps {
  templateId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function EditGlobalTemplateModal({
  templateId,
  isOpen,
  onClose,
  onSuccess,
}: EditGlobalTemplateModalProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: "",
    complianceType: "TRAINING",
    description: "",
    scope: "PERSON",
    recurrenceUnit: "MONTH",
    recurrenceEvery: 1,
    firstDueOffsetDays: 0,
    anchor: "HIRE_DATE",
    requiredDocumentName: "",
    legalReference: "",
    sourceUrl: "",
    effectiveFrom: "",
    effectiveTo: "",
    country: "IT",
    regions: [] as string[],
    notes: "",
    active: true,
  });

  useEffect(() => {
    if (isOpen && templateId) {
      loadTemplate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, templateId]);

  const loadTemplate = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/global-templates/${templateId}`);
      if (!response.ok) throw new Error("Errore caricamento template");

      const data = await response.json();
      const template = data.template;

      // Parse regions dal database (può essere stringa JSON o NULL)
      let regions: string[] = [];
      if (template.regions) {
        try {
          regions = JSON.parse(template.regions);
        } catch {
          // Se non è JSON valido, ignora
          regions = [];
        }
      }

      setFormData({
        title: template.title || "",
        complianceType: template.complianceType || "TRAINING",
        description: template.description || "",
        scope: template.scope || "PERSON",
        recurrenceUnit: template.recurrenceUnit || "MONTH",
        recurrenceEvery: template.recurrenceEvery || 1,
        firstDueOffsetDays: template.firstDueOffsetDays || 0,
        anchor: template.anchor || "HIRE_DATE",
        requiredDocumentName: template.requiredDocumentName || "",
        legalReference: template.legalReference || "",
        sourceUrl: template.sourceUrl || "",
        effectiveFrom: template.effectiveFrom
          ? new Date(template.effectiveFrom).toISOString().split("T")[0]
          : "",
        effectiveTo: template.effectiveTo
          ? new Date(template.effectiveTo).toISOString().split("T")[0]
          : "",
        country: template.country || "IT",
        regions: regions,
        notes: template.notes || "",
        active: template.active ?? true,
      });
    } catch (error) {
      console.error("Errore caricamento template:", error);
      alert("Errore nel caricamento del template");
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      if (!formData.title.trim()) {
        alert("Il titolo è obbligatorio");
        setIsSaving(false);
        return;
      }

      const response = await fetch(
        `/api/admin/global-templates/${templateId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...formData,
            // Per le strutture, usa sempre LAST_COMPLETION come anchor
            anchor:
              formData.scope === "STRUCTURE"
                ? "LAST_COMPLETION"
                : formData.anchor,
            description: formData.description.trim() || null,
            requiredDocumentName: formData.requiredDocumentName.trim() || null,
            legalReference: formData.legalReference.trim() || null,
            sourceUrl: formData.sourceUrl.trim() || null,
            notes: formData.notes.trim() || null,
            effectiveFrom: formData.effectiveFrom
              ? new Date(formData.effectiveFrom)
              : null,
            effectiveTo: formData.effectiveTo
              ? new Date(formData.effectiveTo)
              : null,
            regions:
              formData.regions.length > 0
                ? JSON.stringify(formData.regions)
                : null,
          }),
        },
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Errore durante l'aggiornamento");
      }

      onSuccess();
      onClose();
      alert("Template globale aggiornato con successo");
    } catch (error) {
      console.error("Error updating template:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Errore durante l'aggiornamento",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (
      !confirm(
        "Sei sicuro di voler eliminare questo template globale? Questa azione non può essere annullata e il template non sarà più disponibile per nessuna organizzazione.",
      )
    ) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(
        `/api/admin/global-templates/${templateId}`,
        {
          method: "DELETE",
        },
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Errore durante l'eliminazione");
      }

      onSuccess();
      onClose();
      alert("Template globale eliminato con successo");
    } catch (error) {
      console.error("Error deleting template:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Errore durante l'eliminazione",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <FileText className="h-6 w-6 text-indigo-600" />
            Modifica Template Globale
          </DialogTitle>
          <DialogDescription>
            Modifica i dettagli del template di adempimento globale. Le
            modifiche saranno visibili a tutte le organizzazioni.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
            <span className="ml-2">Caricamento...</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Titolo */}
              <div className="space-y-2 md:col-span-2">
                <Label
                  htmlFor="title"
                  className="text-sm font-medium flex items-center gap-2"
                >
                  <FileText className="h-4 w-4 text-indigo-500" />
                  Titolo *
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="Es: Formazione Antincendio"
                  required
                  className="border-indigo-200 focus:border-indigo-500"
                />
              </div>

              {/* Descrizione */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="description" className="text-sm font-medium">
                  Descrizione
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Descrizione dettagliata dell'adempimento"
                  rows={3}
                  className="border-indigo-200 focus:border-indigo-500"
                />
              </div>

              {/* Ambito */}
              <div className="space-y-2">
                <Label
                  htmlFor="scope"
                  className="text-sm font-medium flex items-center gap-2"
                >
                  <Target className="h-4 w-4 text-purple-500" />
                  Ambito *
                </Label>
                <select
                  id="scope"
                  value={formData.scope}
                  onChange={(e) =>
                    setFormData({ ...formData, scope: e.target.value })
                  }
                  required
                  className="w-full px-3 py-2 border border-indigo-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="PERSON">Persona</option>
                  <option value="STRUCTURE">Struttura</option>
                  <option value="ROLE">Ruolo</option>
                </select>
              </div>

              {/* Tipo Compliance */}
              <div className="space-y-2">
                <Label
                  htmlFor="complianceType"
                  className="text-sm font-medium flex items-center gap-2"
                >
                  <AlertCircle className="h-4 w-4 text-amber-500" />
                  Tipo Compliance *
                </Label>
                <select
                  id="complianceType"
                  value={formData.complianceType}
                  onChange={(e) =>
                    setFormData({ ...formData, complianceType: e.target.value })
                  }
                  required
                  className="w-full px-3 py-2 border border-indigo-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="TRAINING">Formazione</option>
                  <option value="MAINTENANCE">Manutenzione</option>
                  <option value="INSPECTION">Ispezione</option>
                  <option value="DOCUMENT">Documento</option>
                  <option value="REPORTING">Reportistica</option>
                  <option value="WASTE">Rifiuti</option>
                  <option value="DATA_PROTECTION">Protezione Dati</option>
                  <option value="INSURANCE">Assicurazione</option>
                  <option value="OTHER">Altro</option>
                </select>
              </div>

              {/* Ricorrenza */}
              <div className="space-y-2">
                <Label
                  htmlFor="recurrenceEvery"
                  className="text-sm font-medium flex items-center gap-2"
                >
                  <Calendar className="h-4 w-4 text-green-500" />
                  Ricorre ogni *
                </Label>
                <Input
                  id="recurrenceEvery"
                  type="number"
                  min="1"
                  value={formData.recurrenceEvery}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      recurrenceEvery: parseInt(e.target.value) || 1,
                    })
                  }
                  required
                  className="border-indigo-200 focus:border-indigo-500"
                />
              </div>

              {/* Unità */}
              <div className="space-y-2">
                <Label htmlFor="recurrenceUnit" className="text-sm font-medium">
                  Unità *
                </Label>
                <select
                  id="recurrenceUnit"
                  value={formData.recurrenceUnit}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      recurrenceUnit: e.target.value,
                    })
                  }
                  required
                  className="w-full px-3 py-2 border border-indigo-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="DAY">Giorni</option>
                  <option value="MONTH">Mesi</option>
                  <option value="YEAR">Anni</option>
                </select>
              </div>

              {/* Anchor - solo per ambito PERSON */}
              {formData.scope === "PERSON" && (
                <div className="space-y-2">
                  <Label htmlFor="anchor" className="text-sm font-medium">
                    Punto di Riferimento *
                  </Label>
                  <select
                    id="anchor"
                    value={formData.anchor}
                    onChange={(e) =>
                      setFormData({ ...formData, anchor: e.target.value })
                    }
                    required
                    className="w-full px-3 py-2 border border-indigo-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="HIRE_DATE">Data assunzione</option>
                    <option value="ASSIGNMENT_START">Inizio incarico</option>
                    <option value="LAST_COMPLETION">
                      Ultimo completamento
                    </option>
                    <option value="CUSTOM">Personalizzato</option>
                  </select>
                </div>
              )}

              {formData.scope === "STRUCTURE" && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    Punto di Riferimento
                  </Label>
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                    <p className="text-sm text-blue-800">
                      Per gli adempimenti di struttura, viene usato
                      automaticamente "Ultimo completamento"
                    </p>
                  </div>
                </div>
              )}

              {/* Offset giorni */}
              <div className="space-y-2">
                <Label
                  htmlFor="firstDueOffsetDays"
                  className="text-sm font-medium"
                >
                  Prima scadenza dopo (giorni)
                </Label>
                <Input
                  id="firstDueOffsetDays"
                  type="number"
                  min="0"
                  value={formData.firstDueOffsetDays}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      firstDueOffsetDays: parseInt(e.target.value) || 0,
                    })
                  }
                  className="border-indigo-200 focus:border-indigo-500"
                />
              </div>

              {/* Documento richiesto */}
              <div className="space-y-2">
                <Label
                  htmlFor="requiredDocumentName"
                  className="text-sm font-medium"
                >
                  Documento Richiesto
                </Label>
                <Input
                  id="requiredDocumentName"
                  value={formData.requiredDocumentName}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      requiredDocumentName: e.target.value,
                    })
                  }
                  placeholder="Es: Attestato formazione"
                  className="border-indigo-200 focus:border-indigo-500"
                />
              </div>

              {/* Riferimento Legale */}
              <div className="space-y-2">
                <Label htmlFor="legalReference" className="text-sm font-medium">
                  Riferimento Normativo
                </Label>
                <Input
                  id="legalReference"
                  value={formData.legalReference}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      legalReference: e.target.value,
                    })
                  }
                  placeholder="Es: D.Lgs. 81/2008"
                  className="border-indigo-200 focus:border-indigo-500"
                />
              </div>

              {/* URL Fonte */}
              <div className="space-y-2">
                <Label htmlFor="sourceUrl" className="text-sm font-medium">
                  URL Fonte
                </Label>
                <Input
                  id="sourceUrl"
                  type="url"
                  value={formData.sourceUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, sourceUrl: e.target.value })
                  }
                  placeholder="https://..."
                  className="border-indigo-200 focus:border-indigo-500"
                />
              </div>

              {/* Localizzazione */}
              <div className="space-y-2 md:col-span-2 p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <Globe className="h-5 w-5 text-indigo-600" />
                  <h3 className="font-semibold text-indigo-900">
                    Applicabilità Geografica
                  </h3>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="country" className="text-sm font-medium">
                      Paese
                    </Label>
                    <select
                      id="country"
                      value={formData.country}
                      onChange={(e) =>
                        setFormData({ ...formData, country: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-indigo-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="IT">Italia</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-indigo-500" />
                      Regioni di applicazione
                    </Label>
                    <p className="text-xs text-indigo-700 mb-2">
                      Seleziona le regioni dove si applica questo template. Se
                      non selezioni nulla, sarà valido per tutta Italia.
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-4 bg-white border border-indigo-200 rounded-md max-h-48 overflow-y-auto">
                      {ITALIAN_REGIONS.map((region) => (
                        <div
                          key={region}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            id={`region-${region}`}
                            checked={formData.regions.includes(region)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setFormData({
                                  ...formData,
                                  regions: [...formData.regions, region],
                                });
                              } else {
                                setFormData({
                                  ...formData,
                                  regions: formData.regions.filter(
                                    (r) => r !== region,
                                  ),
                                });
                              }
                            }}
                          />
                          <Label
                            htmlFor={`region-${region}`}
                            className="text-sm font-normal cursor-pointer"
                          >
                            {region}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Date validità */}
              <div className="space-y-2">
                <Label htmlFor="effectiveFrom" className="text-sm font-medium">
                  Valido da
                </Label>
                <Input
                  id="effectiveFrom"
                  type="date"
                  value={formData.effectiveFrom}
                  onChange={(e) =>
                    setFormData({ ...formData, effectiveFrom: e.target.value })
                  }
                  className="border-indigo-200 focus:border-indigo-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="effectiveTo" className="text-sm font-medium">
                  Valido fino a
                </Label>
                <Input
                  id="effectiveTo"
                  type="date"
                  value={formData.effectiveTo}
                  onChange={(e) =>
                    setFormData({ ...formData, effectiveTo: e.target.value })
                  }
                  className="border-indigo-200 focus:border-indigo-500"
                />
              </div>

              {/* Note */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="notes" className="text-sm font-medium">
                  Note Interne
                </Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  placeholder="Note per gli amministratori del sistema"
                  rows={2}
                  className="border-indigo-200 focus:border-indigo-500"
                />
              </div>

              {/* Stato attivo */}
              <div className="space-y-2 md:col-span-2">
                <Label className="text-sm font-medium">Stato</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="active"
                    checked={formData.active}
                    onChange={(e) =>
                      setFormData({ ...formData, active: e.target.checked })
                    }
                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                  />
                  <Label htmlFor="active" className="text-sm font-normal">
                    Template attivo (visibile alle organizzazioni)
                  </Label>
                </div>
              </div>
            </div>

            <DialogFooter className="flex justify-between">
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={isSaving || isDeleting}
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Eliminazione...
                  </>
                ) : (
                  <>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Elimina
                  </>
                )}
              </Button>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={isSaving || isDeleting}
                >
                  Annulla
                </Button>
                <Button type="submit" disabled={isSaving || isDeleting}>
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvataggio...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Salva Modifiche
                    </>
                  )}
                </Button>
              </div>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
