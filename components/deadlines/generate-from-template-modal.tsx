"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface DeadlineTemplate {
  id: string;
  title: string;
  complianceType: string;
  description: string | null;
  scope: string;
  recurrenceUnit: string;
  recurrenceEvery: number;
  firstDueOffsetDays: number;
}

interface Person {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface Structure {
  id: string;
  name: string;
  code: string | null;
}

interface GenerateFromTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  organizationId: string;
}

export default function GenerateFromTemplateModal({
  isOpen,
  onClose,
  onSuccess,
  organizationId,
}: GenerateFromTemplateModalProps) {
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [templates, setTemplates] = useState<DeadlineTemplate[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [structures, setStructures] = useState<Structure[]>([]);

  const [formData, setFormData] = useState({
    templateId: "",
    targetType: "PERSON",
    targetId: "",
    startDate: new Date().toISOString().split("T")[0],
    generateCount: "1",
  });

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen, organizationId]);

  const loadData = async () => {
    try {
      setLoadingData(true);

      const [templatesRes, peopleRes, structuresRes] = await Promise.all([
        fetch(`/api/organizations/${organizationId}/deadline-templates`),
        fetch(`/api/organizations/${organizationId}/people`),
        fetch(`/api/organizations/${organizationId}/structures`),
      ]);

      if (templatesRes.ok) {
        const data = await templatesRes.json();
        setTemplates(data.templates || []);
      }

      if (peopleRes.ok) {
        const data = await peopleRes.json();
        setPeople(data.people || []);
      }

      if (structuresRes.ok) {
        const data = await structuresRes.json();
        setStructures(data.structures || []);
      }
    } catch (error) {
      console.error("Errore caricamento dati:", error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(
        `/api/organizations/${organizationId}/deadlines/generate-from-template`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            templateId: formData.templateId,
            targetType: formData.targetType,
            targetId:
              formData.targetType === "PERSON" ||
              formData.targetType === "STRUCTURE"
                ? formData.targetId
                : null,
            startDate: formData.startDate,
            generateCount: parseInt(formData.generateCount),
          }),
        },
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Errore nella generazione");
      }

      const data = await response.json();
      alert(`${data.count} scadenze create con successo!`);
      onSuccess();
    } catch (error) {
      console.error("Errore:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Errore nella generazione delle scadenze",
      );
    } finally {
      setLoading(false);
    }
  };

  const selectedTemplate = templates.find((t) => t.id === formData.templateId);

  const getRecurrenceText = (template: DeadlineTemplate) => {
    const unit =
      template.recurrenceUnit === "DAY"
        ? "giorni"
        : template.recurrenceUnit === "MONTH"
          ? "mesi"
          : "anni";
    return `Ogni ${template.recurrenceEvery} ${unit}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-indigo-900">
            Genera Scadenze da Template
          </DialogTitle>
          <DialogDescription>
            Seleziona un template e i destinatari per generare scadenze
            automaticamente
          </DialogDescription>
        </DialogHeader>

        {loadingData ? (
          <div className="flex justify-center items-center py-8">
            <div className="text-gray-600">Caricamento...</div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Selezione Template */}
            <div className="space-y-2">
              <Label htmlFor="templateId" className="text-sm font-medium">
                Template *
              </Label>
              <select
                id="templateId"
                value={formData.templateId}
                onChange={(e) =>
                  setFormData({ ...formData, templateId: e.target.value })
                }
                required
                className="w-full px-3 py-2 border border-indigo-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Seleziona un template...</option>
                {templates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.title} - {getRecurrenceText(template)}
                  </option>
                ))}
              </select>
            </div>

            {/* Informazioni Template Selezionato */}
            {selectedTemplate && (
              <div className="bg-indigo-50 p-4 rounded-md space-y-2">
                <h3 className="font-semibold text-indigo-900">
                  Dettagli Template
                </h3>
                <p className="text-sm text-gray-700">
                  <strong>Tipo:</strong> {selectedTemplate.complianceType}
                </p>
                <p className="text-sm text-gray-700">
                  <strong>Ricorrenza:</strong>{" "}
                  {getRecurrenceText(selectedTemplate)}
                </p>
                {selectedTemplate.description && (
                  <p className="text-sm text-gray-700">
                    <strong>Descrizione:</strong> {selectedTemplate.description}
                  </p>
                )}
              </div>
            )}

            {/* Tipo di Target */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Destinatari *</Label>
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="targetType"
                    value="PERSON"
                    checked={formData.targetType === "PERSON"}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        targetType: e.target.value,
                        targetId: "",
                      })
                    }
                    className="w-4 h-4 text-indigo-600"
                  />
                  <span className="text-sm">Persona specifica</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="targetType"
                    value="ALL_PEOPLE"
                    checked={formData.targetType === "ALL_PEOPLE"}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        targetType: e.target.value,
                        targetId: "",
                      })
                    }
                    className="w-4 h-4 text-indigo-600"
                  />
                  <span className="text-sm">Tutte le persone</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="targetType"
                    value="STRUCTURE"
                    checked={formData.targetType === "STRUCTURE"}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        targetType: e.target.value,
                        targetId: "",
                      })
                    }
                    className="w-4 h-4 text-indigo-600"
                  />
                  <span className="text-sm">Struttura specifica</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="targetType"
                    value="ALL_STRUCTURES"
                    checked={formData.targetType === "ALL_STRUCTURES"}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        targetType: e.target.value,
                        targetId: "",
                      })
                    }
                    className="w-4 h-4 text-indigo-600"
                  />
                  <span className="text-sm">Tutte le strutture</span>
                </label>
              </div>
            </div>

            {/* Selezione Persona/Struttura Specifica */}
            {formData.targetType === "PERSON" && (
              <div className="space-y-2">
                <Label htmlFor="personId" className="text-sm font-medium">
                  Persona *
                </Label>
                <select
                  id="personId"
                  value={formData.targetId}
                  onChange={(e) =>
                    setFormData({ ...formData, targetId: e.target.value })
                  }
                  required
                  className="w-full px-3 py-2 border border-indigo-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Seleziona una persona...</option>
                  {people.map((person) => (
                    <option key={person.id} value={person.id}>
                      {person.firstName} {person.lastName}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {formData.targetType === "STRUCTURE" && (
              <div className="space-y-2">
                <Label htmlFor="structureId" className="text-sm font-medium">
                  Struttura *
                </Label>
                <select
                  id="structureId"
                  value={formData.targetId}
                  onChange={(e) =>
                    setFormData({ ...formData, targetId: e.target.value })
                  }
                  required
                  className="w-full px-3 py-2 border border-indigo-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Seleziona una struttura...</option>
                  {structures.map((structure) => (
                    <option key={structure.id} value={structure.id}>
                      {structure.name}
                      {structure.code && ` (${structure.code})`}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Data di Inizio */}
            <div className="space-y-2">
              <Label htmlFor="startDate" className="text-sm font-medium">
                Data di Inizio *
              </Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) =>
                  setFormData({ ...formData, startDate: e.target.value })
                }
                required
                className="border-indigo-200 focus:border-indigo-500"
              />
              <p className="text-xs text-gray-500">
                La prima scadenza sarà calcolata a partire da questa data
              </p>
            </div>

            {/* Numero di Scadenze da Generare */}
            <div className="space-y-2">
              <Label htmlFor="generateCount" className="text-sm font-medium">
                Numero di Scadenze *
              </Label>
              <Input
                id="generateCount"
                type="number"
                min="1"
                max="12"
                value={formData.generateCount}
                onChange={(e) =>
                  setFormData({ ...formData, generateCount: e.target.value })
                }
                required
                className="border-indigo-200 focus:border-indigo-500"
              />
              <p className="text-xs text-gray-500">
                Numero di scadenze ricorrenti da creare (massimo 12)
              </p>
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={loading}
              >
                Annulla
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                {loading ? "Generazione..." : "Genera Scadenze"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
