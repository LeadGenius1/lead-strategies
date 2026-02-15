// Robots.txt configuration for SEO
// Scenario A: Single Next.js app - all domains (aileadstrategies.com, videosite.ai, clientcontact.io, ultralead.ai) point to same deployment. One sitemap only.
export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/dashboard/',
          '/dashboard/private/',
          '/_next/',
          '/api/v1/',
          '/login',
          '/signup',
          '/auth/',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/dashboard/',
          '/login',
          '/signup',
          '/auth/',
        ],
      },
      {
        userAgent: 'Bingbot',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/dashboard/',
          '/login',
          '/signup',
          '/auth/',
        ],
      },
      // Allow AI/LLM crawlers
      {
        userAgent: 'GPTBot',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/dashboard/',
          '/login',
          '/signup',
          '/auth/',
        ],
      },
      {
        userAgent: 'ChatGPT-User',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/dashboard/',
          '/login',
          '/signup',
          '/auth/',
        ],
      },
      {
        userAgent: 'Claude-Web',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/dashboard/',
          '/login',
          '/signup',
          '/auth/',
        ],
      },
      {
        userAgent: 'anthropic-ai',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/dashboard/',
          '/login',
          '/signup',
          '/auth/',
        ],
      },
      {
        userAgent: 'PerplexityBot',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/dashboard/',
          '/login',
          '/signup',
          '/auth/',
        ],
      },
    ],
    // Scenario A: Single app serving all domains - one sitemap only (avoids 404s on other domains)
    sitemap: 'https://aileadstrategies.com/sitemap.xml',
    host: 'https://aileadstrategies.com',
  };
}
