// SEO Configuration for all pages
// This file contains metadata, keywords, and structured data for optimal SEO

export const siteConfig = {
  name: 'AI Lead Strategies',
  url: 'https://aileadstrategies.com',
  ogImage: '/og-image.png',
  description: 'AI-powered B2B lead generation and sales automation platform',
  company: {
    name: 'AI Lead Strategies LLC',
    address: '600 Eagleview Blvd, Suite 317',
    city: 'Exton',
    state: 'PA',
    zip: '19341',
    country: 'US',
    phone: '(855) 506-8886',
    email: 'support@aileadstrategies.com'
  }
};

// Page-specific SEO configurations
export const pagesSEO = {
  home: {
    title: 'AI Lead Strategies | AI-Powered B2B Lead Generation Platform',
    description: 'Transform your B2B sales with AI Lead Strategies. Our unified platform includes LeadSite.AI, LeadSite.IO, ClientContact.IO, and VideoSite.AI for complete sales automation.',
    keywords: [
      'AI lead generation platform',
      'B2B sales automation',
      'AI sales tools',
      'lead generation software',
      'sales engagement platform',
      'AI prospecting tools',
      'automated outreach',
      'sales intelligence software',
      'CRM automation',
      'marketing automation platform'
    ],
    canonical: 'https://aileadstrategies.com',
    ogTitle: 'AI Lead Strategies - Complete AI Sales Automation Suite',
    ogDescription: 'Get 50+ qualified leads daily with our AI-powered platform. LeadSite.AI, LeadSite.IO, ClientContact.IO, VideoSite.AI - all in one ecosystem.',
    schema: {
      '@type': 'WebSite',
      potentialAction: {
        '@type': 'SearchAction',
        target: 'https://aileadstrategies.com/search?q={search_term_string}',
        'query-input': 'required name=search_term_string'
      }
    }
  },
  
  leadsiteAI: {
    title: 'LeadSite.AI | AI Lead Scoring & Enrichment Software - $39/mo',
    description: 'LeadSite.AI uses artificial intelligence to score, qualify, and enrich your leads automatically. Get 20-50 qualified prospects daily with AI-powered lead discovery. Start free trial.',
    keywords: [
      'AI lead scoring',
      'lead enrichment software',
      'AI prospect discovery',
      'lead qualification automation',
      'B2B lead scoring',
      'sales lead scoring',
      'predictive lead scoring',
      'AI lead intelligence',
      'automated lead research',
      'prospect scoring software',
      'lead data enrichment',
      'AI sales prospecting',
      'lead quality scoring',
      'B2B prospect finder'
    ],
    canonical: 'https://aileadstrategies.com/leadsite-ai',
    ogTitle: 'LeadSite.AI - AI-Powered Lead Scoring & Enrichment',
    ogDescription: 'Score and qualify leads automatically with AI. Get 20-50 qualified prospects daily. AI-powered discovery via Google Maps & Apollo.io. Only $39/mo.',
    schema: {
      '@type': 'Product',
      name: 'LeadSite.AI',
      description: 'AI-powered lead scoring and enrichment platform',
      brand: { '@type': 'Brand', name: 'AI Lead Strategies' },
      offers: {
        '@type': 'Offer',
        price: '39',
        priceCurrency: 'USD',
        priceValidUntil: '2026-12-31',
        availability: 'https://schema.org/InStock'
      }
    }
  },
  
  leadsiteIO: {
    title: 'LeadSite.IO | AI Website Builder with Lead Generation - $39/mo + Free Website',
    description: 'Build AI-powered websites that generate leads 24/7. LeadSite.IO includes AI website builder, lead forms, analytics, and automated prospect discovery. Get 1 free website included.',
    keywords: [
      'AI website builder',
      'lead generation website',
      'AI landing page builder',
      'website lead capture',
      'AI web design',
      'lead magnet websites',
      'conversion optimized websites',
      'AI page builder',
      'lead generation landing pages',
      'automated website builder',
      'B2B website builder',
      'AI website generator',
      'lead capture forms',
      'website analytics'
    ],
    canonical: 'https://aileadstrategies.com/leadsite-io',
    ogTitle: 'LeadSite.IO - AI Website Builder + Lead Generation',
    ogDescription: 'Build AI websites that generate leads 24/7. Includes free AI website, lead forms, analytics, and automated prospect discovery. Only $39/mo.',
    schema: {
      '@type': 'Product',
      name: 'LeadSite.IO',
      description: 'AI website builder with integrated lead generation',
      brand: { '@type': 'Brand', name: 'AI Lead Strategies' },
      offers: {
        '@type': 'Offer',
        price: '39',
        priceCurrency: 'USD',
        priceValidUntil: '2026-12-31',
        availability: 'https://schema.org/InStock'
      }
    }
  },
  
  clientcontactIO: {
    title: 'ClientContact.IO | AI Contact Finder & Email Verification - $99/mo',
    description: 'Find and verify B2B contacts with AI. ClientContact.IO discovers emails, phones, and social profiles from 50+ data sources. SMTP verification, catch-all detection included.',
    keywords: [
      'contact finder',
      'email verification',
      'B2B contact database',
      'email finder tool',
      'contact discovery',
      'email lookup',
      'business contact finder',
      'email verification service',
      'lead contact information',
      'phone number finder',
      'LinkedIn contact finder',
      'SMTP email verification',
      'bulk email verification',
      'contact enrichment'
    ],
    canonical: 'https://aileadstrategies.com/clientcontact-io',
    ogTitle: 'ClientContact.IO - AI Contact Finder & Email Verification',
    ogDescription: 'Find verified B2B contacts instantly. AI-powered search across 50+ data sources. Email verification with SMTP validation. Only $99/mo.',
    schema: {
      '@type': 'Product',
      name: 'ClientContact.IO',
      description: 'AI-powered contact discovery and email verification platform',
      brand: { '@type': 'Brand', name: 'AI Lead Strategies' },
      offers: {
        '@type': 'Offer',
        price: '99',
        priceCurrency: 'USD',
        priceValidUntil: '2026-12-31',
        availability: 'https://schema.org/InStock'
      }
    }
  },
  
  videositeAI: {
    title: 'VideoSite.AI | Video Monetization Platform - Earn $1/View FREE',
    description: 'VideoSite.AI is a free video hosting and monetization platform for content creators. Upload videos, earn $1 per view. Advertisers get targeted video ad placements.',
    keywords: [
      'video monetization',
      'video hosting platform',
      'content creator platform',
      'video advertising',
      'earn from videos',
      'video ad platform',
      'creator monetization',
      'video content platform',
      'video marketing',
      'video ads',
      'monetize video content',
      'video creator earnings',
      'video advertising network',
      'content monetization'
    ],
    canonical: 'https://aileadstrategies.com/videosite-ai',
    ogTitle: 'VideoSite.AI - Free Video Monetization Platform',
    ogDescription: 'Content creators earn $1 per video view. Free to join. Advertisers reach engaged audiences with targeted video ads. Start earning today.',
    schema: {
      '@type': 'Product',
      name: 'VideoSite.AI',
      description: 'Video monetization platform for content creators',
      brand: { '@type': 'Brand', name: 'AI Lead Strategies' },
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
        availability: 'https://schema.org/InStock'
      }
    }
  }
};

