// types/next-auth.d.ts
import { User as NextAuthUser } from "next-auth";

declare module "next-auth" {
  interface User {
    isAdmin?: boolean;
    image?: string;
    initials?: string;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      isAdmin?: boolean;
      image?: string;
      initials?: string;
    };
  }

  interface JWT {
    id: string;
    email: string;
    name: string;
    isAdmin?: boolean;
    image?: string;
    initials?: string;
  }
}
