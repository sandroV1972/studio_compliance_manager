"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export interface TemplateFormData {
  title: string;
  complianceType: string;
  description: string;
  scope: string;
  recurrenceUnit: string;
  recurrenceEvery: string;
  firstDueOffsetDays: string;
  anchor: string;
  requiredDocumentName: string;
}

interface TemplateFormProps {
  formData: TemplateFormData;
  onChange: (data: TemplateFormData) => void;
}

export function TemplateForm({ formData, onChange }: TemplateFormProps) {
  const updateField = (field: keyof TemplateFormData, value: string) => {
    onChange({ ...formData, [field]: value });
  };

  return (
    <div className="space-y-6">
      {/* Titolo */}
      <div className="space-y-2">
        <Label htmlFor="title" className="text-sm font-medium">
          Titolo *
        </Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => updateField("title", e.target.value)}
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
          onChange={(e) => updateField("complianceType", e.target.value)}
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
          onChange={(e) => updateField("description", e.target.value)}
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
              onChange={(e) => updateField("scope", e.target.value)}
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
              onChange={(e) => updateField("scope", e.target.value)}
              className="h-4 w-4 text-indigo-600"
            />
            <span>Struttura</span>
          </label>
        </div>
      </div>

      {/* Ricorrenza */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="recurrenceEvery" className="text-sm font-medium">
            Ricorre ogni *
          </Label>
          <Input
            id="recurrenceEvery"
            type="number"
            min="1"
            value={formData.recurrenceEvery}
            onChange={(e) => updateField("recurrenceEvery", e.target.value)}
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
            onChange={(e) => updateField("recurrenceUnit", e.target.value)}
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
            onChange={(e) => updateField("anchor", e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="HIRE_DATE">Data assunzione</option>
            <option value="ASSIGNMENT_START">Inizio incarico</option>
            <option value="LAST_COMPLETION">Ultimo completamento</option>
            <option value="CUSTOM">Personalizzato</option>
          </select>
          <p className="text-xs text-gray-500">
            Il punto di riferimento da cui calcolare le scadenze per la persona
          </p>
        </div>
      )}

      {formData.scope === "STRUCTURE" && (
        <div className="space-y-2">
          <Label className="text-sm font-medium">Punto di Riferimento</Label>
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-800">
              Per gli adempimenti legati alla struttura, le scadenze vengono
              calcolate in base alla data di creazione o all'ultimo
              completamento.
            </p>
          </div>
        </div>
      )}

      {/* Offset giorni */}
      <div className="space-y-2">
        <Label htmlFor="firstDueOffsetDays" className="text-sm font-medium">
          Prima scadenza dopo (giorni)
        </Label>
        <Input
          id="firstDueOffsetDays"
          type="number"
          min="0"
          value={formData.firstDueOffsetDays}
          onChange={(e) => updateField("firstDueOffsetDays", e.target.value)}
        />
        <p className="text-xs text-gray-500">
          Numero di giorni dal punto di riferimento alla prima scadenza
        </p>
      </div>

      {/* Documento richiesto */}
      <div className="space-y-2">
        <Label htmlFor="requiredDocumentName" className="text-sm font-medium">
          Documento Richiesto (opzionale)
        </Label>
        <Input
          id="requiredDocumentName"
          value={formData.requiredDocumentName}
          onChange={(e) => updateField("requiredDocumentName", e.target.value)}
          placeholder="Es: Attestato formazione"
        />
        <p className="text-xs text-gray-500">
          Se specificato, questo adempimento richiederà l'upload di un documento
        </p>
      </div>
    </div>
  );
}
