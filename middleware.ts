// middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

const adminPaths = ["/admin"];

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.AUTH_SECRET });

  // Only run on /admin* paths
  if (adminPaths.some(path => req.nextUrl.pathname.startsWith(path))) {
    const email = token?.email;
    const adminEmails = process.env.NEXT_PUBLIC_ADMIN_EMAILS
      ?.split(",")
      .map((e) => e.trim()) || [];

    const isAdmin = email && adminEmails.includes(email);
    if (!isAdmin) {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"], // protect all admin routes
};
