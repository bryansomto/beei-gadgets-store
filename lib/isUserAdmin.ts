type MaybeUser = {
    email?: string | null;
  };
  
  export const isUserAdmin = (user: MaybeUser | string | null | undefined): boolean => {
    const email = typeof user === "string" ? user : user?.email;
    if (!email) return false;
  
    const adminEmails = process.env.NEXT_PUBLIC_ADMIN_EMAILS
      ?.split(",")
      .map((e) => e.trim()) || [];
  
    return adminEmails.includes(email);
  };
  