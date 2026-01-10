'use client';

import { Section } from '@/lib/website-builder/types';

interface CTAProps {
  section: Section;
  isEditing?: boolean;
  onUpdate?: (content: Record<string, any>) => void;
}

export default function CTA({ section, isEditing = false, onUpdate }: CTAProps) {
  const content = section.content;
  const settings = section.settings || {};

  return (
    <div
      className="relative"
      style={{
        backgroundColor: settings.backgroundColor || '#1a1a1a',
        color: settings.textColor || '#ffffff',
        paddingTop: `${settings.padding?.top || 60}px`,
        paddingBottom: `${settings.padding?.bottom || 60}px`,
      }}
    >
      <div className="container mx-auto px-4 max-w-4xl">
        <div
          className={`${
            content.alignment === 'left' ? 'text-left' : 
            content.alignment === 'right' ? 'text-right' : 
            'text-center'
          }`}
        >
          {isEditing ? (
            <>
              <input
                type="text"
                value={content.title || ''}
                onChange={(e) => onUpdate?.({ ...content, title: e.target.value })}
                className="w-full bg-transparent border border-purple-500/30 p-3 text-2xl font-bold text-white outline-none focus:border-purple-500 mb-2" style={{ fontFamily: 'Inter, sans-serif', letterSpacing: '-0.02em' }}
                placeholder="CTA title"
              />
              <input
                type="text"
                value={content.subtitle || ''}
                onChange={(e) => onUpdate?.({ ...content, subtitle: e.target.value })}
                className="w-full bg-transparent border border-purple-500/30 p-2 text-neutral-300 outline-none focus:border-purple-500 font-geist mb-4"
                placeholder="CTA subtitle"
              />
              <div className="flex gap-4">
                <input
                  type="text"
                  value={content.ctaText || ''}
                  onChange={(e) => onUpdate?.({ ...content, ctaText: e.target.value })}
                  className="bg-transparent border border-purple-500/30 p-2 text-sm text-white outline-none focus:border-purple-500 font-geist"
                  placeholder="Button text"
                />
                <input
                  type="text"
                  value={content.ctaLink || ''}
                  onChange={(e) => onUpdate?.({ ...content, ctaLink: e.target.value })}
                  className="bg-transparent border border-purple-500/30 p-2 text-sm text-white outline-none focus:border-purple-500 font-geist"
                  placeholder="Button link"
                />
              </div>
            </>
          ) : (
            <>
              <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ fontFamily: 'Inter, sans-serif', letterSpacing: '-0.02em' }}>
                {content.title || 'Ready to Get Started?'}
              </h2>
              {content.subtitle && (
                <p className="text-lg text-neutral-300 mb-8" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {content.subtitle}
                </p>
              )}
              {content.ctaText && (
                <a
                  href={content.ctaLink || '#'}
                  className="inline-block bg-white text-black px-8 py-3 text-sm font-bold tracking-widest uppercase hover:bg-neutral-200 transition-colors" style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  {content.ctaText}
                </a>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
