"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserPlus, Mail, Shield, Building2 } from "lucide-react";

interface InviteUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface Structure {
  id: string;
  name: string;
  city: string | null;
}

export function InviteUserModal({
  isOpen,
  onClose,
  onSuccess,
}: InviteUserModalProps) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<string>("");
  const [structureId, setStructureId] = useState<string>("");
  const [structures, setStructures] = useState<Structure[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (isOpen) {
      loadStructures();
      // Reset form
      setEmail("");
      setRole("");
      setStructureId("");
      setError("");
    }
  }, [isOpen]);

  const loadStructures = async () => {
    try {
      const response = await fetch("/api/user/organization");
      if (!response.ok) return;
      const result = await response.json();
      const data = result.data || result;
      setStructures(data.structures || []);
    } catch (error) {
      console.error("Errore caricamento strutture:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/invites", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          role,
          structureId: structureId || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Errore nell'invio dell'invito");
        return;
      }

      onSuccess();
    } catch (error) {
      console.error("Errore:", error);
      setError("Errore nell'invio dell'invito");
    } finally {
      setLoading(false);
    }
  };

  const requiresStructure = role === "MANAGER" || role === "OPERATOR";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Invita Nuovo Utente
          </DialogTitle>
          <DialogDescription>
            Invia un invito via email per aggiungere un nuovo membro alla tua
            organizzazione
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="utente@esempio.it"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Ruolo */}
          <div className="space-y-2">
            <Label htmlFor="role" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Ruolo
            </Label>
            <Select value={role} onValueChange={setRole} required>
              <SelectTrigger>
                <SelectValue placeholder="Seleziona un ruolo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ADMIN">
                  <div className="flex flex-col items-start">
                    <span className="font-medium">Amministratore</span>
                    <span className="text-xs text-muted-foreground">
                      Gestisce tutte le strutture
                    </span>
                  </div>
                </SelectItem>
                <SelectItem value="MANAGER">
                  <div className="flex flex-col items-start">
                    <span className="font-medium">Manager</span>
                    <span className="text-xs text-muted-foreground">
                      Gestisce una struttura specifica
                    </span>
                  </div>
                </SelectItem>
                <SelectItem value="OPERATOR">
                  <div className="flex flex-col items-start">
                    <span className="font-medium">Operatore</span>
                    <span className="text-xs text-muted-foreground">
                      Opera in una struttura specifica
                    </span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Struttura (obbligatoria per MANAGER e OPERATOR) */}
          {requiresStructure && (
            <div className="space-y-2">
              <Label htmlFor="structure" className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Struttura
                <span className="text-red-500">*</span>
              </Label>
              <Select
                value={structureId}
                onValueChange={setStructureId}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona una struttura" />
                </SelectTrigger>
                <SelectContent>
                  {structures.map((structure) => (
                    <SelectItem key={structure.id} value={structure.id}>
                      <div className="flex flex-col items-start">
                        <span>{structure.name}</span>
                        {structure.city && (
                          <span className="text-xs text-muted-foreground">
                            {structure.city}
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                I ruoli Manager e Operatore richiedono una struttura specifica
              </p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs text-blue-800">
              <strong>Nota:</strong> L'utente riceverà un'email con un link per
              registrarsi. L'invito scadrà dopo 7 giorni.
            </p>
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Annulla
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Invio in corso..." : "Invia Invito"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
