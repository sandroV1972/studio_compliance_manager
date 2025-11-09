"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Building2,
  Calendar,
  Users,
  FileText,
  BarChart3,
  LayoutDashboard,
  ChevronDown,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface StructureNavProps {
  structureId: string;
}

interface Structure {
  id: string;
  name: string;
  city: string | null;
}

interface Organization {
  id: string;
  name: string;
  structures: Structure[];
}

export function StructureNav({ structureId }: StructureNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [currentStructure, setCurrentStructure] = useState<Structure | null>(
    null,
  );

  useEffect(() => {
    loadOrganization();
  }, [structureId]);

  const loadOrganization = async () => {
    try {
      const response = await fetch("/api/user/organization");
      if (!response.ok) return;
      const data = await response.json();
      setOrganization(data);

      const structure = data.structures.find(
        (s: Structure) => s.id === structureId,
      );
      setCurrentStructure(structure || null);
    } catch (error) {
      console.error("Errore:", error);
    }
  };

  const navItems = [
    {
      href: `/structures/${structureId}`,
      label: "Panoramica",
      icon: LayoutDashboard,
      isActive: pathname === `/structures/${structureId}`,
    },
    {
      href: `/structures/${structureId}/people`,
      label: "Personale",
      icon: Users,
      isActive: pathname?.startsWith(`/structures/${structureId}/people`),
    },
    {
      href: `/structures/${structureId}/deadlines`,
      label: "Scadenze",
      icon: Calendar,
      isActive: pathname?.startsWith(`/structures/${structureId}/deadlines`),
    },
    {
      href: `/structures/${structureId}/documents`,
      label: "Documenti",
      icon: FileText,
      isActive: pathname?.startsWith(`/structures/${structureId}/documents`),
    },
    {
      href: `/structures/${structureId}/reports`,
      label: "Report",
      icon: BarChart3,
      isActive: pathname?.startsWith(`/structures/${structureId}/reports`),
    },
  ];

  const handleStructureChange = (newStructureId: string) => {
    router.push(`/structures/${newStructureId}`);
  };

  return (
    <>
      {/* Desktop Navigation */}
      <div className="hidden lg:flex items-center gap-4">
        {/* Dropdown selezione struttura */}
        {organization && currentStructure && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="text-white hover:bg-white/10 flex items-center gap-2"
              >
                <Building2 className="h-4 w-4" />
                <span className="font-medium">{currentStructure.name}</span>
                {currentStructure.city && (
                  <span className="text-xs opacity-75">
                    ({currentStructure.city})
                  </span>
                )}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              {organization.structures.map((structure) => (
                <DropdownMenuItem
                  key={structure.id}
                  onClick={() => handleStructureChange(structure.id)}
                  className={structure.id === structureId ? "bg-accent" : ""}
                >
                  <Building2 className="h-4 w-4 mr-2" />
                  <div className="flex flex-col">
                    <span>{structure.name}</span>
                    {structure.city && (
                      <span className="text-xs text-muted-foreground">
                        {structure.city}
                      </span>
                    )}
                  </div>
                  {structure.id === structureId && (
                    <span className="ml-auto">✓</span>
                  )}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push("/structures")}>
                <LayoutDashboard className="h-4 w-4 mr-2" />
                Dashboard
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* Separatore */}
        <div className="h-8 w-px bg-white/20"></div>

        {/* Menu navigazione */}
        <nav className="flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            if (item.isActive) {
              return (
                <span
                  key={item.href}
                  className="text-sm text-white bg-white/20 px-3 py-2 rounded-md flex items-center gap-1 cursor-not-allowed"
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </span>
              );
            }
            return (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm text-white/90 hover:text-white hover:bg-white/10 px-3 py-2 rounded-md transition-all flex items-center gap-1"
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Mobile Navigation - Dropdown combinato */}
      <div className="lg:hidden">
        {organization && currentStructure && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="text-white hover:bg-white/10 flex items-center gap-2 text-xs px-2"
              >
                <Building2 className="h-4 w-4" />
                <span className="font-medium truncate max-w-[120px]">
                  {currentStructure.name}
                </span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              {/* Sezioni della struttura corrente */}
              <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                Sezioni
              </div>
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <DropdownMenuItem
                    key={item.href}
                    onClick={() => router.push(item.href)}
                    className={item.isActive ? "bg-accent" : ""}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {item.label}
                  </DropdownMenuItem>
                );
              })}
              <DropdownMenuSeparator />
              {/* Altre strutture */}
              <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                Cambia Struttura
              </div>
              {organization.structures.map((structure) => (
                <DropdownMenuItem
                  key={structure.id}
                  onClick={() => handleStructureChange(structure.id)}
                  className={structure.id === structureId ? "bg-accent" : ""}
                >
                  <Building2 className="h-4 w-4 mr-2" />
                  <div className="flex flex-col">
                    <span>{structure.name}</span>
                    {structure.city && (
                      <span className="text-xs text-muted-foreground">
                        {structure.city}
                      </span>
                    )}
                  </div>
                  {structure.id === structureId && (
                    <span className="ml-auto">✓</span>
                  )}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push("/structures")}>
                <LayoutDashboard className="h-4 w-4 mr-2" />
                Dashboard
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </>
  );
}
