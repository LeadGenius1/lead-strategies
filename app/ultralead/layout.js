import { generateSEOMetadata } from '@/lib/metadata';

export const metadata = generateSEOMetadata({
  title: 'UltraLead - AI Sales Command Center | Full CRM + 7 AI Agents',
  description:
    'Your Complete AI Sales Command Center. Full CRM, 7 self-healing AI agents, 22+ channel unified inbox, voice calling with AI transcription. $499/mo. Start free trial.',
  canonical: 'https://aileadstrategies.com/ultralead',
  ogImage: '/og-image.png',
  keywords: [
    'AI sales automation',
    'CRM software',
    'AI agents',
    'unified inbox',
    'sales command center',
    'B2B sales platform',
    'enterprise CRM',
  ],
});

export default function UltraLeadLayout({ children }) {
  return children;
}
