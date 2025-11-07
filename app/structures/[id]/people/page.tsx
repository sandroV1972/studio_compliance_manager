"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Mail, Phone, Calendar, User } from "lucide-react";

interface Person {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  fiscalCode: string | null;
  hireDate: string | null;
  active: boolean;
  structures: Array<{
    structureId: string;
    isPrimary: boolean;
  }>;
}

export default function PeoplePage() {
  const params = useParams();
  const router = useRouter();
  const structureId = params.id as string;

  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPeople();
  }, [structureId]);

  const loadPeople = async () => {
    try {
      const response = await fetch(`/api/structures/${structureId}/people`);
      if (!response.ok) throw new Error("Errore nel caricamento");
      const data = await response.json();
      setPeople(data);
    } catch (error) {
      console.error("Errore:", error);
    } finally {
      setLoading(false);
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
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Personale</h2>
          <p className="text-muted-foreground">
            Gestisci il personale della struttura
          </p>
        </div>
        <Button
          onClick={() => router.push(`/structures/${structureId}/people/new`)}
        >
          <Plus className="mr-2 h-4 w-4" />
          Aggiungi Personale
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista Personale</CardTitle>
          <CardDescription>
            {people.length} {people.length === 1 ? "persona" : "persone"}{" "}
            assegnate a questa struttura
          </CardDescription>
        </CardHeader>
        <CardContent>
          {people.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Nessun membro del personale trovato
            </p>
          ) : (
            <div className="space-y-4">
              {people.map((person) => {
                const isPrimary = person.structures.some(
                  (s) => s.structureId === structureId && s.isPrimary,
                );

                return (
                  <div
                    key={person.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                        <User className="h-6 w-6 text-purple-600" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">
                            {person.firstName} {person.lastName}
                          </h3>
                          {isPrimary && (
                            <Badge variant="default">
                              Struttura Principale
                            </Badge>
                          )}
                          {!person.active && (
                            <Badge variant="secondary">Non Attivo</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          {person.email && (
                            <div className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {person.email}
                            </div>
                          )}
                          {person.phone && (
                            <div className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {person.phone}
                            </div>
                          )}
                          {person.hireDate && (
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Assunto:{" "}
                              {new Date(person.hireDate).toLocaleDateString(
                                "it-IT",
                                {
                                  day: "2-digit",
                                  month: "2-digit",
                                  year: "numeric",
                                },
                              )}
                            </div>
                          )}
                        </div>
                        {person.fiscalCode && (
                          <p className="text-xs text-muted-foreground">
                            CF: {person.fiscalCode}
                          </p>
                        )}
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Dettagli
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
