import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// ─── Subdomain Architecture ─────────────────────────────────────────────────
// Root domain (telaven.com / localhost:3003)       → Landing page only
// App subdomain (app.telaven.com / app.localhost:3003) → Dashboard, auth, API
// ─────────────────────────────────────────────────────────────────────────────

const DOMAIN = process.env.NEXT_PUBLIC_DOMAIN || 'localhost:3003'
const PROTOCOL = process.env.NEXT_PUBLIC_PROTOCOL || 'http'

// Dashboard routes that require authentication (app subdomain)
const protectedPaths = [
  '/dashboard',
  '/dashboard-2',
  '/mail',
  '/tasks',
  '/chat',
  '/calendar',
  '/users',
  '/settings',
  '/pricing',
  '/faqs',
  '/reviews',
  '/review-profiles',
  '/analytics',
  '/automations',
  '/campaigns',
  '/contacts',
  '/integrations',
  '/widgets',
]

// Auth routes on app subdomain (redirect to dashboard if already logged in)
const authPaths = ['/sign-in', '/sign-up', '/forgot-password', '/reset-password', '/verify-email']

function isAppSubdomain(hostname: string): boolean {
  return hostname.startsWith('app.')
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const hostname = request.headers.get('host') || ''

  // ─── Root Domain: Only serve landing pages ──────────────────────────────
  if (!isAppSubdomain(hostname)) {
    // Allow landing page paths, static assets, and API on root domain
    const isLandingPath = pathname === '/' || pathname.startsWith('/landing')
    const isStaticOrApi = pathname.startsWith('/api') ||
      pathname.startsWith('/_next') ||
      pathname.startsWith('/favicon') ||
      pathname.startsWith('/r/') || // magic links are public
      /\.(png|jpg|jpeg|gif|svg|webp|ico|css|js)$/i.test(pathname)

    if (isLandingPath || isStaticOrApi) {
      return NextResponse.next()
    }

    // Any other path on root domain → redirect to app subdomain
    const appUrl = new URL(pathname, `${PROTOCOL}://app.${DOMAIN}`)
    appUrl.search = request.nextUrl.search
    return NextResponse.redirect(appUrl)
  }

  // ─── App Subdomain: Dashboard + Auth + API ──────────────────────────────

  // Redirect root of app subdomain to /dashboard
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Redirect legacy auth paths
  if (pathname === '/login') {
    return NextResponse.redirect(new URL('/sign-in', request.url))
  }
  if (pathname === '/register') {
    return NextResponse.redirect(new URL('/sign-up', request.url))
  }

  // If someone hits /landing on app subdomain, send them to root domain
  if (pathname === '/landing' || pathname.startsWith('/landing/')) {
    return NextResponse.redirect(new URL('/', `${PROTOCOL}://${DOMAIN}`))
  }

  // Check if the path is protected
  const isProtected = protectedPaths.some(
    (path) => pathname === path || pathname.startsWith(path + '/')
  )

  // Check if the path is an auth page
  const isAuthPath = authPaths.some(
    (path) => pathname === path || pathname.startsWith(path + '/')
  )

  if (!isProtected && !isAuthPath) {
    return NextResponse.next()
  }

  // Check for session by looking at the cookie
  const sessionCookie = request.cookies.get('better-auth.session_token')?.value

  if (isProtected && !sessionCookie) {
    const signInUrl = new URL('/sign-in', request.url)
    signInUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(signInUrl)
  }

  if (isAuthPath && sessionCookie) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
