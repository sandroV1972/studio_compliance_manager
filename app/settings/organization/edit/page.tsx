"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2, ArrowLeft, Save } from "lucide-react";
import Link from "next/link";

interface OrganizationData {
  id: string;
  name: string;
  type: string;
  vatNumber: string;
  fiscalCode: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
  phone: string;
  email: string;
  pec: string;
  website: string;
}

export default function EditOrganizationPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<Partial<OrganizationData>>({
    name: "",
    vatNumber: "",
    fiscalCode: "",
    address: "",
    city: "",
    province: "",
    postalCode: "",
    country: "IT",
    phone: "",
    email: "",
    pec: "",
    website: "",
  });

  useEffect(() => {
    loadOrganization();
  }, []);

  const loadOrganization = async () => {
    try {
      const response = await fetch("/api/user/organization");
      if (!response.ok) throw new Error("Errore caricamento organizzazione");
      const data = await response.json();
      setFormData({
        name: data.name || "",
        vatNumber: data.vatNumber || "",
        fiscalCode: data.fiscalCode || "",
        address: data.address || "",
        city: data.city || "",
        province: data.province || "",
        postalCode: data.postalCode || "",
        country: data.country || "IT",
        phone: data.phone || "",
        email: data.email || "",
        pec: data.pec || "",
        website: data.website || "",
      });
    } catch (error) {
      console.error("Errore:", error);
      alert("Errore nel caricamento dell'organizzazione");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch("/api/organizations", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Errore nell'aggiornamento");
      }

      alert("Organizzazione aggiornata con successo!");
      router.push("/settings/profile");
    } catch (error: any) {
      console.error("Errore:", error);
      alert(error.message || "Errore nell'aggiornamento dell'organizzazione");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Caricamento...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/settings/profile">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Torna al Profilo
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building2 className="h-6 w-6 text-purple-600" />
            <CardTitle>Modifica Organizzazione</CardTitle>
          </div>
          <CardDescription>
            Aggiorna i dati della tua organizzazione
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nome Organizzazione */}
            <div>
              <Label htmlFor="name">
                Nome Organizzazione <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
                placeholder="Es: Studio Medico Rossi"
              />
            </div>

            {/* Dati Fiscali */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="vatNumber">Partita IVA</Label>
                <Input
                  id="vatNumber"
                  value={formData.vatNumber}
                  onChange={(e) => {
                    let value = e.target.value.toUpperCase();
                    // Rimuovi spazi
                    value = value.replace(/\s/g, "");
                    // Assicurati che inizi con IT
                    if (value && !value.startsWith("IT")) {
                      value = "IT" + value.replace(/^IT/, "");
                    }
                    // Limita a IT + 11 cifre
                    if (value.startsWith("IT")) {
                      const numbers = value.slice(2).replace(/\D/g, "");
                      value = "IT" + numbers.slice(0, 11);
                    }
                    setFormData({ ...formData, vatNumber: value });
                  }}
                  placeholder="IT12345678901"
                  maxLength={13}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Formato: IT + 11 cifre
                </p>
              </div>
              <div>
                <Label htmlFor="fiscalCode">Codice Fiscale</Label>
                <Input
                  id="fiscalCode"
                  value={formData.fiscalCode}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      fiscalCode: e.target.value.toUpperCase(),
                    })
                  }
                  placeholder="ABCDEF12G34H567I"
                  maxLength={16}
                />
              </div>
            </div>

            {/* Indirizzo */}
            <div>
              <Label htmlFor="address">Indirizzo</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                placeholder="Via Roma 123"
              />
            </div>

            {/* Città, Provincia, CAP */}
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2">
                <Label htmlFor="city">Città</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) =>
                    setFormData({ ...formData, city: e.target.value })
                  }
                  placeholder="Milano"
                />
              </div>
              <div>
                <Label htmlFor="province">Provincia</Label>
                <Input
                  id="province"
                  value={formData.province}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      province: e.target.value.toUpperCase(),
                    })
                  }
                  placeholder="MI"
                  maxLength={2}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="postalCode">CAP</Label>
                <Input
                  id="postalCode"
                  value={formData.postalCode}
                  onChange={(e) =>
                    setFormData({ ...formData, postalCode: e.target.value })
                  }
                  placeholder="20100"
                  maxLength={5}
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="country">Nazione</Label>
                <Input
                  id="country"
                  value={formData.country}
                  onChange={(e) =>
                    setFormData({ ...formData, country: e.target.value })
                  }
                  placeholder="IT"
                />
              </div>
            </div>

            {/* Contatti */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Telefono</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  placeholder="+39 02 1234567"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="info@studio.it"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="pec">PEC</Label>
                <Input
                  id="pec"
                  type="email"
                  value={formData.pec}
                  onChange={(e) =>
                    setFormData({ ...formData, pec: e.target.value })
                  }
                  placeholder="studio@pec.it"
                />
              </div>
              <div>
                <Label htmlFor="website">Sito Web</Label>
                <Input
                  id="website"
                  type="url"
                  value={formData.website}
                  onChange={(e) =>
                    setFormData({ ...formData, website: e.target.value })
                  }
                  placeholder="https://www.studio.it"
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-2 pt-4">
              <Link href="/settings/profile">
                <Button type="button" variant="outline" disabled={saving}>
                  Annulla
                </Button>
              </Link>
              <Button type="submit" disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? "Salvataggio..." : "Salva Modifiche"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
