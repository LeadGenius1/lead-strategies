import { generateSEOMetadata } from '@/lib/metadata';

export const metadata = generateSEOMetadata({
  title: 'UltraLead.AI — Your AI Marketing Team | 7 Agents, Every Channel, One Dashboard',
  description:
    'Stop doing your own marketing. UltraLead.AI gives you 7 AI agents that research your market, write your content, find your leads, and post to every channel — automatically. $499/mo. Start free.',
  canonical: 'https://aileadstrategies.com/ultralead',
  ogImage: '/og-image.png',
  keywords: [
    'AI marketing automation',
    'autonomous marketing',
    'AI agents',
    'outreach marketing',
    'lead generation',
    'content automation',
    'marketing AI platform',
  ],
});

export default function UltraLeadLayout({ children }) {
  return children;
}
