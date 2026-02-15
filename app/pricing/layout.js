import { generateSEOMetadata } from '@/lib/metadata';

export const metadata = generateSEOMetadata({
  title: 'Pricing - AI Lead Strategies Platform Plans',
  description:
    'Transparent pricing for AI Lead Strategies. LeadSite.AI ($49), LeadSite.IO ($49+Free Website), ClientContact.IO ($99-$399), UltraLead ($499), VideoSite.AI (FREE). 14-day free trial.',
  canonical: 'https://aileadstrategies.com/pricing',
  ogImage: '/og-image.png',
  keywords: [
    'AI lead generation pricing',
    'sales automation pricing',
    'B2B platform pricing',
    'CRM pricing',
    'lead generation software cost',
  ],
});

export default function PricingLayout({ children }) {
  return children;
}
