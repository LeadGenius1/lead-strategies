'use client';

import { Section } from '@/lib/website-builder/types';
import { ChevronDown, Plus, Minus } from 'lucide-react';
import { useState } from 'react';

interface FAQProps {
  section: Section;
  isEditing?: boolean;
  onUpdate?: (content: Record<string, any>) => void;
}

export default function FAQ({ section, isEditing = false, onUpdate }: FAQProps) {
  const content = section.content;
  const settings = section.settings || {};
  const faqs = content.faqs || [];
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const handleFAQUpdate = (index: number, field: string, value: string) => {
    const updated = [...faqs];
    updated[index] = { ...updated[index], [field]: value };
    onUpdate?.({ ...content, faqs: updated });
  };

  const addFAQ = () => {
    onUpdate?.({
      ...content,
      faqs: [
        ...faqs,
        {
          question: 'New Question?',
          answer: 'Add your answer here.',
        },
      ],
    });
  };

  const removeFAQ = (index: number) => {
    const updated = faqs.filter((_: any, i: number) => i !== index);
    onUpdate?.({ ...content, faqs: updated });
  };

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
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
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Title */}
        <div className="text-center mb-12">
          {isEditing ? (
            <>
              <input
                type="text"
                value={content.title || ''}
                onChange={(e) => onUpdate?.({ ...content, title: e.target.value })}
                className="w-full bg-transparent border border-purple-500/30 p-3 text-3xl font-bold text-center text-white outline-none focus:border-purple-500 mb-4"
                placeholder="Section title"
              />
              <textarea
                value={content.subtitle || ''}
                onChange={(e) => onUpdate?.({ ...content, subtitle: e.target.value })}
                className="w-full bg-transparent border border-purple-500/30 p-2 text-sm text-center text-neutral-300 outline-none focus:border-purple-500 resize-none"
                rows={2}
                placeholder="Subtitle (optional)"
              />
            </>
          ) : (
            <>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                {content.title || 'Frequently Asked Questions'}
              </h2>
              {content.subtitle && (
                <p className="text-neutral-300 text-lg">
                  {content.subtitle}
                </p>
              )}
            </>
          )}
        </div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {faqs.map((faq: any, index: number) => (
            <div
              key={index}
              className="relative border border-neutral-800 bg-neutral-900/30 hover:border-neutral-700 transition-colors"
            >
              {isEditing && (
                <button
                  onClick={() => removeFAQ(index)}
                  className="absolute top-4 right-12 bg-red-500 text-white px-2 py-1 text-xs font-bold uppercase hover:bg-red-600 z-10"
                >
                  Remove
                </button>
              )}

              {/* Question */}
              <div
                className={`flex items-center justify-between p-6 cursor-pointer ${
                  !isEditing ? 'hover:bg-neutral-900/50' : ''
                }`}
                onClick={() => !isEditing && toggleFAQ(index)}
              >
                {isEditing ? (
                  <input
                    type="text"
                    value={faq.question || ''}
                    onChange={(e) => handleFAQUpdate(index, 'question', e.target.value)}
                    className="flex-1 bg-transparent border border-purple-500/30 p-2 text-sm font-semibold text-white outline-none focus:border-purple-500 mr-4"
                    placeholder="Question"
                  />
                ) : (
                  <h3 className="font-semibold text-lg pr-8">
                    {faq.question}
                  </h3>
                )}

                {!isEditing && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFAQ(index);
                    }}
                    className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-neutral-800 hover:bg-neutral-700 transition-colors"
                  >
                    {openIndex === index ? (
                      <Minus size={16} />
                    ) : (
                      <Plus size={16} />
                    )}
                  </button>
                )}
              </div>

              {/* Answer */}
              {(isEditing || openIndex === index) && (
                <div className="px-6 pb-6">
                  {isEditing ? (
                    <textarea
                      value={faq.answer || ''}
                      onChange={(e) => handleFAQUpdate(index, 'answer', e.target.value)}
                      className="w-full bg-transparent border border-purple-500/30 p-2 text-sm text-neutral-300 outline-none focus:border-purple-500 resize-none"
                      rows={3}
                      placeholder="Answer"
                    />
                  ) : (
                    <div className="text-neutral-300 leading-relaxed">
                      {faq.answer}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Add FAQ Button (Edit Mode) */}
        {isEditing && (
          <div className="text-center mt-8">
            <button
              onClick={addFAQ}
              className="bg-purple-500 text-white px-6 py-2 text-sm font-bold uppercase hover:bg-purple-600"
            >
              + Add Question
            </button>
          </div>
        )}

        {/* Contact CTA */}
        {content.showContactCTA !== false && !isEditing && (
          <div className="mt-12 text-center p-8 bg-neutral-900/50 border border-neutral-800">
            <p className="text-neutral-300 mb-4">
              {content.contactText || "Still have questions? We're here to help."}
            </p>
            <a
              href={content.contactLink || '#contact'}
              className="inline-block bg-white text-black px-8 py-3 font-bold tracking-widest uppercase hover:bg-neutral-200 transition-colors"
            >
              {content.contactCTA || 'Contact Us'}
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
