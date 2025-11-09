"use client";

import { useState, useEffect } from "react";
import {
  FileText,
  Download,
  Trash2,
  AlertCircle,
  CheckCircle,
  Calendar,
  Upload,
} from "lucide-react";
import UploadDocumentModal from "./upload-document-modal";

interface Document {
  id: string;
  fileName: string;
  fileType: string | null;
  fileSize: number;
  expiryDate: string | null;
  isExpired: boolean;
  notes: string | null;
  createdAt: string;
  uploadedBy: {
    id: string;
    name: string | null;
    email: string;
  } | null;
  documentTemplate: {
    id: string;
    name: string;
    category: string | null;
    isMandatory: boolean;
  } | null;
}

interface DocumentsListProps {
  organizationId: string;
  structureId: string;
  structureName: string;
}

export default function DocumentsList({
  organizationId,
  structureId,
  structureName,
}: DocumentsListProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    loadDocuments();
  }, [organizationId, structureId]);

  const loadDocuments = async () => {
    setLoading(true);
    try {
      // Carica tutti i documenti della struttura (inclusi quelli delle persone)
      const endpoint = `/api/organizations/${organizationId}/structures/${structureId}/documents`;

      const response = await fetch(endpoint);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Errore caricamento documenti");
      }
      const data = await response.json();
      setDocuments(data.documents || []);
    } catch (error) {
      console.error("Errore caricamento documenti:", error);
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (documentId: string, fileName: string) => {
    try {
      const response = await fetch(
        `/api/organizations/${organizationId}/documents/${documentId}`,
      );
      if (!response.ok) throw new Error("Errore download documento");

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
      console.error("Errore download documento:", error);
      alert("Errore durante il download del documento");
    }
  };

  const handleDelete = async (documentId: string) => {
    if (
      !confirm(
        "Sei sicuro di voler eliminare questo documento? Questa azione non può essere annullata.",
      )
    ) {
      return;
    }

    setDeletingId(documentId);
    try {
      const response = await fetch(
        `/api/organizations/${organizationId}/documents/${documentId}`,
        {
          method: "DELETE",
        },
      );

      if (!response.ok) throw new Error("Errore eliminazione documento");

      // Ricarica la lista
      await loadDocuments();
    } catch (error) {
      console.error("Errore eliminazione documento:", error);
      alert("Errore durante l'eliminazione del documento");
    } finally {
      setDeletingId(null);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("it-IT", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getExpiryStatus = (doc: Document) => {
    if (!doc.expiryDate) return null;

    const expiryDate = new Date(doc.expiryDate);
    const today = new Date();
    const daysUntilExpiry = Math.floor(
      (expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (doc.isExpired || daysUntilExpiry < 0) {
      return {
        label: "Scaduto",
        color: "text-red-700 bg-red-50 border-red-200",
        icon: AlertCircle,
      };
    } else if (daysUntilExpiry <= 30) {
      return {
        label: `Scade tra ${daysUntilExpiry} giorni`,
        color: "text-orange-700 bg-orange-50 border-orange-200",
        icon: AlertCircle,
      };
    } else if (daysUntilExpiry <= 60) {
      return {
        label: `Scade tra ${daysUntilExpiry} giorni`,
        color: "text-yellow-700 bg-yellow-50 border-yellow-200",
        icon: Calendar,
      };
    } else {
      return {
        label: `Scade il ${formatDate(doc.expiryDate)}`,
        color: "text-green-700 bg-green-50 border-green-200",
        icon: CheckCircle,
      };
    }
  };

  // Raggruppa i documenti per categoria
  const groupedDocuments = documents.reduce(
    (acc, doc) => {
      const category = doc.documentTemplate?.category || "Altro";
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(doc);
      return acc;
    },
    {} as Record<string, Document[]>,
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Documenti</h3>
          <p className="text-sm text-gray-500 mt-1">
            {documents.length} documento{documents.length !== 1 ? "i" : ""}
          </p>
        </div>
        <button
          onClick={() => setIsUploadModalOpen(true)}
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 flex items-center justify-center gap-2 whitespace-nowrap"
        >
          <Upload className="w-4 h-4" />
          <span className="hidden sm:inline">Carica Documento</span>
          <span className="sm:hidden">Carica</span>
        </button>
      </div>

      {/* Documenti */}
      {documents.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-2">Nessun documento caricato</p>
          <p className="text-sm text-gray-500">
            Clicca su "Carica Documento" per iniziare
          </p>
        </div>
      ) : (
        <div className="space-y-4 sm:space-y-6">
          {Object.entries(groupedDocuments).map(([category, docs]) => (
            <div key={category} className="space-y-2 sm:space-y-3">
              <h4 className="text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wide px-1">
                {category}
              </h4>
              <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-200">
                {docs.map((doc) => {
                  const expiryStatus = getExpiryStatus(doc);
                  const StatusIcon = expiryStatus?.icon;

                  return (
                    <div
                      key={doc.id}
                      className="p-3 sm:p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
                        <div className="flex items-start gap-2 sm:gap-3 flex-1 min-w-0">
                          <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h5 className="text-sm font-medium text-gray-900 break-words">
                                {doc.fileName}
                              </h5>
                              {doc.documentTemplate?.isMandatory && (
                                <span className="px-2 py-0.5 text-xs font-medium text-indigo-700 bg-indigo-50 rounded whitespace-nowrap">
                                  Obbligatorio
                                </span>
                              )}
                            </div>
                            {doc.documentTemplate && (
                              <p className="text-xs text-gray-500 mt-0.5">
                                {doc.documentTemplate.name}
                              </p>
                            )}
                            <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-2 text-xs text-gray-500">
                              <span>{formatFileSize(doc.fileSize)}</span>
                              <span className="hidden sm:inline">
                                Caricato il {formatDate(doc.createdAt)}
                              </span>
                              <span className="sm:hidden">
                                {formatDate(doc.createdAt)}
                              </span>
                              {doc.uploadedBy && (
                                <span className="hidden sm:inline">
                                  da{" "}
                                  {doc.uploadedBy.name || doc.uploadedBy.email}
                                </span>
                              )}
                            </div>
                            {doc.notes && (
                              <p className="text-sm text-gray-600 mt-2 italic break-words">
                                {doc.notes}
                              </p>
                            )}
                            {expiryStatus && (
                              <div
                                className={`flex items-center gap-2 mt-2 px-2 py-1 rounded border text-xs font-medium w-fit ${expiryStatus.color}`}
                              >
                                {StatusIcon && (
                                  <StatusIcon className="w-3.5 h-3.5" />
                                )}
                                {expiryStatus.label}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 justify-end sm:justify-start flex-shrink-0">
                          <button
                            onClick={() => handleDownload(doc.id, doc.fileName)}
                            className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="Download"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(doc.id)}
                            disabled={deletingId === doc.id}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                            title="Elimina"
                          >
                            {deletingId === doc.id ? (
                              <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      <UploadDocumentModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        organizationId={organizationId}
        structureId={structureId}
        structureName={structureName}
        onUploadSuccess={loadDocuments}
      />
    </div>
  );
}
