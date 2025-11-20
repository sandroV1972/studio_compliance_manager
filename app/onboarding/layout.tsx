import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { User } from "lucide-react";
import { Logo } from "@/components/ui/logo";

export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/login");
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b bg-gradient-to-r from-purple-600 to-blue-600 sticky top-0 z-50 shadow-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-6">
            <div className="flex items-center">
              <Logo className="h-16 w-16" />
            </div>
            <div className="text-white font-semibold">
              Configurazione Iniziale
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-white/90">
              <User className="h-4 w-4" />
              <span className="text-sm">
                {session.user.name || session.user.email}
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
