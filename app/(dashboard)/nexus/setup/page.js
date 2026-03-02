'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { AetherInput, AetherSelect, AetherTextarea } from '@/components/aether/AetherInput';
import AetherButton from '@/components/aether/AetherButton';

// ═══ Constants ═══

const INDUSTRY_OPTIONS = [
  { value: '', label: 'Select industry...' },
  { value: 'Home Services', label: 'Home Services' },
  { value: 'SaaS', label: 'SaaS / Software' },
  { value: 'E-commerce', label: 'E-commerce / Retail' },
  { value: 'Healthcare', label: 'Healthcare / Medical' },
  { value: 'Real Estate', label: 'Real Estate' },
  { value: 'Legal', label: 'Legal Services' },
  { value: 'Financial Services', label: 'Financial Services' },
  { value: 'Marketing Agency', label: 'Marketing / Agency' },
  { value: 'Education', label: 'Education / Training' },
  { value: 'Fitness', label: 'Fitness / Wellness' },
  { value: 'Restaurant', label: 'Restaurant / Food' },
  { value: 'Construction', label: 'Construction / Trades' },
  { value: 'Auto', label: 'Automotive' },
  { value: 'Beauty', label: 'Beauty / Salon / Spa' },
  { value: 'Consulting', label: 'Consulting' },
  { value: 'Other', label: 'Other' },
];

const BUSINESS_TYPE_OPTIONS = [
  { value: '', label: 'Select type...' },
  { value: 'B2B', label: 'B2B — Sell to businesses' },
  { value: 'B2C', label: 'B2C — Sell to consumers' },
  { value: 'B2B2C', label: 'B2B2C — Both' },
];

const BUDGET_OPTIONS = [
  { value: '', label: 'Select budget...' },
  { value: '$1k-$2k', label: '$1,000 – $2,000/mo' },
  { value: '$2k-$5k', label: '$2,000 – $5,000/mo' },
  { value: '$5k-$10k', label: '$5,000 – $10,000/mo' },
  { value: '$10k-$25k', label: '$10,000 – $25,000/mo' },
  { value: '$25k+', label: '$25,000+/mo' },
];

const CHANNEL_OPTIONS = [
  { id: 'facebook', label: 'Facebook' },
  { id: 'instagram', label: 'Instagram' },
  { id: 'linkedin', label: 'LinkedIn' },
  { id: 'twitter', label: 'Twitter / X' },
  { id: 'tiktok', label: 'TikTok' },
  { id: 'youtube', label: 'YouTube' },
  { id: 'email', label: 'Email' },
  { id: 'sms', label: 'SMS' },
];

const PLATFORM_OPTIONS = [
  { id: 'LeadSite', label: 'LeadSite.AI' },
  { id: 'UltraLead', label: 'UltraLead.AI' },
  { id: 'ClientContact', label: 'ClientContact.IO' },
  { id: 'VideoSite', label: 'VideoSite.AI' },
  { id: 'LeadSiteIO', label: 'LeadSite.IO' },
];

// ═══ Step Indicator ═══

