import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"
import Nodemailer from "next-auth/providers/nodemailer"
import { MongoDBAdapter } from "@auth/mongodb-adapter"
import client from "./lib/db"
import { ZodError } from "zod"
import { signInSchema } from "./lib/zod"
import verifyUser from "./lib/verifyUser"

 
export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: MongoDBAdapter(client),
  providers: [
    Nodemailer({
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: process.env.EMAIL_SERVER_PORT,
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      },
      from: process.env.EMAIL_FROM,
    }),
    Google ({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
    Credentials({
      // You can specify which fields should be submitted, by adding keys to the `credentials` object.
      // e.g. domain, username, password, 2FA token, etc.
      credentials: {
        email: {},
        password: {},
      },
      authorize: async (credentials) => {
        try {
          const { email, password } = await signInSchema.parseAsync(credentials);

          // logic to verify if the user exists

          if (!email || !password) {
            // Return `null` to indicate that the credentials are invalid
            // throw new Error("Invalid credentials");
            return null;
          }
          const user = await verifyUser({ email, password });

          if (!user) {
            // Return `null` to indicate that the credentials are invalid
            throw new Error("Invalid credentials");
            // return null;
          }

          // return object matching the User type
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            };
        } catch (error) {
          if (error instanceof ZodError) {
            // Return `null` to indicate that the credentials are invalid
            throw new Error("Invalid credentials");
            // return null;
          }
          throw error; // Re-throw unexpected errors
        }
      }
    }),  
  ],
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
        token.name = user.name
      }
      return token
    },

    // 🧠 Make token values available to the client
    async session({ session, token, user }) {
      if (token) {
        session.user.id = token.id as string
        session.user.email = token.email as string
        session.user.name = token.name as string
      }
      return session
    },
  },

  // pages: {
  //   signIn: '/login', // optional: custom login page
  // },

})