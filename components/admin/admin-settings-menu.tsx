"use client";

import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Settings, User, Mail, ShieldCheck } from "lucide-react";
import Link from "next/link";

interface AdminSettingsMenuProps {
  userEmail: string;
  userName?: string | null;
}

export function AdminSettingsMenu({
  userEmail,
  userName,
}: AdminSettingsMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 text-sm text-white/90 hover:text-white hover:bg-white/10 px-3 py-2 rounded-md transition-all focus:outline-none">
        <Settings className="h-4 w-4" />
        Impostazioni
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-indigo-600" />
              <p className="text-sm font-medium leading-none">Super Admin</p>
            </div>
            {userName && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <User className="h-3 w-3" />
                <p className="text-xs leading-none">{userName}</p>
              </div>
            )}
            <div className="flex items-center gap-2 text-muted-foreground">
              <Mail className="h-3 w-3" />
              <p className="text-xs leading-none">{userEmail}</p>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/admin/settings" className="cursor-pointer">
            <Settings className="mr-2 h-4 w-4" />
            <span>Impostazioni</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/admin/profile" className="cursor-pointer">
            <User className="mr-2 h-4 w-4" />
            <span>Profilo Admin</span>
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
