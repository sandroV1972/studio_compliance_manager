"use client";

import { useState } from "react";
import { Menu, X, Settings, Building2 } from "lucide-react";
import Link from "next/link";

interface MenuItem {
  href: string;
  label: string;
  icon?: string;
}

interface MobileMenuProps {
  items: MenuItem[];
  userName?: string;
  userEmail?: string;
}

const iconMap = {
  Settings,
  Building2,
};

export function MobileMenu({ items, userName, userEmail }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Hamburger button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden p-2 text-white hover:bg-white/10 rounded-md transition-colors"
        aria-label="Toggle menu"
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Mobile menu overlay */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setIsOpen(false)}
          />

          {/* Menu panel */}
          <div className="fixed top-16 right-0 bottom-0 w-64 bg-white shadow-xl z-50 lg:hidden overflow-y-auto">
            <div className="p-4 space-y-4">
              {/* User info */}
              {(userName || userEmail) && (
                <div className="pb-4 border-b border-gray-200">
                  <p className="text-sm font-medium text-gray-900">
                    {userName || userEmail}
                  </p>
                  {userName && userEmail && (
                    <p className="text-xs text-gray-500">{userEmail}</p>
                  )}
                </div>
              )}

              {/* Menu items */}
              <nav className="space-y-1">
                {items.map((item) => {
                  const Icon = item.icon
                    ? iconMap[item.icon as keyof typeof iconMap]
                    : null;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                    >
                      {Icon && <Icon className="h-4 w-4" />}
                      {item.label}
                    </Link>
                  );
                })}
              </nav>

              {/* Logout button */}
              <div className="pt-4 border-t border-gray-200">
                <Link
                  href="/auth/logout"
                  onClick={() => setIsOpen(false)}
                  className="block w-full text-center px-4 py-2 text-sm text-white bg-red-500 hover:bg-red-600 rounded-md transition-colors font-medium"
                >
                  Logout
                </Link>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
