import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function Home() {
  const session = await auth();

  if (!session) {
    redirect("/auth/login");
  }

  // Redirect basato sul ruolo dell'utente
  if (session.user.isSuperAdmin) {
    redirect("/admin");
  } else {
    redirect("/dashboard");
  }
}
