import type { NextAuthConfig } from "next-auth"
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google"
import { MongoDBAdapter } from "@auth/mongodb-adapter"
import clientPromise from "./lib/db"
import { ZodError } from "zod"
import verifyUser from "./lib/verifyUser"

import { signInSchema } from "./lib/validation/signInSchema"
 
export default { providers: [
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
            firstName: user.firstName,
            lastName: user.lastName,
            isAdmin: user.isAdmin,
            image: user.image,
            initials: user.initials,
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
  ], } satisfies NextAuthConfig