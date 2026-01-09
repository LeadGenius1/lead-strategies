import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Domain to landing page mapping
const domainRoutes: Record<string, string> = {
  'leadsite.ai': '/leadsite-ai',
  'www.leadsite.ai': '/leadsite-ai',
  'leadsite.io': '/leadsite-io',
  'www.leadsite.io': '/leadsite-io',
  'clientcontact.io': '/clientcontact-io',
  'www.clientcontact.io': '/clientcontact-io',
  'tackleai.ai': '/tackle-io',
  'www.tackleai.ai': '/tackle-io',
  'videosite.ai': '/videosite-io',
  'www.videosite.ai': '/videosite-io',
  // aileadstrategies.com shows main homepage (no rewrite needed)
};

// Protected routes that require authentication
const protectedRoutes = [
  '/dashboard',
  '/settings',
  '/api/user',
];

// Public routes that should redirect to dashboard if authenticated
const authRoutes = [
  '/login',
  '/signup',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hostname = request.headers.get('host') || '';
  const token = request.cookies.get('auth-token')?.value;

  // Domain-based routing: rewrite root path to domain-specific landing page
  // Only rewrite the homepage, not other paths like /signup, /login, /dashboard
  if (pathname === '/') {
    const cleanHostname = hostname.split(':')[0].toLowerCase(); // Remove port if present
    const targetPath = domainRoutes[cleanHostname];
    
    if (targetPath) {
      // Rewrite to the domain-specific landing page (URL stays the same)
      const url = request.nextUrl.clone();
      url.pathname = targetPath;
      return NextResponse.rewrite(url);
    }
  }

  // Check if route is protected
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));

  // Redirect to login if accessing protected route without token
  if (isProtectedRoute && !token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect to dashboard if accessing auth routes with valid token
  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (all API endpoints)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
