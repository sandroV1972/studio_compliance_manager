"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [tokenValid, setTokenValid] = useState(false);

  // Valida il token al caricamento
  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setError("Token mancante. Richiedi un nuovo link di reset password.");
        setValidating(false);
        return;
      }

      try {
        const response = await fetch(`/api/auth/reset-password?token=${token}`);
        const data = await response.json();

        if (data.valid) {
          setTokenValid(true);
        } else {
          setError(data.error || "Token non valido");
        }
      } catch (err) {
        setError("Errore durante la verifica del token");
      } finally {
        setValidating(false);
      }
    };

    validateToken();
  }, [token]);

  const validatePassword = () => {
    if (password.length < 8) {
      setError("La password deve contenere almeno 8 caratteri");
      return false;
    }

    if (password !== confirmPassword) {
      setError("Le password non corrispondono");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!validatePassword()) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Errore durante il reset della password");
      }

      setSuccess(true);

      // Redirect al login dopo 3 secondi
      setTimeout(() => {
        router.push("/auth/login");
      }, 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (validating) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-purple-50/30 to-blue-50/20 px-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-purple-600 mb-4" />
            <p className="text-muted-foreground">
              Verifica del link in corso...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-purple-50/30 to-blue-50/20 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">
            {success ? "Password aggiornata!" : "Reimposta password"}
          </CardTitle>
          <CardDescription>
            {success
              ? "La tua password è stata modificata con successo"
              : "Crea una nuova password per il tuo account"}
          </CardDescription>
        </CardHeader>

        {success ? (
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg p-4">
              <CheckCircle2 className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium mb-1">
                  Password aggiornata con successo
                </p>
                <p className="text-green-600">
                  Verrai reindirizzato al login tra pochi secondi...
                </p>
              </div>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-sm">
              <p className="text-purple-900">
                Puoi ora accedere con la tua nuova password.
              </p>
            </div>
          </CardContent>
        ) : !tokenValid ? (
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-4">
              <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium mb-1">Link non valido</p>
                <p className="text-red-600">{error}</p>
              </div>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm text-gray-700">
              <p className="font-medium mb-2">Possibili cause:</p>
              <ul className="list-disc list-inside space-y-1 text-gray-600">
                <li>Il link è scaduto (valido per 1 ora)</li>
                <li>Il link è già stato utilizzato</li>
                <li>Il link non è valido</li>
              </ul>
              <p className="mt-3">
                Richiedi un nuovo link dalla{" "}
                <Link
                  href="/auth/forgot-password"
                  className="text-purple-700 hover:text-purple-900 font-medium"
                >
                  pagina di recupero password
                </Link>
                .
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
                <Label htmlFor="password">Nuova Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Almeno 8 caratteri"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Usa almeno 8 caratteri con lettere e numeri
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Conferma Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Ripeti la password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={loading}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Password strength indicator */}
              {password && (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <div
                      className={`h-1 flex-1 rounded ${password.length >= 8 ? "bg-green-500" : "bg-gray-300"}`}
                    />
                    <div
                      className={`h-1 flex-1 rounded ${password.length >= 12 ? "bg-green-500" : "bg-gray-300"}`}
                    />
                    <div
                      className={`h-1 flex-1 rounded ${/[A-Z]/.test(password) && /[0-9]/.test(password) ? "bg-green-500" : "bg-gray-300"}`}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {password.length < 8
                      ? "Debole - Usa almeno 8 caratteri"
                      : password.length < 12
                        ? "Media - Aggiungi più caratteri"
                        : /[A-Z]/.test(password) && /[0-9]/.test(password)
                          ? "Forte - Ottima password!"
                          : "Buona - Aggiungi maiuscole e numeri"}
                  </p>
                </div>
              )}
            </CardContent>

            <CardFooter className="flex flex-col space-y-4">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Aggiornamento...
                  </>
                ) : (
                  "Aggiorna password"
                )}
              </Button>

              <div className="text-center">
                <Link
                  href="/auth/login"
                  className="text-sm text-purple-700 hover:text-purple-900 font-medium"
                >
                  Torna al login
                </Link>
              </div>
            </CardFooter>
          </form>
        )}

        {(success || !tokenValid) && (
          <CardFooter>
            <Link href="/auth/login" className="w-full">
              <Button className="w-full">Vai al login</Button>
            </Link>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-purple-50/30 to-blue-50/20">
          <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
