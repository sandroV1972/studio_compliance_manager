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
import {
  Building2,
  Users,
  MapPin,
  Calendar,
  Phone,
  Mail,
  Edit,
} from "lucide-react";

interface Structure {
  id: string;
  name: string;
  code: string | null;
  address: string | null;
  city: string | null;
  province: string | null;
  postalCode: string | null;
  phone: string | null;
  email: string | null;
  active: boolean;
  _count: {
    personStructures: number;
    deadlineInstances: number;
  };
}

export default function StructureDashboard() {
  const params = useParams();
  const router = useRouter();
  const structureId = params.id as string;

  const [structure, setStructure] = useState<Structure | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [structureId]);

  const loadData = async () => {
    try {
      const response = await fetch(`/api/structures/${structureId}`);
      if (!response.ok) throw new Error("Errore nel caricamento");
      const data = await response.json();
      setStructure(data);
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

  if (!structure) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-red-600">Struttura non trovata</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Building2 className="h-8 w-8 text-purple-600" />
            {structure.name}
          </h1>
          {structure.code && (
            <p className="text-muted-foreground mt-1">
              Codice: {structure.code}
            </p>
          )}
        </div>
        <Button
          onClick={() => router.push(`/structures/${structureId}/edit`)}
          variant="outline"
          className="flex items-center gap-2"
        >
          <Edit className="h-4 w-4" />
          Modifica Struttura
        </Button>
      </div>

      {/* Info Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Informazioni Generali */}
        <Card>
          <CardHeader>
            <CardTitle>Informazioni Generali</CardTitle>
            <CardDescription>Dettagli sulla struttura</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {structure.address && (
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                <div>
                  <p>{structure.address}</p>
                  {structure.city && (
                    <p className="text-sm text-muted-foreground">
                      {structure.postalCode && `${structure.postalCode} `}
                      {structure.city}
                      {structure.province && ` (${structure.province})`}
                    </p>
                  )}
                </div>
              </div>
            )}

            {structure.email && (
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <a
                  href={`mailto:${structure.email}`}
                  className="text-blue-600 hover:underline"
                >
                  {structure.email}
                </a>
              </div>
            )}

            {structure.phone && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <a
                  href={`tel:${structure.phone}`}
                  className="text-blue-600 hover:underline"
                >
                  {structure.phone}
                </a>
              </div>
            )}

            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                Stato:{" "}
                <span
                  className={`font-medium ${structure.active ? "text-green-600" : "text-red-600"}`}
                >
                  {structure.active ? "Attiva" : "Non attiva"}
                </span>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Statistiche */}
        <Card>
          <CardHeader>
            <CardTitle>Statistiche</CardTitle>
            <CardDescription>Panoramica della struttura</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Personale</span>
                </div>
                <span className="text-2xl font-bold">
                  {structure._count.personStructures}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Scadenze</span>
                </div>
                <span className="text-2xl font-bold">
                  {structure._count.deadlineInstances}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Work in Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Funzionalità in Sviluppo</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Le sezioni Personale, Scadenze, Documenti e Report saranno
            disponibili a breve.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
