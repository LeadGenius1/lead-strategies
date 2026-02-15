import { generateSEOMetadata } from '@/lib/metadata';

export const metadata = generateSEOMetadata({
  title: 'LeadSite.IO - AI Website Builder with Lead Generation - $49/mo + Free Website',
  description:
    'Build AI-powered websites that generate leads 24/7. LeadSite.IO includes AI website builder, lead forms, analytics, and 1 free AI-built website included.',
  canonical: 'https://aileadstrategies.com/leadsite-io',
  ogImage: '/og-image.png',
  keywords: [
    'AI website builder',
    'lead generation website',
    'AI landing page builder',
    'website lead capture',
    'AI web design',
    'lead magnet websites',
    'conversion optimized websites',
  ],
});

export default function LeadSiteIOLayout({ children }) {
  return children;
}
