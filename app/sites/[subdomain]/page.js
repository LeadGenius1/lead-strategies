'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import api from '@/lib/api';
import { Loader2, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function PublishedWebsitePage() {
  const params = useParams();
  const subdomain = params.subdomain;
  const [website, setWebsite] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (subdomain) {
      loadWebsite();
    }
  }, [subdomain]);

  async function loadWebsite() {
    try {
      const response = await api.get(`/api/v1/websites/subdomain/${subdomain}`);
      const websiteData = response.data?.data || response.data;
      
      if (websiteData && websiteData.isPublished) {
        setWebsite(websiteData);
      } else {
        setWebsite(null);
      }
    } catch (error) {
      console.error('Load website error:', error);
      setWebsite(null);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    try {
      await api.post(`/api/v1/websites/${website.id}/forms/submit`, {
        formData
      });
      
      setSubmitted(true);
      setFormData({ name: '', email: '', message: '' });
      toast.success('Thank you! We\'ll be in touch soon.');
    } catch (error) {
      console.error('Submit form error:', error);
      toast.error('Failed to submit form. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  if (!website) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Website Not Found</h1>
          <p className="text-gray-600">This website doesn't exist or hasn't been published yet.</p>
        </div>
      </div>
    );
  }

  const pages = website.pages || [];
  const settings = website.settings || {};
  const colors = settings.colors || { primary: '#3b82f6', secondary: '#8b5cf6', accent: '#06b6d4' };

  // Render website from pages data
  // This is a simplified renderer - in production, you'd use a proper template engine
  return (
    <div className="min-h-screen bg-white" style={{ '--primary': colors.primary, '--secondary': colors.secondary, '--accent': colors.accent }}>
      {/* Simple Website Renderer */}
      {pages.map((page, idx) => (
        <div key={idx} className="page">
          {page.sections?.map((section, sectionIdx) => (
            <div key={sectionIdx} className={`section section-${section.type} section-${section.layout}`}>
              {section.type === 'hero' && (
                <div className="py-20 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-center">
                  <h1 className="text-5xl font-bold mb-4">{section.items?.headline || 'Welcome'}</h1>
                  <p className="text-xl mb-8">{section.items?.subheadline || 'Your business solution'}</p>
                  <button className="px-8 py-4 bg-white text-indigo-600 rounded-lg font-semibold text-lg hover:bg-gray-100 transition">
                    {section.items?.ctaText || 'Get Started'}
                  </button>
                </div>
              )}
              
              {section.type === 'about' && (
                <div className="py-16 px-6 max-w-4xl mx-auto">
                  <h2 className="text-4xl font-bold mb-6 text-center">{section.items?.title || 'About Us'}</h2>
                  <p className="text-lg text-gray-700 leading-relaxed text-center">
                    {section.items?.description || 'We are a professional business dedicated to excellence.'}
                  </p>
                </div>
              )}
              
              {section.type === 'features' && section.items && (
                <div className="py-16 px-6 bg-gray-50">
                  <div className="max-w-6xl mx-auto">
                    <h2 className="text-4xl font-bold mb-12 text-center">Key Features</h2>
                    <div className="grid md:grid-cols-3 gap-8">
                      {section.items.map((feature, fIdx) => (
                        <div key={fIdx} className="bg-white p-6 rounded-lg shadow">
                          <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                          <p className="text-gray-600">{feature.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              
              {section.type === 'services' && section.items && (
                <div className="py-16 px-6">
                  <div className="max-w-6xl mx-auto">
                    <h2 className="text-4xl font-bold mb-12 text-center">Our Services</h2>
                    <div className="grid md:grid-cols-3 gap-8">
                      {section.items.map((service, sIdx) => (
                        <div key={sIdx} className="bg-white p-6 rounded-lg border border-gray-200">
                          <h3 className="text-xl font-semibold mb-3">{service.title}</h3>
                          <p className="text-gray-600">{service.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              
              {section.type === 'testimonials' && section.items && (
                <div className="py-16 px-6 bg-gray-50">
                  <div className="max-w-6xl mx-auto">
                    <h2 className="text-4xl font-bold mb-12 text-center">What Our Clients Say</h2>
                    <div className="grid md:grid-cols-3 gap-8">
                      {section.items.map((testimonial, tIdx) => (
                        <div key={tIdx} className="bg-white p-6 rounded-lg shadow">
                          <p className="text-gray-700 mb-4 italic">"{testimonial.quote}"</p>
                          <div>
                            <p className="font-semibold">{testimonial.name}</p>
                            <p className="text-sm text-gray-600">{testimonial.role} at {testimonial.company}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              
              {section.type === 'cta' && (
                <div className="py-20 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-center">
                  <h2 className="text-4xl font-bold mb-4">{section.items?.headline || 'Ready to Get Started?'}</h2>
                  <p className="text-xl mb-8">{section.items?.subheadline || 'Join us today'}</p>
                  <button className="px-8 py-4 bg-white text-indigo-600 rounded-lg font-semibold text-lg hover:bg-gray-100 transition">
                    {section.items?.buttonText || 'Contact Us'}
                  </button>
                </div>
              )}
              
              {section.type === 'contact' && (
                <div className="py-16 px-6 bg-white">
                  <div className="max-w-2xl mx-auto">
                    <h2 className="text-4xl font-bold mb-4 text-center">{section.items?.title || 'Get In Touch'}</h2>
                    <p className="text-gray-600 mb-8 text-center">{section.items?.description || 'We\'d love to hear from you'}</p>
                    
                    {submitted ? (
                      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-8 text-center">
                        <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-emerald-900 mb-2">Thank You!</h3>
                        <p className="text-emerald-700">We've received your message and will get back to you soon.</p>
                      </div>
                    ) : (
                      <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                          <input
                            type="text"
                            placeholder="Your Name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <input
                            type="email"
                            placeholder="Your Email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <textarea
                            placeholder="Your Message"
                            value={formData.message}
                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                            required
                            rows={6}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          />
                        </div>
                        <button
                          type="submit"
                          disabled={submitting}
                          className="w-full px-8 py-4 bg-indigo-600 text-white rounded-lg font-semibold text-lg hover:bg-indigo-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          {submitting ? (
                            <>
                              <Loader2 className="w-5 h-5 animate-spin" />
                              Sending...
                            </>
                          ) : (
                            'Send Message'
                          )}
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
