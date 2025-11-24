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
  Building2,
  Users,
  MapPin,
  Calendar as CalendarIcon,
  Phone,
  Mail,
  Edit,
  UserPlus,
  CalendarPlus,
  FileText,
  AlertCircle,
  Clock,
  CheckCircle2,
  User,
  Eye,
  Globe,
  Shield,
  Briefcase,
} from "lucide-react";
import { DeadlineCalendar } from "@/components/structures/deadline-calendar";
import { NewDeadlineModal } from "@/components/deadlines/new-deadline-modal";
import { NewPersonModal } from "@/components/people/new-person-modal";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

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
  pec: string | null;
  website: string | null;
  vatNumber: string | null;
  fiscalCode: string | null;
  responsiblePersonId: string | null;
  responsiblePerson?: {
    id: string;
    firstName: string;
    lastName: string;
  } | null;
  legalRepName: string | null;
  licenseNumber: string | null;
  licenseExpiry: string | null;
  insurancePolicy: string | null;
  insuranceExpiry: string | null;
  notes: string | null;
  active: boolean;
  _count: {
    personStructures: number;
    deadlineInstances: number;
  };
}

interface DeadlineInstance {
  id: string;
  title: string;
  dueDate: string;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "OVERDUE" | "CANCELLED";
  notes: string | null;
  person?: {
    id: string;
    firstName: string;
    lastName: string;
  } | null;
  template?: {
    title: string;
    complianceType: string;
  };
}