function StepIndicator({ current, total }) {
  return (
    <div className="flex items-center gap-2 mb-8">
      {Array.from({ length: total }, (_, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium border transition-all ${
            i < current
              ? 'bg-indigo-500 border-indigo-500 text-white'
              : i === current
                ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-400'
                : 'bg-white/5 border-white/10 text-neutral-600'
          }`}>
            {i < current ? '\u2713' : i + 1}
          </div>
          {i < total - 1 && (
            <div className={`w-12 h-px ${i < current ? 'bg-indigo-500' : 'bg-white/10'}`} />
          )}
        </div>
      ))}
    </div>
  );
}

// ═══ Chip Multi-Select ═══

function ChipSelect({ options, selected, onChange, label }) {
  const toggle = (id) => {
    if (selected.includes(id)) {
      onChange(selected.filter(s => s !== id));
    } else {
      onChange([...selected, id]);
    }
  };

  return (
    <div>
      {label && <label className="block text-sm text-neutral-400 mb-2 font-light">{label}</label>}
      <div className="flex flex-wrap gap-2">
        {options.map(opt => (
          <button
            key={opt.id}
            type="button"
            onClick={() => toggle(opt.id)}
            className={`px-3 py-1.5 rounded-lg text-sm font-light border transition-all ${
              selected.includes(opt.id)
                ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300'
                : 'bg-white/5 border-white/10 text-neutral-400 hover:border-white/20 hover:text-neutral-300'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ═══ Competitor Tag Input ═══

function CompetitorInput({ competitors, onChange }) {
  const [input, setInput] = useState('');

  const addCompetitor = () => {
    const val = input.trim();
    if (val && !competitors.includes(val)) {
      onChange([...competitors, val]);
      setInput('');
    }
  };

  const remove = (idx) => {
    onChange(competitors.filter((_, i) => i !== idx));
  };

  return (
    <div>
      <label className="block text-sm text-neutral-400 mb-2 font-light">Competitors</label>
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCompetitor(); } }}
          placeholder="competitor.com"
          className="input-aether flex-1"
        />
        <button
          type="button"
          onClick={addCompetitor}
          className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-neutral-400 hover:text-white hover:border-white/20 transition-all"
        >
          Add
        </button>
      </div>
      {competitors.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {competitors.map((c, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-sm bg-indigo-500/10 border border-indigo-500/20 text-indigo-300"
            >
              {c}
              <button
                type="button"
                onClick={() => remove(i)}
                className="text-indigo-400 hover:text-white"
              >
                &times;
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// ═══ Discovery Progress ═══

function DiscoveryProgress() {
  const tasks = [
    { label: 'Analyzing your website', icon: '\uD83D\uDD0D' },
    { label: 'Finding your social profiles', icon: '\uD83D\uDCF1' },
    { label: 'Researching your competitors', icon: '\uD83C\uDFAF' },
    { label: 'Studying your market', icon: '\uD83D\uDCC8' },
    { label: 'Building your strategy', icon: '\uD83E\uDDE0' },
  ];

  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIdx(prev => (prev < tasks.length - 1 ? prev + 1 : prev));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="max-w-lg mx-auto text-center">
      <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
      </div>
      <h2 className="text-2xl font-medium text-white mb-2">Nexus is learning about your business</h2>
      <p className="text-neutral-500 text-sm font-light mb-8">
        Our AI agents are researching your market, competitors, and audience. This takes 1-2 minutes.
      </p>
      <div className="space-y-3 text-left">
        {tasks.map((task, i) => (
          <div key={i} className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-500 ${
            i < activeIdx
              ? 'bg-emerald-500/5 border-emerald-500/20'
              : i === activeIdx
                ? 'bg-indigo-500/5 border-indigo-500/20'
                : 'bg-white/[0.02] border-white/5'
          }`}>
            <span className="text-lg">{task.icon}</span>
            <span className={`text-sm font-light flex-1 ${
              i < activeIdx ? 'text-emerald-400' : i === activeIdx ? 'text-indigo-300' : 'text-neutral-600'
            }`}>
              {task.label}
            </span>
            {i < activeIdx && <span className="text-emerald-400 text-xs">{'\u2713'}</span>}
            {i === activeIdx && (
              <div className="w-4 h-4 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
            )}
          </div>
        ))}
      </div>
      <button
        onClick={() => window.location.href = '/nexus/market-strategy'}
        className="mt-8 text-sm text-indigo-400 hover:text-indigo-300 underline underline-offset-4 transition-colors"
      >
        Skip to Market Strategy
      </button>
    </div>
  );
}

// ═══ Main Page ═══

export default function NexusSetupPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  // Form state
  const [form, setForm] = useState({
    businessName: '',
    website: '',
    industry: '',
    businessType: '',
    targetMarket: '',
    icp: '',
    offer: '',
    competitors: [],
    budgetRange: '',
    activeChannels: [],
    platforms: [],
  });

  const set = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  // Pre-fill from existing profile or user.metadata hints
  useEffect(() => {
    async function load() {
      try {
        const res = await api.get('/api/v1/business-profile');
        const data = res.data;

        if (data.status === 'profile_exists') {
          // Already has profile — redirect to market strategy
          router.push('/nexus/market-strategy');
          return;
        }

        if (data.status === 'profile_not_created' && data.suggested) {
          const s = data.suggested;
          const h = s._hints || {};
          setForm(prev => ({
            ...prev,
            businessName: s.businessName || prev.businessName,
            website: s.website || prev.website,
            industry: s.industry || prev.industry,
            // Map _hints to form fields
            targetMarket: h.targetAudience || prev.targetMarket,
            icp: h.idealCustomerProfile || prev.icp,
            offer: h.productsServices || prev.offer,
          }));
        }
      } catch (err) {
        // API might be down or flag off — show empty form
        console.warn('Business profile fetch failed:', err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [router]);

  // Validation per step
  const canProceed = () => {
    if (step === 0) {
      return form.businessName.trim() && form.industry && form.businessType;
    }
    if (step === 1) {
      return form.targetMarket.trim() && form.icp.trim() && form.offer.trim() && form.competitors.length > 0;
    }
    if (step === 2) {
      return form.budgetRange && form.activeChannels.length > 0 && form.platforms.length > 0;
    }
    return false;
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError('');

    try {
      await api.post('/api/v1/business-profile', {
        businessName: form.businessName.trim(),
        website: form.website.trim() || undefined,
        industry: form.industry,
        businessType: form.businessType,
        targetMarket: form.targetMarket.trim(),
        icp: form.icp.trim(),
        offer: form.offer.trim(),
        competitors: form.competitors,
        budgetRange: form.budgetRange,
        platforms: form.platforms,
        activeChannels: form.activeChannels,
      });

      setSubmitted(true);

      // Auto-redirect after 20 seconds
      setTimeout(() => {
        router.push('/nexus/market-strategy');
      }, 20000);
    } catch (err) {
      const msg = err.response?.data?.error || err.message;
      const missing = err.response?.data?.missing;
      setError(missing ? `Missing: ${missing.join(', ')}` : msg);
      setSubmitting(false);
    }
  };

  // --- Loading state ---
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-white/20 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  // --- Discovery running state ---
  if (submitted) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <DiscoveryProgress />
      </div>
    );
  }

  // --- Step content ---
  return (
    <div className="max-w-2xl mx-auto py-8">
      {/* Header */}
      <div className="mb-8">
        <p className="text-indigo-400 text-xs font-medium uppercase tracking-widest mb-2">Nexus 2.0</p>
        <h1 className="text-3xl md:text-4xl font-medium tracking-tight text-white mb-2">
          Set up once. AI handles the rest.
        </h1>
        <p className="text-neutral-500 text-sm font-light">
          Tell Nexus about your business and we'll build your entire marketing strategy — automatically.
        </p>
      </div>

      <StepIndicator current={step} total={3} />

      {/* Step 1: Business Info */}
      {step === 0 && (
        <div className="space-y-5">
          <p className="text-xs text-neutral-500 uppercase tracking-wider font-medium mb-4">Step 1 of 3 — Your Business</p>
          <AetherInput
            label="Business Name"
            value={form.businessName}
            onChange={e => set('businessName', e.target.value)}
            placeholder="Tampa Clean Pros"
          />
          <AetherInput
            label="Website URL"
            value={form.website}
            onChange={e => set('website', e.target.value)}
            placeholder="https://yourwebsite.com"
          />
          {form.website.trim() && (
            <p className="text-xs text-indigo-400/70 font-light -mt-2 ml-1">
              We'll analyze your site to pre-fill your strategy
            </p>
          )}
          <AetherSelect
            label="Industry"
            value={form.industry}
            onChange={e => set('industry', e.target.value)}
            options={INDUSTRY_OPTIONS}
          />
          <AetherSelect
            label="Business Type"
            value={form.businessType}
            onChange={e => set('businessType', e.target.value)}
            options={BUSINESS_TYPE_OPTIONS}
          />
        </div>
      )}

      {/* Step 2: Customers */}
      {step === 1 && (
        <div className="space-y-5">
          <p className="text-xs text-neutral-500 uppercase tracking-wider font-medium mb-4">Step 2 of 3 — Your Customers</p>
          <AetherInput
            label="Target Market"
            value={form.targetMarket}
            onChange={e => set('targetMarket', e.target.value)}
            placeholder="Homeowners in Tampa Bay area"
          />
          <AetherTextarea
            label="Ideal Customer Profile"
            value={form.icp}
            onChange={e => set('icp', e.target.value)}
            placeholder="Dual-income families, ages 30-55, $75K+ household income, own a home, busy lifestyle..."
          />
          <AetherInput
            label="Primary Offer"
            value={form.offer}
            onChange={e => set('offer', e.target.value)}
            placeholder="First deep clean $99 (normally $199)"
          />
          <CompetitorInput
            competitors={form.competitors}
            onChange={val => set('competitors', val)}
          />
        </div>
      )}

      {/* Step 3: Channels */}
      {step === 2 && (
        <div className="space-y-6">
          <p className="text-xs text-neutral-500 uppercase tracking-wider font-medium mb-4">Step 3 of 3 — Your Channels</p>
          <AetherSelect
            label="Monthly Marketing Budget"
            value={form.budgetRange}
            onChange={e => set('budgetRange', e.target.value)}
            options={BUDGET_OPTIONS}
          />
          <ChipSelect
            label="Active Channels"
            options={CHANNEL_OPTIONS}
            selected={form.activeChannels}
            onChange={val => set('activeChannels', val)}
          />
          <ChipSelect
            label="Platforms to Use"
            options={PLATFORM_OPTIONS}
            selected={form.platforms}
            onChange={val => set('platforms', val)}
          />
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mt-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/5">
        {step > 0 ? (
          <button
            type="button"
            onClick={() => setStep(step - 1)}
            className="text-sm text-neutral-400 hover:text-white transition-colors"
          >
            Back
          </button>
        ) : (
          <div />
        )}

        {step < 2 ? (
          <AetherButton
            onClick={() => { if (canProceed()) setStep(step + 1); }}
            disabled={!canProceed()}
          >
            Next
          </AetherButton>
        ) : (
          <AetherButton
            onClick={handleSubmit}
            disabled={!canProceed() || submitting}
          >
            {submitting ? 'Launching...' : 'Launch My Strategy'}
          </AetherButton>
        )}
      </div>
    </div>
  );
}
