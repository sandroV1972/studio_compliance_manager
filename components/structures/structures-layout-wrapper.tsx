import Link from "next/link";
import { Settings, User, LayoutDashboard } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { auth } from "@/lib/auth";

export async function StructuresLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b bg-gradient-to-r from-purple-600 to-blue-600 sticky top-0 z-50 shadow-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-6">
            <Link
              href="/structures"
              className="flex items-center hover:opacity-80 transition-opacity"
            >
              <Logo className="h-12 w-12" />
            </Link>
            <nav className="flex items-center gap-1">
              <span className="text-sm text-white bg-white/20 px-3 py-2 rounded-md flex items-center gap-1 cursor-default">
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </span>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/settings/profile"
              className="flex items-center gap-2 text-sm text-white/90 hover:text-white hover:bg-white/10 px-3 py-2 rounded-md transition-all"
            >
              <Settings className="h-4 w-4" />
              Impostazioni
            </Link>
            <div className="h-8 w-px bg-white/20"></div>
            <div className="flex items-center gap-2 text-white/90">
              <User className="h-4 w-4" />
              <span className="text-sm">
                {session?.user?.name || session?.user?.email}
              </span>
            </div>
            <Link
              href="/auth/logout"
              prefetch={false}
              className="text-sm text-white bg-red-500 hover:bg-red-600 px-4 py-2 rounded-md transition-colors font-medium"
            >
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
