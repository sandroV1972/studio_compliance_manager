"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { AlertCircle, Mail } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [accountStatus, setAccountStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resendingEmail, setResendingEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  useEffect(() => {
    // Controlla se c'è un errore nei parametri URL
    const errorParam = searchParams.get("error");
    if (errorParam) {
      const errorMessages: Record<string, string> = {
        CredentialsSignin: "Email o password non validi",
        Configuration: "Si è verificato un errore di configurazione",
        AccessDenied: "Accesso negato",
        Verification: "Il token di verifica è scaduto o non valido",
      };
      setError(errorMessages[errorParam] || "Errore durante l'autenticazione");
    }

    // Controlla se c'è un messaggio di info
    const info = searchParams.get("info");
    if (info === "pending") {
      setError(
        "Account in attesa di approvazione. Verrai contattato quando l'account sarà attivato.",
      );
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setAccountStatus(null);
    setEmailSent(false);
    setLoading(true);

    try {
      // Prima controlla lo stato dell'account
      const checkResponse = await fetch("/api/auth/check-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (checkResponse.ok) {
        const checkData = await checkResponse.json();

        if (!checkData.canLogin) {
          setError(checkData.message || "Non è possibile effettuare il login");
          setAccountStatus(checkData.accountStatus);
          setLoading(false);
          return;
        }
      }

      // Procedi con il login
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        // Gestisci gli errori in base al tipo
        const errorMessages: Record<string, string> = {
          CredentialsSignin:
            "Email o password non validi. Verifica le tue credenziali.",
          Configuration:
            "Si è verificato un errore di configurazione del server",
          AccessDenied: "Accesso negato. Contatta l'amministratore.",
          Verification: "Il token di verifica è scaduto",
        };

        setError(errorMessages[result.error] || result.error);
      } else if (result?.ok) {
        // Verifica se l'utente è SuperAdmin per reindirizzare correttamente
        const sessionCheck = await fetch("/api/auth/session");
        const sessionData = await sessionCheck.json();

        if (sessionData?.user?.isSuperAdmin) {
          router.push("/admin");
        } else {
          router.push("/dashboard");
        }
        router.refresh();
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Si è verificato un errore imprevisto. Riprova più tardi.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!email) {
      setError(
        "Inserisci la tua email prima di richiedere una nuova email di verifica",
      );
      return;
    }

    setResendingEmail(true);
    setEmailSent(false);

    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setEmailSent(true);
        setError("");

        // In modalità sviluppo, mostra il link
        if (data.verificationUrl) {
          console.log("🔗 Link di verifica:", data.verificationUrl);
        }
      } else {
        setError(data.error || "Errore durante l'invio dell'email");
      }
    } catch (err) {
      console.error("Resend email error:", err);
      setError("Errore durante l'invio dell'email di verifica");
    } finally {
      setResendingEmail(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-purple-50/30 to-blue-50/20 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Accedi</CardTitle>
          <CardDescription>
            Inserisci le tue credenziali per accedere al sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
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
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
              <Link
                href="/auth/forgot-password"
                className="text-xs text-purple-700 hover:text-purple-900 font-medium"
              >
                Password dimenticata?
              </Link>
            </div>
            {error && (
              <div className="flex items-start gap-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-4">
                <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium mb-1">Errore di autenticazione</p>
                  <p className="text-red-600">{error}</p>

                  {/* Mostra pulsante "Reinvia email" se l'account non è verificato */}
                  {accountStatus === "PENDING_VERIFICATION" && (
                    <div className="mt-3">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleResendVerification}
                        disabled={resendingEmail}
                        className="w-full"
                      >
                        <Mail className="mr-2 h-4 w-4" />
                        {resendingEmail
                          ? "Invio in corso..."
                          : "Reinvia email di verifica"}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {emailSent && (
              <div className="flex items-start gap-3 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg p-4">
                <Mail className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium mb-1">Email inviata!</p>
                  <p className="text-green-600">
                    Controlla la tua casella di posta e clicca sul link per
                    verificare il tuo account.
                  </p>
                  <p className="text-xs text-green-600 mt-2">
                    (In modalità sviluppo: controlla la console del server per
                    il link)
                  </p>
                </div>
              </div>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Accesso in corso..." : "Accedi"}
            </Button>
          </form>
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground mb-4">
              Non hai un account?{" "}
              <Link
                href="/auth/register"
                className="text-purple-700 hover:text-purple-900 font-medium"
              >
                Registrati
              </Link>
            </p>
            <div className="text-xs text-muted-foreground border-t pt-4">
              <p className="font-semibold mb-1">Account Demo:</p>
              <p>demo@studiodentistico.it / Demo123!</p>
              <p>admin@studiocompliance.it / Admin123!</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-purple-50/30 to-blue-50/20 px-4">
          <Card className="w-full max-w-md">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold">
                Caricamento...
              </CardTitle>
            </CardHeader>
          </Card>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
