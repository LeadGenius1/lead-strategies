'use client';

import { Section } from '@/lib/website-builder/types';
import { Rocket, Shield, TrendingUp, Sparkles } from 'lucide-react';

const getFeatureIcon = (iconName: string) => {
  const icons: Record<string, React.ReactNode> = {
    rocket: <Rocket className="w-10 h-10 text-purple-400" />,
    shield: <Shield className="w-10 h-10 text-purple-400" />,
    'trending-up': <TrendingUp className="w-10 h-10 text-purple-400" />,
  };
  return icons[iconName?.toLowerCase()] || <Sparkles className="w-10 h-10 text-purple-400" />;
};

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
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4" style={{ fontFamily: 'Inter, sans-serif', letterSpacing: '-0.02em' }}>
              {content.title || 'Key Features'}
            </h2>
            {content.subtitle && (
              <p className="text-center text-neutral-400 mb-12" style={{ fontFamily: 'Inter, sans-serif' }}>
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
                    className="w-full bg-transparent border border-purple-500/30 p-2 text-white outline-none focus:border-purple-500" style={{ fontFamily: 'Inter, sans-serif' }}
                    placeholder="Icon name (rocket, shield, trending-up)"
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
                  <div className="mb-4 flex items-center justify-center">
                    {getFeatureIcon(feature.icon || 'sparkles')}
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-center" style={{ fontFamily: 'Inter, sans-serif' }}>
                    {feature.title || 'Feature'}
                  </h3>
                  <p className="text-neutral-400 text-center" style={{ fontFamily: 'Inter, sans-serif' }}>
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
