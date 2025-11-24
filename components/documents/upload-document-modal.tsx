"use client";

import { useState, useEffect } from "react";
import { X, Upload, FileText, AlertCircle } from "lucide-react";
import { DatePicker } from "@/components/ui/date-picker";

interface DocumentTemplate {
  id: string;
  scope: string;
  name: string;
  description: string | null;
  category: string | null;
  isMandatory: boolean;
  hasExpiry: boolean;
  reminderDays: number | null;
  fileFormats: string | null;
  maxSizeKB: number | null;
  legalReference: string | null;
}

interface Person {
  id: string;
  firstName: string;
  lastName: string;
}

interface DeadlineInstance {
  id: string;
  title: string;
  dueDate: string;
  status: string;
  person?: {
    id: string;
    firstName: string;
    lastName: string;
  } | null;
  structure?: {
    id: string;
    name: string;
  } | null;
  template?: {
    id: string;
    title: string;
    requiredDocumentName: string | null;
  } | null;
}

interface UploadDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  organizationId: string;
  structureId: string;
  structureName: string;
  onUploadSuccess: () => void;
}

export default function UploadDocumentModal({
  isOpen,
  onClose,
  organizationId,
  structureId,
  structureName,
  onUploadSuccess,
}: UploadDocumentModalProps) {
  const [documentType, setDocumentType] = useState<"TEMPLATE" | "DEADLINE">(
    "TEMPLATE",
  );
  const [ownerType, setOwnerType] = useState<"STRUCTURE" | "PERSON">(
    "STRUCTURE",
  );
  const [selectedPersonId, setSelectedPersonId] = useState<string>("");
  const [selectedDeadlineId, setSelectedDeadlineId] = useState<string>("");

  const [people, setPeople] = useState<Person[]>([]);
  const [deadlines, setDeadlines] = useState<DeadlineInstance[]>([]);
  const [templates, setTemplates] = useState<DocumentTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] =
    useState<DocumentTemplate | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [expiryDate, setExpiryDate] = useState<Date | undefined>();
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      loadPeople();
    }
  }, [isOpen, organizationId]);

  useEffect(() => {
    if (isOpen && documentType === "DEADLINE") {
      loadDeadlines();
    }
  }, [isOpen, documentType, organizationId, structureId]);

  useEffect(() => {
    if (isOpen && documentType === "TEMPLATE") {
      loadTemplates();
    }
  }, [isOpen, documentType, ownerType, organizationId]);

  const loadPeople = async () => {
    try {
      const response = await fetch(
        `/api/organizations/${organizationId}/people`,
      );
      if (!response.ok) throw new Error("Errore caricamento persone");
      const data = await response.json();
      setPeople(data.people || []);
    } catch (error) {
      console.error("Errore caricamento persone:", error);
    }
  };

  const loadDeadlines = async () => {
    try {
      // Carica TUTTE le scadenze dell'organizzazione che richiedono documenti
      // Non filtrare per structureId perché vogliamo mostrare sia scadenze di persone che di strutture
      const response = await fetch(
        `/api/organizations/${organizationId}/deadlines?requiresDocument=true`,
      );
      if (!response.ok) throw new Error("Errore caricamento scadenze");
      const result = await response.json();
      // L'API restituisce una risposta paginata con { data: [...], metadata: {...}, stats: {...} }
      setDeadlines(result.data || []);
    } catch (error) {
      console.error("Errore caricamento scadenze:", error);
      setDeadlines([]);
    }
  };

  const loadTemplates = async () => {
    try {
      const response = await fetch(
        `/api/organizations/${organizationId}/document-templates?scope=${ownerType}`,
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Errore caricamento template");
      }
      const data = await response.json();
      console.log("Template ricevuti:", data);
      setTemplates(data.templates || []);
    } catch (error) {
      console.error("Errore caricamento template:", error);
      setError("Impossibile caricare i template documenti");
      setTemplates([]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError("");

      // Verifica formato se template selezionato
      if (selectedTemplate?.fileFormats) {
        const allowedFormats = selectedTemplate.fileFormats
          .split(",")
          .map((f) => f.trim().toLowerCase());
        const fileExtension = selectedFile.name.split(".").pop()?.toLowerCase();
        if (fileExtension && !allowedFormats.includes(fileExtension)) {
          setError(
            `Formato file non valido. Formati accettati: ${selectedTemplate.fileFormats}`,
          );
        }
      }

      // Verifica dimensione se template selezionato
      if (
        selectedTemplate?.maxSizeKB &&
        selectedFile.size > selectedTemplate.maxSizeKB * 1024
      ) {
        setError(
          `File troppo grande. Dimensione massima: ${selectedTemplate.maxSizeKB}KB`,
        );
      }
    }
  };

  const handleTemplateChange = (templateId: string) => {
    const template = templates.find((t) => t.id === templateId) || null;
    setSelectedTemplate(template);

    // Reset file se non compatibile con il nuovo template
    if (file && template) {
      if (template.fileFormats) {
        const allowedFormats = template.fileFormats
          .split(",")
          .map((f) => f.trim().toLowerCase());
        const fileExtension = file.name.split(".").pop()?.toLowerCase();
        if (fileExtension && !allowedFormats.includes(fileExtension)) {
          setFile(null);
          setError(
            `Il file selezionato non è compatibile. Formati accettati: ${template.fileFormats}`,
          );
        }
      }

      if (template.maxSizeKB && file.size > template.maxSizeKB * 1024) {
        setFile(null);
        setError(
          `Il file selezionato è troppo grande. Dimensione massima: ${template.maxSizeKB}KB`,
        );
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!file) {
      setError("Seleziona un file da caricare");
      return;
    }

    // Validazioni specifiche per tipo documento
    if (documentType === "TEMPLATE") {
      if (ownerType === "PERSON" && !selectedPersonId) {
        setError("Seleziona una persona");
        return;
      }

      if (selectedTemplate?.hasExpiry && !expiryDate) {
        setError(
          "La data di scadenza è obbligatoria per questo tipo di documento",
        );
        return;
      }
    } else if (documentType === "DEADLINE") {
      if (!selectedDeadlineId) {
        setError("Seleziona una scadenza");
        return;
      }
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      if (documentType === "TEMPLATE") {
        if (selectedTemplate) {
          formData.append("templateId", selectedTemplate.id);
        }
        if (expiryDate) {
          formData.append("expiryDate", expiryDate.toISOString());
        }
      }

      if (notes.trim()) {
        formData.append("notes", notes.trim());
      }

      let endpoint: string;
      if (documentType === "DEADLINE") {
        endpoint = `/api/organizations/${organizationId}/deadlines/${selectedDeadlineId}/documents`;
      } else {
        const targetId =
          ownerType === "PERSON" ? selectedPersonId : structureId;
        endpoint =
          ownerType === "PERSON"
            ? `/api/organizations/${organizationId}/people/${targetId}/documents`
            : `/api/organizations/${organizationId}/structures/${targetId}/documents`;
      }

      const response = await fetch(endpoint, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Errore durante l'upload");
      }

      onUploadSuccess();
      handleClose();
    } catch (error) {
      console.error("Errore upload documento:", error);
      setError(
        error instanceof Error ? error.message : "Errore durante l'upload",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setDocumentType("TEMPLATE");
    setOwnerType("STRUCTURE");
    setSelectedPersonId("");
    setSelectedDeadlineId("");
    setSelectedTemplate(null);
    setFile(null);
    setExpiryDate(undefined);
    setNotes("");
    setError("");
    onClose();
  };

  if (!isOpen) return null;

  // Raggruppa i template per categoria
  const groupedTemplates = templates.reduce(
    (acc, template) => {
      const category = template.category || "Altro";
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(template);
      return acc;
    },
    {} as Record<string, DocumentTemplate[]>,
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
          <div className="min-w-0 flex-1 mr-4">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
              Carica Documento
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1 truncate">
              Struttura: {structureName}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-500 flex-shrink-0"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-4 sm:p-6 space-y-4 sm:space-y-6"
        >
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Tipo di Documento */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Tipo di Documento <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setDocumentType("TEMPLATE");
                  setSelectedDeadlineId("");
                }}
                className={`px-4 py-3 border-2 rounded-lg transition-colors ${
                  documentType === "TEMPLATE"
                    ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                    : "border-gray-300 hover:border-gray-400"
                }`}
              >
                <FileText className="w-5 h-5 mx-auto mb-1" />
                <span className="text-sm font-medium">Documento Generico</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setDocumentType("DEADLINE");
                  setSelectedTemplate(null);
                }}
                className={`px-4 py-3 border-2 rounded-lg transition-colors ${
                  documentType === "DEADLINE"
                    ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                    : "border-gray-300 hover:border-gray-400"
                }`}
              >
                <FileText className="w-5 h-5 mx-auto mb-1" />
                <span className="text-sm font-medium">
                  Documento Obbligo Adempimenti
                </span>
              </button>
            </div>
          </div>

          {/* Se DEADLINE: Selezione Scadenza */}
          {documentType === "DEADLINE" && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Adempimento che richiede il documento{" "}
                <span className="text-red-500">*</span>
              </label>
              <p className="text-xs text-gray-500 mb-2">
                Seleziona l'adempimento per il quale stai caricando questo
                documento obbligatorio
              </p>
              <select
                value={selectedDeadlineId}
                onChange={(e) => setSelectedDeadlineId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="">Seleziona un adempimento...</option>
                {deadlines.map((deadline) => {
                  const assignedTo = deadline.person
                    ? `${deadline.person.firstName} ${deadline.person.lastName}`
                    : deadline.structure?.name || "Non assegnato";
                  return (
                    <option key={deadline.id} value={deadline.id}>
                      {deadline.title}
                      {deadline.template?.requiredDocumentName &&
                        ` - Richiede: ${deadline.template.requiredDocumentName}`}
                      {` - Assegnato a: ${assignedTo}`}
                      {" - Scadenza: "}
                      {new Date(deadline.dueDate).toLocaleDateString("it-IT")}
                      {` (${deadline.status})`}
                    </option>
                  );
                })}
              </select>
              {deadlines.length === 0 && (
                <p className="text-xs text-amber-600 mt-2">
                  ⚠️ Nessun adempimento che richiede documenti trovato. Crea
                  scadenze da template che richiedono documenti (es: RC
                  Professionale, Estintori, ecc.)
                </p>
              )}
            </div>
          )}

          {/* Se TEMPLATE: Selezione Owner Type e Persona/Struttura */}
          {documentType === "TEMPLATE" && (
            <>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Documento per <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setOwnerType("STRUCTURE");
                      setSelectedPersonId("");
                    }}
                    className={`px-4 py-2 border-2 rounded-lg transition-colors ${
                      ownerType === "STRUCTURE"
                        ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    <span className="text-sm font-medium">Struttura</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setOwnerType("PERSON");
                      setSelectedTemplate(null);
                    }}
                    className={`px-4 py-2 border-2 rounded-lg transition-colors ${
                      ownerType === "PERSON"
                        ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    <span className="text-sm font-medium">Persona</span>
                  </button>
                </div>
              </div>

              {ownerType === "PERSON" && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Seleziona Persona <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedPersonId}
                    onChange={(e) => setSelectedPersonId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="">Seleziona una persona...</option>
                    {people.map((person) => (
                      <option key={person.id} value={person.id}>
                        {person.firstName} {person.lastName}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Tipo Documento Template */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Tipo Documento{" "}
                  <span className="text-gray-400 font-normal">(opzionale)</span>
                </label>
                <select
                  value={selectedTemplate?.id || ""}
                  onChange={(e) => handleTemplateChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">Documento generico</option>
                  {Object.entries(groupedTemplates).map(([category, temps]) => (
                    <optgroup key={category} label={category}>
                      {temps.map((template) => (
                        <option key={template.id} value={template.id}>
                          {template.name}
                          {template.isMandatory ? " *" : ""}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
                {selectedTemplate && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-2">
                    {selectedTemplate.description && (
                      <p className="text-sm text-blue-900">
                        {selectedTemplate.description}
                      </p>
                    )}
                    {selectedTemplate.legalReference && (
                      <p className="text-xs text-blue-700">
                        Riferimento normativo: {selectedTemplate.legalReference}
                      </p>
                    )}
                    {selectedTemplate.fileFormats && (
                      <p className="text-xs text-blue-700">
                        Formati accettati: {selectedTemplate.fileFormats}
                      </p>
                    )}
                    {selectedTemplate.maxSizeKB && (
                      <p className="text-xs text-blue-700">
                        Dimensione massima: {selectedTemplate.maxSizeKB}KB
                      </p>
                    )}
                  </div>
                )}
              </div>
            </>
          )}

          {/* File Upload */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              File <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-4">
              <label className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-indigo-500 transition-colors">
                <Upload className="w-5 h-5 text-gray-400" />
                <span className="text-sm text-gray-600">
                  {file ? file.name : "Seleziona un file"}
                </span>
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="hidden"
                  accept={selectedTemplate?.fileFormats || undefined}
                />
              </label>
            </div>
            {file && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <FileText className="w-4 h-4" />
                <span>
                  {(file.size / 1024).toFixed(2)} KB -{" "}
                  {file.type || "Tipo sconosciuto"}
                </span>
              </div>
            )}
          </div>

          {/* Data di Scadenza */}
          {documentType === "TEMPLATE" && selectedTemplate?.hasExpiry && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Data di Scadenza <span className="text-red-500">*</span>
              </label>
              <DatePicker date={expiryDate} onDateChange={setExpiryDate} />
              {selectedTemplate.reminderDays && (
                <p className="text-xs text-gray-500">
                  Riceverai un promemoria {selectedTemplate.reminderDays} giorni
                  prima della scadenza
                </p>
              )}
            </div>
          )}

          {documentType === "TEMPLATE" && !selectedTemplate?.hasExpiry && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Data di Scadenza{" "}
                <span className="text-gray-400 font-normal">(opzionale)</span>
              </label>
              <DatePicker date={expiryDate} onDateChange={setExpiryDate} />
            </div>
          )}

          {/* Note */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Note{" "}
              <span className="text-gray-400 font-normal">(opzionale)</span>
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
              placeholder="Aggiungi note o dettagli aggiuntivi..."
            />
          </div>

          {/* Azioni */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
              disabled={loading}
            >
              Annulla
            </button>
            <button
              type="submit"
              disabled={loading || !file}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Caricamento...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Carica Documento
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
