'use client';

/**
 * Reusable JSON-LD Structured Data component for SEO
 * Renders Schema.org structured data as a script tag
 * Pass pre-built schema object (with @context, @type) from lib/structuredData
 */
interface StructuredDataProps {
  /** Pre-built schema object - must include @context and @type */
  data: Record<string, unknown>;
}

export default function StructuredData({ data }: StructuredDataProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
