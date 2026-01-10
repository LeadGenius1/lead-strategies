'use client';

import { Section } from '@/lib/website-builder/types';

interface FeaturesProps {
  section: Section;
  isEditing?: boolean;
  onUpdate?: (content: Record<string, any>) => void;
}

export default function Features({ section, isEditing = false, onUpdate }: FeaturesProps) {
  const content = section.content;
  const settings = section.settings || {};
  const columns = content.columns || 3;
  const gridCols = columns === 2 ? 'md:grid-cols-2' : columns === 4 ? 'md:grid-cols-4' : 'md:grid-cols-3';

  return (
    <div
      className="relative"
      style={{
        backgroundColor: settings.backgroundColor || '#050505',
        color: settings.textColor || '#ffffff',
        paddingTop: `${settings.padding?.top || 60}px`,
        paddingBottom: `${settings.padding?.bottom || 60}px`,
      }}
    >
      <div className="container mx-auto px-4 max-w-6xl">
        {isEditing ? (
          <>
            <input
              type="text"
              value={content.title || ''}
              onChange={(e) => onUpdate?.({ ...content, title: e.target.value })}
              className="w-full bg-transparent border border-purple-500/30 p-3 text-2xl font-bold text-white outline-none focus:border-purple-500 font-space-grotesk mb-2"
              placeholder="Section title"
            />
            <input
              type="text"
              value={content.subtitle || ''}
              onChange={(e) => onUpdate?.({ ...content, subtitle: e.target.value })}
              className="w-full bg-transparent border border-purple-500/30 p-2 text-neutral-300 outline-none focus:border-purple-500 font-geist mb-6"
              placeholder="Section subtitle"
            />
          </>
        ) : (
          <>
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 font-space-grotesk">
              {content.title || 'Key Features'}
            </h2>
            {content.subtitle && (
              <p className="text-center text-neutral-400 mb-12 font-geist">
                {content.subtitle}
              </p>
            )}
          </>
        )}

        <div className={`grid grid-cols-1 ${gridCols} gap-6`}>
          {(content.features || []).map((feature: any, index: number) => (
            <div
              key={index}
              className="bg-[#030303] border border-subtle p-6 hover:border-purple-500/30 transition-all"
            >
              {isEditing ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={feature.icon || ''}
                    onChange={(e) => {
                      const newFeatures = [...(content.features || [])];
                      newFeatures[index] = { ...feature, icon: e.target.value };
                      onUpdate?.({ ...content, features: newFeatures });
                    }}
                    className="w-full bg-transparent border border-purple-500/30 p-2 text-white outline-none focus:border-purple-500 font-geist"
                    placeholder="Icon emoji"
                  />
                  <input
                    type="text"
                    value={feature.title || ''}
                    onChange={(e) => {
                      const newFeatures = [...(content.features || [])];
                      newFeatures[index] = { ...feature, title: e.target.value };
                      onUpdate?.({ ...content, features: newFeatures });
                    }}
                    className="w-full bg-transparent border border-purple-500/30 p-2 text-white outline-none focus:border-purple-500 font-geist"
                    placeholder="Feature title"
                  />
                  <textarea
                    value={feature.description || ''}
                    onChange={(e) => {
                      const newFeatures = [...(content.features || [])];
                      newFeatures[index] = { ...feature, description: e.target.value };
                      onUpdate?.({ ...content, features: newFeatures });
                    }}
                    className="w-full bg-transparent border border-purple-500/30 p-2 text-neutral-300 outline-none focus:border-purple-500 font-geist"
                    placeholder="Feature description"
                    rows={3}
                  />
                </div>
              ) : (
                <>
                  <div className="text-4xl mb-4">{feature.icon || '✨'}</div>
                  <h3 className="text-xl font-semibold mb-2 font-space-grotesk">
                    {feature.title || 'Feature'}
                  </h3>
                  <p className="text-neutral-400 font-geist">
                    {feature.description || 'Feature description'}
                  </p>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
