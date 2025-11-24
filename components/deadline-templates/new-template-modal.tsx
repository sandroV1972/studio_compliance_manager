"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Save, Loader2 } from "lucide-react";
import { TemplateForm, type TemplateFormData } from "./template-form";

interface NewTemplateModalProps {
  organizationId: string;
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

export function NewTemplateModal({
  organizationId,
  isOpen,
  onClose,
  onSuccess,
}: NewTemplateModalProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<TemplateFormData>(initialFormData);

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
        `/api/organizations/${organizationId}/deadline-templates`,
        {
          method: "POST",
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
        throw new Error(error.error || "Errore durante la creazione");
      }

      // Reset form
      setFormData(initialFormData);

      onSuccess();
      onClose();
      alert("Adempimento creato con successo");
    } catch (error) {
      console.error("Error creating template:", error);
      alert(
        error instanceof Error ? error.message : "Errore durante la creazione",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    if (!isSaving) {
      setFormData(initialFormData);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Nuovo Adempimento
          </DialogTitle>
          <DialogDescription>
            Crea un nuovo template di adempimento per l'organizzazione
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <TemplateForm formData={formData} onChange={setFormData} />

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSaving}
            >
              Annulla
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creazione...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Crea Adempimento
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
