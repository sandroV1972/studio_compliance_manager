"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Save, Loader2, FileText, Calendar, Target, AlertCircle } from "lucide-react";

interface GlobalTemplateFormProps {
  template?: {
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
  isOpen: boolean;
  onClose: () => void;
}

export function GlobalTemplateForm({ template, isOpen, onClose }: GlobalTemplateFormProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: template?.title || "",
    description: template?.description || "",
    scope: template?.scope || "PERSON",
    complianceType: template?.complianceType || "TRAINING",
    recurrenceUnit: template?.recurrenceUnit || "YEAR",
    recurrenceEvery: template?.recurrenceEvery || 1,
    firstDueOffsetDays: template?.firstDueOffsetDays || 0,
    anchor: template?.anchor || "HIRE_DATE",
    legalReference: template?.legalReference || "",
    sourceUrl: template?.sourceUrl || "",
    effectiveFrom: template?.effectiveFrom ? new Date(template.effectiveFrom).toISOString().split('T')[0] : "",
    effectiveTo: template?.effectiveTo ? new Date(template.effectiveTo).toISOString().split('T')[0] : "",
    country: template?.country || "IT",
    notes: template?.notes || "",
    active: template?.active ?? true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const url = template 
        ? `/api/admin/global-templates/${template.id}`
        : `/api/admin/global-templates`;
      
      const method = template ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          recurrenceEvery: parseInt(formData.recurrenceEvery.toString()),
          firstDueOffsetDays: parseInt(formData.firstDueOffsetDays.toString()),
          effectiveFrom: formData.effectiveFrom ? new Date(formData.effectiveFrom) : null,
          effectiveTo: formData.effectiveTo ? new Date(formData.effectiveTo) : null,
        }),
      });

      if (!response.ok) {
        throw new Error("Errore durante il salvataggio");
      }

      router.refresh();
      onClose();
      alert(template ? "Template aggiornato con successo" : "Template creato con successo");
    } catch (error) {
      console.error("Error saving template:", error);
      alert("Errore durante il salvataggio del template");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <FileText className="h-6 w-6 text-indigo-600" />
            {template ? "Modifica Template Globale" : "Nuovo Template Globale"}
          </DialogTitle>
          <DialogDescription>
            {template ? "Modifica i dati del template globale" : "Crea un nuovo template globale per tutte le organizzazioni"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="title" className="text-sm font-medium flex items-center gap-2">
                <FileText className="h-4 w-4 text-indigo-500" />
                Titolo *
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Es: Aggiornamento formazione sicurezza"
                required
                className="border-indigo-200 focus:border-indigo-500"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description" className="text-sm font-medium">
                Descrizione
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descrizione dettagliata del template"
                rows={3}
                className="border-indigo-200 focus:border-indigo-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="scope" className="text-sm font-medium flex items-center gap-2">
                <Target className="h-4 w-4 text-purple-500" />
                Scope *
              </Label>
              <select
                id="scope"
                value={formData.scope}
                onChange={(e) => setFormData({ ...formData, scope: e.target.value })}
                required
                className="w-full px-3 py-2 border border-indigo-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="PERSON">Persona</option>
                <option value="STRUCTURE">Struttura</option>
                <option value="ROLE">Ruolo</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="complianceType" className="text-sm font-medium flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-amber-500" />
                Tipo Compliance *
              </Label>
              <select
                id="complianceType"
                value={formData.complianceType}
                onChange={(e) => setFormData({ ...formData, complianceType: e.target.value })}
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

            <div className="space-y-2">
              <Label htmlFor="recurrenceEvery" className="text-sm font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4 text-green-500" />
                Ricorrenza Ogni *
              </Label>
              <Input
                id="recurrenceEvery"
                type="number"
                min="1"
                value={formData.recurrenceEvery}
                onChange={(e) => setFormData({ ...formData, recurrenceEvery: parseInt(e.target.value) })}
                required
                className="border-indigo-200 focus:border-indigo-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="recurrenceUnit" className="text-sm font-medium">
                Unità Ricorrenza *
              </Label>
              <select
                id="recurrenceUnit"
                value={formData.recurrenceUnit}
                onChange={(e) => setFormData({ ...formData, recurrenceUnit: e.target.value })}
                required
                className="w-full px-3 py-2 border border-indigo-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="DAY">Giorni</option>
                <option value="MONTH">Mesi</option>
                <option value="YEAR">Anni</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="anchor" className="text-sm font-medium">
                Anchor *
              </Label>
              <select
                id="anchor"
                value={formData.anchor}
                onChange={(e) => setFormData({ ...formData, anchor: e.target.value })}
                required
                className="w-full px-3 py-2 border border-indigo-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="HIRE_DATE">Data Assunzione</option>
                <option value="ASSIGNMENT_START">Inizio Incarico</option>
                <option value="LAST_COMPLETION">Ultimo Completamento</option>
                <option value="CUSTOM">Personalizzato</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="firstDueOffsetDays" className="text-sm font-medium">
                Offset Giorni Prima Scadenza
              </Label>
              <Input
                id="firstDueOffsetDays"
                type="number"
                value={formData.firstDueOffsetDays}
                onChange={(e) => setFormData({ ...formData, firstDueOffsetDays: parseInt(e.target.value) })}
                className="border-indigo-200 focus:border-indigo-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="legalReference" className="text-sm font-medium">
                Riferimento Legale
              </Label>
              <Input
                id="legalReference"
                value={formData.legalReference}
                onChange={(e) => setFormData({ ...formData, legalReference: e.target.value })}
                placeholder="Es: D.Lgs. 81/2008"
                className="border-indigo-200 focus:border-indigo-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sourceUrl" className="text-sm font-medium">
                URL Fonte
              </Label>
              <Input
                id="sourceUrl"
                type="url"
                value={formData.sourceUrl}
                onChange={(e) => setFormData({ ...formData, sourceUrl: e.target.value })}
                placeholder="https://..."
                className="border-indigo-200 focus:border-indigo-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="effectiveFrom" className="text-sm font-medium">
                Valido Da
              </Label>
              <Input
                id="effectiveFrom"
                type="date"
                value={formData.effectiveFrom}
                onChange={(e) => setFormData({ ...formData, effectiveFrom: e.target.value })}
                className="border-indigo-200 focus:border-indigo-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="effectiveTo" className="text-sm font-medium">
                Valido Fino A
              </Label>
              <Input
                id="effectiveTo"
                type="date"
                value={formData.effectiveTo}
                onChange={(e) => setFormData({ ...formData, effectiveTo: e.target.value })}
                className="border-indigo-200 focus:border-indigo-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="country" className="text-sm font-medium">
                Paese
              </Label>
              <Input
                id="country"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                placeholder="IT"
                className="border-indigo-200 focus:border-indigo-500"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="notes" className="text-sm font-medium">
                Note
              </Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Note aggiuntive"
                rows={2}
                className="border-indigo-200 focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center gap-3 md:col-span-2 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
              <input
                id="active"
                type="checkbox"
                checked={formData.active}
                onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                className="h-5 w-5 rounded border-green-300 text-green-600 focus:ring-green-500"
              />
              <Label htmlFor="active" className="text-sm font-semibold text-gray-800 cursor-pointer">
                Template Attivo
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSaving}
            >
              Annulla
            </Button>
            <Button
              type="submit"
              disabled={isSaving}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvataggio...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  {template ? "Salva Modifiche" : "Crea Template"}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
