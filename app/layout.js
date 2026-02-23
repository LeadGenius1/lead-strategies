import './globals.css'
import { Providers } from './providers'
import Script from 'next/script'

export const metadata = {
  metadataBase: new URL('https://aileadstrategies.com'),
  title: {
    default: 'AI Lead Strategies | AI-Powered Lead Generation & Sales Automation Platform',
    template: '%s | AI Lead Strategies'
  },
  description: 'AI Lead Strategies offers a complete suite of AI-powered tools for B2B lead generation, sales automation, CRM, and customer engagement. Includes LeadSite.AI, LeadSite.IO, ClientContact.IO, and VideoSite.AI platforms.',
  keywords: [
    'AI lead generation',
    'B2B sales automation',
    'AI CRM software',
    'lead scoring',
    'email automation',
    'sales intelligence',
    'prospect discovery',
    'AI website builder',
    'omnichannel outreach',
    'sales engagement platform',
    'marketing automation',
    'AI prospecting',
    'lead enrichment',
    'contact finder',
    'sales pipeline management'
  ],
  authors: [{ name: 'AI Lead Strategies LLC', url: 'https://aileadstrategies.com' }],
  creator: 'AI Lead Strategies LLC',
  publisher: 'AI Lead Strategies LLC',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'AI Lead Strategies',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://aileadstrategies.com',
    siteName: 'AI Lead Strategies',
    title: 'AI Lead Strategies | AI-Powered Lead Generation & Sales Automation',
    description: 'Transform your B2B sales with AI-powered lead generation, automated outreach, and intelligent CRM. Get 50+ qualified leads daily on autopilot.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'AI Lead Strategies - AI-Powered B2B Lead Generation Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Lead Strategies | AI-Powered Lead Generation',
    description: 'Transform your B2B sales with AI-powered lead generation, automated outreach, and intelligent CRM.',
    images: ['/og-image.png'],
    creator: '@aileadstrategies',
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'google-site-verification-code',
  },
  alternates: {
    canonical: 'https://aileadstrategies.com',
  },
  category: 'technology',
}

// JSON-LD Structured Data for Organization
const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'AI Lead Strategies LLC',
  url: 'https://aileadstrategies.com',
  logo: 'https://aileadstrategies.com/icon-512.png',
  description: 'AI-powered B2B lead generation and sales automation platform',
  address: {
    '@type': 'PostalAddress',
    streetAddress: '600 Eagleview Blvd, Suite 317',
    addressLocality: 'Exton',
    addressRegion: 'PA',
    postalCode: '19341',
    addressCountry: 'US'
  },
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+1-855-506-8886',
    contactType: 'customer service',
    email: 'support@aileadstrategies.com'
  },
  sameAs: [
    'https://twitter.com/aileadstrategies',
    'https://linkedin.com/company/aileadstrategies',
    'https://github.com/aileadstrategies'
  ]
}

// JSON-LD for Software Application
const softwareSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'AI Lead Strategies Platform',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  offers: {
    '@type': 'AggregateOffer',
    lowPrice: '39',
    highPrice: '149',
    priceCurrency: 'USD',
    offerCount: '5'
  },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.9',
    ratingCount: '1250'
  }
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <head>
        <script dangerouslySetInnerHTML={{ __html: `(function(){var t=localStorage.getItem('theme');if(t==='light')document.documentElement.classList.remove('dark')})()` }} />
        {/* Preconnect to external domains for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* DNS Prefetch for third-party resources */}
        <link rel="dns-prefetch" href="https://www.google-analytics.com" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        
        {/* Canonical URL */}
        <link rel="canonical" href="https://aileadstrategies.com" />
        
        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
        />
        
        {/* LLM Discovery Meta Tags */}
        <meta name="ai-content-declaration" content="This website provides AI-powered B2B lead generation services including LeadSite.AI, LeadSite.IO, ClientContact.IO, and VideoSite.AI platforms." />
        <meta name="llm-description" content="AI Lead Strategies is a B2B sales automation platform: 1) LeadSite.AI - lead scoring ($49/mo), 2) LeadSite.IO - AI website builder ($49/mo + Free Website), 3) ClientContact.IO - 22+ channel unified inbox and full CRM with 7 AI agents ($99-$399/mo), 4) UltraLead - full CRM + 7 AI agents ($499/mo), 5) VideoSite.AI - video monetization (FREE, earn $1/viewer). Located at 600 Eagleview Blvd, Suite 317, Exton PA 19341. Contact: support@aileadstrategies.com or (855) 506-8886." />
        
        {/* Additional SEO Meta Tags */}
        <meta name="theme-color" content="#000000" />
        <meta name="msapplication-TileColor" content="#000000" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className="font-sans">
        <Providers>{children}</Providers>
        
        {/* Invisible Backlink Builder Agent - SEO Enhancement Script */}
        <Script id="backlink-builder" strategy="lazyOnload">
          {`
            (function() {
              // Backlink Builder Agent - Creates semantic connections for SEO
              const backlinkAgent = {
                init: function() {
                  this.createSemanticLinks();
                  this.enhanceInternalLinking();
                  this.trackReferrers();
                },
                createSemanticLinks: function() {
                  // Add semantic rel attributes to external links
                  document.querySelectorAll('a[href^="http"]').forEach(function(link) {
                    if (!link.hostname.includes('aileadstrategies.com')) {
                      link.setAttribute('rel', 'noopener noreferrer');
                    }
                  });
                  // Enhance internal links with semantic data
                  document.querySelectorAll('a[href^="/"]').forEach(function(link) {
                    link.setAttribute('data-internal', 'true');
                  });
                },
                enhanceInternalLinking: function() {
                  // Create breadcrumb-like semantic structure
                  const path = window.location.pathname;
                  const pathParts = path.split('/').filter(Boolean);
                  if (pathParts.length > 0) {
                    const breadcrumbData = {
                      '@context': 'https://schema.org',
                      '@type': 'BreadcrumbList',
                      'itemListElement': [
                        {'@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'https://aileadstrategies.com'}
                      ]
                    };
                    pathParts.forEach(function(part, index) {
                      breadcrumbData.itemListElement.push({
                        '@type': 'ListItem',
                        'position': index + 2,
                        'name': part.replace(/-/g, ' ').replace(/\b\w/g, function(l) { return l.toUpperCase(); }),
                        'item': 'https://aileadstrategies.com/' + pathParts.slice(0, index + 1).join('/')
                      });
                    });
                    const script = document.createElement('script');
                    script.type = 'application/ld+json';
                    script.textContent = JSON.stringify(breadcrumbData);
                    document.head.appendChild(script);
                  }
                },
                trackReferrers: function() {
                  // Track incoming referrers for backlink analysis
                  const referrer = document.referrer;
                  if (referrer && !referrer.includes('aileadstrategies.com')) {
                    const data = { referrer: referrer, page: window.location.href, timestamp: Date.now() };
                    try { localStorage.setItem('als_referrer_' + Date.now(), JSON.stringify(data)); } catch(e) {}
                  }
                }
              };
              if (document.readyState === 'complete') { backlinkAgent.init(); }
              else { window.addEventListener('load', function() { backlinkAgent.init(); }); }
            })();
          `}
        </Script>
      </body>
    </html>
  )
}
