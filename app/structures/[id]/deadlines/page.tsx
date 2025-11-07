"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, AlertCircle, CheckCircle2, Clock, Plus } from "lucide-react";

interface Deadline {
  id: string;
  title: string;
  dueDate: string;
  status: string;
  person: { id: string; firstName: string; lastName: string } | null;
  structure: { id: string; name: string } | null;
  template: { id: string; title: string; complianceType: string } | null;
}

export default function DeadlinesPage() {
  const params = useParams();
  const organizationId = params.id as string;
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDeadlines();
  }, [organizationId]);

  const loadDeadlines = async () => {
    try {
      const response = await fetch(
        `/api/organizations/${organizationId}/deadlines`,
      );
      if (!response.ok) throw new Error("Errore nel caricamento");
      const data = await response.json();
      setDeadlines(data.deadlines);
    } catch (error) {
      console.error("Errore:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string, dueDate: string) => {
    const isPast = new Date(dueDate) < new Date();

    if (status === "DONE") {
      return (
        <Badge className="bg-green-500 text-white">
          <CheckCircle2 className="h-3 w-3 mr-1" />
          Completata
        </Badge>
      );
    }
    if (status === "PENDING" && isPast) {
      return (
        <Badge className="bg-red-500 text-white">
          <AlertCircle className="h-3 w-3 mr-1" />
          In ritardo
        </Badge>
      );
    }
    return (
      <Badge className="bg-yellow-500 text-white">
        <Clock className="h-3 w-3 mr-1" />
        In sospeso
      </Badge>
    );
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("it-IT", {
      day: "2-digit",
      month: "long",
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

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Scadenze</h2>
          <p className="text-muted-foreground">
            Gestisci tutte le scadenze dell'organizzazione
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nuova Scadenza
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tutte le Scadenze</CardTitle>
          <CardDescription>
            Lista completa delle scadenze in ordine cronologico
          </CardDescription>
        </CardHeader>
        <CardContent>
          {deadlines.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Nessuna scadenza trovata
            </p>
          ) : (
            <div className="space-y-4">
              {deadlines.map((deadline) => (
                <div
                  key={deadline.id}
                  className="flex items-start justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="font-medium text-lg">{deadline.title}</div>
                    {deadline.template && (
                      <div className="text-sm text-muted-foreground">
                        {deadline.template.title} -{" "}
                        {deadline.template.complianceType}
                      </div>
                    )}
                    {deadline.person && (
                      <div className="text-sm text-muted-foreground">
                        Persona: {deadline.person.firstName}{" "}
                        {deadline.person.lastName}
                      </div>
                    )}
                    {deadline.structure && (
                      <div className="text-sm text-muted-foreground">
                        Struttura: {deadline.structure.name}
                      </div>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {formatDate(deadline.dueDate)}
                      </span>
                    </div>
                  </div>
                  <div>{getStatusBadge(deadline.status, deadline.dueDate)}</div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
