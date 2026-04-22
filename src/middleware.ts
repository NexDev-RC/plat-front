import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Rutas que REQUIEREN autenticación
const PROTECTED = [
  '/dashboard',
  '/learn',
  '/profile',
  '/admin',
  '/instructor',
]

// Rutas solo para usuarios NO autenticados
const GUEST_ONLY = ['/login', '/register']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get('access_token')?.value

  const isProtected = PROTECTED.some((p) => pathname.startsWith(p))
  const isGuestOnly = GUEST_ONLY.some((p) => pathname.startsWith(p))

  // Sin token en ruta protegida → login
  if (isProtected && !token) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Con token en ruta de guest → dashboard
  if (isGuestOnly && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|public).*)'],
}
