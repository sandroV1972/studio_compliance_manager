"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import DocumentsList from "@/components/documents/documents-list";

interface Structure {
  id: string;
  name: string;
  organizationId: string;
}

export default function DocumentsPage() {
  const params = useParams();
  const structureId = params.id as string;
  const [structure, setStructure] = useState<Structure | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStructure();
  }, [structureId]);

  const loadStructure = async () => {
    try {
      const response = await fetch(`/api/structures/${structureId}`);
      if (!response.ok) throw new Error("Errore caricamento struttura");
      const data = await response.json();
      setStructure(data);
    } catch (error) {
      console.error("Errore caricamento struttura:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!structure) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center text-red-600">Struttura non trovata</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <DocumentsList
        organizationId={structure.organizationId}
        structureId={structure.id}
        structureName={structure.name}
      />
    </div>
  );
}
