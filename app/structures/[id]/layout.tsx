import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Settings, User } from "lucide-react";
import { StructureNav } from "./structure-nav";
import { Logo } from "@/components/ui/logo";
import { MobileMenu } from "@/components/ui/mobile-menu";

export default async function StructureLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/login");
  }

  const { id } = await params;

  const menuItems = [
    { href: "/settings/profile", label: "Impostazioni", icon: "Settings" },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b bg-gradient-to-r from-purple-600 to-blue-600 sticky top-0 z-50 shadow-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          {/* Logo e nav */}
          <div className="flex items-center gap-4 lg:gap-6 flex-1 min-w-0">
            <Link
              href="/structures"
              className="flex items-center hover:opacity-80 transition-opacity flex-shrink-0"
            >
              <Logo className="h-10 w-10 lg:h-12 lg:w-12" />
            </Link>
            <StructureNav structureId={id} />
          </div>

          {/* Desktop menu */}
          <div className="hidden lg:flex items-center gap-4">
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
                {session.user.name || session.user.email}
              </span>
            </div>
            <Link
              href="/auth/logout"
              className="text-sm text-white bg-red-500 hover:bg-red-600 px-4 py-2 rounded-md transition-colors font-medium"
            >
              Logout
            </Link>
          </div>

          {/* Mobile menu */}
          <MobileMenu
            items={menuItems}
            userName={session.user.name || undefined}
            userEmail={session.user.email || undefined}
          />
        </div>
      </header>
      <main className="flex-1 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
        {children}
      </main>
    </div>
  );
}
