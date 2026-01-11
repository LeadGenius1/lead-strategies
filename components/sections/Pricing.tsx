'use client';

import { Section } from '@/lib/website-builder/types';
import { Check, X } from 'lucide-react';

interface PricingProps {
  section: Section;
  isEditing?: boolean;
  onUpdate?: (content: Record<string, any>) => void;
}

export default function Pricing({ section, isEditing = false, onUpdate }: PricingProps) {
  const content = section.content;
  const settings = section.settings || {};
  const plans = content.plans || [];

  const handlePlanUpdate = (index: number, field: string, value: any) => {
    const updated = [...plans];
    updated[index] = { ...updated[index], [field]: value };
    onUpdate?.({ ...content, plans: updated });
  };

  const handleFeatureUpdate = (planIndex: number, featureIndex: number, value: string) => {
    const updated = [...plans];
    const features = [...(updated[planIndex].features || [])];
    features[featureIndex] = value;
    updated[planIndex] = { ...updated[planIndex], features };
    onUpdate?.({ ...content, plans: updated });
  };

  const addPlan = () => {
    onUpdate?.({
      ...content,
      plans: [
        ...plans,
        {
          name: 'New Plan',
          price: '$0',
          interval: '/month',
          features: ['Feature 1', 'Feature 2', 'Feature 3'],
          cta: 'Get Started',
          highlighted: false,
        },
      ],
    });
  };

  const removePlan = (index: number) => {
    const updated = plans.filter((_: any, i: number) => i !== index);
    onUpdate?.({ ...content, plans: updated });
  };

  return (
    <div
      className="relative"
      style={{
        backgroundColor: settings.backgroundColor || '#030303',
        color: settings.textColor || '#ffffff',
        paddingTop: `${settings.padding?.top || 60}px`,
        paddingBottom: `${settings.padding?.bottom || 60}px`,
      }}
    >
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Title */}
        <div className="text-center mb-12">
          {isEditing ? (
            <>
              <input
                type="text"
                value={content.title || ''}
                onChange={(e) => onUpdate?.({ ...content, title: e.target.value })}
                className="w-full max-w-2xl mx-auto bg-transparent border border-purple-500/30 p-3 text-3xl font-bold text-center text-white outline-none focus:border-purple-500 mb-4"
                placeholder="Section title"
              />
              <input
                type="text"
                value={content.subtitle || ''}
                onChange={(e) => onUpdate?.({ ...content, subtitle: e.target.value })}
                className="w-full max-w-xl mx-auto bg-transparent border border-purple-500/30 p-2 text-sm text-center text-neutral-300 outline-none focus:border-purple-500"
                placeholder="Subtitle"
              />
            </>
          ) : (
            <>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                {content.title || 'Choose Your Plan'}
              </h2>
              {content.subtitle && (
                <p className="text-neutral-300 text-lg">
                  {content.subtitle}
                </p>
              )}
            </>
          )}
        </div>

        {/* Pricing Cards */}
        <div className={`grid grid-cols-1 md:grid-cols-${Math.min(plans.length, 3)} gap-8`}>
          {plans.map((plan: any, planIndex: number) => (
            <div
              key={planIndex}
              className={`relative p-8 ${
                plan.highlighted
                  ? 'bg-gradient-to-br from-purple-900/50 to-pink-900/50 border-2 border-purple-500 scale-105 shadow-2xl shadow-purple-500/20'
                  : 'bg-neutral-900/50 border border-neutral-800'
              } transition-all hover:border-neutral-700`}
            >
              {isEditing && (
                <button
                  onClick={() => removePlan(planIndex)}
                  className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 text-xs font-bold uppercase hover:bg-red-600 z-10"
                >
                  Remove
                </button>
              )}

              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1 text-xs font-bold uppercase">
                  Most Popular
                </div>
              )}

              {/* Plan Name */}
              {isEditing ? (
                <input
                  type="text"
                  value={plan.name || ''}
                  onChange={(e) => handlePlanUpdate(planIndex, 'name', e.target.value)}
                  className="w-full bg-transparent border border-purple-500/30 p-2 text-lg font-bold text-center text-white outline-none focus:border-purple-500 mb-4"
                  placeholder="Plan name"
                />
              ) : (
                <h3 className="text-2xl font-bold text-center mb-4">{plan.name}</h3>
              )}

              {/* Price */}
              <div className="text-center mb-6">
                {isEditing ? (
                  <div className="flex items-baseline justify-center gap-2">
                    <input
                      type="text"
                      value={plan.price || ''}
                      onChange={(e) => handlePlanUpdate(planIndex, 'price', e.target.value)}
                      className="w-24 bg-transparent border border-purple-500/30 p-2 text-4xl font-bold text-white outline-none focus:border-purple-500"
                      placeholder="$99"
                    />
                    <input
                      type="text"
                      value={plan.interval || ''}
                      onChange={(e) => handlePlanUpdate(planIndex, 'interval', e.target.value)}
                      className="w-24 bg-transparent border border-purple-500/30 p-2 text-sm text-neutral-400 outline-none focus:border-purple-500"
                      placeholder="/month"
                    />
                  </div>
                ) : (
                  <>
                    <div className="text-5xl font-bold mb-1">
                      {plan.price || '$0'}
                    </div>
                    <div className="text-neutral-400 text-sm">
                      {plan.interval || '/month'}
                    </div>
                  </>
                )}
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-8">
                {(plan.features || []).map((feature: any, featureIndex: number) => (
                  <li key={featureIndex} className="flex items-start gap-3">
                    {typeof feature === 'string' ? (
                      <>
                        <Check className="text-purple-500 flex-shrink-0 mt-1" size={18} />
                        {isEditing ? (
                          <input
                            type="text"
                            value={feature}
                            onChange={(e) => handleFeatureUpdate(planIndex, featureIndex, e.target.value)}
                            className="flex-1 bg-transparent border border-purple-500/30 p-1 text-sm text-white outline-none focus:border-purple-500"
                            placeholder="Feature"
                          />
                        ) : (
                          <span className="text-sm">{feature}</span>
                        )}
                      </>
                    ) : (
                      <>
                        {feature.included ? (
                          <Check className="text-purple-500 flex-shrink-0 mt-1" size={18} />
                        ) : (
                          <X className="text-neutral-600 flex-shrink-0 mt-1" size={18} />
                        )}
                        <span className={`text-sm ${!feature.included ? 'text-neutral-500 line-through' : ''}`}>
                          {feature.name}
                        </span>
                      </>
                    )}
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              {isEditing ? (
                <input
                  type="text"
                  value={plan.cta || ''}
                  onChange={(e) => handlePlanUpdate(planIndex, 'cta', e.target.value)}
                  className="w-full bg-transparent border border-purple-500/30 p-2 text-sm text-center text-white outline-none focus:border-purple-500"
                  placeholder="Button text"
                />
              ) : (
                <button
                  className={`w-full py-3 font-bold tracking-widest uppercase transition-all ${
                    plan.highlighted
                      ? 'bg-white text-black hover:bg-neutral-200'
                      : 'bg-neutral-800 text-white hover:bg-neutral-700 border border-neutral-700'
                  }`}
                >
                  {plan.cta || 'Get Started'}
                </button>
              )}

              {/* Highlight Toggle (Edit Mode) */}
              {isEditing && (
                <label className="flex items-center justify-center gap-2 mt-4 text-xs text-neutral-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={plan.highlighted || false}
                    onChange={(e) => handlePlanUpdate(planIndex, 'highlighted', e.target.checked)}
                    className="form-checkbox"
                  />
                  Highlight as popular
                </label>
              )}
            </div>
          ))}
        </div>

        {/* Add Plan Button (Edit Mode) */}
        {isEditing && (
          <div className="text-center mt-8">
            <button
              onClick={addPlan}
              className="bg-purple-500 text-white px-6 py-2 text-sm font-bold uppercase hover:bg-purple-600"
            >
              + Add Plan
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
