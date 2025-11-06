"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Edit, Archive, ArchiveRestore, Trash2, Loader2 } from "lucide-react";
import { GlobalTemplateForm } from "./global-template-form";

interface GlobalTemplateActionsProps {
  template: {
    id: string;
    title: string;
    description: string | null;
    scope: string;
    complianceType: string;
    recurrenceUnit: string;
    recurrenceEvery: number;
    firstDueOffsetDays: number;
    anchor: string;
    legalReference: string | null;
    sourceUrl: string | null;
    effectiveFrom: Date | null;
    effectiveTo: Date | null;
    country: string | null;
    notes: string | null;
    active: boolean;
  };
}

export function GlobalTemplateActions({ template }: GlobalTemplateActionsProps) {
  const router = useRouter();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleArchive = async () => {
    if (!confirm(`Sei sicuro di voler ${template.active ? "archiviare" : "ripristinare"} questo template?`)) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/global-templates/${template.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          active: !template.active,
        }),
      });

      if (!response.ok) {
        throw new Error("Errore durante l'operazione");
      }

      router.refresh();
      alert(template.active ? "Template archiviato con successo" : "Template ripristinato con successo");
    } catch (error) {
      console.error("Error toggling archive:", error);
      alert("Errore durante l'operazione");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Sei sicuro di voler eliminare definitivamente questo template? Questa azione non può essere annullata.")) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/global-templates/${template.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Errore durante l'eliminazione");
      }

      router.push("/admin/global");
      alert("Template eliminato con successo");
    } catch (error) {
      console.error("Error deleting template:", error);
      alert("Errore durante l'eliminazione del template");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <Button
          onClick={() => setIsEditOpen(true)}
          disabled={isLoading}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
        >
          <Edit className="h-4 w-4 mr-2" />
          Modifica
        </Button>
        
        <Button
          onClick={handleArchive}
          disabled={isLoading}
          variant="outline"
          className="border-amber-300 text-amber-700 hover:bg-amber-50"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : template.active ? (
            <Archive className="h-4 w-4 mr-2" />
          ) : (
            <ArchiveRestore className="h-4 w-4 mr-2" />
          )}
          {template.active ? "Archivia" : "Ripristina"}
        </Button>

        <Button
          onClick={handleDelete}
          disabled={isLoading}
          variant="outline"
          className="border-red-300 text-red-700 hover:bg-red-50"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4 mr-2" />
          )}
          Elimina
        </Button>
      </div>

      <GlobalTemplateForm
        template={template}
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
      />
    </>
  );
}
