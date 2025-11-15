"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";

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
  const [loading, setLoading] = useState(false);

  const handleApprove = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/users/approve", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      });

      if (response.ok) {
        const result = await response.json();
        alert(result.data?.message || "Utente approvato con successo");
        onSuccess();
        onClose();
      } else {
        const data = await response.json();
        alert(data.error?.message || "Errore durante l'approvazione");
      }
    } catch (error) {
      console.error("Errore approvazione:", error);
      alert("Errore durante l'approvazione");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Approva Utente</DialogTitle>
          <DialogDescription>
            Conferma l'approvazione di {userName} ({userEmail})
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Alert>
            <InfoIcon className="h-4 w-4" />
            <AlertDescription>
              <strong>Cosa succederà dopo l'approvazione:</strong>
              <ul className="mt-2 ml-4 list-disc space-y-1 text-sm">
                <li>L'utente riceverà un'email di conferma</li>
                <li>Al primo accesso dovrà creare la sua organizzazione</li>
                <li>
                  Diventerà automaticamente amministratore della sua
                  organizzazione
                </li>
                <li>Potrà invitare altri utenti (responsabili e operatori)</li>
              </ul>
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Annulla
          </Button>
          <Button
            onClick={handleApprove}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700"
          >
            {loading ? "Approvazione..." : "Approva Utente"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
