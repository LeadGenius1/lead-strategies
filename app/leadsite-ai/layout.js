import { generateSEOMetadata } from '@/lib/metadata';

export const metadata = generateSEOMetadata({
  title: 'LeadSite.AI - AI Lead Scoring & Enrichment Software - $49/mo',
  description:
    'AI-powered lead scoring and enrichment platform that finds 20-50 qualified prospects daily using Google Maps and Apollo.io. Start free trial.',
  canonical: 'https://aileadstrategies.com/leadsite-ai',
  ogImage: '/og-image.png',
  keywords: [
    'AI lead scoring',
    'lead enrichment software',
    'AI prospect discovery',
    'lead qualification automation',
    'B2B lead scoring',
    'sales lead scoring',
    'predictive lead scoring',
  ],
});

export default function LeadSiteAILayout({ children }) {
  return children;
}
