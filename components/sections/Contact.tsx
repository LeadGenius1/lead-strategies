'use client';

import { Section } from '@/lib/website-builder/types';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { useState } from 'react';

interface ContactProps {
  section: Section;
  isEditing?: boolean;
  onUpdate?: (content: Record<string, any>) => void;
}

export default function Contact({ section, isEditing = false, onUpdate }: ContactProps) {
  const content = section.content;
  const settings = section.settings || {};
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // In production, this would submit to an API
    console.log('Form submitted:', formData);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
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
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left Column - Contact Info */}
          <div>
            {/* Title */}
            {isEditing ? (
              <>
                <input
                  type="text"
                  value={content.title || ''}
                  onChange={(e) => onUpdate?.({ ...content, title: e.target.value })}
                  className="w-full bg-transparent border border-purple-500/30 p-3 text-3xl font-bold text-white outline-none focus:border-purple-500 mb-4"
                  placeholder="Section title"
                />
                <textarea
                  value={content.subtitle || ''}
                  onChange={(e) => onUpdate?.({ ...content, subtitle: e.target.value })}
                  className="w-full bg-transparent border border-purple-500/30 p-2 text-sm text-neutral-300 outline-none focus:border-purple-500 mb-8 resize-none"
                  rows={2}
                  placeholder="Subtitle"
                />
              </>
            ) : (
              <>
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  {content.title || 'Get In Touch'}
                </h2>
                <p className="text-neutral-300 mb-8 text-lg">
                  {content.subtitle || "We'd love to hear from you"}
                </p>
              </>
            )}

            {/* Contact Details */}
            <div className="space-y-6">
              {content.showEmail !== false && (
                <div className="flex items-start gap-4">
                  <div className="bg-purple-500/10 p-3 mt-1">
                    <Mail className="text-purple-500" size={24} />
                  </div>
                  <div>
                    <div className="font-semibold mb-1">Email</div>
                    {isEditing ? (
                      <input
                        type="email"
                        value={content.email || ''}
                        onChange={(e) => onUpdate?.({ ...content, email: e.target.value })}
                        className="bg-transparent border border-purple-500/30 p-2 text-sm text-neutral-300 outline-none focus:border-purple-500"
                        placeholder="your@email.com"
                      />
                    ) : (
                      <a
                        href={`mailto:${content.email || 'contact@example.com'}`}
                        className="text-neutral-300 hover:text-purple-400 transition-colors"
                      >
                        {content.email || 'contact@example.com'}
                      </a>
                    )}
                  </div>
                </div>
              )}

              {content.showPhone !== false && (
                <div className="flex items-start gap-4">
                  <div className="bg-purple-500/10 p-3 mt-1">
                    <Phone className="text-purple-500" size={24} />
                  </div>
                  <div>
                    <div className="font-semibold mb-1">Phone</div>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={content.phone || ''}
                        onChange={(e) => onUpdate?.({ ...content, phone: e.target.value })}
                        className="bg-transparent border border-purple-500/30 p-2 text-sm text-neutral-300 outline-none focus:border-purple-500"
                        placeholder="+1 (555) 123-4567"
                      />
                    ) : (
                      <a
                        href={`tel:${content.phone || ''}`}
                        className="text-neutral-300 hover:text-purple-400 transition-colors"
                      >
                        {content.phone || '+1 (555) 123-4567'}
                      </a>
                    )}
                  </div>
                </div>
              )}

              {content.showAddress !== false && (
                <div className="flex items-start gap-4">
                  <div className="bg-purple-500/10 p-3 mt-1">
                    <MapPin className="text-purple-500" size={24} />
                  </div>
                  <div>
                    <div className="font-semibold mb-1">Address</div>
                    {isEditing ? (
                      <textarea
                        value={content.address || ''}
                        onChange={(e) => onUpdate?.({ ...content, address: e.target.value })}
                        className="w-full bg-transparent border border-purple-500/30 p-2 text-sm text-neutral-300 outline-none focus:border-purple-500 resize-none"
                        rows={2}
                        placeholder="123 Main St, City, State 12345"
                      />
                    ) : (
                      <div className="text-neutral-300">
                        {content.address || '123 Main St, City, State 12345'}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Contact Form */}
          <div>
            {isEditing ? (
              <div className="p-8 bg-neutral-900/50 border border-neutral-800">
                <div className="text-center text-neutral-400 py-12">
                  <Send size={48} className="mx-auto mb-4 opacity-50" />
                  <p>Contact form will be functional in preview mode</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold mb-2">Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-neutral-900/50 border border-neutral-800 p-3 text-white outline-none focus:border-purple-500 transition-colors"
                    placeholder="Your name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-neutral-900/50 border border-neutral-800 p-3 text-white outline-none focus:border-purple-500 transition-colors"
                    placeholder="your@email.com"
                    required
                  />
                </div>

                {(content.fields || []).includes('phone') && (
                  <div>
                    <label className="block text-sm font-semibold mb-2">Phone</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full bg-neutral-900/50 border border-neutral-800 p-3 text-white outline-none focus:border-purple-500 transition-colors"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold mb-2">Message</label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full bg-neutral-900/50 border border-neutral-800 p-3 text-white outline-none focus:border-purple-500 transition-colors resize-none"
                    rows={5}
                    placeholder="Your message..."
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitted}
                  className="w-full bg-white text-black px-8 py-3 font-bold tracking-widest uppercase hover:bg-neutral-200 transition-colors disabled:bg-green-500 disabled:text-white flex items-center justify-center gap-2"
                >
                  {submitted ? (
                    <>✓ Message Sent</>
                  ) : (
                    <>
                      <Send size={18} />
                      {content.submitText || 'Send Message'}
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
