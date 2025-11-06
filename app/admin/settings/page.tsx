"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Search, Building2, Users, Clock, ChevronRight, Database, Mail, Bell, Shield } from "lucide-react";

interface Organization {
  id: string;
  name: string;
  usersCount: number;
  deadlinesCount: number;
  createdAt: string;
}

export default function AdminSettingsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [filteredOrganizations, setFilteredOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrganizations();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredOrganizations(organizations);
    } else {
      const filtered = organizations.filter(org =>
        org.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredOrganizations(filtered);
    }
  }, [searchQuery, organizations]);

  const fetchOrganizations = async () => {
    try {
      const response = await fetch("/api/admin/organizations");
      if (response.ok) {
        const data = await response.json();
        setOrganizations(data);
        setFilteredOrganizations(data);
      }
    } catch (error) {
      console.error("Errore nel caricamento delle organizzazioni:", error);
    } finally {
      setLoading(false);
    }
  };

  const settingsSections = [
    {
      title: "Configurazione Database",
      description: "Gestione connessioni e backup del database",
      icon: Database,
      items: [
        { label: "Tipo Database", value: "PostgreSQL" },
        { label: "Stato Connessione", value: "Attiva", status: "success" },
        { label: "Ultimo Backup", value: "Non configurato", status: "warning" },
      ],
    },
    {
      title: "Notifiche Email",
      description: "Configurazione servizio email e template",
      icon: Mail,
      items: [
        { label: "Provider Email", value: "Non configurato", status: "warning" },
        { label: "Email Mittente", value: "noreply@example.com" },
        { label: "Template Attivi", value: "5" },
      ],
    },
    {
      title: "Notifiche Sistema",
      description: "Gestione notifiche e alert",
      icon: Bell,
      items: [
        { label: "Notifiche Scadenze", value: "Attive", status: "success" },
        { label: "Alert Amministratori", value: "Attivi", status: "success" },
        { label: "Frequenza Check", value: "Ogni ora" },
      ],
    },
    {
      title: "Sicurezza",
      description: "Impostazioni di sicurezza e autenticazione",
      icon: Shield,
      items: [
        { label: "Autenticazione 2FA", value: "Non configurata", status: "warning" },
        { label: "Sessioni Attive", value: "Gestite" },
        { label: "Password Policy", value: "Standard" },
      ],
    },
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Impostazioni Sistema</h2>
          <p className="text-muted-foreground">
            Configurazione globale dell'applicazione
          </p>
        </div>
        <Link href="/admin" className="text-sm text-blue-600 hover:underline">
          ← Torna alla dashboard
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-blue-600" />
            <CardTitle>Organizzazioni</CardTitle>
          </div>
          <CardDescription>
            Gestisci tutte le organizzazioni del sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Cerca organizzazione..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Caricamento organizzazioni...
            </div>
          ) : filteredOrganizations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchQuery ? "Nessuna organizzazione trovata" : "Nessuna organizzazione presente"}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredOrganizations.map((org) => (
                <Link
                  key={org.id}
                  href={`/admin/organizations/${org.id}`}
                  className="block"
                >
                  <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <Building2 className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold">{org.name}</h4>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {org.usersCount} utenti
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {org.deadlinesCount} scadenze
                          </span>
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {settingsSections.map((section) => {
          const Icon = section.icon;
          return (
            <Card key={section.title}>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Icon className="h-5 w-5 text-blue-600" />
                  <CardTitle>{section.title}</CardTitle>
                </div>
                <CardDescription>{section.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {section.items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between py-2 border-b last:border-0">
                      <span className="text-sm font-medium text-muted-foreground">
                        {item.label}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-semibold ${
                          item.status === 'success' ? 'text-green-600' :
                          item.status === 'warning' ? 'text-orange-600' :
                          'text-gray-900'
                        }`}>
                          {item.value}
                        </span>
                        {item.status === 'success' && (
                          <div className="h-2 w-2 rounded-full bg-green-600"></div>
                        )}
                        {item.status === 'warning' && (
                          <div className="h-2 w-2 rounded-full bg-orange-600"></div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
