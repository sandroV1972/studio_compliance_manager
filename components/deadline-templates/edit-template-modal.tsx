"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Save, Loader2, Trash2 } from "lucide-react";
import { TemplateForm, type TemplateFormData } from "./template-form";

interface EditTemplateModalProps {
  organizationId: string;
  templateId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const initialFormData: TemplateFormData = {
  title: "",
  complianceType: "TRAINING",
  description: "",
  scope: "PERSON",
  recurrenceUnit: "MONTH",
  recurrenceEvery: "1",
  firstDueOffsetDays: "0",
  anchor: "HIRE_DATE",
  requiredDocumentName: "",
};

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
  const [formData, setFormData] = useState<TemplateFormData>(initialFormData);

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
            <TemplateForm formData={formData} onChange={setFormData} />

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
