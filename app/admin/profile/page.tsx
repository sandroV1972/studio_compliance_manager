import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Mail, Shield, Calendar } from "lucide-react";
import { formatDate } from "@/lib/utils";

async function getUserProfile(userId: string) {
  return await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      emailVerified: true,
      isSuperAdmin: true,
      accountStatus: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

export default async function AdminProfilePage() {
  const session = await auth();

  if (!session?.user?.isSuperAdmin) {
    redirect("/auth/login");
  }

  const user = await getUserProfile(session.user.id);

  if (!user) {
    redirect("/auth/login");
  }

  const getAccountStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      APPROVED: { label: "Approvato", className: "bg-green-500" },
      PENDING_VERIFICATION: {
        label: "In attesa verifica",
        className: "bg-yellow-500",
      },
      PENDING_APPROVAL: {
        label: "In attesa approvazione",
        className: "bg-orange-500",
      },
      REJECTED: { label: "Rifiutato", className: "bg-red-500" },
    };

    const { label, className } =
      statusMap[status] || statusMap["PENDING_VERIFICATION"];
    return <Badge className={`${className} text-white`}>{label}</Badge>;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Profilo Admin</h2>
          <p className="text-muted-foreground">
            Gestisci le informazioni del tuo account amministratore
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Card Informazioni Personali */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-indigo-600" />
              Informazioni Personali
            </CardTitle>
            <CardDescription>
              Dati del tuo account amministratore
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Nome
              </label>
              <p className="text-lg font-medium">
                {user.name || "Non specificato"}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                <Mail className="h-3 w-3" />
                Email
              </label>
              <p className="text-lg font-medium">{user.email}</p>
              {user.emailVerified && (
                <Badge
                  variant="outline"
                  className="mt-1 text-green-600 border-green-600"
                >
                  Email verificata
                </Badge>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Stato Account
              </label>
              <div className="mt-1">
                {getAccountStatusBadge(user.accountStatus)}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card Ruolo e Permessi */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-indigo-600" />
              Ruolo e Permessi
            </CardTitle>
            <CardDescription>I tuoi privilegi nel sistema</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Ruolo
              </label>
              <div className="mt-2">
                <Badge className="bg-indigo-600 text-white text-base px-3 py-1">
                  Super Admin
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Hai accesso completo a tutte le funzionalità del sistema,
                inclusa la gestione di utenti, organizzazioni e template
                globali.
              </p>
            </div>

            <div className="pt-4 border-t">
              <label className="text-sm font-medium text-muted-foreground">
                Privilegi
              </label>
              <ul className="mt-2 space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                  Gestione utenti e approvazioni
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                  Gestione organizzazioni
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                  Creazione template globali
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                  Visualizzazione completa del sistema
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Card Informazioni Account */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-indigo-600" />
              Informazioni Account
            </CardTitle>
            <CardDescription>Date importanti del tuo account</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Account creato il
                </label>
                <p className="text-base font-medium mt-1">
                  {formatDate(user.createdAt)}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Ultimo aggiornamento
                </label>
                <p className="text-base font-medium mt-1">
                  {formatDate(user.updatedAt)}
                </p>
              </div>

              {user.emailVerified && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Email verificata il
                  </label>
                  <p className="text-base font-medium mt-1">
                    {formatDate(user.emailVerified)}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-blue-900">
                Informazioni sulla Sicurezza
              </h3>
              <p className="text-sm text-blue-800 mt-1">
                Come Super Admin, hai la responsabilità di mantenere sicuri i
                dati di tutte le organizzazioni nel sistema. Assicurati di
                utilizzare una password robusta e di non condividere le tue
                credenziali con nessuno.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
