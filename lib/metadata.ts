/**
 * SEO Metadata Generator for Next.js App Router
 * Multi-Domain SEO Optimization - 2026-02-13
 */
import type { Metadata } from 'next';

interface GenerateMetadataProps {
  title: string;
  description: string;
  canonical?: string;
  ogImage?: string;
  keywords?: string[];
  noindex?: boolean;
}

const SITE_URL = 'https://aileadstrategies.com';
const DEFAULT_OG_IMAGE = '/og-image.png';

export function generateSEOMetadata({
  title,
  description,
  canonical,
  ogImage = DEFAULT_OG_IMAGE,
  keywords,
  noindex = false,
}: GenerateMetadataProps): Metadata {
  const fullTitle = `${title} | AI Lead Strategies`;
  const fullCanonical = canonical || SITE_URL;
  const fullOgImage = ogImage.startsWith('http') ? ogImage : `${SITE_URL}${ogImage}`;

  return {
    title: fullTitle,
    description,
    keywords: keywords?.join(', '),
    authors: [{ name: 'AI Lead Strategies LLC', url: SITE_URL }],
    robots: noindex ? 'noindex, nofollow' : 'index, follow',
    alternates: {
      canonical: fullCanonical,
    },
    openGraph: {
      title: fullTitle,
      description,
      url: fullCanonical,
      siteName: 'AI Lead Strategies',
      images: [
        {
          url: fullOgImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [fullOgImage],
      creator: '@aileadstrategies',
    },
  };
}
