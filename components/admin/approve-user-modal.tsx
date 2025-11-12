"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
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
import { Label } from "@/components/ui/label";

interface Organization {
  id: string;
  name: string;
}

interface Structure {
  id: string;
  name: string;
}

interface ApproveUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  userName: string;
  userEmail: string;
  onSuccess: () => void;
}

export function ApproveUserModal({
  isOpen,
  onClose,
  userId,
  userName,
  userEmail,
  onSuccess,
}: ApproveUserModalProps) {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [structures, setStructures] = useState<Structure[]>([]);
  const [selectedOrg, setSelectedOrg] = useState<string>("");
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [selectedStructure, setSelectedStructure] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [loadingOrgs, setLoadingOrgs] = useState(true);

  useEffect(() => {
    if (isOpen) {
      loadOrganizations();
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedOrg) {
      loadStructures(selectedOrg);
      setSelectedStructure(""); // Reset structure when org changes
    } else {
      setStructures([]);
    }
  }, [selectedOrg]);

  const loadOrganizations = async () => {
    try {
      const response = await fetch("/api/admin/organizations");
      if (response.ok) {
        const data = await response.json();
        setOrganizations(data.organizations || []);
      }
    } catch (error) {
      console.error("Errore caricamento organizzazioni:", error);
    } finally {
      setLoadingOrgs(false);
    }
  };

  const loadStructures = async (orgId: string) => {
    try {
      const response = await fetch(`/api/organizations/${orgId}/structures`);
      if (response.ok) {
        const data = await response.json();
        setStructures(data.structures || []);
      }
    } catch (error) {
      console.error("Errore caricamento strutture:", error);
    }
  };

  const handleApprove = async () => {
    if (!selectedOrg || !selectedRole) {
      alert("Seleziona organizzazione e ruolo");
      return;
    }

    if (
      (selectedRole === "MANAGER" || selectedRole === "OPERATOR") &&
      !selectedStructure
    ) {
      alert("Seleziona una struttura per i ruoli MANAGER e OPERATOR");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/admin/users/approve", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          organizationId: selectedOrg,
          role: selectedRole,
          structureId: selectedStructure || null,
        }),
      });

      if (response.ok) {
        onSuccess();
        handleClose();
      } else {
        const data = await response.json();
        alert(data.error || "Errore durante l'approvazione");
      }
    } catch (error) {
      console.error("Errore approvazione:", error);
      alert("Errore durante l'approvazione");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedOrg("");
    setSelectedRole("");
    setSelectedStructure("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Approva Utente</DialogTitle>
          <DialogDescription>
            Configura l'accesso per {userName} ({userEmail})
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Organizzazione */}
          <div className="space-y-2">
            <Label htmlFor="organization">Organizzazione *</Label>
            <Select
              value={selectedOrg}
              onValueChange={setSelectedOrg}
              disabled={loadingOrgs}
            >
              <SelectTrigger id="organization">
                <SelectValue placeholder="Seleziona organizzazione" />
              </SelectTrigger>
              <SelectContent>
                {organizations.map((org) => (
                  <SelectItem key={org.id} value={org.id}>
                    {org.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Ruolo */}
          <div className="space-y-2">
            <Label htmlFor="role">Ruolo *</Label>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger id="role">
                <SelectValue placeholder="Seleziona ruolo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ADMIN">Amministratore</SelectItem>
                <SelectItem value="MANAGER">Responsabile</SelectItem>
                <SelectItem value="OPERATOR">Operatore</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {selectedRole === "ADMIN" &&
                "Gestisce template, utenti e strutture dell'organizzazione"}
              {selectedRole === "MANAGER" &&
                "Gestisce scadenze per la propria struttura"}
              {selectedRole === "OPERATOR" &&
                "Visualizza e carica documenti nella propria struttura"}
            </p>
          </div>

          {/* Struttura (solo per MANAGER e OPERATOR) */}
          {(selectedRole === "MANAGER" || selectedRole === "OPERATOR") && (
            <div className="space-y-2">
              <Label htmlFor="structure">Struttura *</Label>
              <Select
                value={selectedStructure}
                onValueChange={setSelectedStructure}
                disabled={!selectedOrg || structures.length === 0}
              >
                <SelectTrigger id="structure">
                  <SelectValue placeholder="Seleziona struttura" />
                </SelectTrigger>
                <SelectContent>
                  {structures.map((structure) => (
                    <SelectItem key={structure.id} value={structure.id}>
                      {structure.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {structures.length === 0 && selectedOrg && (
                <p className="text-xs text-amber-600">
                  Nessuna struttura disponibile per questa organizzazione
                </p>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            Annulla
          </Button>
          <Button
            onClick={handleApprove}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700"
          >
            {loading ? "Approvazione..." : "Approva"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
