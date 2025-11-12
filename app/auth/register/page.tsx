"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
import { PasswordStrengthIndicator } from "@/components/ui/password-strength-indicator";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle,
  Building2,
  UserCheck,
  Home,
} from "lucide-react";

interface InviteData {
  email: string;
  organizationName: string;
  role: string;
  structureName?: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inviteToken = searchParams.get("invite");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [inviteData, setInviteData] = useState<InviteData | null>(null);
  const [loadingInvite, setLoadingInvite] = useState(!!inviteToken);

  // Valida il token di invito al caricamento
  useEffect(() => {
    if (inviteToken) {
      validateInviteToken(inviteToken);
    }
  }, [inviteToken]);

  const validateInviteToken = async (token: string) => {
    try {
      const response = await fetch(`/api/invites/validate?token=${token}`);
      const data = await response.json();

      if (data.valid && data.invite) {
        setInviteData(data.invite);
        setFormData((prev) => ({ ...prev, email: data.invite.email }));
      } else {
        setError(data.error || "Invito non valido o scaduto");
      }
    } catch (err) {
      setError("Errore durante la validazione dell'invito");
    } finally {
      setLoadingInvite(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (formData.password !== formData.confirmPassword) {
      setError("Le password non coincidono");
      setLoading(false);
      return;
    }

    // Validazione requisiti password
    const passwordErrors = [];
    if (formData.password.length < 12) {
      passwordErrors.push("almeno 12 caratteri");
    }
    if (!/[A-Z]/.test(formData.password)) {
      passwordErrors.push("una lettera maiuscola");
    }
    if (!/[a-z]/.test(formData.password)) {
      passwordErrors.push("una lettera minuscola");
    }
    if (!/\d/.test(formData.password)) {
      passwordErrors.push("un numero");
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formData.password)) {
      passwordErrors.push("un carattere speciale");
    }

    if (passwordErrors.length > 0) {
      setError(`La password deve contenere: ${passwordErrors.join(", ")}`);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          inviteToken: inviteToken || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Errore durante la registrazione");
      } else {
        setSuccess(true);
      }
    } catch (err) {
      setError("Si è verificato un errore durante la registrazione");
    } finally {
      setLoading(false);
    }
  };

  if (loadingInvite) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-purple-50/30 to-blue-50/20 px-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-700 mx-auto mb-4"></div>
              <p className="text-muted-foreground">
                Validazione invito in corso...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (success) {
    const isInviteRegistration = !!inviteToken;

    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-purple-50/30 to-blue-50/20 px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-16 w-16 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-green-600">
              Registrazione Completata!
            </CardTitle>
            <CardDescription className="text-base">
              {isInviteRegistration
                ? `Benvenuto in ${inviteData?.organizationName}! Il tuo account è stato creato con successo.`
                : "Ti abbiamo inviato un'email di verifica. Controlla la tua casella di posta e clicca sul link per verificare il tuo account."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {isInviteRegistration ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-sm text-green-800">
                  <p className="font-semibold mb-2">Il tuo account è attivo!</p>
                  <p>Puoi accedere subito al sistema e iniziare a lavorare.</p>
                </div>
              ) : (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
                  <p className="font-semibold mb-2">Prossimi passi:</p>
                  <ol className="list-decimal list-inside space-y-1">
                    <li>Verifica la tua email cliccando sul link ricevuto</li>
                    <li>Attendi l'approvazione dell'amministratore</li>
                    <li>
                      Riceverai una notifica quando il tuo account sarà attivato
                    </li>
                  </ol>
                </div>
              )}
              <Button
                onClick={() => router.push("/auth/login")}
                className="w-full"
              >
                {isInviteRegistration ? "Accedi Ora" : "Torna al Login"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-purple-50/30 to-blue-50/20 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="mb-4">
            <Link
              href="/auth/login"
              className="inline-flex items-center gap-2 text-sm font-medium text-purple-700 hover:text-purple-900 transition-colors group"
            >
              <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              Torna al Login
            </Link>
          </div>
          <CardTitle className="text-2xl font-bold">
            {inviteData ? "Completa la Registrazione" : "Crea un Account"}
          </CardTitle>
          <CardDescription>
            {inviteData
              ? "Sei stato invitato a far parte di un'organizzazione"
              : "Inserisci i tuoi dati per registrarti al sistema"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {inviteData && (
            <div className="mb-6 bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-purple-900">
                  <Building2 className="h-4 w-4" />
                  <span className="font-semibold">Organizzazione:</span>
                  <span>{inviteData.organizationName}</span>
                </div>
                <div className="flex items-center gap-2 text-purple-900">
                  <UserCheck className="h-4 w-4" />
                  <span className="font-semibold">Ruolo:</span>
                  <span>{inviteData.role}</span>
                </div>
                {inviteData.structureName && (
                  <div className="flex items-center gap-2 text-purple-900">
                    <Home className="h-4 w-4" />
                    <span className="font-semibold">Struttura:</span>
                    <span>{inviteData.structureName}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome Completo</Label>
              <Input
                id="name"
                type="text"
                placeholder="Mario Rossi"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="nome@esempio.it"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
                disabled={loading || !!inviteData}
                readOnly={!!inviteData}
                className={inviteData ? "bg-gray-100" : ""}
              />
              {inviteData && (
                <p className="text-xs text-muted-foreground">
                  Email precompilata dall'invito
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Minimo 12 caratteri"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required
                disabled={loading}
                minLength={12}
              />
              <PasswordStrengthIndicator password={formData.password} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Conferma Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Ripeti la password"
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData({ ...formData, confirmPassword: e.target.value })
                }
                required
                disabled={loading}
                minLength={12}
              />
            </div>
            {error && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
                {error}
              </div>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Registrazione in corso..." : "Registrati"}
            </Button>
          </form>
          {!inviteData && (
            <div className="mt-4 text-center text-sm text-muted-foreground">
              <p>
                Hai già un account?{" "}
                <Link
                  href="/auth/login"
                  className="text-purple-700 hover:text-purple-900 font-medium"
                >
                  Accedi
                </Link>
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
