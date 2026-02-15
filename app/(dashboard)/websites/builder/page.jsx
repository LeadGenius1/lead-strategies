'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import {
  ArrowLeft,
  ArrowRight,
  Globe,
  Check,
  Loader2,
  Sparkles,
  Eye,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';

const TEMPLATES = [
  { id: '1a', slug: 'executive-dark', name: 'Executive Dark', category: 'Business', style: 'Professional dark theme' },
  { id: '2b', slug: 'warm-professional', name: 'Warm Professional', category: 'Business', style: 'Friendly professional' },
  { id: '3c', slug: 'tech-premium', name: 'Tech Premium', category: 'SaaS', style: 'Modern tech aesthetic' },
  { id: '4d', slug: 'minimal-portfolio', name: 'Minimal Portfolio', category: 'Portfolio', style: 'Clean minimalist' },
  { id: '5e', slug: 'ai-agency', name: 'AI Agency', category: 'Agency', style: 'Bold AI branding' },
];

const STEPS = [
  { title: 'Basics', fields: ['business_name', 'tagline', 'industry', 'business_type'] },
  { title: 'Contact', fields: ['owner_name', 'email', 'phone', 'address', 'hours'] },
  { title: 'Services', fields: ['service1_name', 'service1_description', 'service2_name', 'service2_description', 'service3_name', 'service3_description'] },
  { title: 'About', fields: ['about_headline', 'about_story', 'years_experience', 'clients_served', 'unique_value'] },
  { title: 'Social', fields: ['website_url', 'linkedin', 'facebook', 'instagram', 'twitter'] },
  { title: 'Branding', fields: ['accent_color', 'logo_url', 'hero_image_url', 'tone', 'target_audience'] },
  { title: 'CTA', fields: ['primary_cta', 'secondary_cta', 'cta_destination', 'lead_magnet'] },
];

const REQUIRED = new Set([
  'business_name', 'tagline', 'industry', 'business_type',
  'owner_name', 'email', 'phone',
  'service1_name', 'service1_description',
  'about_headline', 'about_story', 'unique_value',
  'tone', 'target_audience', 'primary_cta', 'cta_destination',
]);

const INDUSTRIES = ['Technology', 'Healthcare', 'Finance', 'Retail', 'Consulting', 'Marketing', 'Education', 'Other'];
const TONES = ['Professional', 'Friendly', 'Bold', 'Minimal', 'Innovative'];
const BUSINESS_TYPES = ['B2B', 'B2C', 'Both'];

