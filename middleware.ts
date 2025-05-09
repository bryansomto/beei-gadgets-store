// middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

const adminPaths = ["/admin"];
const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
const apiPath = '/api/admins';

export async function middleware(req: NextRequest) {
  if (!adminPaths.some(path => req.nextUrl.pathname.startsWith(path))) {
    return NextResponse.next();
  }

  const token = await getToken({ req, secret: process.env.AUTH_SECRET });

  // Redirect to home if not authenticated
  if (!token?.email) {
    const signInUrl = new URL('/login', req.url);
    signInUrl.searchParams.set('callbackUrl', req.url);
    return NextResponse.redirect(signInUrl);
  }

   try {
    // Check admin status with caching
    const response = await fetch(`${baseUrl}${apiPath}?email=${encodeURIComponent(token.email)}`, {
      next: { revalidate: 300, tags: ['administrators'] }
    });

    // Fallback to environment variable admins if API fails
    const adminEmails = process.env.NEXT_PUBLIC_ADMIN_EMAILS
      ?.split(",")
      .map((e) => e.trim()) || [];

    let isAdmin = false;
    
    if (response.ok) {
      const adminData = await response.json();
      isAdmin = !!adminData; // Assuming API returns admin object or null
    } else {
      console.warn('Admin API failed, falling back to env vars');
      isAdmin = adminEmails.includes(token.email);
    }

    if (!isAdmin) {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    return NextResponse.next();
  } catch (error) {
    console.error('Admin verification error:', error);
    return NextResponse.redirect(new URL("/error", req.url));
  }
}

export const config = {
  matcher: ["/admin/:path*"],
};
