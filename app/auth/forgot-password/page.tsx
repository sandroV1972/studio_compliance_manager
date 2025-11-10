"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertCircle, ArrowLeft, CheckCircle2, Mail } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Errore durante la richiesta");
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-purple-50/30 to-blue-50/20 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">
            {success ? "Email inviata" : "Password dimenticata?"}
          </CardTitle>
          <CardDescription>
            {success
              ? "Controlla la tua casella di posta"
              : "Inserisci la tua email per ricevere le istruzioni"}
          </CardDescription>
        </CardHeader>

        {success ? (
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg p-4">
              <CheckCircle2 className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium mb-1">Email inviata con successo</p>
                <p className="text-green-600">
                  Se l'email esiste nel nostro sistema, riceverai un messaggio
                  con le istruzioni per reimpostare la password. Controlla anche
                  la cartella spam.
                </p>
              </div>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-sm">
              <p className="font-medium mb-1 text-purple-900">
                Il link sarà valido per 1 ora
              </p>
              <p className="text-purple-700">
                Se non ricevi l'email entro pochi minuti, prova a controllare la
                cartella spam o riprova.
              </p>
            </div>
          </CardContent>
        ) : (
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <div className="flex items-start gap-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-4">
                  <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium mb-1">Errore</p>
                    <p className="text-red-600">{error}</p>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="nome@esempio.it"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
            </CardContent>

            <CardFooter className="flex flex-col space-y-4">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Invio in corso..." : "Invia istruzioni"}
              </Button>

              <div className="text-center">
                <Link
                  href="/auth/login"
                  className="text-sm text-purple-700 hover:text-purple-900 font-medium inline-flex items-center gap-1"
                >
                  <ArrowLeft className="h-3 w-3" />
                  Torna al login
                </Link>
              </div>
            </CardFooter>
          </form>
        )}

        {success && (
          <CardFooter>
            <Link href="/auth/login" className="w-full">
              <Button className="w-full">Torna al login</Button>
            </Link>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
