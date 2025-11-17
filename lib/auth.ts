import NextAuth, { type DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import * as bcrypt from "bcryptjs";
import { z } from "zod";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      isSuperAdmin: boolean;
      needsOnboarding: boolean;
    } & DefaultSession["user"];
  }

  interface User {
    isSuperAdmin: boolean;
    needsOnboarding: boolean;
  }
}

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  cookies: {
    sessionToken: {
      name: "authjs.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: false, // App runs on HTTP inside Docker, nginx handles HTTPS
      },
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          const validated = loginSchema.safeParse(credentials);

          if (!validated.success) {
            throw new Error("Email o password non validi");
          }

          const { email, password } = validated.data;

          const user = await prisma.user.findUnique({
            where: { email },
          });

          if (!user || !user.password) {
            throw new Error("Email o password non validi");
          }

          const accountStatus = (user as any).accountStatus;

          if (accountStatus === "PENDING_VERIFICATION") {
            throw new Error(
              "Email non verificata. Controlla la tua casella di posta.",
            );
          }

          if (accountStatus === "PENDING_APPROVAL") {
            throw new Error(
              "Account in attesa di approvazione. Verrai contattato quando l'account sarà attivato.",
            );
          }

          if (accountStatus === "REJECTED") {
            throw new Error(
              "Account rifiutato. Contatta l'amministratore per maggiori informazioni.",
            );
          }

          if (accountStatus !== "APPROVED" && !user.isSuperAdmin) {
            throw new Error(
              "Account non autorizzato. Contatta l'amministratore.",
            );
          }

          const isValid = await bcrypt.compare(password, user.password);

          if (!isValid) {
            throw new Error("Email o password non validi");
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
            isSuperAdmin: user.isSuperAdmin,
            needsOnboarding: (user as any).needsOnboarding || false,
          };
        } catch (error) {
          // Re-throw the error with the original message
          if (error instanceof Error) {
            throw error;
          }
          throw new Error("Errore durante l'autenticazione");
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.isSuperAdmin = user.isSuperAdmin;
        token.needsOnboarding = user.needsOnboarding;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.isSuperAdmin = token.isSuperAdmin as boolean;
        session.user.needsOnboarding = token.needsOnboarding as boolean;
      }
      return session;
    },
  },
});
