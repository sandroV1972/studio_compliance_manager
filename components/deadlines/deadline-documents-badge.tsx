"use client";

import { useState, useEffect } from "react";
import { FileText, Upload, Download, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Document {
  id: string;
  fileName: string;
  fileSize: number;
  createdAt: string;
  uploadedBy: {
    name: string | null;
    email: string;
  } | null;
}

interface DeadlineDocumentsBadgeProps {
  organizationId: string;
  deadlineId: string;
  requiredDocumentName: string | null;
  structureId: string;
  structureName: string;
}

export function DeadlineDocumentsBadge({
  organizationId,
  deadlineId,
  requiredDocumentName,
  structureId,
  structureName,
}: DeadlineDocumentsBadgeProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Carica i documenti al mount per mostrare il conteggio
  useEffect(() => {
    loadDocuments();
  }, []);

  // Ricarica quando si riapre il dialog
  useEffect(() => {
    if (isDialogOpen) {
      loadDocuments();
    }
  }, [isDialogOpen]);

  const loadDocuments = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/organizations/${organizationId}/deadlines/${deadlineId}/documents`,
      );
      if (!response.ok) throw new Error("Errore caricamento documenti");
      const data = await response.json();
      setDocuments(data.documents || []);
    } catch (error) {
      console.error("Errore:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(
        `/api/organizations/${organizationId}/deadlines/${deadlineId}/documents`,
        {
          method: "POST",
          body: formData,
        },
      );

      if (!response.ok) throw new Error("Errore upload");
      await loadDocuments();
    } catch (error) {
      console.error("Errore:", error);
      alert("Errore durante il caricamento del documento");
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleUpload(file);
    }
  };

  const handleDelete = async (documentId: string) => {
    if (!confirm("Sei sicuro di voler eliminare questo documento?")) return;

    try {
      const response = await fetch(
        `/api/organizations/${organizationId}/documents/${documentId}`,
        { method: "DELETE" },
      );
      if (!response.ok) throw new Error("Errore eliminazione");
      await loadDocuments();
    } catch (error) {
      console.error("Errore:", error);
      alert("Errore durante l'eliminazione del documento");
    }
  };

  const handleDownload = async (documentId: string, fileName: string) => {
    try {
      const response = await fetch(
        `/api/organizations/${organizationId}/documents/${documentId}`,
      );
      if (!response.ok) throw new Error("Errore download");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Errore:", error);
      alert("Errore durante il download del documento");
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("it-IT", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!requiredDocumentName) return null;

  return (
    <>
      <Button
        variant={documents.length > 0 ? "default" : "outline"}
        size="sm"
        onClick={() => setIsDialogOpen(true)}
        className={`flex items-center gap-2 ${
          documents.length > 0
            ? "bg-green-600 hover:bg-green-700 text-white"
            : ""
        }`}
      >
        <FileText className="h-4 w-4" />
        Documenti
        {documents.length > 0 && (
          <Badge variant="secondary" className="ml-1 bg-white text-green-700">
            {documents.length}
          </Badge>
        )}
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Documenti Obbligatori</DialogTitle>
            <DialogDescription>
              Documento richiesto: <strong>{requiredDocumentName}</strong>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Upload Button */}
            <div className="flex justify-end">
              <label className="cursor-pointer">
                <Button size="sm" className="flex items-center gap-2" asChild>
                  <span>
                    <Upload className="h-4 w-4" />
                    Carica Documento
                  </span>
                </Button>
                <input
                  type="file"
                  onChange={handleFileSelect}
                  className="hidden"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                />
              </label>
            </div>

            {/* Documents List */}
            {loading ? (
              <div className="text-center py-8">Caricamento...</div>
            ) : documents.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                <p>Nessun documento caricato</p>
                <p className="text-sm mt-1">
                  Carica il documento richiesto: {requiredDocumentName}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <FileText className="h-5 w-5 text-gray-400 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">
                          {doc.fileName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {formatFileSize(doc.fileSize)} •{" "}
                          {formatDate(doc.createdAt)}
                          {doc.uploadedBy && (
                            <>
                              {" "}
                              • {doc.uploadedBy.name || doc.uploadedBy.email}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDownload(doc.id, doc.fileName)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(doc.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
