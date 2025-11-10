"use client";

import { useState } from "react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Sparkles, Loader2 } from "lucide-react";

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

interface CreateGlobalTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateGlobalTemplateModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateGlobalTemplateModalProps) {
  const [useAI, setUseAI] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [generatingAI, setGeneratingAI] = useState(false);
  const [saving, setSaving] = useState(false);

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

  const handleAIGenerate = async () => {
    if (!aiPrompt.trim()) {
      alert("Inserisci una descrizione del template");
      return;
    }

    setGeneratingAI(true);
    try {
      const response = await fetch("/api/admin/global-templates/ai-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: aiPrompt }),
      });

      if (!response.ok) throw new Error("Errore nella generazione AI");

      const data = await response.json();

      // Popola il form con i dati generati dall'AI
      setFormData({
        ...formData,
        title: data.title || formData.title,
        description: data.description || formData.description,
        complianceType: data.complianceType || formData.complianceType,
        scope: data.scope || formData.scope,
        recurrenceUnit: data.recurrenceUnit || formData.recurrenceUnit,
        recurrenceEvery: data.recurrenceEvery || formData.recurrenceEvery,
        firstDueOffsetDays:
          data.firstDueOffsetDays || formData.firstDueOffsetDays,
        requiredDocumentName:
          data.requiredDocumentName || formData.requiredDocumentName,
        legalReference: data.legalReference || formData.legalReference,
        sourceUrl: data.sourceUrl || formData.sourceUrl,
        regions: data.region ? [data.region] : formData.regions, // Converti singola regione da AI a array
        notes: data.notes || formData.notes,
      });

      setUseAI(false); // Torna alla vista del form
    } catch (error) {
      console.error("Errore generazione AI:", error);
      alert("Errore nella generazione AI. Riprova.");
    } finally {
      setGeneratingAI(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch("/api/admin/global-templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Errore nel salvataggio");

      onSuccess();
      handleClose();
    } catch (error) {
      console.error("Errore salvataggio:", error);
      alert("Errore nel salvataggio del template");
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setFormData({
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
      regions: [],
      notes: "",
      active: true,
    });
    setAiPrompt("");
    setUseAI(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nuovo Template Globale</DialogTitle>
          <DialogDescription>
            {useAI
              ? "Descrivi il template in linguaggio naturale e l'AI lo genererà per te"
              : "Crea un nuovo template di adempimento valido per tutte le organizzazioni"}
          </DialogDescription>
        </DialogHeader>

        {/* Toggle AI */}
        <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg border border-purple-200">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            <div>
              <p className="font-medium text-sm">Genera con AI</p>
              <p className="text-xs text-muted-foreground">
                Lascia che l'intelligenza artificiale compili i campi per te
              </p>
            </div>
          </div>
          <Switch checked={useAI} onCheckedChange={setUseAI} />
        </div>

        {useAI ? (
          /* Vista AI */
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="aiPrompt">Descrizione del Template</Label>
              <Textarea
                id="aiPrompt"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="Esempio: Formazione obbligatoria sulla sicurezza sul lavoro per tutti i dipendenti. Deve essere rinnovata ogni 2 anni. Riferimento normativo: D.Lgs. 81/2008, art. 37. Prima scadenza 30 giorni dall'assunzione."
                rows={8}
                className="resize-none"
              />
            </div>
            <Button
              onClick={handleAIGenerate}
              disabled={generatingAI || !aiPrompt.trim()}
              className="w-full"
            >
              {generatingAI ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generazione in corso...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Genera Template
                </>
              )}
            </Button>
          </div>
        ) : (
          /* Form manuale */
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-2">
                <Label htmlFor="title">Titolo *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="complianceType">Tipo di Adempimento *</Label>
                <Select
                  value={formData.complianceType}
                  onValueChange={(value) =>
                    setFormData({ ...formData, complianceType: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TRAINING">Formazione</SelectItem>
                    <SelectItem value="MAINTENANCE">Manutenzione</SelectItem>
                    <SelectItem value="INSPECTION">Ispezione</SelectItem>
                    <SelectItem value="DOCUMENT">Documentazione</SelectItem>
                    <SelectItem value="REPORTING">Reporting</SelectItem>
                    <SelectItem value="WASTE">Gestione Rifiuti</SelectItem>
                    <SelectItem value="DATA_PROTECTION">
                      Privacy/GDPR
                    </SelectItem>
                    <SelectItem value="INSURANCE">Assicurazioni</SelectItem>
                    <SelectItem value="OTHER">Altro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="scope">Ambito *</Label>
                <Select
                  value={formData.scope}
                  onValueChange={(value) =>
                    setFormData({ ...formData, scope: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PERSON">Persona</SelectItem>
                    <SelectItem value="STRUCTURE">Struttura</SelectItem>
                    <SelectItem value="ROLE">Ruolo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="col-span-2 space-y-2">
                <Label htmlFor="description">Descrizione</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="recurrenceEvery">Ricorrenza Ogni *</Label>
                <Input
                  id="recurrenceEvery"
                  type="number"
                  min="1"
                  value={formData.recurrenceEvery}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      recurrenceEvery: parseInt(e.target.value),
                    })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="recurrenceUnit">Unità *</Label>
                <Select
                  value={formData.recurrenceUnit}
                  onValueChange={(value) =>
                    setFormData({ ...formData, recurrenceUnit: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DAY">Giorni</SelectItem>
                    <SelectItem value="MONTH">Mesi</SelectItem>
                    <SelectItem value="YEAR">Anni</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="firstDueOffsetDays">
                  Giorni prima scadenza
                </Label>
                <Input
                  id="firstDueOffsetDays"
                  type="number"
                  value={formData.firstDueOffsetDays}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      firstDueOffsetDays: parseInt(e.target.value),
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="anchor">Ancora temporale *</Label>
                <Select
                  value={formData.anchor}
                  onValueChange={(value) =>
                    setFormData({ ...formData, anchor: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="HIRE_DATE">Data assunzione</SelectItem>
                    <SelectItem value="ASSIGNMENT_START">
                      Inizio incarico
                    </SelectItem>
                    <SelectItem value="LAST_COMPLETION">
                      Ultimo completamento
                    </SelectItem>
                    <SelectItem value="CUSTOM">Personalizzata</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="col-span-2 space-y-2">
                <Label htmlFor="requiredDocumentName">
                  Nome documento richiesto
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
                  placeholder="es. Attestato formazione sicurezza"
                />
              </div>

              <div className="col-span-2 space-y-2">
                <Label htmlFor="legalReference">Riferimento normativo</Label>
                <Input
                  id="legalReference"
                  value={formData.legalReference}
                  onChange={(e) =>
                    setFormData({ ...formData, legalReference: e.target.value })
                  }
                  placeholder="es. D.Lgs. 81/2008, art. 37"
                />
              </div>

              <div className="col-span-2 space-y-2">
                <Label htmlFor="sourceUrl">URL fonte normativa</Label>
                <Input
                  id="sourceUrl"
                  type="url"
                  value={formData.sourceUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, sourceUrl: e.target.value })
                  }
                  placeholder="https://..."
                />
              </div>

              <div className="col-span-2 space-y-2">
                <Label>Regioni di applicazione</Label>
                <div className="text-sm text-muted-foreground mb-2">
                  Seleziona le regioni dove si applica questo template. Se non
                  selezioni nulla, sarà valido per tutta Italia.
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-4 border rounded-md max-h-48 overflow-y-auto">
                  {ITALIAN_REGIONS.map((region) => (
                    <div key={region} className="flex items-center space-x-2">
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

              <div className="space-y-2">
                <Label htmlFor="effectiveFrom">Data inizio validità</Label>
                <Input
                  id="effectiveFrom"
                  type="date"
                  value={formData.effectiveFrom}
                  onChange={(e) =>
                    setFormData({ ...formData, effectiveFrom: e.target.value })
                  }
                />
              </div>

              <div className="col-span-2 space-y-2">
                <Label htmlFor="notes">Note</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  rows={2}
                />
              </div>

              <div className="col-span-2 flex items-center space-x-2">
                <Switch
                  id="active"
                  checked={formData.active}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, active: checked })
                  }
                />
                <Label htmlFor="active">Template attivo</Label>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>
                Annulla
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? "Salvataggio..." : "Crea Template"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
