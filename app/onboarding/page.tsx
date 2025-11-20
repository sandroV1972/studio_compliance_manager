"use client";

import { useState } from "react";
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

export default function OnboardingPage() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    city: "",
    province: "",
    postalCode: "",
    country: "Italia",
    phone: "",
    email: "",
    vatNumber: "",
    fiscalCode: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/organizations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage =
          errorData.details ||
          errorData.error ||
          "Errore nella creazione dell'organizzazione";
        console.error("Server error:", errorData);
        throw new Error(errorMessage);
      }

      // Aspetta un attimo per assicurarsi che il database sia aggiornato
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Usa window.location.href per un hard redirect che forza il refresh
      window.location.href = "/dashboard";
    } catch (error) {
      console.error("Errore:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Errore nella creazione dell'organizzazione";
      alert(errorMessage);
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Benvenuto!</CardTitle>
          <CardDescription>
            Crea la tua prima organizzazione per iniziare a gestire scadenze e
            adempimenti
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Nome Organizzazione *</Label>
              <Input
                id="name"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Es: Studio Dentistico Rossi"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="vatNumber">Partita IVA</Label>
                <Input
                  id="vatNumber"
                  value={formData.vatNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, vatNumber: e.target.value })
                  }
                  placeholder="IT12345678901"
                />
              </div>
              <div>
                <Label htmlFor="fiscalCode">Codice Fiscale</Label>
                <Input
                  id="fiscalCode"
                  value={formData.fiscalCode}
                  onChange={(e) =>
                    setFormData({ ...formData, fiscalCode: e.target.value })
                  }
                  placeholder="RSSMRA80A01H501U"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="address">Indirizzo</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                placeholder="Via Roma, 123"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
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
                    setFormData({ ...formData, province: e.target.value })
                  }
                  placeholder="MI"
                  maxLength={2}
                />
              </div>
              <div>
                <Label htmlFor="postalCode">CAP</Label>
                <Input
                  id="postalCode"
                  value={formData.postalCode}
                  onChange={(e) =>
                    setFormData({ ...formData, postalCode: e.target.value })
                  }
                  placeholder="20100"
                />
              </div>
            </div>

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

            <div className="flex justify-end gap-4 pt-4">
              <Button type="submit" disabled={loading}>
                {loading ? "Creazione in corso..." : "Crea Organizzazione"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
