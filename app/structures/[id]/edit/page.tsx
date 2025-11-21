"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface Person {
  id: string;
  firstName: string;
  lastName: string;
}

export default function EditStructurePage() {
  const router = useRouter();
  const params = useParams();
  const structureId = params.id as string;
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [people, setPeople] = useState<Person[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    address: "",
    city: "",
    province: "",
    postalCode: "",
    phone: "",
    email: "",
    pec: "",
    website: "",
    vatNumber: "",
    fiscalCode: "",
    responsiblePersonId: "",
    legalRepName: "",
    licenseNumber: "",
    licenseExpiry: "",
    insurancePolicy: "",
    insuranceExpiry: "",
    notes: "",
  });

  useEffect(() => {
    loadData();
  }, [structureId]);

  const loadData = async () => {
    try {
      // Carica organizzazione
      const orgResponse = await fetch("/api/user/organization");
      if (!orgResponse.ok) throw new Error("Errore caricamento organizzazione");
      const orgResponseData = await orgResponse.json();
      const orgData = orgResponseData.data; // Unwrap envelope

      if (!orgData) {
        throw new Error("Nessuna organizzazione trovata per l'utente");
      }

      // Carica persone
      const peopleResponse = await fetch(
        `/api/organizations/${orgData.id}/people`,
      );
      if (peopleResponse.ok) {
        const peopleData = await peopleResponse.json();
        setPeople(peopleData.people || []);
      }

      // Carica struttura
      const structureResponse = await fetch(`/api/structures/${structureId}`);
      if (!structureResponse.ok) throw new Error("Struttura non trovata");
      const structure = await structureResponse.json();

      // Formatta date da ISO a gg/mm/aaaa
      const formatDateFromISO = (isoDate: string | null): string => {
        if (!isoDate) return "";
        const date = new Date(isoDate);
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
      };

      setFormData({
        name: structure.name || "",
        code: structure.code || "",
        address: structure.address || "",
        city: structure.city || "",
        province: structure.province || "",
        postalCode: structure.postalCode || "",
        phone: structure.phone || "",
        email: structure.email || "",
        pec: structure.pec || "",
        website: structure.website || "",
        vatNumber: structure.vatNumber || "",
        fiscalCode: structure.fiscalCode || "",
        responsiblePersonId: structure.responsiblePersonId || "",
        legalRepName: structure.legalRepName || "",
        licenseNumber: structure.licenseNumber || "",
        licenseExpiry: formatDateFromISO(structure.licenseExpiry),
        insurancePolicy: structure.insurancePolicy || "",
        insuranceExpiry: formatDateFromISO(structure.insuranceExpiry),
        notes: structure.notes || "",
      });
    } catch (error) {
      console.error("Errore caricamento dati:", error);
      alert(error instanceof Error ? error.message : "Errore caricamento dati");
    } finally {
      setLoadingData(false);
    }
  };

  const formatDateInput = (value: string): string => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 2) return numbers;
    else if (numbers.length <= 4)
      return `${numbers.slice(0, 2)}/${numbers.slice(2)}`;
    else
      return `${numbers.slice(0, 2)}/${numbers.slice(2, 4)}/${numbers.slice(4, 8)}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`/api/structures/${structureId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          error.error || "Errore nell'aggiornamento della struttura",
        );
      }

      // Reindirizza alla struttura
      router.push(`/structures/${structureId}`);
    } catch (error) {
      console.error("Errore:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Errore nell'aggiornamento della struttura",
      );
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Caricamento...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <Link
          href={`/structures/${structureId}`}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Torna alla struttura
        </Link>
      </div>

      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building2 className="h-6 w-6 text-purple-600" />
            <CardTitle>Modifica Struttura</CardTitle>
          </div>
          <CardDescription>Aggiorna i dati della struttura</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Tabs defaultValue="general" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="general">Generale</TabsTrigger>
                <TabsTrigger value="contacts">Contatti</TabsTrigger>
                <TabsTrigger value="fiscal">Dati Fiscali</TabsTrigger>
                <TabsTrigger value="licenses">Autorizzazioni</TabsTrigger>
              </TabsList>

              <TabsContent value="general" className="space-y-4 mt-4">
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

                <div>
                  <Label htmlFor="notes">Note</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                    placeholder="Note aggiuntive sulla struttura"
                    rows={3}
                  />
                </div>
              </TabsContent>

              <TabsContent value="contacts" className="space-y-4 mt-4">
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
                      placeholder="struttura@pec.it"
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
                      placeholder="https://www.struttura.it"
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="fiscal" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="vatNumber">Partita IVA</Label>
                    <Input
                      id="vatNumber"
                      value={formData.vatNumber}
                      onChange={(e) =>
                        setFormData({ ...formData, vatNumber: e.target.value })
                      }
                      placeholder="12345678901"
                      maxLength={11}
                    />
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

                <div>
                  <Label htmlFor="responsiblePersonId">
                    Persona Responsabile
                  </Label>
                  <select
                    id="responsiblePersonId"
                    value={formData.responsiblePersonId}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        responsiblePersonId: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="">-- Nessuna persona selezionata --</option>
                    {people.map((person) => (
                      <option key={person.id} value={person.id}>
                        {person.firstName} {person.lastName}
                      </option>
                    ))}
                  </select>
                  {people.length === 0 && (
                    <p className="text-sm text-amber-600 mt-1">
                      Nessuna persona trovata. Crea prima una persona se
                      necessario.
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="legalRepName">
                    Nome Rappresentante Legale
                  </Label>
                  <Input
                    id="legalRepName"
                    value={formData.legalRepName}
                    onChange={(e) =>
                      setFormData({ ...formData, legalRepName: e.target.value })
                    }
                    placeholder="Es: Dr. Mario Rossi"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Se diverso dalla persona responsabile
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="licenses" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="licenseNumber">
                      Numero Autorizzazione Sanitaria
                    </Label>
                    <Input
                      id="licenseNumber"
                      value={formData.licenseNumber}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          licenseNumber: e.target.value,
                        })
                      }
                      placeholder="Es: AUT-2024-001"
                    />
                  </div>
                  <div>
                    <Label htmlFor="licenseExpiry">
                      Scadenza Autorizzazione
                    </Label>
                    <Input
                      id="licenseExpiry"
                      type="text"
                      value={formData.licenseExpiry}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          licenseExpiry: formatDateInput(e.target.value),
                        })
                      }
                      placeholder="gg/mm/aaaa"
                      maxLength={10}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="insurancePolicy">
                      Numero Polizza Assicurativa
                    </Label>
                    <Input
                      id="insurancePolicy"
                      value={formData.insurancePolicy}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          insurancePolicy: e.target.value,
                        })
                      }
                      placeholder="Es: POL-2024-12345"
                    />
                  </div>
                  <div>
                    <Label htmlFor="insuranceExpiry">Scadenza Polizza</Label>
                    <Input
                      id="insuranceExpiry"
                      type="text"
                      value={formData.insuranceExpiry}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          insuranceExpiry: formatDateInput(e.target.value),
                        })
                      }
                      placeholder="gg/mm/aaaa"
                      maxLength={10}
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex justify-end gap-4 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push(`/structures/${structureId}`)}
                disabled={loading}
              >
                Annulla
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Salvataggio in corso..." : "Salva Modifiche"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
