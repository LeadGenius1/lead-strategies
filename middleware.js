// Middleware for AI Lead Strategies
// Handles domain-based routing and security headers

import { NextResponse } from 'next/server';

export function middleware(request) {
  const hostname = request.headers.get('host') || '';
  const pathname = request.nextUrl.pathname;
  const isVideoSiteDomain = hostname.includes('videosite.ai');

  // ============================================
  // DOMAIN-BASED ROUTING
  // ============================================

  if (isVideoSiteDomain) {
    // Allow these routes on videosite.ai
    const allowedRoutes = [
      '/',           // Home page
      '/watch',      // Browse videos
      '/ads',        // Advertiser platform
    ];

    // Check if current path is allowed or starts with allowed prefix
    const isAllowed = allowedRoutes.some(route =>
      pathname === route || pathname.startsWith(route + '/')
    );

    // Also allow Next.js internals
    const isNextInternal = pathname.startsWith('/_next') ||
                          pathname.startsWith('/api') ||
                          pathname === '/favicon.ico';

    // If not allowed, redirect to home
    if (!isAllowed && !isNextInternal) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // aileadstrategies.com - allow everything
  const response = NextResponse.next();

  // ============================================
  // SECURITY HEADERS
  // ============================================

  // Prevent clickjacking attacks
  response.headers.set('X-Frame-Options', 'DENY');

  // Prevent MIME type sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff');

  // Enable XSS protection (legacy browsers)
  response.headers.set('X-XSS-Protection', '1; mode=block');

  // Control referrer information
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Restrict browser features
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), interest-cohort=()'
  );

  // Enforce HTTPS (1 year)
  response.headers.set(
    'Strict-Transport-Security',
    'max-age=31536000; includeSubDomains; preload'
  );

  // Content Security Policy
  // Allows: self, inline scripts/styles, CDNs, API, fonts, images
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cdn.jsdelivr.net https://www.googletagmanager.com https://www.google-analytics.com;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    font-src 'self' https://fonts.gstatic.com data:;
    img-src 'self' data: https: blob:;
    media-src 'self' https: blob:;
    connect-src 'self' https://api.aileadstrategies.com https://www.google-analytics.com https://api.stripe.com https://*.r2.cloudflarestorage.com wss:;
    frame-src 'self' https://js.stripe.com https://hooks.stripe.com;
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    upgrade-insecure-requests;
  `.replace(/\s{2,}/g, ' ').trim();

  response.headers.set('Content-Security-Policy', cspHeader);

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
