'use client';

import { Section } from '@/lib/website-builder/types';

interface HeroProps {
  section: Section;
  isEditing?: boolean;
  onUpdate?: (content: Record<string, any>) => void;
}

export default function Hero({ section, isEditing = false, onUpdate }: HeroProps) {
  const content = section.content;
  const settings = section.settings || {};

  return (
    <div
      className="relative"
      style={{
        backgroundColor: settings.backgroundColor || '#030303',
        color: settings.textColor || '#ffffff',
        paddingTop: `${settings.padding?.top || 80}px`,
        paddingBottom: `${settings.padding?.bottom || 80}px`,
        paddingLeft: `${settings.padding?.left || 0}px`,
        paddingRight: `${settings.padding?.right || 0}px`,
      }}
    >
      <div className="container mx-auto px-4 max-w-6xl">
        <div
          className={`text-center ${
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
                className="w-full bg-transparent border border-purple-500/30 p-4 text-4xl md:text-6xl font-bold text-white outline-none focus:border-purple-500 font-space-grotesk mb-4"
                placeholder="Enter title"
              />
              <input
                type="text"
                value={content.subtitle || ''}
                onChange={(e) => onUpdate?.({ ...content, subtitle: e.target.value })}
                className="w-full bg-transparent border border-purple-500/30 p-3 text-lg md:text-xl text-neutral-300 outline-none focus:border-purple-500 font-geist mb-6"
                placeholder="Enter subtitle"
              />
              <div className="flex gap-4 justify-center">
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
              <h1 className="text-4xl md:text-6xl font-bold mb-4 font-space-grotesk">
                {content.title || 'Welcome'}
              </h1>
              <p className="text-lg md:text-xl text-neutral-300 mb-8 font-geist">
                {content.subtitle || 'Get started today'}
              </p>
              {content.ctaText && (
                <a
                  href={content.ctaLink || '#'}
                  className="inline-block bg-white text-black px-8 py-3 text-sm font-bold tracking-widest uppercase hover:bg-neutral-200 transition-colors font-geist"
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
