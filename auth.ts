import NextAuth, { User as NextAuthUser } from "next-auth"
import { MongoDBAdapter } from "@auth/mongodb-adapter"
import Credentials from "next-auth/providers/credentials"
import client from "./lib/db"
import { verifyPassword, sanitizeEmail } from "./lib/auth-utils"
import { createOrUpdateUser, getUserByEmail } from "@/lib/services/user-services"
export { createUser, createOrUpdateUser } from "@/lib/services/user-services"

if (!process.env.AUTH_SECRET) {
  throw new Error('AUTH_SECRET environment variable is not set')
}

export const authConfig = {
  secret: process.env.AUTH_SECRET,
  adapter: MongoDBAdapter(client),
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log("Missing credentials");
          return null;
        }

        try {
          const user = await getUserByEmail(credentials.email as string);

          console.log("User found:", !!user);
          console.log("User has emailPassword:", !!user?.emailPassword);
          console.log("Email verified:", user?.emailPassword?.emailVerified);

          if (!user) {
            console.log("No user found with email:", sanitizeEmail(credentials.email as string));
            return null;
          }

          if (!user.emailPassword?.hashedPassword) {
            console.log("User exists but no password hash found");
            return null;
          }

          if (!user.emailPassword.emailVerified) {
            console.log("Email not verified");
            return null;
          }

          const isValidPassword = await verifyPassword(
            credentials.password as string,
            user.emailPassword.hashedPassword
          );

          console.log("Password validation result:", isValidPassword);

          if (!isValidPassword) {
            console.log("Invalid password");
            return null;
          }

          console.log("Login successful for user:", user.email);

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.profile?.name || '',
          };
        } catch (error) {
          console.error("Error during authentication:", error);
          return null;
        }
      }
    })
  ],
  session: {
    strategy: "jwt" as const,
  },
  // pages: {
  //   signIn: '/login',
  //   error: '/login',
  // },
  // trustHost: true,
  callbacks: {
    async jwt({ token, user }: { token: any; user?: NextAuthUser }) {
      if (user) {
        token.id = user.id || token.id;
        token.email = user.email || token.email;
        token.name = user.name || token.name;
      }
      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
      }
      return session;
    }
  },
}

export const providerMap = {
  credentials: {
    id: "credentials",
    name: "Email"
  }
}