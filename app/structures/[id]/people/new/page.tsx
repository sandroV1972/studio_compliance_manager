"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, UserPlus, Users } from "lucide-react";
import Link from "next/link";
import { validateFiscalCode } from "@/lib/utils";

interface ExistingPerson {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  fiscalCode: string | null;
  structures: Array<{
    structure: {
      id: string;
      name: string;
    };
  }>;
}

export default function NewPersonPage() {
  const params = useParams();
  const router = useRouter();
  const structureId = params.id as string;

  const [loading, setLoading] = useState(false);
  const [existingPeople, setExistingPeople] = useState<ExistingPerson[]>([]);
  const [loadingPeople, setLoadingPeople] = useState(true);

  // Form per nuovo personale
  const [newPersonForm, setNewPersonForm] = useState({
    firstName: "",
    lastName: "",
    fiscalCode: "",
    email: "",
    phone: "",
    hireDate: "",
    birthDate: "",
    notes: "",
    isPrimary: false,
  });

  useEffect(() => {
    loadExistingPeople();
  }, []);

  const loadExistingPeople = async () => {
    try {
      const response = await fetch("/api/people");
      if (!response.ok) throw new Error("Errore nel caricamento");
      const data = await response.json();

      // Filtra le persone non ancora assegnate a questa struttura
      const filtered = data.filter(
        (person: ExistingPerson) =>
          !person.structures.some((s) => s.structure.id === structureId),
      );

      setExistingPeople(filtered);
    } catch (error) {
      console.error("Errore:", error);
    } finally {
      setLoadingPeople(false);
    }
  };

  const handleCreateNew = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/people", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newPersonForm,
          structureId, // Assegna automaticamente alla struttura corrente
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Errore nella creazione del personale");
      }

      router.push(`/structures/${structureId}/people`);
    } catch (error) {
      console.error("Errore:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Errore nella creazione del personale",
      );
      setLoading(false);
    }
  };

  const handleAssignExisting = async (personId: string) => {
    setLoading(true);

    try {
      const response = await fetch(`/api/structures/${structureId}/people`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          personId,
          isPrimary: false,
          startDate: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          error.error || "Errore nell'assegnazione del personale",
        );
      }

      router.push(`/structures/${structureId}/people`);
    } catch (error) {
      console.error("Errore:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Errore nell'assegnazione del personale",
      );
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <Link
          href={`/structures/${structureId}/people`}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Torna al personale
        </Link>
      </div>

      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold tracking-tight mb-6">
          Aggiungi Personale
        </h1>

        <Tabs defaultValue="new" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="new">
              <UserPlus className="h-4 w-4 mr-2" />
              Crea Nuovo
            </TabsTrigger>
            <TabsTrigger value="existing">
              <Users className="h-4 w-4 mr-2" />
              Assegna Esistente
            </TabsTrigger>
          </TabsList>

          {/* Tab: Crea Nuovo Personale */}
          <TabsContent value="new">
            <Card>
              <CardHeader>
                <CardTitle>Crea Nuovo Personale</CardTitle>
                <CardDescription>
                  Aggiungi una nuova persona all'organizzazione e assegnala a
                  questa struttura
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateNew} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">Nome *</Label>
                      <Input
                        id="firstName"
                        required
                        value={newPersonForm.firstName}
                        onChange={(e) =>
                          setNewPersonForm({
                            ...newPersonForm,
                            firstName: e.target.value,
                          })
                        }
                        placeholder="Mario"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Cognome *</Label>
                      <Input
                        id="lastName"
                        required
                        value={newPersonForm.lastName}
                        onChange={(e) =>
                          setNewPersonForm({
                            ...newPersonForm,
                            lastName: e.target.value,
                          })
                        }
                        placeholder="Rossi"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="fiscalCode">Codice Fiscale</Label>
                    <Input
                      id="fiscalCode"
                      value={newPersonForm.fiscalCode}
                      onChange={(e) =>
                        setNewPersonForm({
                          ...newPersonForm,
                          fiscalCode: e.target.value,
                        })
                      }
                      placeholder="RSSMRA80A01H501U"
                      maxLength={16}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={newPersonForm.email}
                        onChange={(e) =>
                          setNewPersonForm({
                            ...newPersonForm,
                            email: e.target.value,
                          })
                        }
                        placeholder="mario.rossi@example.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Telefono</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={newPersonForm.phone}
                        onChange={(e) =>
                          setNewPersonForm({
                            ...newPersonForm,
                            phone: e.target.value,
                          })
                        }
                        placeholder="+39 123 456 7890"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="hireDate">Data Assunzione</Label>
                      <Input
                        id="hireDate"
                        type="date"
                        value={newPersonForm.hireDate}
                        onChange={(e) =>
                          setNewPersonForm({
                            ...newPersonForm,
                            hireDate: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="birthDate">Data di Nascita</Label>
                      <Input
                        id="birthDate"
                        type="date"
                        value={newPersonForm.birthDate}
                        onChange={(e) =>
                          setNewPersonForm({
                            ...newPersonForm,
                            birthDate: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="notes">Note</Label>
                    <Textarea
                      id="notes"
                      value={newPersonForm.notes}
                      onChange={(e) =>
                        setNewPersonForm({
                          ...newPersonForm,
                          notes: e.target.value,
                        })
                      }
                      placeholder="Note aggiuntive..."
                      rows={3}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isPrimary"
                      checked={newPersonForm.isPrimary}
                      onCheckedChange={(checked: boolean) =>
                        setNewPersonForm({
                          ...newPersonForm,
                          isPrimary: checked === true,
                        })
                      }
                    />
                    <Label
                      htmlFor="isPrimary"
                      className="text-sm font-normal cursor-pointer"
                    >
                      Imposta questa come struttura principale per il dipendente
                    </Label>
                  </div>

                  <div className="flex justify-end gap-4 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() =>
                        router.push(`/structures/${structureId}/people`)
                      }
                      disabled={loading}
                    >
                      Annulla
                    </Button>
                    <Button type="submit" disabled={loading}>
                      {loading ? "Creazione in corso..." : "Crea e Assegna"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Assegna Personale Esistente */}
          <TabsContent value="existing">
            <Card>
              <CardHeader>
                <CardTitle>Assegna Personale Esistente</CardTitle>
                <CardDescription>
                  Seleziona una persona già presente nell'organizzazione per
                  assegnarla a questa struttura
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingPeople ? (
                  <p className="text-center text-muted-foreground py-8">
                    Caricamento...
                  </p>
                ) : existingPeople.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    Nessun personale disponibile da assegnare. Tutto il
                    personale dell'organizzazione è già assegnato a questa
                    struttura.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {existingPeople.map((person) => (
                      <div
                        key={person.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div>
                          <h3 className="font-semibold">
                            {person.firstName} {person.lastName}
                          </h3>
                          {person.email && (
                            <p className="text-sm text-muted-foreground">
                              {person.email}
                            </p>
                          )}
                          {person.fiscalCode && (
                            <p className="text-xs text-muted-foreground">
                              CF: {person.fiscalCode}
                            </p>
                          )}
                          {person.structures.length > 0 && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Assegnato a:{" "}
                              {person.structures
                                .map((s) => s.structure.name)
                                .join(", ")}
                            </p>
                          )}
                        </div>
                        <Button
                          onClick={() => handleAssignExisting(person.id)}
                          disabled={loading}
                        >
                          Assegna
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
