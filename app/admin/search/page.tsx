"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import Link from "next/link";

interface SearchResult {
  type: "user" | "organization" | "person" | "structure";
  id: string;
  title: string;
  subtitle: string;
  link: string;
}

export default function AdminSearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (searchQuery: string) => {
    setQuery(searchQuery);
    
    if (searchQuery.length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/admin/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();
      setResults(data.results || []);
    } catch (error) {
      console.error("Search error:", error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "user":
        return "bg-blue-100 text-blue-800";
      case "organization":
        return "bg-purple-100 text-purple-800";
      case "person":
        return "bg-green-100 text-green-800";
      case "structure":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "user":
        return "Utente";
      case "organization":
        return "Organizzazione";
      case "person":
        return "Persona";
      case "structure":
        return "Struttura";
      default:
        return type;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Ricerca Globale</h2>
        <p className="text-muted-foreground">
          Cerca utenti, organizzazioni, personale e strutture
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Cerca nel Sistema</CardTitle>
          <CardDescription>
            Inserisci almeno 2 caratteri per iniziare la ricerca
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Cerca per nome, email, codice fiscale..."
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {loading && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Ricerca in corso...</p>
          </CardContent>
        </Card>
      )}

      {!loading && query.length >= 2 && results.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Nessun risultato trovato</p>
          </CardContent>
        </Card>
      )}

      {!loading && results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Risultati ({results.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {results.map((result, index) => (
                <Link
                  key={`${result.type}-${result.id}-${index}`}
                  href={result.link}
                  className="flex items-center justify-between border-b pb-4 last:border-0 hover:bg-gray-50 p-2 rounded transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-1 rounded ${getTypeColor(result.type)}`}>
                        {getTypeLabel(result.type)}
                      </span>
                      <p className="font-medium">{result.title}</p>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{result.subtitle}</p>
                  </div>
                  <span className="text-sm text-blue-600">Apri →</span>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
