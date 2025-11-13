"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserPlus, Mail, Calendar, Trash2, Users } from "lucide-react";
import { InviteUserModal } from "@/components/users/invite-user-modal";

interface Invite {
  id: string;
  email: string;
  role: string;
  expiresAt: string;
  createdAt: string;
  structure: {
    id: string;
    name: string;
  } | null;
  inviter: {
    name: string | null;
    email: string;
  };
}

interface OrganizationUser {
  id: string;
  role: string;
  structureId: string | null;
  user: {
    id: string;
    name: string | null;
    email: string;
  };
  structure: {
    id: string;
    name: string;
  } | null;
}

export default function UsersPage() {
  const [invites, setInvites] = useState<Invite[]>([]);
  const [users, setUsers] = useState<OrganizationUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [invitesRes, usersRes] = await Promise.all([
        fetch("/api/invites"),
        fetch("/api/user/organization"),
      ]);

      if (invitesRes.ok) {
        const invitesData = await invitesRes.json();
        setInvites(invitesData.invites || []);
      }

      if (usersRes.ok) {
        const result = await usersRes.json();
        const orgData = result.data || result;
        // Ottieni gli utenti dell'organizzazione
        const orgUsersRes = await fetch(
          `/api/organizations/${orgData.id}/users`,
        );
        if (orgUsersRes.ok) {
          const usersData = await orgUsersRes.json();
          setUsers(usersData.users || []);
        }
      }
    } catch (error) {
      console.error("Errore caricamento dati:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInviteSuccess = () => {
    setIsInviteModalOpen(false);
    loadData();
  };

  const handleDeleteInvite = async (inviteId: string) => {
    if (!confirm("Sei sicuro di voler revocare questo invito?")) return;

    try {
      const response = await fetch(`/api/invites/${inviteId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        loadData();
      } else {
        const error = await response.json();
        alert(error.error || "Errore nella revoca dell'invito");
      }
    } catch (error) {
      console.error("Errore:", error);
      alert("Errore nella revoca dell'invito");
    }
  };

  const getRoleBadge = (role: string) => {
    const colors: Record<string, string> = {
      OWNER: "bg-purple-500",
      ADMIN: "bg-blue-500",
      MANAGER: "bg-green-500",
      OPERATOR: "bg-orange-500",
    };

    const labels: Record<string, string> = {
      OWNER: "Proprietario",
      ADMIN: "Amministratore",
      MANAGER: "Manager",
      OPERATOR: "Operatore",
    };

    return (
      <Badge className={`${colors[role] || "bg-gray-500"} text-white`}>
        {labels[role] || role}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("it-IT", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getDaysUntilExpiry = (expiresAt: string) => {
    const expiry = new Date(expiresAt);
    const today = new Date();
    const diffTime = expiry.getTime() - today.getTime();
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

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Gestione Utenti</h2>
          <p className="text-muted-foreground">
            Invita nuovi utenti e gestisci i membri della tua organizzazione
          </p>
        </div>
        <Button onClick={() => setIsInviteModalOpen(true)}>
          <UserPlus className="mr-2 h-4 w-4" />
          Invita Utente
        </Button>
      </div>

      {/* Utenti Attivi */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Utenti Attivi
          </CardTitle>
          <CardDescription>
            {users.length} {users.length === 1 ? "utente" : "utenti"}{" "}
            nell'organizzazione
          </CardDescription>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Nessun utente trovato
            </p>
          ) : (
            <div className="space-y-3">
              {users.map((orgUser) => (
                <div
                  key={orgUser.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-medium">
                        {orgUser.user.name || orgUser.user.email}
                      </h4>
                      {getRoleBadge(orgUser.role)}
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Mail className="h-4 w-4" />
                        {orgUser.user.email}
                      </div>
                      {orgUser.structure && (
                        <Badge variant="outline" className="text-purple-700">
                          {orgUser.structure.name}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Inviti Pendenti */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Inviti Pendenti
          </CardTitle>
          <CardDescription>
            {invites.length} {invites.length === 1 ? "invito" : "inviti"} in
            attesa di conferma
          </CardDescription>
        </CardHeader>
        <CardContent>
          {invites.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Nessun invito pendente
            </p>
          ) : (
            <div className="space-y-3">
              {invites.map((invite) => {
                const daysUntilExpiry = getDaysUntilExpiry(invite.expiresAt);
                const isExpiringSoon = daysUntilExpiry <= 2;

                return (
                  <div
                    key={invite.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-medium">{invite.email}</h4>
                        {getRoleBadge(invite.role)}
                        {invite.structure && (
                          <Badge variant="outline" className="text-purple-700">
                            {invite.structure.name}
                          </Badge>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          Invitato il {formatDate(invite.createdAt)}
                        </div>
                        <div
                          className={
                            isExpiringSoon ? "text-orange-600 font-medium" : ""
                          }
                        >
                          Scade{" "}
                          {daysUntilExpiry > 0
                            ? `tra ${daysUntilExpiry} giorni`
                            : "oggi"}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteInvite(invite.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-medium text-blue-900 mb-2">
          Informazioni sui Ruoli
        </h3>
        <ul className="text-sm text-blue-800 space-y-2">
          <li>
            <strong>Proprietario (OWNER):</strong> Ha accesso completo a tutte
            le funzionalità dell'organizzazione. Può gestire utenti, strutture e
            template.
          </li>
          <li>
            <strong>Amministratore (ADMIN):</strong> Può gestire tutte le
            strutture e gli adempimenti dell'organizzazione, ma non può gestire
            gli utenti.
          </li>
          <li>
            <strong>Manager (MANAGER):</strong> Gestisce una struttura
            specifica. Può creare e modificare scadenze e documenti per la
            propria struttura.
          </li>
          <li>
            <strong>Operatore (OPERATOR):</strong> Può visualizzare e caricare
            documenti per una struttura specifica, ma non può modificare
            scadenze.
          </li>
        </ul>
      </div>

      <InviteUserModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        onSuccess={handleInviteSuccess}
      />
    </div>
  );
}
