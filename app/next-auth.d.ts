/* eslint-disable @typescript-eslint/no-unused-vars */

import type { User as _NextAuthUser } from "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    firstName: string;
    lastName: string;
    phone?: string;
    isAdmin?: boolean;
    image?: string;
    initials?: string;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      phone?: string;
      isAdmin?: boolean;
      image?: string;
      initials?: string;
    };
  }

  interface JWT {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    isAdmin?: boolean;
    image?: string;
    initials?: string;
  }
}
