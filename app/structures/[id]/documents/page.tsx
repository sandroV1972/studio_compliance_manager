"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function DocumentsPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Documenti</h2>
          <p className="text-muted-foreground">
            Gestisci i documenti dell'organizzazione
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Carica Documento
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista Documenti</CardTitle>
          <CardDescription>
            Visualizza e gestisci tutti i documenti
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">
            Nessun documento trovato
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
