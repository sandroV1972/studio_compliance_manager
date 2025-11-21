"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Save,
  Loader2,
  Calendar,
  AlertCircle,
  User,
  Building2,
  Bell,
  Plus,
  X,
} from "lucide-react";
import { DatePicker } from "@/components/ui/date-picker";

interface Person {
  id: string;
  firstName: string;
  lastName: string;
}

interface Structure {
  id: string;
  name: string;
}

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

interface NewDeadlineModalProps {
  organizationId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function NewDeadlineModal({
  organizationId,
  isOpen,
  onClose,
}: NewDeadlineModalProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [people, setPeople] = useState<Person[]>([]);
  const [structures, setStructures] = useState<Structure[]>([]);
  const [templates, setTemplates] = useState<DeadlineTemplate[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [activeTab, setActiveTab] = useState("manual");

  const [formData, setFormData] = useState({
    title: "",
    complianceType: "TRAINING",
    scope: "PERSON",
    personId: "",
    structureId: "",
    notes: "",
  });
  const [dueDate, setDueDate] = useState<Date | undefined>();
  const [reminders, setReminders] = useState<
    { daysBefore: number; message?: string }[]
  >([]);

  // Template form data
  const [templateFormData, setTemplateFormData] = useState({
    templateId: "",
    targetType: "PERSON",
    targetId: "",
  });
  const [templateStartDate, setTemplateStartDate] = useState<Date | undefined>(
    new Date(),
  );
  const [templateEndDate, setTemplateEndDate] = useState<Date | undefined>();
  const [hasEndDate, setHasEndDate] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadPeopleAndStructures();
    }
  }, [isOpen, organizationId]);

  const loadPeopleAndStructures = async () => {
    setLoadingData(true);
    try {
      const [peopleRes, structuresRes, templatesRes] = await Promise.all([
        fetch(`/api/organizations/${organizationId}/people`),
        fetch(`/api/organizations/${organizationId}/structures`),
        fetch(`/api/organizations/${organizationId}/deadline-templates`),
      ]);

      if (peopleRes.ok) {
        const peopleData = await peopleRes.json();
        setPeople(peopleData.people || []);
      }

      if (structuresRes.ok) {
        const structuresData = await structuresRes.json();
        setStructures(structuresData.structures || []);
      }

      if (templatesRes.ok) {
        const templatesData = await templatesRes.json();
        setTemplates(templatesData.templates || []);
      }
    } catch (error) {
      console.error("Errore caricamento dati:", error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      // Validazioni
      if (!formData.title.trim()) {
        alert("Il titolo è obbligatorio");
        setIsSaving(false);
        return;
      }

      if (!dueDate) {
        alert("La data di scadenza è obbligatoria");
        setIsSaving(false);
        return;
      }

      if (formData.scope === "PERSON" && !formData.personId) {
        alert("Seleziona una persona");
        setIsSaving(false);
        return;
      }

      if (formData.scope === "STRUCTURE" && !formData.structureId) {
        alert("Seleziona una struttura");
        setIsSaving(false);
        return;
      }

      const dueDateISO = dueDate.toISOString().split("T")[0];

      const response = await fetch(
        `/api/organizations/${organizationId}/deadlines`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: formData.title.trim(),
            dueDate: dueDateISO,
            personId: formData.scope === "PERSON" ? formData.personId : null,
            structureId:
              formData.scope === "STRUCTURE" ? formData.structureId : null,
            notes: formData.notes.trim() || null,
            // Informazioni aggiuntive per audit
            complianceType: formData.complianceType,
            // Reminders
            reminders: reminders,
          }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage =
          errorData.error?.message ||
          errorData.error ||
          "Errore durante la creazione";
        throw new Error(errorMessage);
      }

      router.refresh();
      onClose();
      alert("Scadenza creata con successo");

      // Reset form
      setFormData({
        title: "",
        complianceType: "TRAINING",
        scope: "PERSON",
        personId: "",
        structureId: "",
        notes: "",
      });
      setDueDate(undefined);
      setReminders([]);
    } catch (error) {
      console.error("Error creating deadline:", error);
      alert(
        error instanceof Error ? error.message : "Errore durante la creazione",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleTemplateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!templateStartDate) {
      alert("Seleziona una data di inizio");
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch(
        `/api/organizations/${organizationId}/deadlines/generate-from-template`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            templateId: templateFormData.templateId,
            targetType: templateFormData.targetType,
            targetId:
              templateFormData.targetType === "PERSON" ||
              templateFormData.targetType === "STRUCTURE"
                ? templateFormData.targetId
                : null,
            startDate: templateStartDate.toISOString(),
            recurrenceEndDate:
              hasEndDate && templateEndDate
                ? templateEndDate.toISOString()
                : null,
          }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage =
          errorData.error?.message ||
          errorData.error ||
          "Errore nella generazione";
        throw new Error(errorMessage);
      }

      const data = await response.json();
      router.refresh();
      onClose();
      alert(
        `${data.count} scadenze create con successo! Le scadenze ricorrenti verranno generate automaticamente.`,
      );

      // Reset form
      setTemplateFormData({
        templateId: "",
        targetType: "PERSON",
        targetId: "",
      });
      setTemplateStartDate(new Date());
      setTemplateEndDate(undefined);
      setHasEndDate(false);
    } catch (error) {
      console.error("Error generating from template:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Errore durante la creazione della scadenza",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    if (!isSaving) {
      setFormData({
        title: "",
        complianceType: "TRAINING",
        scope: "PERSON",
        personId: "",
        structureId: "",
        notes: "",
      });
      setDueDate(undefined);
      setReminders([]);
      onClose();
    }
  };

  const addReminder = () => {
    setReminders([...reminders, { daysBefore: 7, message: "" }]);
  };

  const removeReminder = (index: number) => {
    setReminders(reminders.filter((_, i) => i !== index));
  };

  const updateReminder = (
    index: number,
    field: "daysBefore" | "message",
    value: number | string,
  ) => {
    const updated = [...reminders];
    if (field === "daysBefore") {
      updated[index].daysBefore = value as number;
    } else {
      updated[index].message = value as string;
    }
    setReminders(updated);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Calendar className="h-6 w-6 text-indigo-600" />
            Nuova Scadenza
          </DialogTitle>
          <DialogDescription>Crea una nuova scadenza manuale</DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="manual">Scadenza Manuale</TabsTrigger>
            <TabsTrigger value="template">Da Template</TabsTrigger>
          </TabsList>

          <TabsContent value="manual">
            {loadingData ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
                <span className="ml-2">Caricamento dati...</span>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6 mt-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="title"
                    className="text-sm font-medium flex items-center gap-2"
                  >
                    <AlertCircle className="h-4 w-4 text-indigo-500" />
                    Titolo Scadenza *
                  </Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="Es: Verifica estintori"
                    required
                    className="border-indigo-200 focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="complianceType"
                    className="text-sm font-medium"
                  >
                    Tipo Compliance *
                  </Label>
                  <select
                    id="complianceType"
                    value={formData.complianceType}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        complianceType: e.target.value,
                      })
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
                          setFormData({
                            ...formData,
                            scope: e.target.value,
                            structureId: "",
                          })
                        }
                        className="h-4 w-4 text-indigo-600"
                      />
                      <User className="h-4 w-4 text-indigo-500" />
                      <span>Persona</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="scope"
                        value="STRUCTURE"
                        checked={formData.scope === "STRUCTURE"}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            scope: e.target.value,
                            personId: "",
                          })
                        }
                        className="h-4 w-4 text-indigo-600"
                      />
                      <Building2 className="h-4 w-4 text-purple-500" />
                      <span>Struttura</span>
                    </label>
                  </div>
                </div>

                {formData.scope === "PERSON" && (
                  <div className="space-y-2">
                    <Label htmlFor="personId" className="text-sm font-medium">
                      Seleziona Persona *
                    </Label>
                    <select
                      id="personId"
                      value={formData.personId}
                      onChange={(e) =>
                        setFormData({ ...formData, personId: e.target.value })
                      }
                      required
                      className="w-full px-3 py-2 border border-indigo-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">-- Seleziona una persona --</option>
                      {people.map((person) => (
                        <option key={person.id} value={person.id}>
                          {person.firstName} {person.lastName}
                        </option>
                      ))}
                    </select>
                    {people.length === 0 && (
                      <p className="text-sm text-amber-600">
                        Nessuna persona trovata. Crea prima una persona.
                      </p>
                    )}
                  </div>
                )}

                {formData.scope === "STRUCTURE" && (
                  <div className="space-y-2">
                    <Label
                      htmlFor="structureId"
                      className="text-sm font-medium"
                    >
                      Seleziona Struttura *
                    </Label>
                    <select
                      id="structureId"
                      value={formData.structureId}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          structureId: e.target.value,
                        })
                      }
                      required
                      className="w-full px-3 py-2 border border-indigo-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">-- Seleziona una struttura --</option>
                      {structures.map((structure) => (
                        <option key={structure.id} value={structure.id}>
                          {structure.name}
                        </option>
                      ))}
                    </select>
                    {structures.length === 0 && (
                      <p className="text-sm text-amber-600">
                        Nessuna struttura trovata. Crea prima una struttura.
                      </p>
                    )}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="dueDate" className="text-sm font-medium">
                    Data Scadenza *
                  </Label>
                  <DatePicker
                    date={dueDate}
                    onDateChange={setDueDate}
                    placeholder="Seleziona data di scadenza"
                  />
                </div>

                {/* Reminders Section */}
                <div className="space-y-3 border-t pt-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <Bell className="h-4 w-4 text-indigo-500" />
                      Promemoria (opzionale)
                    </Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addReminder}
                      className="h-8"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Aggiungi Promemoria
                    </Button>
                  </div>

                  {reminders.length === 0 ? (
                    <p className="text-sm text-muted-foreground italic">
                      Nessun promemoria configurato. Aggiungi un promemoria per
                      ricevere notifiche prima della scadenza.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {reminders.map((reminder, index) => (
                        <div
                          key={index}
                          className="flex gap-2 items-start p-3 border rounded-md bg-gray-50"
                        >
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2">
                              <Label className="text-xs">Giorni prima:</Label>
                              <Input
                                type="number"
                                min="1"
                                max="365"
                                value={reminder.daysBefore}
                                onChange={(e) =>
                                  updateReminder(
                                    index,
                                    "daysBefore",
                                    parseInt(e.target.value) || 1,
                                  )
                                }
                                className="w-20 h-8"
                              />
                              <span className="text-xs text-muted-foreground">
                                {reminder.daysBefore === 1
                                  ? "giorno"
                                  : "giorni"}{" "}
                                prima
                              </span>
                            </div>
                            <Input
                              type="text"
                              placeholder="Messaggio personalizzato (opzionale)"
                              value={reminder.message || ""}
                              onChange={(e) =>
                                updateReminder(index, "message", e.target.value)
                              }
                              className="text-sm"
                            />
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeReminder(index)}
                            className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes" className="text-sm font-medium">
                    Note (opzionale)
                  </Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                    placeholder="Note aggiuntive sulla scadenza"
                    rows={3}
                    className="border-indigo-200 focus:border-indigo-500"
                  />
                </div>

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleClose}
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
                        Creazione...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Crea Scadenza
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </form>
            )}
          </TabsContent>

          <TabsContent value="template">
            {loadingData ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
                <span className="ml-2">Caricamento dati...</span>
              </div>
            ) : (
              <form onSubmit={handleTemplateSubmit} className="space-y-6 mt-4">
                {/* Selezione Template */}
                <div className="space-y-2">
                  <Label htmlFor="templateId" className="text-sm font-medium">
                    Template *
                  </Label>
                  <select
                    id="templateId"
                    value={templateFormData.templateId}
                    onChange={(e) =>
                      setTemplateFormData({
                        ...templateFormData,
                        templateId: e.target.value,
                      })
                    }
                    required
                    className="w-full px-3 py-2 border border-indigo-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Seleziona un template...</option>
                    {templates.map((template) => (
                      <option key={template.id} value={template.id}>
                        {template.title} - Ogni {template.recurrenceEvery}{" "}
                        {template.recurrenceUnit === "DAY"
                          ? "giorni"
                          : template.recurrenceUnit === "MONTH"
                            ? "mesi"
                            : "anni"}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Tipo di Target */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Destinatari *</Label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="targetType"
                        value="PERSON"
                        checked={templateFormData.targetType === "PERSON"}
                        onChange={(e) =>
                          setTemplateFormData({
                            ...templateFormData,
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
                        checked={templateFormData.targetType === "ALL_PEOPLE"}
                        onChange={(e) =>
                          setTemplateFormData({
                            ...templateFormData,
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
                        checked={templateFormData.targetType === "STRUCTURE"}
                        onChange={(e) =>
                          setTemplateFormData({
                            ...templateFormData,
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
                        checked={
                          templateFormData.targetType === "ALL_STRUCTURES"
                        }
                        onChange={(e) =>
                          setTemplateFormData({
                            ...templateFormData,
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
                {templateFormData.targetType === "PERSON" && (
                  <div className="space-y-2">
                    <Label htmlFor="personId" className="text-sm font-medium">
                      Persona *
                    </Label>
                    <select
                      id="personId"
                      value={templateFormData.targetId}
                      onChange={(e) =>
                        setTemplateFormData({
                          ...templateFormData,
                          targetId: e.target.value,
                        })
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

                {templateFormData.targetType === "STRUCTURE" && (
                  <div className="space-y-2">
                    <Label
                      htmlFor="structureId"
                      className="text-sm font-medium"
                    >
                      Struttura *
                    </Label>
                    <select
                      id="structureId"
                      value={templateFormData.targetId}
                      onChange={(e) =>
                        setTemplateFormData({
                          ...templateFormData,
                          targetId: e.target.value,
                        })
                      }
                      required
                      className="w-full px-3 py-2 border border-indigo-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">Seleziona una struttura...</option>
                      {structures.map((structure) => (
                        <option key={structure.id} value={structure.id}>
                          {structure.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Data di Inizio */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    Data di Inizio *
                  </Label>
                  <DatePicker
                    date={templateStartDate}
                    onDateChange={setTemplateStartDate}
                  />
                  <p className="text-xs text-gray-500">
                    La prima scadenza sarà calcolata a partire da questa data
                  </p>
                </div>

                {/* Data Fine Ricorrenza (Opzionale) */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="hasEndDate"
                      checked={hasEndDate}
                      onChange={(e) => {
                        setHasEndDate(e.target.checked);
                        if (!e.target.checked) {
                          setTemplateEndDate(undefined);
                        }
                      }}
                      className="w-4 h-4 text-indigo-600"
                    />
                    <Label
                      htmlFor="hasEndDate"
                      className="text-sm font-medium cursor-pointer"
                    >
                      Imposta data di fine ricorrenza
                    </Label>
                  </div>
                  {hasEndDate && (
                    <div className="space-y-2">
                      <DatePicker
                        date={templateEndDate}
                        onDateChange={setTemplateEndDate}
                      />
                      <p className="text-xs text-gray-500">
                        Le scadenze verranno generate fino a questa data
                      </p>
                    </div>
                  )}
                  {!hasEndDate && (
                    <p className="text-xs text-gray-500">
                      Le scadenze ricorrenti verranno generate automaticamente
                      senza limite di tempo. Verranno sempre mantenute 3
                      occorrenze future.
                    </p>
                  )}
                </div>

                {/* Buttons */}
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleClose}
                    disabled={isSaving}
                  >
                    Annulla
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSaving}
                    className="bg-indigo-600 hover:bg-indigo-700"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generazione...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Genera Scadenze
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </form>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