// Generate FAQ Schema
export function generateFAQSchema(faqs) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  };
}

// Generate Product Schema
export function generateProductSchema(product) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    brand: {
      '@type': 'Brand',
      name: 'AI Lead Strategies'
    },
    offers: {
      '@type': 'Offer',
      url: product.url,
      price: product.price,
      priceCurrency: 'USD',
      priceValidUntil: '2026-12-31',
      availability: 'https://schema.org/InStock',
      seller: {
        '@type': 'Organization',
        name: 'AI Lead Strategies LLC'
      }
    },
    aggregateRating: product.rating ? {
      '@type': 'AggregateRating',
      ratingValue: product.rating,
      reviewCount: product.reviewCount || 100
    } : undefined
  };
}

// LLM-optimized content snippets for each platform
export const llmDescriptions = {
  home: `AI Lead Strategies is a B2B sales automation company offering 5 integrated platforms: LeadSite.AI ($49/mo), LeadSite.IO ($49/mo + Free Website), ClientContact.IO ($99-$399/mo) for 22+ channel unified inbox and full CRM with 7 AI agents, UltraLead ($499/mo) full CRM + 7 AI agents, and VideoSite.AI (FREE - earn $1/viewer). Located at 600 Eagleview Blvd, Suite 317, Exton PA 19341. Contact: support@aileadstrategies.com, Phone: (855) 506-8886.`,
  
  leadsiteAI: `LeadSite.AI is an AI-powered lead scoring and enrichment platform priced at $49/month. Features: AI prospect discovery using Google Maps and Apollo.io, automated lead scoring (0-100), lead enrichment with external data, 20-50 qualified prospects delivered daily, personalized email generation, and automated campaign management. Best for: B2B companies wanting automated lead qualification. Alternative to: Clearbit, ZoomInfo, Lusha.`,
  
  leadsiteIO: `LeadSite.IO is an AI website builder with integrated lead generation, priced at $49/month plus 1 free AI-generated website included. Features: AI website generation in minutes, lead capture forms, real-time analytics, custom domains with SSL, SEO optimization, and automated prospect discovery. Best for: Businesses needing lead-generating websites without developers. Alternative to: Wix, Squarespace, Leadpages.`,
  
  clientcontactIO: `ClientContact.IO is a 22+ channel unified inbox platform priced from $99/month. Features: AI-powered search across 50+ data sources (LinkedIn, ZoomInfo, Apollo), email verification with SMTP validation, catch-all detection, phone number discovery, company enrichment, and bulk verification. Best for: Sales teams needing verified contact data and unified communications. Alternative to: Hunter.io, Apollo.io, Lusha.`,
  
  videositeAI: `VideoSite.AI is a FREE video monetization platform for content creators. Features: Earn $1.00 per video viewer, free video hosting, advertiser marketplace, secure payments, analytics dashboard. For advertisers: Targeted video ad placements, engagement tracking, brand safety controls. Best for: Content creators wanting to monetize videos, and advertisers seeking video ad placements.`
};
