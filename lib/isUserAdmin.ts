// @/lib/isUserAdmin.ts
import {Admin} from "@/models/Admin";
import { mongooseConnect } from "./mongoose";

type MaybeUser = {
    email?: string | null;
  };

  // export const findAdminByEmail = async (email: string) => {
  //   return await Admin.findOne({ email });
  // };
  
  export async function isUserAdmin(user: MaybeUser | string | null | undefined): Promise<boolean> {
    const email = typeof user === "string" ? user : user?.email;
    if (!email) return false;

    await mongooseConnect();

    // Check if user exists in Admin collection
    const dbAdmin = await Admin.findOne({ email });
    if (dbAdmin) return true;
  
    // If not in DB, check if their email is in the ENV list
    const adminEmails = process.env.NEXT_PUBLIC_ADMIN_EMAILS
    ?.split(",")
    .map((e) => e.trim()) || [];

    // console.info(`Admin email check for ${email}:`, adminEmails.includes(email));  // Log result
  
    return adminEmails.includes(email);
  };
  