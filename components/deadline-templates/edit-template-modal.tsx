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
import { Save, Loader2, Trash2 } from "lucide-react";

interface EditTemplateModalProps {
  organizationId: string;
  templateId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function EditTemplateModal({
  organizationId,
  templateId,
  isOpen,
  onClose,
  onSuccess,
}: EditTemplateModalProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: "",
    complianceType: "TRAINING",
    description: "",
    scope: "PERSON",
    recurrenceUnit: "MONTH",
    recurrenceEvery: "1",
    firstDueOffsetDays: "0",
    anchor: "HIRE_DATE",
    requiredDocumentName: "",
  });

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
      setFormData({
        title: data.template.title || "",
        complianceType: data.template.complianceType || "TRAINING",
        description: data.template.description || "",
        scope: data.template.scope || "PERSON",
        recurrenceUnit: data.template.recurrenceUnit || "MONTH",
        recurrenceEvery: String(data.template.recurrenceEvery || 1),
        firstDueOffsetDays: String(data.template.firstDueOffsetDays || 0),
        anchor: data.template.anchor || "HIRE_DATE",
        requiredDocumentName: data.template.requiredDocumentName || "",
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
        `/api/organizations/${organizationId}/deadline-templates/${templateId}`,
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
          }),
        },
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Errore durante l'aggiornamento");
      }

      onSuccess();
      onClose();
      alert("Adempimento aggiornato con successo");
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
        "Sei sicuro di voler eliminare questo adempimento? Questa azione non può essere annullata.",
      )
    ) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(
        `/api/organizations/${organizationId}/deadline-templates/${templateId}`,
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
      alert("Adempimento eliminato con successo");
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Modifica Adempimento
          </DialogTitle>
          <DialogDescription>
            Modifica i dettagli del template di adempimento
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
            <span className="ml-2">Caricamento...</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Titolo */}
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-medium">
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
              />
            </div>

            {/* Tipo Compliance */}
            <div className="space-y-2">
              <Label htmlFor="complianceType" className="text-sm font-medium">
                Tipo Compliance *
              </Label>
              <select
                id="complianceType"
                value={formData.complianceType}
                onChange={(e) =>
                  setFormData({ ...formData, complianceType: e.target.value })
                }
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
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

            {/* Descrizione */}
            <div className="space-y-2">
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
              />
            </div>

            {/* Ambito */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Ambito *</Label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="scope"
                    value="PERSON"
                    checked={formData.scope === "PERSON"}
                    onChange={(e) =>
                      setFormData({ ...formData, scope: e.target.value })
                    }
                    className="h-4 w-4 text-indigo-600"
                  />
                  <span>Persona</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="scope"
                    value="STRUCTURE"
                    checked={formData.scope === "STRUCTURE"}
                    onChange={(e) =>
                      setFormData({ ...formData, scope: e.target.value })
                    }
                    className="h-4 w-4 text-indigo-600"
                  />
                  <span>Struttura</span>
                </label>
              </div>
            </div>

            {/* Ricorrenza */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor="recurrenceEvery"
                  className="text-sm font-medium"
                >
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
                      recurrenceEvery: e.target.value,
                    })
                  }
                  required
                />
              </div>
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="DAY">Giorni</option>
                  <option value="MONTH">Mesi</option>
                  <option value="YEAR">Anni</option>
                </select>
              </div>
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="HIRE_DATE">Data assunzione</option>
                  <option value="ASSIGNMENT_START">Inizio incarico</option>
                  <option value="LAST_COMPLETION">Ultimo completamento</option>
                  <option value="CUSTOM">Personalizzato</option>
                </select>
                <p className="text-xs text-gray-500">
                  Il punto di riferimento da cui calcolare le scadenze per la
                  persona
                </p>
              </div>
            )}

            {formData.scope === "STRUCTURE" && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Punto di Riferimento
                </Label>
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <p className="text-sm text-blue-800">
                    Per gli adempimenti legati alla struttura, le scadenze
                    vengono calcolate in base alla data di creazione o
                    all'ultimo completamento.
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
                    firstDueOffsetDays: e.target.value,
                  })
                }
              />
              <p className="text-xs text-gray-500">
                Numero di giorni dal punto di riferimento alla prima scadenza
              </p>
            </div>

            {/* Documento richiesto */}
            <div className="space-y-2">
              <Label
                htmlFor="requiredDocumentName"
                className="text-sm font-medium"
              >
                Documento Richiesto (opzionale)
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
              />
              <p className="text-xs text-gray-500">
                Se specificato, questo adempimento richiederà l'upload di un
                documento
              </p>
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
