"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Plus, Edit, Settings } from "lucide-react";
import Link from "next/link";
import { NewDeadlineModal } from "@/components/deadlines/new-deadline-modal";
import EditDeadlineModal from "@/components/deadlines/edit-deadline-modal";
import { DeadlineDocumentsBadge } from "@/components/deadlines/deadline-documents-badge";

interface Deadline {
  id: string;
  title: string;
  dueDate: string;
  status: string;
  person: { id: string; firstName: string; lastName: string } | null;
  structure: { id: string; name: string } | null;
  template: {
    id: string;
    title: string;
    complianceType: string;
    requiredDocumentName: string | null;
  } | null;
  _count?: {
    documents?: number;
  };
}

export default function DeadlinesPage() {
  const params = useParams();
  const structureId = params.id as string;
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedDeadlineId, setSelectedDeadlineId] = useState<string>("");
  const [organizationId, setOrganizationId] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(20);

  const loadOrganization = useCallback(async () => {
    try {
      const response = await fetch("/api/user/organization");
      if (!response.ok) return;
      const result = await response.json();
      const data = result.data || result; // Support both envelope and direct response
      setOrganizationId(data.id);
    } catch (error) {
      console.error("Errore:", error);
    }
  }, []);

  const loadDeadlines = useCallback(async () => {
    try {
      const response = await fetch(`/api/structures/${structureId}/deadlines`);
      if (!response.ok) throw new Error("Errore nel caricamento");
      const data = await response.json();
      setDeadlines(data || []);
      setTotal(data.length || 0);
      // Calculate pagination from client-side data
      setTotalPages(Math.ceil((data.length || 0) / limit));
    } catch (error) {
      console.error("Errore caricamento scadenze:", error);
      setDeadlines([]);
      setTotalPages(1);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [structureId, limit]);

  useEffect(() => {
    loadOrganization();
  }, [loadOrganization]);

  useEffect(() => {
    if (organizationId) {
      loadDeadlines();
    }
  }, [organizationId, loadDeadlines]);

  const handleModalClose = () => {
    setIsModalOpen(false);
    loadDeadlines(); // Ricarica le scadenze dopo la creazione
  };

  const handleEditClick = (deadlineId: string) => {
    setSelectedDeadlineId(deadlineId);
    setIsEditModalOpen(true);
  };

  const handleEditModalClose = () => {
    setIsEditModalOpen(false);
    setSelectedDeadlineId("");
    loadDeadlines(); // Ricarica le scadenze dopo la modifica
  };

  const getStatusInfo = (status: string, dueDate: string) => {
    const isPast = new Date(dueDate) < new Date();

    if (status === "COMPLETED") {
      return {
        bgColor: "bg-green-500",
        label: "Completata",
      };
    }
    if (status === "IN_PROGRESS") {
      return {
        bgColor: "bg-blue-500",
        label: "In corso",
      };
    }
    if (status === "PENDING" && isPast) {
      return {
        bgColor: "bg-red-500",
        label: "In ritardo",
      };
    }
    return {
      bgColor: "bg-yellow-500",
      label: "In sospeso",
    };
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("it-IT", {
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

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Scadenze</h2>
          <p className="text-muted-foreground">
            Gestisci tutte le scadenze dell'organizzazione
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={`/structures/${structureId}/deadline-templates`}>
            <Button variant="outline">
              <Settings className="mr-2 h-4 w-4" />
              Gestisci Adempimenti
            </Button>
          </Link>
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nuova Scadenza
          </Button>
        </div>
      </div>

      <NewDeadlineModal
        organizationId={organizationId}
        isOpen={isModalOpen}
        onClose={handleModalClose}
      />

      {selectedDeadlineId && (
        <EditDeadlineModal
          organizationId={organizationId}
          deadlineId={selectedDeadlineId}
          isOpen={isEditModalOpen}
          onClose={handleEditModalClose}
          onSuccess={handleEditModalClose}
        />
      )}

      <Card>
        <CardHeader>
          <CardTitle>Tutte le Scadenze</CardTitle>
          <CardDescription>
            Lista completa delle scadenze in ordine cronologico ({total}{" "}
            {total === 1 ? "scadenza" : "scadenze"})
          </CardDescription>
        </CardHeader>
        <CardContent>
          {deadlines.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Nessuna scadenza trovata
            </p>
          ) : (
            <>
              <div className="space-y-4">
                {deadlines
                  .slice((currentPage - 1) * limit, currentPage * limit)
                  .map((deadline) => {
                    const statusInfo = getStatusInfo(
                      deadline.status,
                      deadline.dueDate,
                    );
                    return (
                      <div
                        key={deadline.id}
                        className="relative flex items-start justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors overflow-hidden"
                      >
                        {/* Fascia colorata a destra */}
                        <div
                          className={`absolute top-0 right-0 bottom-0 w-1.5 ${statusInfo.bgColor}`}
                        />

                        <div className="flex-1 pr-4">
                          <div className="font-medium text-lg">
                            {deadline.title}
                          </div>
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
                          {/* Bottone documenti sempre visibile */}
                          <div className="mt-3">
                            <DeadlineDocumentsBadge
                              organizationId={organizationId}
                              deadlineId={deadline.id}
                              requiredDocumentName={
                                deadline.template?.requiredDocumentName || null
                              }
                              structureId={structureId}
                              structureName={deadline.structure?.name || ""}
                            />
                          </div>
                        </div>

                        {/* Solo bottone Modifica a destra */}
                        <div className="flex items-start">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditClick(deadline.id)}
                            className="flex items-center gap-2"
                          >
                            <Edit className="h-4 w-4" />
                            Modifica
                          </Button>
                        </div>
                      </div>
                    );
                  })}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-4 border-t">
                  <div className="text-sm text-muted-foreground">
                    Pagina {currentPage} di {totalPages}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      Precedente
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={currentPage === totalPages}
                    >
                      Successiva
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
