import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import ProfileForm from "./ProfileForm";
import { Building2, Mail, Phone, MapPin } from "lucide-react";

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/login");
  }

  // Carica le informazioni dell'organizzazione
  const orgUser = await prisma.organizationUser.findUnique({
    where: {
      userId: session.user.id,
    },
    include: {
      organization: true,
    },
  });

  return (
    <div className="container mx-auto p-6 max-w-4xl space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Card Profilo Utente */}
        <Card>
          <CardHeader>
            <CardTitle>Profilo Utente</CardTitle>
            <CardDescription>
              Visualizza e modifica i tuoi dati personali
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProfileForm user={session.user} />
          </CardContent>
        </Card>

        {/* Card Organizzazione */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-purple-600" />
              <CardTitle>Organizzazione</CardTitle>
            </div>
            <CardDescription>
              Informazioni sulla tua organizzazione
            </CardDescription>
          </CardHeader>
          <CardContent>
            {orgUser?.organization ? (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Nome Organizzazione
                  </label>
                  <p className="text-lg font-semibold">
                    {orgUser.organization.name}
                  </p>
                </div>

                {orgUser.organization.vatNumber && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Partita IVA
                    </label>
                    <p>{orgUser.organization.vatNumber}</p>
                  </div>
                )}

                {orgUser.organization.fiscalCode && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Codice Fiscale
                    </label>
                    <p>{orgUser.organization.fiscalCode}</p>
                  </div>
                )}

                {orgUser.organization.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <a
                      href={`mailto:${orgUser.organization.email}`}
                      className="text-blue-600 hover:underline"
                    >
                      {orgUser.organization.email}
                    </a>
                  </div>
                )}

                {orgUser.organization.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <a
                      href={`tel:${orgUser.organization.phone}`}
                      className="text-blue-600 hover:underline"
                    >
                      {orgUser.organization.phone}
                    </a>
                  </div>
                )}

                {orgUser.organization.address && (
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                    <div>
                      <p>{orgUser.organization.address}</p>
                      {orgUser.organization.city && (
                        <p className="text-sm text-muted-foreground">
                          {orgUser.organization.postalCode &&
                            `${orgUser.organization.postalCode} `}
                          {orgUser.organization.city}
                          {orgUser.organization.province &&
                            ` (${orgUser.organization.province})`}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                <div className="pt-4">
                  <p className="text-xs text-muted-foreground">
                    Ruolo: <span className="font-medium">{orgUser.role}</span>
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-muted-foreground mb-4">
                  Non hai ancora un'organizzazione
                </p>
                <a href="/onboarding" className="text-blue-600 hover:underline">
                  Crea la tua organizzazione
                </a>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
