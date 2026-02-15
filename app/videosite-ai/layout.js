import { generateSEOMetadata } from '@/lib/metadata';

export const metadata = generateSEOMetadata({
  title: 'VideoSite.AI - Free Video Hosting Platform | Earn Per View',
  description:
    'Free video hosting where creators earn $0.01 per view. Upload unlimited videos, no ads, no subscription. Start monetizing your content today.',
  canonical: 'https://aileadstrategies.com/videosite-ai',
  ogImage: '/og-image.png',
  keywords: [
    'free video hosting',
    'creator earnings',
    'video monetization',
    'no ads video platform',
    'earn from videos',
  ],
});

export default function VideoSiteAILayout({ children }) {
  return children;
}
