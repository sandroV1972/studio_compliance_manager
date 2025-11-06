"use client";

import { useState, useEffect, use } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Building2, Users, Save, X, Edit, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface OrganizationUser {
  id: string;
  role: string;
  createdAt: string;
  user: {
    id: string;
    email: string;
    name: string | null;
    createdAt: string;
  };
}

interface Organization {
  id: string;
  name: string;
  type: string;
  vatNumber: string | null;
  fiscalCode: string | null;
  address: string | null;
  city: string | null;
  province: string | null;
  postalCode: string | null;
  country: string;
  phone: string | null;
  email: string | null;
  pec: string | null;
  website: string | null;
  timezone: string;
  notificationsEnabled: boolean;
  createdAt: string;
  updatedAt: string;
  users: OrganizationUser[];
  _count: {
    people: number;
    structures: number;
    deadlineInstances: number;
  };
}

export default function AdminOrganizationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [searchUser, setSearchUser] = useState("");
  const [formData, setFormData] = useState<Partial<Organization>>({});
  const [alert, setAlert] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  useEffect(() => {
    fetchOrganization();
  }, [resolvedParams.id]);

  useEffect(() => {
    if (alert) {
      const timer = setTimeout(() => setAlert(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [alert]);

  const fetchOrganization = async () => {
    try {
      const response = await fetch(`/api/admin/organizations/${resolvedParams.id}`);
      if (response.ok) {
        const data = await response.json();
        setOrganization(data);
        setFormData(data);
      } else {
        setAlert({ type: 'error', message: 'Organizzazione non trovata' });
        router.push("/admin/settings");
      }
    } catch (error) {
      console.error("Errore nel caricamento:", error);
      setAlert({ type: 'error', message: 'Errore nel caricamento dell\'organizzazione' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/admin/organizations/${resolvedParams.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const updated = await response.json();
        setOrganization(updated);
        setFormData(updated);
        setIsEditing(false);
        setAlert({ type: 'success', message: 'Organizzazione aggiornata con successo' });
      } else {
        throw new Error("Errore nell'aggiornamento");
      }
    } catch (error) {
      console.error("Errore nel salvataggio:", error);
      setAlert({ type: 'error', message: 'Errore nell\'aggiornamento dell\'organizzazione' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData(organization || {});
    setIsEditing(false);
  };

  const filteredUsers = organization?.users.filter(orgUser =>
    orgUser.user.name?.toLowerCase().includes(searchUser.toLowerCase()) ||
    orgUser.user.email.toLowerCase().includes(searchUser.toLowerCase())
  ) || [];

  if (loading) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!organization) {
    return null;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {alert && (
        <Alert variant={alert.type === 'error' ? 'destructive' : 'default'}>
          {alert.type === 'success' ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          <AlertDescription>{alert.message}</AlertDescription>
        </Alert>
      )}

      <div className="flex items-center justify-between">
        <Link href="/admin/settings" className="text-blue-600 hover:underline">
          ← Torna alle impostazioni
        </Link>
        {!isEditing ? (
          <Button onClick={() => setIsEditing(true)} variant="outline">
            <Edit className="h-4 w-4 mr-2" />
            Modifica
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button onClick={handleCancel} variant="outline" disabled={isSaving}>
              <X className="h-4 w-4 mr-2" />
              Annulla
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Salva
            </Button>
          </div>
        )}
      </div>

      <div>
        <h2 className="text-3xl font-bold tracking-tight">{organization.name}</h2>
        <p className="text-muted-foreground">
          Creata il {formatDate(new Date(organization.createdAt))}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utenti</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{organization.users.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Personale</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{organization._count.people}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Strutture</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{organization._count.structures}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scadenze</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{organization._count.deadlineInstances}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dettagli Organizzazione</CardTitle>
          <CardDescription>
            Informazioni generali e contatti
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Nome Organizzazione</Label>
              <Input
                id="name"
                value={formData.name || ""}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Tipo</Label>
              <Input
                id="type"
                value={formData.type || ""}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vatNumber">Partita IVA</Label>
              <Input
                id="vatNumber"
                value={formData.vatNumber || ""}
                onChange={(e) => setFormData({ ...formData, vatNumber: e.target.value })}
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fiscalCode">Codice Fiscale</Label>
              <Input
                id="fiscalCode"
                value={formData.fiscalCode || ""}
                onChange={(e) => setFormData({ ...formData, fiscalCode: e.target.value })}
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email || ""}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pec">PEC</Label>
              <Input
                id="pec"
                type="email"
                value={formData.pec || ""}
                onChange={(e) => setFormData({ ...formData, pec: e.target.value })}
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telefono</Label>
              <Input
                id="phone"
                value={formData.phone || ""}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="website">Sito Web</Label>
              <Input
                id="website"
                value={formData.website || ""}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                disabled={!isEditing}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Indirizzo</Label>
            <Input
              id="address"
              value={formData.address || ""}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              disabled={!isEditing}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="city">Città</Label>
              <Input
                id="city"
                value={formData.city || ""}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="province">Provincia</Label>
              <Input
                id="province"
                value={formData.province || ""}
                onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="postalCode">CAP</Label>
              <Input
                id="postalCode"
                value={formData.postalCode || ""}
                onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                disabled={!isEditing}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Utenti dell'Organizzazione</CardTitle>
          <CardDescription>
            {organization.users.length} membri totali
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Cerca utente..."
              value={searchUser}
              onChange={(e) => setSearchUser(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="space-y-4">
            {filteredUsers.map((orgUser) => (
              <div key={orgUser.id} className="flex items-center justify-between border-b pb-4 last:border-0">
                <div>
                  <p className="font-medium">{orgUser.user.name || orgUser.user.email}</p>
                  <p className="text-sm text-muted-foreground">{orgUser.user.email}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-800">
                      {orgUser.role}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Aggiunto il {formatDate(new Date(orgUser.createdAt))}
                    </span>
                  </div>
                </div>
                <Link
                  href={`/admin/users/${orgUser.user.id}`}
                  className="text-sm text-blue-600 hover:underline"
                >
                  Profilo utente →
                </Link>
              </div>
            ))}
            {filteredUsers.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                {searchUser ? "Nessun utente trovato" : "Nessun utente nell'organizzazione"}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
