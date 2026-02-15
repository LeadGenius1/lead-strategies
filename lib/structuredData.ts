/**
 * Schema.org JSON-LD Structured Data for SEO
 * Multi-Domain SEO Optimization - 2026-02-13
 */

// Organization Schema for Homepage
export const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'AI Lead Strategies LLC',
  url: 'https://aileadstrategies.com',
  logo: 'https://aileadstrategies.com/logo.png',
  description: 'AI-powered lead generation and sales automation platform for B2B businesses',
  foundingDate: '2025',
  address: {
    '@type': 'PostalAddress',
    streetAddress: '600 Eagleview Blvd, Suite 317',
    addressLocality: 'Exton',
    addressRegion: 'PA',
    postalCode: '19341',
    addressCountry: 'US',
  },
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'Customer Service',
    email: 'support@aileadstrategies.com',
    telephone: '+1-855-506-8886',
  },
  sameAs: [
    'https://www.linkedin.com/company/ai-lead-strategies',
    'https://twitter.com/aileadstrategies',
    'https://github.com/aileadstrategies',
  ],
};

// WebSite Schema with Search Action
export const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'AI Lead Strategies',
  url: 'https://aileadstrategies.com',
  description: 'AI-powered B2B lead generation and sales automation platform',
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: 'https://aileadstrategies.com/search?q={search_term_string}',
    },
    'query-input': 'required name=search_term_string',
  },
  publisher: {
    '@type': 'Organization',
    name: 'AI Lead Strategies LLC',
    logo: 'https://aileadstrategies.com/logo.png',
  },
};

// SoftwareApplication Schema factory for Platform Pages
export function createSoftwareSchema(
  name: string,
  description: string,
  price: string,
  url: string
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name,
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    description,
    url,
    offers: {
      '@type': 'Offer',
      price,
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '127',
    },
  };
}

// VideoSite.AI specific schema (FREE platform)
export const videositeSchema = createSoftwareSchema(
  'VideoSite.AI',
  'Free video hosting platform where creators earn money per view',
  '0',
  'https://aileadstrategies.com/videosite-ai'
);

// ClientContact.IO specific schema
export const clientContactSchema = createSoftwareSchema(
  'ClientContact.IO',
  'Unified inbox for managing customer communication across 22+ channels',
  '99',
  'https://aileadstrategies.com/clientcontact-io'
);

// UltraLead.AI specific schema
export const ultraLeadSchema = createSoftwareSchema(
  'UltraLead.AI',
  'All-in-one AI-powered lead generation and sales automation platform',
  '499',
  'https://aileadstrategies.com/ultralead'
);

// LeadSite.AI specific schema
export const leadSiteAISchema = createSoftwareSchema(
  'LeadSite.AI',
  'AI-powered lead scoring and enrichment platform',
  '49',
  'https://aileadstrategies.com/leadsite-ai'
);

// LeadSite.IO specific schema
export const leadSiteIOSchema = createSoftwareSchema(
  'LeadSite.IO',
  'AI website builder with integrated lead generation',
  '49',
  'https://aileadstrategies.com/leadsite-io'
);
