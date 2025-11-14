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
  Calendar,
  AlertCircle,
  User,
  Building2,
  Bell,
  Plus,
  X,
  Trash2,
} from "lucide-react";
import { DatePicker } from "@/components/ui/date-picker";

interface Person {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
}

interface Structure {
  id: string;
  name: string;
  email: string | null;
}

interface Reminder {
  id?: string;
  daysBefore: number;
  message?: string;
  notified?: boolean;
}

interface Deadline {
  id: string;
  title: string;
  dueDate: string;
  status: string;
  notes: string | null;
  personId: string | null;
  structureId: string | null;
  person?: Person;
  structure?: Structure;
  reminders: Reminder[];
  template?: {
    id: string;
    title: string;
    complianceType: string;
  } | null;
}

interface EditDeadlineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  organizationId: string;
  deadlineId: string;
}

export default function EditDeadlineModal({
  isOpen,
  onClose,
  onSuccess,
  organizationId,
  deadlineId,
}: EditDeadlineModalProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [people, setPeople] = useState<Person[]>([]);
  const [structures, setStructures] = useState<Structure[]>([]);

  const [formData, setFormData] = useState({
    title: "",
    scope: "PERSON",
    personId: "",
    structureId: "",
    notes: "",
    status: "PENDING",
    complianceType: "TRAINING",
  });
  const [dueDate, setDueDate] = useState<Date | undefined>();
  const [reminders, setReminders] = useState<Reminder[]>([]);

  useEffect(() => {
    if (isOpen && deadlineId) {
      setLoadingData(true);
      loadData();
    }
  }, [isOpen, deadlineId, organizationId]);

  const loadData = async () => {
    try {
      console.log("Caricamento dati per deadline:", deadlineId);
      console.log("Organization ID:", organizationId);

      // Carica tutto in parallelo
      const [deadlineRes, peopleRes, structuresRes] = await Promise.all([
        fetch(`/api/organizations/${organizationId}/deadlines/${deadlineId}`),
        fetch(`/api/organizations/${organizationId}/people`),
        fetch(`/api/organizations/${organizationId}/structures`),
      ]);

      console.log("Deadline response status:", deadlineRes.status);

      // Carica deadline data
      if (!deadlineRes.ok) {
        let errorMessage = "Errore nel caricamento della scadenza";
        try {
          const errorData = await deadlineRes.json();
          console.error("Errore API deadline:", errorData);
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          console.error("Impossibile parsare errore:", e);
        }
        throw new Error(errorMessage);
      }

      const responseData = await deadlineRes.json();
      console.log("Deadline response data:", responseData);

      const deadline: Deadline = responseData.deadline;

      if (!deadline) {
        throw new Error("Nessun dato scadenza ricevuto dall'API");
      }

      console.log("Deadline caricata:", deadline);

      setFormData({
        title: deadline.title,
        scope: deadline.personId ? "PERSON" : "STRUCTURE",
        personId: deadline.personId || "",
        structureId: deadline.structureId || "",
        notes: deadline.notes || "",
        status: deadline.status,
        complianceType: deadline.template?.complianceType || "OTHER",
      });

      setDueDate(new Date(deadline.dueDate));
      setReminders(deadline.reminders || []);

      // Carica people
      if (peopleRes.ok) {
        const data = await peopleRes.json();
        setPeople(data.people || []);
      }

      // Carica structures
      if (structuresRes.ok) {
        const data = await structuresRes.json();
        setStructures(data.structures || []);
      }
    } catch (error) {
      console.error("Errore caricamento scadenza:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Errore nel caricamento della scadenza",
      );
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
        `/api/organizations/${organizationId}/deadlines/${deadlineId}`,
        {
          method: "PATCH",
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
            status: formData.status,
            reminders: reminders,
          }),
        },
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Errore durante l'aggiornamento");
      }

      onSuccess();
      onClose();
      alert("Scadenza aggiornata con successo");
    } catch (error) {
      console.error("Error updating deadline:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Errore durante l'aggiornamento della scadenza",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (
      !confirm(
        "Sei sicuro di voler eliminare questa scadenza? L'operazione non può essere annullata.",
      )
    ) {
      return;
    }

    setIsDeleting(true);

    try {
      const response = await fetch(
        `/api/organizations/${organizationId}/deadlines/${deadlineId}`,
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
      alert("Scadenza eliminata con successo");
    } catch (error) {
      console.error("Error deleting deadline:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Errore durante l'eliminazione della scadenza",
      );
    } finally {
      setIsDeleting(false);
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

  const handleClose = () => {
    if (!isSaving && !isDeleting) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Calendar className="h-6 w-6 text-indigo-600" />
            Modifica Scadenza
          </DialogTitle>
          <DialogDescription>
            Modifica i dettagli della scadenza esistente
          </DialogDescription>
        </DialogHeader>

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
              <Label htmlFor="complianceType" className="text-sm font-medium">
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
              <Label htmlFor="status" className="text-sm font-medium">
                Stato *
              </Label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value })
                }
                required
                className="w-full px-3 py-2 border border-indigo-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="PENDING">In Attesa</option>
                <option value="IN_PROGRESS">In Corso</option>
                <option value="COMPLETED">Completata</option>
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
                      {person.email && ` (${person.email})`}
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
                <Label htmlFor="structureId" className="text-sm font-medium">
                  Seleziona Struttura *
                </Label>
                <select
                  id="structureId"
                  value={formData.structureId}
                  onChange={(e) =>
                    setFormData({ ...formData, structureId: e.target.value })
                  }
                  required
                  className="w-full px-3 py-2 border border-indigo-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">-- Seleziona una struttura --</option>
                  {structures.map((structure) => (
                    <option key={structure.id} value={structure.id}>
                      {structure.name}
                      {structure.email && ` (${structure.email})`}
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
                            {reminder.daysBefore === 1 ? "giorno" : "giorni"}{" "}
                            prima
                          </span>
                          {reminder.notified && (
                            <span className="text-xs text-green-600 font-medium">
                              ✓ Inviato
                            </span>
                          )}
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

            <div className="flex items-center justify-between gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={isDeleting || isSaving}
                className="flex items-center gap-2"
              >
                {isDeleting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                Elimina Scadenza
              </Button>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={isSaving || isDeleting}
                >
                  Annulla
                </Button>
                <Button
                  type="submit"
                  disabled={isSaving || isDeleting}
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
                      Salva Modifiche
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
