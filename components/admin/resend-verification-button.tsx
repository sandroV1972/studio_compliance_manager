"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Mail, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

interface ResendVerificationButtonProps {
  userId: string;
  userEmail: string;
}

export function ResendVerificationButton({
  userId,
  userEmail,
}: ResendVerificationButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleResend = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: userEmail }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsSent(true);
        // Reset dello stato dopo 5 secondi
        setTimeout(() => {
          setIsSent(false);
        }, 5000);
      } else {
        setError(data.error || "Impossibile inviare l'email di verifica");
      }
    } catch (error) {
      setError("Si è verificato un errore durante l'invio dell'email");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <Button
        onClick={handleResend}
        disabled={isLoading || isSent}
        variant={isSent ? "outline" : "default"}
        className={
          isSent
            ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
            : "bg-purple-600 hover:bg-purple-700 text-white"
        }
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Invio in corso...
          </>
        ) : isSent ? (
          <>
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Email inviata
          </>
        ) : (
          <>
            <Mail className="mr-2 h-4 w-4" />
            Invia nuovamente email di verifica
          </>
        )}
      </Button>
      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-md border border-red-200">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
