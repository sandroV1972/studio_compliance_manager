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
} from "lucide-react";

interface Person {
  id: string;
  firstName: string;
  lastName: string;
}

interface Structure {
  id: string;
  name: string;
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
  const [loadingData, setLoadingData] = useState(true);

  const [formData, setFormData] = useState({
    title: "",
    complianceType: "TRAINING",
    scope: "PERSON",
    personId: "",
    structureId: "",
    dueDate: "",
    notes: "",
  });

  useEffect(() => {
    if (isOpen) {
      loadPeopleAndStructures();
    }
  }, [isOpen, organizationId]);

  const loadPeopleAndStructures = async () => {
    setLoadingData(true);
    try {
      const [peopleRes, structuresRes] = await Promise.all([
        fetch(`/api/organizations/${organizationId}/people`),
        fetch(`/api/organizations/${organizationId}/structures`),
      ]);

      if (peopleRes.ok) {
        const peopleData = await peopleRes.json();
        setPeople(peopleData.people || []);
      }

      if (structuresRes.ok) {
        const structuresData = await structuresRes.json();
        setStructures(structuresData.structures || []);
      }
    } catch (error) {
      console.error("Errore caricamento dati:", error);
    } finally {
      setLoadingData(false);
    }
  };

  const formatDateInput = (value: string): string => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 2) {
      return numbers;
    } else if (numbers.length <= 4) {
      return `${numbers.slice(0, 2)}/${numbers.slice(2)}`;
    } else {
      return `${numbers.slice(0, 2)}/${numbers.slice(2, 4)}/${numbers.slice(4, 8)}`;
    }
  };

  const convertDateToISO = (dateStr: string): string | null => {
    if (!dateStr) return null;
    const parts = dateStr.split("/");
    if (parts.length !== 3) return null;
    const [day, month, year] = parts;
    if (!day || !month || !year) return null;
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
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

      if (!formData.dueDate) {
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

      const dueDateISO = convertDateToISO(formData.dueDate);
      if (!dueDateISO) {
        alert("Formato data non valido. Usa gg/mm/aaaa");
        setIsSaving(false);
        return;
      }

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
          }),
        },
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Errore durante la creazione");
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
        dueDate: "",
        notes: "",
      });
    } catch (error) {
      console.error("Error creating deadline:", error);
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
        dueDate: "",
        notes: "",
      });
      onClose();
    }
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

        <Tabs defaultValue="manual" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="manual">Scadenza Manuale</TabsTrigger>
            <TabsTrigger value="template" disabled>
              Da Template (Presto)
            </TabsTrigger>
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
                  <Input
                    id="dueDate"
                    type="text"
                    value={formData.dueDate}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        dueDate: formatDateInput(e.target.value),
                      })
                    }
                    placeholder="gg/mm/aaaa"
                    maxLength={10}
                    required
                    className="border-indigo-200 focus:border-indigo-500"
                  />
                  <p className="text-xs text-muted-foreground">
                    Formato: gg/mm/aaaa (es: 15/06/2025)
                  </p>
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
            <div className="py-8 text-center text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>Funzionalità in arrivo</p>
              <p className="text-sm">
                Potrai creare scadenze basate sui template preconfigurati
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
