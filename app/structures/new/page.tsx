"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { Building2, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewStructurePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    address: "",
    city: "",
    province: "",
    postalCode: "",
    phone: "",
    email: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/structures", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          error.error || "Errore nella creazione della struttura",
        );
      }

      const structure = await response.json();

      // Reindirizza alla nuova struttura
      router.push(`/structures/${structure.id}`);
    } catch (error) {
      console.error("Errore:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Errore nella creazione della struttura",
      );
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <Link
          href="/structures"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Torna alle strutture
        </Link>
      </div>

      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building2 className="h-6 w-6 text-purple-600" />
            <CardTitle>Crea Nuova Struttura</CardTitle>
          </div>
          <CardDescription>
            Aggiungi una nuova struttura alla tua organizzazione
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Nome Struttura *</Label>
              <Input
                id="name"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Es: Sede Centrale"
              />
            </div>

            <div>
              <Label htmlFor="code">Codice Struttura</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) =>
                  setFormData({ ...formData, code: e.target.value })
                }
                placeholder="Es: SEDE01"
              />
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
                  placeholder="info@struttura.it"
                />
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/structures")}
                disabled={loading}
              >
                Annulla
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Creazione in corso..." : "Crea Struttura"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
