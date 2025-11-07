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

export default function ReportsPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Report</h2>
          <p className="text-muted-foreground">
            Genera e visualizza report per l'organizzazione
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nuovo Report
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista Report</CardTitle>
          <CardDescription>Visualizza tutti i report generati</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">
            Nessun report trovato
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
