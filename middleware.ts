import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify, SignJWT } from 'jose'

const SECRET = new TextEncoder().encode(process.env.SESSION_SECRET || 'my-super-secret')
const SESSION_COOKIE_NAME = 'session-token'
const SESSION_DURATION_MS = 1000 * 60 * 30 // 30 minutes

export async function middleware(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value

  if (!token) {
    // No session, just pass through
    return NextResponse.next()
  }

  try {
    // Verify the JWT
    const { payload } = await jwtVerify(token, SECRET)

    // Optionally: check if session is still valid (expiration)
    // If token is expired, jwtVerify will throw

    // Create a new token with updated expiry
    const newExpiry = Date.now() + SESSION_DURATION_MS
    const newToken = await new SignJWT({ ...payload })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(Math.floor(newExpiry / 1000)) // In seconds
      .sign(SECRET)

    const response = NextResponse.next()
    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: newToken,
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: SESSION_DURATION_MS / 1000,
    })

    return response
  } catch (error) {
    // Token invalid or expired, optionally clear the cookie
    const res = NextResponse.next()
    res.cookies.delete(SESSION_COOKIE_NAME)
    return res
  }
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'], // adjust to your needs
}
