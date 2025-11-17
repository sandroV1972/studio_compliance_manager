import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Search,
  LayoutDashboard,
  Users,
  Building2,
  FileCheck2,
  LogOut,
} from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { AdminSettingsMenu } from "@/components/admin/admin-settings-menu";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user?.isSuperAdmin) {
    redirect("/auth/login");
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b bg-gradient-to-r from-indigo-600 to-purple-600 sticky top-0 z-50 shadow-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-6">
            <Link
              href="/admin"
              className="flex items-center gap-3 text-xl font-bold text-white hover:text-indigo-100 transition-colors group"
            >
              <Logo className="h-16 w-16" />
              <span>Admin Panel</span>
            </Link>
            <nav className="flex items-center gap-2">
              <Link
                href="/admin"
                className="flex items-center gap-2 text-sm text-white/90 hover:text-white hover:bg-white/10 px-3 py-2 rounded-md transition-all"
              >
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Link>
              <Link
                href="/admin/users"
                className="flex items-center gap-2 text-sm text-white/90 hover:text-white hover:bg-white/10 px-3 py-2 rounded-md transition-all"
              >
                <Users className="h-4 w-4" />
                Utenti
              </Link>
              <Link
                href="/admin/organizations"
                className="flex items-center gap-2 text-sm text-white/90 hover:text-white hover:bg-white/10 px-3 py-2 rounded-md transition-all"
              >
                <Building2 className="h-4 w-4" />
                Organizzazioni
              </Link>
              <Link
                href="/admin/global-templates"
                className="flex items-center gap-2 text-sm text-white/90 hover:text-white hover:bg-white/10 px-3 py-2 rounded-md transition-all"
              >
                <FileCheck2 className="h-4 w-4" />
                Template Globali
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/admin/search"
              className="flex items-center gap-2 text-sm text-white/90 hover:text-white hover:bg-white/10 px-3 py-2 rounded-md transition-all"
            >
              <Search className="h-4 w-4" />
              Ricerca
            </Link>
            <div className="h-8 w-px bg-white/20"></div>
            <AdminSettingsMenu
              userEmail={session.user.email || ""}
              userName={session.user.name}
            />
            <Link
              href="/auth/logout"
              prefetch={false}
              className="flex items-center gap-2 text-sm text-white bg-red-500 hover:bg-red-600 px-4 py-2 rounded-md transition-colors font-medium"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
        {children}
      </main>
    </div>
  );
}
