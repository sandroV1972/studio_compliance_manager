"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Save, Archive, Trash2, ArchiveRestore, Loader2, User, Mail, Phone, Hash, Calendar, FileText } from "lucide-react";

interface EditPersonFormProps {
  person: {
    id: string;
    firstName: string;
    lastName: string;
    fiscalCode: string | null;
    email: string | null;
    phone: string | null;
    hireDate: Date | null;
    birthDate: Date | null;
    notes: string | null;
    active: boolean;
  };
}

export function EditPersonForm({ person }: EditPersonFormProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    firstName: person.firstName,
    lastName: person.lastName,
    fiscalCode: person.fiscalCode || "",
    email: person.email || "",
    phone: person.phone || "",
    hireDate: person.hireDate ? new Date(person.hireDate).toISOString().split('T')[0] : "",
    birthDate: person.birthDate ? new Date(person.birthDate).toISOString().split('T')[0] : "",
    notes: person.notes || "",
    active: person.active,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const response = await fetch(`/api/admin/people/${person.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          hireDate: formData.hireDate ? new Date(formData.hireDate) : null,
          birthDate: formData.birthDate ? new Date(formData.birthDate) : null,
        }),
      });

      if (!response.ok) {
        throw new Error("Errore durante il salvataggio");
      }

      router.refresh();
      setIsEditing(false);
      alert("Persona aggiornata con successo");
    } catch (error) {
      console.error("Error updating person:", error);
      alert("Errore durante l'aggiornamento della persona");
    } finally {
      setIsSaving(false);
    }
  };

  const handleArchive = async () => {
    if (!confirm(`Sei sicuro di voler ${person.active ? "archiviare" : "ripristinare"} questa persona?`)) {
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch(`/api/admin/people/${person.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          active: !person.active,
        }),
      });

      if (!response.ok) {
        throw new Error("Errore durante l'operazione");
      }

      router.refresh();
      alert(person.active ? "Persona archiviata con successo" : "Persona ripristinata con successo");
    } catch (error) {
      console.error("Error toggling archive:", error);
      alert("Errore durante l'operazione");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Sei sicuro di voler eliminare definitivamente questa persona? Questa azione non può essere annullata.")) {
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch(`/api/admin/people/${person.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Errore durante l'eliminazione");
      }

      router.push("/admin/people");
      alert("Persona eliminata con successo");
    } catch (error) {
      console.error("Error deleting person:", error);
      alert("Errore durante l'eliminazione della persona");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isEditing) {
    return (
      <div className="flex items-center gap-2">
        <Button
          onClick={() => setIsEditing(true)}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
        >
          <User className="h-4 w-4 mr-2" />
          Modifica Dati
        </Button>
        
        <Button
          onClick={handleArchive}
          disabled={isSaving}
          variant="outline"
          className="border-amber-300 text-amber-700 hover:bg-amber-50"
        >
          {isSaving ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : person.active ? (
            <Archive className="h-4 w-4 mr-2" />
          ) : (
            <ArchiveRestore className="h-4 w-4 mr-2" />
          )}
          {person.active ? "Archivia" : "Ripristina"}
        </Button>

        <Button
          onClick={handleDelete}
          disabled={isSaving}
          variant="outline"
          className="border-red-300 text-red-700 hover:bg-red-50"
        >
          {isSaving ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4 mr-2" />
          )}
          Elimina
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="firstName" className="text-sm font-medium flex items-center gap-2">
            <User className="h-4 w-4 text-indigo-500" />
            Nome *
          </Label>
          <Input
            id="firstName"
            value={formData.firstName}
            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            required
            className="border-indigo-200 focus:border-indigo-500"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="lastName" className="text-sm font-medium flex items-center gap-2">
            <User className="h-4 w-4 text-indigo-500" />
            Cognome *
          </Label>
          <Input
            id="lastName"
            value={formData.lastName}
            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            required
            className="border-indigo-200 focus:border-indigo-500"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="fiscalCode" className="text-sm font-medium flex items-center gap-2">
            <Hash className="h-4 w-4 text-purple-500" />
            Codice Fiscale
          </Label>
          <Input
            id="fiscalCode"
            value={formData.fiscalCode}
            onChange={(e) => setFormData({ ...formData, fiscalCode: e.target.value })}
            className="border-indigo-200 focus:border-indigo-500"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium flex items-center gap-2">
            <Mail className="h-4 w-4 text-green-500" />
            Email
          </Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="border-indigo-200 focus:border-indigo-500"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone" className="text-sm font-medium flex items-center gap-2">
            <Phone className="h-4 w-4 text-amber-500" />
            Telefono
          </Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="border-indigo-200 focus:border-indigo-500"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="birthDate" className="text-sm font-medium flex items-center gap-2">
            <Calendar className="h-4 w-4 text-pink-500" />
            Data di Nascita
          </Label>
          <Input
            id="birthDate"
            type="date"
            value={formData.birthDate}
            onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
            className="border-indigo-200 focus:border-indigo-500"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="hireDate" className="text-sm font-medium flex items-center gap-2">
            <Calendar className="h-4 w-4 text-blue-500" />
            Data Assunzione
          </Label>
          <Input
            id="hireDate"
            type="date"
            value={formData.hireDate}
            onChange={(e) => setFormData({ ...formData, hireDate: e.target.value })}
            className="border-indigo-200 focus:border-indigo-500"
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="notes" className="text-sm font-medium flex items-center gap-2">
            <FileText className="h-4 w-4 text-gray-500" />
            Note
          </Label>
          <Textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={3}
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
            Persona Attiva
          </Label>
        </div>
      </div>

      <div className="flex items-center gap-2">
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
              Salva Modifiche
            </>
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => setIsEditing(false)}
          disabled={isSaving}
        >
          Annulla
        </Button>
      </div>
    </form>
  );
}
