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
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Calendar,
  Building2,
  FileText,
  Edit,
} from "lucide-react";

interface Person {
  id: string;
  firstName: string;
  lastName: string;
  fiscalCode: string | null;
  email: string | null;
  phone: string | null;
  hireDate: string | null;
  birthDate: string | null;
  notes: string | null;
  active: boolean;
  organizationId: string;
  structures: Array<{
    id: string;
    structureId: string;
    isPrimary: boolean;
    startDate: string | null;
    endDate: string | null;
    structure: {
      id: string;
      name: string;
      city: string | null;
    };
  }>;
  roleAssignments: Array<{
    id: string;
    roleTemplate: {
      id: string;
      key: string;
      label: string;
    };
  }>;
}

export default function PersonDetailPage() {
  const params = useParams();
  const router = useRouter();
  const structureId = params.id as string;
  const personId = params.personId as string;

  const [person, setPerson] = useState<Person | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPerson();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [personId]);

  const loadPerson = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/people/${personId}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Persona non trovata");
      }
      const data = await response.json();
      setPerson(data);
    } catch (error) {
      console.error("Errore:", error);
      setError(
        error instanceof Error ? error.message : "Errore nel caricamento",
      );
      setPerson(null);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("it-IT", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Caricamento...</div>
      </div>
    );
  }

  if (!person) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              {error || "Persona non trovata"}
            </p>
            <div className="flex justify-center mt-4">
              <Button
                variant="outline"
                onClick={() => router.push(`/structures/${structureId}/people`)}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Torna al Personale
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentStructure = person.structures.find(
    (s) => s.structureId === structureId,
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/structures/${structureId}/people`)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Torna al Personale
          </Button>
        </div>
        <Button
          variant="outline"
          onClick={() =>
            router.push(`/structures/${structureId}/people/${personId}/edit`)
          }
        >
          <Edit className="h-4 w-4 mr-2" />
          Modifica
        </Button>
      </div>

      {/* Person Header Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-purple-100 flex items-center justify-center">
                <User className="h-8 w-8 text-purple-600" />
              </div>
              <div>
                <CardTitle className="text-2xl">
                  {person.firstName} {person.lastName}
                </CardTitle>
                <CardDescription>
                  {person.fiscalCode || "Codice fiscale non disponibile"}
                </CardDescription>
              </div>
            </div>
            <div className="flex gap-2">
              {person.active ? (
                <Badge variant="default">Attivo</Badge>
              ) : (
                <Badge variant="secondary">Non Attivo</Badge>
              )}
              {currentStructure?.isPrimary && (
                <Badge variant="outline">Struttura Principale</Badge>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Info Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Informazioni di Contatto */}
        <Card>
          <CardHeader>
            <CardTitle>Informazioni di Contatto</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Email</p>
                <p className="text-sm text-muted-foreground">
                  {person.email || "Non disponibile"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Telefono</p>
                <p className="text-sm text-muted-foreground">
                  {person.phone || "Non disponibile"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Informazioni Anagrafiche */}
        <Card>
          <CardHeader>
            <CardTitle>Informazioni Anagrafiche</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Data di Nascita</p>
                <p className="text-sm text-muted-foreground">
                  {formatDate(person.birthDate)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Data di Assunzione</p>
                <p className="text-sm text-muted-foreground">
                  {formatDate(person.hireDate)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Strutture Assegnate */}
      <Card>
        <CardHeader>
          <CardTitle>Strutture Assegnate</CardTitle>
          <CardDescription>
            {person.structures.length}{" "}
            {person.structures.length === 1 ? "struttura" : "strutture"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {person.structures.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nessuna struttura assegnata
            </p>
          ) : (
            <div className="space-y-3">
              {person.structures.map((ps) => (
                <div
                  key={ps.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <Building2 className="h-4 w-4 text-purple-600" />
                    <div>
                      <p className="font-medium">{ps.structure.name}</p>
                      {ps.structure.city && (
                        <p className="text-sm text-muted-foreground">
                          {ps.structure.city}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {ps.isPrimary && (
                      <Badge variant="default">Principale</Badge>
                    )}
                    {ps.startDate && (
                      <span className="text-xs text-muted-foreground">
                        Dal: {formatDate(ps.startDate)}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Ruoli Assegnati */}
      <Card>
        <CardHeader>
          <CardTitle>Ruoli Assegnati</CardTitle>
          <CardDescription>
            {person.roleAssignments.length}{" "}
            {person.roleAssignments.length === 1 ? "ruolo" : "ruoli"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {person.roleAssignments.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nessun ruolo assegnato
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {person.roleAssignments.map((ra) => (
                <Badge key={ra.id} variant="outline">
                  {ra.roleTemplate.label}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Note */}
      {person.notes && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Note
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{person.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