export default function WebsiteBuilderPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [formData, setFormData] = useState({
    business_name: '', tagline: '', industry: '', business_type: '',
    owner_name: '', email: '', phone: '', address: '', hours: '',
    service1_name: '', service1_description: '', service2_name: '', service2_description: '', service3_name: '', service3_description: '',
    about_headline: '', about_story: '', years_experience: '5+', clients_served: '100+', unique_value: '',
    website_url: '', linkedin: '', facebook: '', instagram: '', twitter: '',
    accent_color: '#3b82f6', logo_url: '', hero_image_url: '', tone: '', target_audience: '',
    primary_cta: 'Get Started', secondary_cta: 'Learn More', cta_destination: '', lead_magnet: '',
  });
  const [generating, setGenerating] = useState(false);
  const [previewData, setPreviewData] = useState(null); // { html, websiteId }

  const currentFields = STEPS[step]?.fields || [];
  const canProceed = () => {
    const req = currentFields.filter((f) => REQUIRED.has(f));
    return req.every((f) => formData[f]?.trim?.());
  };

  const updateField = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleGenerate = async () => {
    if (!selectedTemplate || generating) return;
    setGenerating(true);
    try {
      const token = Cookies.get('token') || Cookies.get('admin_token');
      const res = await fetch('/api/websites/generate', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          templateId: selectedTemplate.slug || selectedTemplate.id,
          formData,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Generation failed');
      setPreviewData({ html: json.data?.html, websiteId: json.data?.websiteId });
      toast.success('Website generated!');
    } catch (e) {
      toast.error(e.message || 'Failed to generate');
    } finally {
      setGenerating(false);
    }
  };

  const closePreview = () => {
    setPreviewData(null);
    router.push('/websites');
  };

  return (
    <div className="min-h-screen bg-black p-6">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[400px] h-[400px] bg-indigo-900/10 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto">
        <Link
          href="/websites"
          className="inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Websites
        </Link>

        <h1 className="text-2xl font-medium text-white mb-2">AI Website Builder</h1>
        <p className="text-neutral-500 text-sm mb-8">Create a professional site in 7 steps</p>

        {/* Progress */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {STEPS.map((s, i) => (
            <button
              key={s.title}
              onClick={() => setStep(i)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                i === step ? 'bg-indigo-500/30 text-white border border-indigo-500/50' : 'bg-white/5 text-neutral-400 border border-white/10'
              }`}
            >
              {i + 1}. {s.title}
            </button>
          ))}
        </div>

        {/* Step 0: Template selection */}
        {step === 0 ? (
          <div className="space-y-6">
            <p className="text-neutral-400 text-sm">Choose a template</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {TEMPLATES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTemplate(t)}
                  className={`p-6 rounded-2xl border text-left transition-all ${
                    selectedTemplate?.id === t.id
                      ? 'bg-indigo-500/10 border-indigo-500/50'
                      : 'bg-neutral-900/50 border-white/10 hover:border-indigo-500/30'
                  }`}
                >
                  <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center mb-3">
                    <Globe className="w-6 h-6 text-indigo-400" />
                  </div>
                  <h3 className="font-medium text-white">{t.name}</h3>
                  <p className="text-xs text-neutral-500 mt-1">{t.style}</p>
                  {selectedTemplate?.id === t.id && (
                    <Check className="w-5 h-5 text-indigo-400 mt-2" />
                  )}
                </button>
              ))}
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setStep(1)}
                disabled={!selectedTemplate}
                className="px-5 py-2.5 bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                Next <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl bg-neutral-900/50 border border-white/10 p-6 space-y-6">
            <h2 className="text-lg font-medium text-white">{STEPS[step].title}</h2>
            <div className="grid gap-4">
              {currentFields.map((key) => (
                <div key={key}>
                  <label className="block text-sm text-neutral-400 mb-1">
                    {key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                    {REQUIRED.has(key) && <span className="text-amber-400 ml-1">*</span>}
                  </label>
                  {key === 'industry' ? (
                    <select
                      value={formData[key]}
                      onChange={(e) => updateField(key, e.target.value)}
                      className="w-full px-4 py-2.5 bg-black/50 border border-white/10 rounded-xl text-white"
                    >
                      <option value="">Select...</option>
                      {INDUSTRIES.map((o) => (
                        <option key={o} value={o}>{o}</option>
                      ))}
                    </select>
                  ) : key === 'business_type' ? (
                    <select
                      value={formData[key]}
                      onChange={(e) => updateField(key, e.target.value)}
                      className="w-full px-4 py-2.5 bg-black/50 border border-white/10 rounded-xl text-white"
                    >
                      <option value="">Select...</option>
                      {BUSINESS_TYPES.map((o) => (
                        <option key={o} value={o}>{o}</option>
                      ))}
                    </select>
                  ) : key === 'tone' || key === 'target_audience' ? (
                    <select
                      value={formData[key]}
                      onChange={(e) => updateField(key, e.target.value)}
                      className="w-full px-4 py-2.5 bg-black/50 border border-white/10 rounded-xl text-white"
                    >
                      <option value="">Select...</option>
                      {(key === 'tone' ? TONES : INDUSTRIES).map((o) => (
                        <option key={o} value={o}>{o}</option>
                      ))}
                    </select>
                  ) : key === 'accent_color' ? (
                    <input
                      type="color"
                      value={formData[key]}
                      onChange={(e) => updateField(key, e.target.value)}
                      className="w-full h-10 rounded-xl cursor-pointer"
                    />
                  ) : (
                    <input
                      type={key.includes('url') || key === 'cta_destination' ? 'url' : 'text'}
                      value={formData[key]}
                      onChange={(e) => updateField(key, e.target.value)}
                      placeholder={`Enter ${key.replace(/_/g, ' ')}`}
                      className="w-full px-4 py-2.5 bg-black/50 border border-white/10 rounded-xl text-white placeholder-neutral-600"
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between pt-4">
              <button
                onClick={() => setStep(step - 1)}
                className="px-5 py-2.5 text-neutral-400 hover:text-white border border-white/10 rounded-xl"
              >
                <ArrowLeft className="w-4 h-4 inline mr-2" />
                Back
              </button>
              {step < STEPS.length - 1 ? (
                <button
                  onClick={() => setStep(step + 1)}
                  disabled={!canProceed()}
                  className="px-5 py-2.5 bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 rounded-xl font-medium disabled:opacity-50 flex items-center gap-2"
                >
                  Next <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleGenerate}
                  disabled={!canProceed() || generating}
                  className="px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-medium disabled:opacity-50 flex items-center gap-2"
                >
                  {generating ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                  Generate
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Preview modal */}
      {previewData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90">
          <div className="relative w-full max-w-4xl h-[90vh] rounded-2xl bg-white overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b bg-neutral-100">
              <h3 className="font-medium text-black">Preview</h3>
              <div className="flex gap-2">
                <Link
                  href={previewData.websiteId ? `/preview/${previewData.websiteId}` : '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-indigo-500 text-white rounded-lg text-sm flex items-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  Open in new tab
                </Link>
                <button
                  onClick={closePreview}
                  className="px-4 py-2 bg-neutral-200 hover:bg-neutral-300 rounded-lg text-sm flex items-center gap-2"
                >
                  Done
                </button>
              </div>
            </div>
            <iframe
              srcDoc={previewData.html}
              title="Preview"
              className="flex-1 w-full border-0"
              sandbox="allow-same-origin"
            />
          </div>
        </div>
      )}
    </div>
  );
}
