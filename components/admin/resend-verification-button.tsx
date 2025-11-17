"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Mail, Loader2, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();

  const handleResend = async () => {
    setIsLoading(true);
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
        toast({
          title: "Email inviata",
          description: `Email di verifica inviata a ${userEmail}`,
          variant: "default",
        });

        // Reset dello stato dopo 5 secondi
        setTimeout(() => {
          setIsSent(false);
        }, 5000);
      } else {
        toast({
          title: "Errore",
          description: data.error || "Impossibile inviare l'email di verifica",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante l'invio dell'email",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
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
  );
}
