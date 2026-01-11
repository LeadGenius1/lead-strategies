'use client';

import { Section } from '@/lib/website-builder/types';
import { Star } from 'lucide-react';

interface TestimonialsProps {
  section: Section;
  isEditing?: boolean;
  onUpdate?: (content: Record<string, any>) => void;
}

export default function Testimonials({ section, isEditing = false, onUpdate }: TestimonialsProps) {
  const content = section.content;
  const settings = section.settings || {};
  const testimonials = content.testimonials || [];

  const handleTestimonialUpdate = (index: number, field: string, value: string) => {
    const updated = [...testimonials];
    updated[index] = { ...updated[index], [field]: value };
    onUpdate?.({ ...content, testimonials: updated });
  };

  const addTestimonial = () => {
    onUpdate?.({
      ...content,
      testimonials: [
        ...testimonials,
        {
          name: 'New Customer',
          company: 'Company',
          quote: 'Add your testimonial here',
          avatar: '',
          rating: 5,
        },
      ],
    });
  };

  const removeTestimonial = (index: number) => {
    const updated = testimonials.filter((_: any, i: number) => i !== index);
    onUpdate?.({ ...content, testimonials: updated });
  };

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
        {/* Title */}
        {isEditing ? (
          <input
            type="text"
            value={content.title || ''}
            onChange={(e) => onUpdate?.({ ...content, title: e.target.value })}
            className="w-full bg-transparent border border-purple-500/30 p-3 text-3xl font-bold text-center text-white outline-none focus:border-purple-500 mb-12"
            placeholder="Section title"
          />
        ) : (
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            {content.title || 'What Our Customers Say'}
          </h2>
        )}

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial: any, index: number) => (
            <div
              key={index}
              className="relative p-6 bg-neutral-900/50 border border-neutral-800 hover:border-neutral-700 transition-colors"
            >
              {isEditing && (
                <button
                  onClick={() => removeTestimonial(index)}
                  className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 text-xs font-bold uppercase hover:bg-red-600 z-10"
                >
                  Remove
                </button>
              )}

              {/* Rating */}
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    className={i < (testimonial.rating || 5) ? 'fill-yellow-400 text-yellow-400' : 'text-neutral-600'}
                  />
                ))}
              </div>

              {/* Quote */}
              {isEditing ? (
                <textarea
                  value={testimonial.quote || ''}
                  onChange={(e) => handleTestimonialUpdate(index, 'quote', e.target.value)}
                  className="w-full bg-transparent border border-purple-500/30 p-2 text-sm text-neutral-300 outline-none focus:border-purple-500 mb-4 resize-none"
                  rows={3}
                  placeholder="Customer quote"
                />
              ) : (
                <p className="text-neutral-300 mb-4 text-sm leading-relaxed">
                  "{testimonial.quote}"
                </p>
              )}

              {/* Author Info */}
              <div className="flex items-center gap-3">
                {testimonial.avatar ? (
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm">
                    {testimonial.name?.charAt(0) || 'A'}
                  </div>
                )}
                <div className="flex-1">
                  {isEditing ? (
                    <>
                      <input
                        type="text"
                        value={testimonial.name || ''}
                        onChange={(e) => handleTestimonialUpdate(index, 'name', e.target.value)}
                        className="w-full bg-transparent border border-purple-500/30 p-1 text-xs text-white outline-none focus:border-purple-500 mb-1"
                        placeholder="Customer name"
                      />
                      <input
                        type="text"
                        value={testimonial.company || ''}
                        onChange={(e) => handleTestimonialUpdate(index, 'company', e.target.value)}
                        className="w-full bg-transparent border border-purple-500/30 p-1 text-xs text-neutral-400 outline-none focus:border-purple-500"
                        placeholder="Company name"
                      />
                    </>
                  ) : (
                    <>
                      <div className="font-semibold text-sm">{testimonial.name}</div>
                      <div className="text-xs text-neutral-400">{testimonial.company}</div>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add Testimonial Button (Edit Mode) */}
        {isEditing && (
          <div className="text-center mt-8">
            <button
              onClick={addTestimonial}
              className="bg-purple-500 text-white px-6 py-2 text-sm font-bold uppercase hover:bg-purple-600"
            >
              + Add Testimonial
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
