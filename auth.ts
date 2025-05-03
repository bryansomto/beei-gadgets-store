import NextAuth from "next-auth"
import { MongoDBAdapter } from "@auth/mongodb-adapter"
import clientPromise from "./lib/db"
import { isUserAdmin } from "./lib/isUserAdmin"
import authConfig from "./auth.config"


export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: MongoDBAdapter(clientPromise),
  session: {
    strategy: 'jwt',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  },
  callbacks: {
    // 🔐 Add data to the JWT token
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.email = user.email
        token.firstName = user.firstName
        token.lastName = user.lastName
        token.isAdmin = user.isAdmin
        token.image = user.image
        token.initials = user.initials
      }
      // When called during session retrieval, re-check isAdmin:
      if (typeof token.isAdmin === "undefined" && token.email) {
        const adminStatus = await isUserAdmin(token.email);
        token.isAdmin = adminStatus;
      }
      return token
    },

    // 🧠 Make token values available to the client
    async session({ session, token, user }) {
      if (token) {
        session.user.id = token.id as string
        session.user.email = token.email as string
        session.user.firstName = token.firstName as string
        session.user.lastName = token.lastName as string
        session.user.isAdmin = token.isAdmin as boolean
        session.user.image = token.image as string
        session.user.initials = token.initials as string
      }
      return session
    },
  },
  ...authConfig,
})