export default function StructureDashboard() {
  const params = useParams();
  const router = useRouter();
  const structureId = params.id as string;

  const [structure, setStructure] = useState<Structure | null>(null);
  const [upcomingDeadlines, setUpcomingDeadlines] = useState<
    DeadlineInstance[]
  >([]);
  const [allDeadlines, setAllDeadlines] = useState<DeadlineInstance[]>([]);
  const [loading, setLoading] = useState(true);
  const [isNewDeadlineModalOpen, setIsNewDeadlineModalOpen] = useState(false);
  const [isNewPersonModalOpen, setIsNewPersonModalOpen] = useState(false);
  const [organizationId, setOrganizationId] = useState<string>("");

  useEffect(() => {
    loadOrganization();
    loadData();
  }, [structureId]);

  const loadOrganization = async () => {
    try {
      const response = await fetch("/api/user/organization");
      if (!response.ok) return;
      const result = await response.json();
      const data = result.data || result;
      setOrganizationId(data.id);
    } catch (error) {
      console.error("Errore caricamento organizzazione:", error);
    }
  };

  const loadData = async () => {
    try {
      const [structureRes, upcomingRes, allRes] = await Promise.all([
        fetch(`/api/structures/${structureId}`),
        fetch(`/api/structures/${structureId}/deadlines?upcoming=true`),
        fetch(`/api/structures/${structureId}/deadlines`),
      ]);

      if (!structureRes.ok) throw new Error("Errore nel caricamento");

      const structureData = await structureRes.json();
      setStructure(structureData);

      if (upcomingRes.ok) {
        const deadlinesData = await upcomingRes.json();
        setUpcomingDeadlines(deadlinesData.slice(0, 5));
      }

      if (allRes.ok) {
        const allDeadlinesData = await allRes.json();
        setAllDeadlines(allDeadlinesData);
      }
    } catch (error) {
      console.error("Errore:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleNewDeadlineClose = () => {
    setIsNewDeadlineModalOpen(false);
    loadData(); // Ricarica le scadenze dopo la creazione
  };

  const handleNewPersonClose = () => {
    setIsNewPersonModalOpen(false);
    loadData(); // Ricarica i dati dopo l'aggiunta del personale
  };

  const getDeadlineStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return (
          <Badge variant="default" className="bg-green-500">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Completata
          </Badge>
        );
      case "PENDING":
        return (
          <Badge variant="secondary">
            <Clock className="h-3 w-3 mr-1" />
            In Attesa
          </Badge>
        );
      case "OVERDUE":
        return (
          <Badge variant="destructive">
            <AlertCircle className="h-3 w-3 mr-1" />
            Scaduta
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("it-IT", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getDaysUntil = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const diffTime = date.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
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
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Building2 className="h-8 w-8 text-purple-600" />
            {structure.name}
          </h1>
          {structure.code && (
            <p className="text-muted-foreground mt-1 mb-3">
              Codice: {structure.code}
            </p>
          )}

          {/* Informazioni Struttura inline */}
          <div className="flex flex-wrap gap-x-6 gap-y-2 mt-3 text-sm">
            {structure.address && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>
                  {structure.address}
                  {structure.city && (
                    <span className="text-muted-foreground">
                      {", "}
                      {structure.postalCode && `${structure.postalCode} `}
                      {structure.city}
                      {structure.province && ` (${structure.province})`}
                    </span>
                  )}
                </span>
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
          </div>
        </div>
        <div className="flex gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Visualizza Dettagli
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
              <DialogHeader className="pb-4 border-b">
                <DialogTitle className="flex items-center gap-2 text-xl">
                  <Building2 className="h-6 w-6 text-purple-600" />
                  {structure.name}
                </DialogTitle>
                {structure.code && (
                  <p className="text-sm text-muted-foreground">
                    Codice: {structure.code}
                  </p>
                )}
              </DialogHeader>

              <div className="space-y-6 pt-4">
                {/* Sezione Informazioni Generali */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-purple-700 uppercase tracking-wide flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Sede e Contatti
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    {structure.address && (
                      <div className="flex gap-3">
                        <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            {structure.address}
                          </p>
                          {(structure.city ||
                            structure.postalCode ||
                            structure.province) && (
                            <p className="text-sm text-gray-600">
                              {structure.postalCode &&
                                `${structure.postalCode} `}
                              {structure.city}
                              {structure.province && ` (${structure.province})`}
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {structure.phone && (
                        <div className="flex gap-3">
                          <Phone className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-xs text-gray-500">Telefono</p>
                            <a
                              href={`tel:${structure.phone}`}
                              className="text-sm font-medium text-blue-600 hover:underline"
                            >
                              {structure.phone}
                            </a>
                          </div>
                        </div>
                      )}

                      {structure.email && (
                        <div className="flex gap-3">
                          <Mail className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-xs text-gray-500">Email</p>
                            <a
                              href={`mailto:${structure.email}`}
                              className="text-sm font-medium text-blue-600 hover:underline break-all"
                            >
                              {structure.email}
                            </a>
                          </div>
                        </div>
                      )}

                      {structure.pec && (
                        <div className="flex gap-3">
                          <Mail className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-xs text-gray-500">PEC</p>
                            <a
                              href={`mailto:${structure.pec}`}
                              className="text-sm font-medium text-blue-600 hover:underline break-all"
                            >
                              {structure.pec}
                            </a>
                          </div>
                        </div>
                      )}

                      {structure.website && (
                        <div className="flex gap-3">
                          <Globe className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-xs text-gray-500">Sito Web</p>
                            <a
                              href={structure.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm font-medium text-blue-600 hover:underline break-all"
                            >
                              {structure.website}
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Sezione Dati Fiscali */}
                {(structure.vatNumber ||
                  structure.fiscalCode ||
                  structure.responsiblePerson ||
                  structure.legalRepName) && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-blue-700 uppercase tracking-wide flex items-center gap-2">
                      <Briefcase className="h-4 w-4" />
                      Dati Fiscali e Legali
                    </h3>
                    <div className="bg-blue-50 rounded-lg p-4 space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {structure.vatNumber && (
                          <div>
                            <p className="text-xs text-gray-500">Partita IVA</p>
                            <p className="text-sm font-medium text-gray-900">
                              {structure.vatNumber}
                            </p>
                          </div>
                        )}
                        {structure.fiscalCode && (
                          <div>
                            <p className="text-xs text-gray-500">
                              Codice Fiscale
                            </p>
                            <p className="text-sm font-medium text-gray-900">
                              {structure.fiscalCode}
                            </p>
                          </div>
                        )}
                      </div>

                      {structure.responsiblePerson && (
                        <div className="flex gap-3 pt-2 border-t border-blue-200">
                          <User className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-xs text-gray-500">
                              Persona Responsabile
                            </p>
                            <p className="text-sm font-medium text-gray-900">
                              {structure.responsiblePerson.firstName}{" "}
                              {structure.responsiblePerson.lastName}
                            </p>
                          </div>
                        </div>
                      )}

                      {structure.legalRepName && (
                        <div className="flex gap-3">
                          <Briefcase className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-xs text-gray-500">
                              Rappresentante Legale
                            </p>
                            <p className="text-sm font-medium text-gray-900">
                              {structure.legalRepName}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Sezione Autorizzazioni */}
                {(structure.licenseNumber ||
                  structure.licenseExpiry ||
                  structure.insurancePolicy ||
                  structure.insuranceExpiry) && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-green-700 uppercase tracking-wide flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Autorizzazioni e Assicurazioni
                    </h3>
                    <div className="bg-green-50 rounded-lg p-4 space-y-4">
                      {(structure.licenseNumber || structure.licenseExpiry) && (
                        <div>
                          <p className="text-xs text-gray-500 mb-2">
                            Autorizzazione Sanitaria
                          </p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {structure.licenseNumber && (
                              <div>
                                <p className="text-xs text-gray-500">Numero</p>
                                <p className="text-sm font-medium text-gray-900">
                                  {structure.licenseNumber}
                                </p>
                              </div>
                            )}
                            {structure.licenseExpiry && (
                              <div>
                                <p className="text-xs text-gray-500">
                                  Scadenza
                                </p>
                                <p className="text-sm font-medium text-gray-900">
                                  {formatDate(structure.licenseExpiry)}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {(structure.insurancePolicy ||
                        structure.insuranceExpiry) && (
                        <div className="pt-3 border-t border-green-200">
                          <p className="text-xs text-gray-500 mb-2">
                            Polizza Assicurativa
                          </p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {structure.insurancePolicy && (
                              <div>
                                <p className="text-xs text-gray-500">
                                  Numero Polizza
                                </p>
                                <p className="text-sm font-medium text-gray-900">
                                  {structure.insurancePolicy}
                                </p>
                              </div>
                            )}
                            {structure.insuranceExpiry && (
                              <div>
                                <p className="text-xs text-gray-500">
                                  Scadenza
                                </p>
                                <p className="text-sm font-medium text-gray-900">
                                  {formatDate(structure.insuranceExpiry)}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Sezione Note */}
                {structure.notes && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Note
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-900 whitespace-pre-wrap">
                        {structure.notes}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>

          <Button
            onClick={() => router.push(`/structures/${structureId}/edit`)}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Edit className="h-4 w-4" />
            Modifica Struttura
          </Button>
        </div>
      </div>

      {/* Tasti Rapidi */}
      <Card>
        <CardHeader>
          <CardTitle>Azioni Rapide</CardTitle>
          <CardDescription>
            Accesso veloce alle funzioni principali
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button
              variant="outline"
              className="h-20 flex flex-col gap-2"
              onClick={() => setIsNewPersonModalOpen(true)}
            >
              <UserPlus className="h-6 w-6 text-purple-600" />
              <span className="text-sm">Aggiungi Personale</span>
            </Button>
            <Button
              variant="outline"
              className="h-20 flex flex-col gap-2"
              onClick={() => setIsNewDeadlineModalOpen(true)}
            >
              <CalendarPlus className="h-6 w-6 text-blue-600" />
              <span className="text-sm">Nuova Scadenza</span>
            </Button>
            <Button
              variant="outline"
              className="h-20 flex flex-col gap-2"
              onClick={() =>
                router.push(`/structures/${structureId}/documents`)
              }
            >
              <FileText className="h-6 w-6 text-green-600" />
              <span className="text-sm">Documenti</span>
            </Button>
            <Button
              variant="outline"
              className="h-20 flex flex-col gap-2"
              onClick={() => router.push(`/structures/${structureId}/people`)}
            >
              <Users className="h-6 w-6 text-orange-600" />
              <span className="text-sm">Visualizza Personale</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Calendar & Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Calendar */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                Calendario Scadenze
              </CardTitle>
              <CardDescription>Visualizza le scadenze per mese</CardDescription>
            </CardHeader>
            <CardContent>
              <DeadlineCalendar deadlines={allDeadlines} />
            </CardContent>
          </Card>

          {/* Statistiche */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Personale</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <Users className="h-8 w-8 text-blue-600" />
                  <span className="text-3xl font-bold">
                    {structure._count.personStructures}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {structure._count.personStructures === 1
                    ? "persona assegnata"
                    : "persone assegnate"}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Scadenze Totali</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <CalendarIcon className="h-8 w-8 text-orange-600" />
                  <span className="text-3xl font-bold">
                    {structure._count.deadlineInstances}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  scadenze totali registrate
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right Column - Upcoming Deadlines */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Prossime Scadenze</CardTitle>
              <CardDescription>Le 5 scadenze più imminenti</CardDescription>
            </CardHeader>
            <CardContent>
              {upcomingDeadlines.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CalendarIcon className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-sm">Nessuna scadenza in arrivo</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {upcomingDeadlines.map((deadline) => {
                    const daysUntil = getDaysUntil(deadline.dueDate);
                    return (
                      <div
                        key={deadline.id}
                        className="border-l-4 border-purple-500 pl-3 py-2 hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() =>
                          router.push(
                            `/structures/${structureId}/deadlines/${deadline.id}`,
                          )
                        }
                      >
                        <div className="flex items-start justify-between mb-1">
                          <div className="flex-1">
                            <h4 className="font-medium text-sm">
                              {deadline.title}
                            </h4>
                            <div className="flex items-center gap-1 mt-1">
                              {deadline.person ? (
                                <>
                                  <User className="h-3 w-3 text-purple-600" />
                                  <span className="text-xs text-purple-600 font-medium">
                                    {deadline.person.firstName}{" "}
                                    {deadline.person.lastName}
                                  </span>
                                </>
                              ) : (
                                <>
                                  <Building2 className="h-3 w-3 text-blue-600" />
                                  <span className="text-xs text-blue-600 font-medium">
                                    Struttura
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                          {getDeadlineStatusBadge(deadline.status)}
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">
                          {formatDate(deadline.dueDate)}
                        </p>
                        {daysUntil >= 0 ? (
                          <p className="text-xs font-medium text-orange-600">
                            {daysUntil === 0
                              ? "Scade oggi!"
                              : daysUntil === 1
                                ? "Scade domani"
                                : `Scade tra ${daysUntil} giorni`}
                          </p>
                        ) : (
                          <p className="text-xs font-medium text-red-600">
                            Scaduta {Math.abs(daysUntil)} giorni fa
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
              <Button
                variant="outline"
                className="w-full mt-4"
                onClick={() =>
                  router.push(`/structures/${structureId}/deadlines`)
                }
              >
                Visualizza Tutte le Scadenze
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modale Nuova Scadenza */}
      {organizationId && (
        <NewDeadlineModal
          isOpen={isNewDeadlineModalOpen}
          onClose={handleNewDeadlineClose}
          organizationId={organizationId}
        />
      )}

      {/* Modale Nuovo Personale */}
      <NewPersonModal
        isOpen={isNewPersonModalOpen}
        onClose={handleNewPersonClose}
        structureId={structureId}
      />
    </div>
  );
}
