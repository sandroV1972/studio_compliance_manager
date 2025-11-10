"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get("token");

      if (!token) {
        setStatus("error");
        setMessage("Token di verifica mancante");
        return;
      }

      try {
        const response = await fetch(`/api/auth/verify-email?token=${token}`);
        const data = await response.json();

        if (response.ok) {
          setStatus("success");
          setMessage(data.message);
        } else {
          setStatus("error");
          setMessage(data.error || "Errore durante la verifica");
        }
      } catch (error) {
        setStatus("error");
        setMessage("Si è verificato un errore durante la verifica");
      }
    };

    verifyEmail();
  }, [searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-purple-50/30 to-blue-50/20 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            {status === "loading" && (
              <Loader2 className="h-16 w-16 text-purple-600 animate-spin" />
            )}
            {status === "success" && (
              <CheckCircle className="h-16 w-16 text-green-600" />
            )}
            {status === "error" && (
              <XCircle className="h-16 w-16 text-red-600" />
            )}
          </div>
          <CardTitle className="text-2xl font-bold">
            {status === "loading" && "Verifica in corso..."}
            {status === "success" && "Email Verificata!"}
            {status === "error" && "Verifica Fallita"}
          </CardTitle>
          <CardDescription className="text-base">{message}</CardDescription>
        </CardHeader>
        <CardContent>
          {status === "success" && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
                <p className="font-semibold mb-2">
                  Il tuo account è in attesa di approvazione
                </p>
                <p>
                  Un amministratore esaminerà la tua richiesta e riceverai una
                  notifica via email quando il tuo account sarà attivato.
                </p>
              </div>
              <Button
                onClick={() => router.push("/auth/login")}
                className="w-full"
              >
                Vai al Login
              </Button>
            </div>
          )}
          {status === "error" && (
            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-800">
                <p>
                  Il link di verifica potrebbe essere scaduto o non valido.
                  Contatta l'amministratore per assistenza.
                </p>
              </div>
              <Button
                onClick={() => router.push("/auth/login")}
                className="w-full"
                variant="outline"
              >
                Torna al Login
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-purple-50/30 to-blue-50/20 px-4">
          <Card className="w-full max-w-md">
            <CardHeader className="space-y-1 text-center">
              <div className="flex justify-center mb-4">
                <Loader2 className="h-16 w-16 text-purple-600 animate-spin" />
              </div>
              <CardTitle className="text-2xl font-bold">
                Caricamento...
              </CardTitle>
            </CardHeader>
          </Card>
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
