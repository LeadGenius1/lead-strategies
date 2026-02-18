'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import {
  ArrowLeft, ArrowRight, Check, X, FileText, DollarSign, Palette,
  Target, Rocket, Calendar, Upload, Plus, Trash2, Monitor, Smartphone,
  Tablet, Eye, MousePointer, Users, Save, AlertCircle,
} from 'lucide-react';

// ── Step config ──
const STEPS = [
  { key: 'basics',    label: 'Basics',    Icon: FileText },
  { key: 'budget',    label: 'Budget',    Icon: DollarSign },
  { key: 'creative',  label: 'Creative',  Icon: Palette },
  { key: 'targeting', label: 'Targeting', Icon: Target },
  { key: 'review',    label: 'Launch',    Icon: Rocket },
];

const OBJECTIVES = ['Brand Awareness', 'Lead Generation', 'Conversions', 'Video Views'];
const AD_FORMATS = ['Video Pre-Roll', 'Video Mid-Roll', 'Display Banner'];
const TIMEZONES = [
  'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
  'America/Anchorage', 'Pacific/Honolulu', 'Europe/London', 'Europe/Paris',
  'Asia/Tokyo', 'Asia/Shanghai', 'Australia/Sydney', 'UTC',
];
const GENDERS = ['All', 'Male', 'Female', 'Other'];
const DEVICES = [
  { key: 'desktop', label: 'Desktop', Icon: Monitor },
  { key: 'mobile',  label: 'Mobile',  Icon: Smartphone },
  { key: 'tablet',  label: 'Tablet',  Icon: Tablet },
];

const INITIAL_FORM = {
  name: '',
  objective: '',
  audienceDescription: '',
  dailyBudget: '',
  totalBudget: '',
  startDate: '',
  endDate: '',
  timezone: 'America/New_York',
  adFormat: '',
  headline: '',
  description: '',
  ctaText: '',
  creativeFile: null,
  ageMin: '18',
  ageMax: '65',
  genders: ['All'],
  locations: '',
  interests: [],
  interestInput: '',
  devices: ['desktop', 'mobile', 'tablet'],
};

export default function CampaignWizard() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  // ── Auto-save draft toast ──
  useEffect(() => {
    if (step === 0) return;
    const t = setTimeout(() => {
      setToast('Draft saved');
      setTimeout(() => setToast(null), 2000);
    }, 3000);
    return () => clearTimeout(t);
  }, [step]);

  // ── Field updater ──
  const set = useCallback((field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  // ── Validation per step ──
  const validate = () => {
    const e = {};
    if (step === 0) {
      if (!form.name.trim()) e.name = 'Campaign name is required';
      else if (form.name.trim().length < 3) e.name = 'Must be at least 3 characters';
      else if (form.name.trim().length > 50) e.name = 'Must be 50 characters or less';
      if (!form.objective) e.objective = 'Select an objective';
    }
    if (step === 1) {
      const daily = parseFloat(form.dailyBudget);
      const total = parseFloat(form.totalBudget);
      if (!form.dailyBudget) e.dailyBudget = 'Daily budget is required';
      else if (isNaN(daily) || daily < 10) e.dailyBudget = 'Minimum $10 per day';
      if (!form.totalBudget) e.totalBudget = 'Total budget is required';
      else if (isNaN(total) || total <= 0) e.totalBudget = 'Enter a valid amount';
      else if (daily && total <= daily) e.totalBudget = 'Must be greater than daily budget';
      if (!form.startDate) e.startDate = 'Start date is required';
      else {
        const today = new Date().toISOString().split('T')[0];
        if (form.startDate < today) e.startDate = 'Must be today or later';
      }
      if (!form.endDate) e.endDate = 'End date is required';
      else if (form.startDate && form.endDate <= form.startDate) e.endDate = 'Must be after start date';
    }
    if (step === 2) {
      if (!form.adFormat) e.adFormat = 'Select an ad format';
      if (!form.headline.trim()) e.headline = 'Headline is required';
      else if (form.headline.length > 60) e.headline = 'Max 60 characters';
      if (form.description.length > 150) e.description = 'Max 150 characters';
    }
    if (step === 3) {
      const min = parseInt(form.ageMin);
      const max = parseInt(form.ageMax);
      if (isNaN(min) || min < 13) e.ageMin = 'Min age must be 13+';
      if (isNaN(max) || max > 100) e.ageMax = 'Max age must be 100 or less';
      if (min && max && min >= max) e.ageMax = 'Must be greater than min age';
      if (form.devices.length === 0) e.devices = 'Select at least one device';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => { if (validate()) setStep((s) => Math.min(s + 1, 4)); };
  const prev = () => setStep((s) => Math.max(s - 1, 0));
  const goTo = (i) => { if (i < step) setStep(i); };

  const handleCancel = () => {
    if (confirm('Discard this campaign draft? Unsaved changes will be lost.')) {
      router.push('/ads/campaigns');
    }
  };

  // ── Interest tags ──
  const addInterest = () => {
    const tag = form.interestInput.trim();
    if (tag && !form.interests.includes(tag)) {
      set('interests', [...form.interests, tag]);
    }
    set('interestInput', '');
  };

  const removeInterest = (tag) => {
    set('interests', form.interests.filter((t) => t !== tag));
  };

  // ── Gender toggle ──
  const toggleGender = (g) => {
    if (g === 'All') {
      set('genders', form.genders.includes('All') ? [] : ['All']);
    } else {
      let next = form.genders.filter((x) => x !== 'All');
      next = next.includes(g) ? next.filter((x) => x !== g) : [...next, g];
      set('genders', next);
    }
  };

  // ── Device toggle ──
  const toggleDevice = (d) => {
    const next = form.devices.includes(d)
      ? form.devices.filter((x) => x !== d)
      : [...form.devices, d];
    set('devices', next);
  };

  // ── Submit ──
  const handleLaunch = async (asDraft = false) => {
    if (!asDraft && !validate()) return;
    setSubmitting(true);
    try {
      await api.post('/api/v1/advertiser/campaigns', {
        name: form.name.trim(),
        objective: form.objective,
        audienceDescription: form.audienceDescription.trim(),
        dailyBudget: parseFloat(form.dailyBudget),
        totalBudget: parseFloat(form.totalBudget),
        startDate: form.startDate,
        endDate: form.endDate,
        timezone: form.timezone,
        adFormat: form.adFormat,
        headline: form.headline.trim(),
        description: form.description.trim(),
        ctaText: form.ctaText.trim(),
        ageMin: parseInt(form.ageMin),
        ageMax: parseInt(form.ageMax),
        genders: form.genders,
        locations: form.locations,
        interests: form.interests,
        devices: form.devices,
        status: asDraft ? 'DRAFT' : 'PENDING',
      });
      router.push('/ads/campaigns');
    } catch (err) {
      console.error('Campaign creation failed:', err);
      setErrors({ submit: 'Failed to create campaign. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  // ── Mock estimates for review step ──
  const dailyNum = parseFloat(form.dailyBudget) || 0;
  const totalNum = parseFloat(form.totalBudget) || 0;
  const estReach = Math.round(totalNum * 120);
  const estImpressions = Math.round(totalNum * 85);
  const estClicks = Math.round(estImpressions * 0.028);

  const formatMoney = (n) => `$${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <Shell>
      {/* Header */}
      <div className="mb-8">
        <Link href="/ads/campaigns" className="inline-flex items-center gap-1 text-xs text-neutral-500 hover:text-neutral-300 transition-colors mb-3">
          <ArrowLeft className="w-3 h-3" /> Back to Campaigns
        </Link>
        <h1 className="text-4xl md:text-5xl font-medium tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-neutral-500 mb-2">
          Create Campaign
        </h1>
        <p className="text-neutral-400 text-sm font-light">Set up a new ad campaign in a few steps.</p>
      </div>

      {/* Step indicator */}
      <div className="mb-10">
        <div className="flex items-center gap-1 mb-4">
          {STEPS.map((s, i) => (
            <div key={s.key} className="flex items-center flex-1">
              <button
                onClick={() => goTo(i)}
                disabled={i > step}
                className={`flex items-center gap-2 text-xs font-medium transition-all ${
                  i === step
                    ? 'text-indigo-400'
                    : i < step
                      ? 'text-green-400 cursor-pointer hover:text-green-300'
                      : 'text-neutral-600 cursor-default'
                }`}
              >
                <span className={`flex items-center justify-center w-7 h-7 rounded-full border text-[10px] font-bold transition-all ${
                  i === step
                    ? 'bg-indigo-500/20 border-indigo-500/30 text-indigo-400'
                    : i < step
                      ? 'bg-green-500/20 border-green-500/30 text-green-400'
                      : 'bg-neutral-900/30 border-white/10 text-neutral-600'
                }`}>
                  {i < step ? <Check className="w-3.5 h-3.5" /> : i + 1}
                </span>
                <span className="hidden sm:inline">{s.label}</span>
              </button>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-px mx-2 ${i < step ? 'bg-green-500/30' : 'bg-white/10'}`} />
              )}
            </div>
          ))}
        </div>
        {/* Progress bar */}
        <div className="h-1 bg-neutral-800/50 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
            style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-green-500/20 border border-green-500/30 text-green-400 text-xs font-medium animate-fade-in">
          <Save className="w-3.5 h-3.5" />
          {toast}
        </div>
      )}

      {/* Step content */}
      <div className="relative rounded-2xl bg-neutral-900/30 border border-white/10 p-6 sm:p-8 mb-8">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />

        {/* ── Step 1: Basics ── */}
        {step === 0 && (
          <div className="space-y-6">
            <StepHeader Icon={FileText} title="Campaign Basics" desc="Name your campaign and define its objective." />

            <Field label="Campaign Name" error={errors.name} required>
              <input
                type="text"
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
                placeholder="e.g. Summer Product Launch"
                maxLength={50}
                className={input(errors.name)}
              />
              <CharCount current={form.name.length} max={50} />
            </Field>

            <Field label="Campaign Objective" error={errors.objective} required>
              <select
                value={form.objective}
                onChange={(e) => set('objective', e.target.value)}
                className={input(errors.objective)}
              >
                <option value="">Select an objective...</option>
                {OBJECTIVES.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            </Field>

            <Field label="Target Audience Description" error={errors.audienceDescription}>
              <textarea
                value={form.audienceDescription}
                onChange={(e) => set('audienceDescription', e.target.value)}
                placeholder="Describe your ideal audience (optional)"
                rows={3}
                className={input(errors.audienceDescription)}
              />
            </Field>
          </div>
        )}

        {/* ── Step 2: Budget & Schedule ── */}
        {step === 1 && (
          <div className="space-y-6">
            <StepHeader Icon={DollarSign} title="Budget & Schedule" desc="Set your spending limits and campaign duration." />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Field label="Daily Budget" error={errors.dailyBudget} required>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 text-sm">$</span>
                  <input
                    type="number"
                    min="10"
                    step="1"
                    value={form.dailyBudget}
                    onChange={(e) => set('dailyBudget', e.target.value)}
                    placeholder="50.00"
                    className={`${input(errors.dailyBudget)} pl-7`}
                  />
                </div>
              </Field>
              <Field label="Total Budget" error={errors.totalBudget} required>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 text-sm">$</span>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={form.totalBudget}
                    onChange={(e) => set('totalBudget', e.target.value)}
                    placeholder="1000.00"
                    className={`${input(errors.totalBudget)} pl-7`}
                  />
                </div>
              </Field>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Field label="Start Date" error={errors.startDate} required>
                <input
                  type="date"
                  value={form.startDate}
                  onChange={(e) => set('startDate', e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className={input(errors.startDate)}
                />
              </Field>
              <Field label="End Date" error={errors.endDate} required>
                <input
                  type="date"
                  value={form.endDate}
                  onChange={(e) => set('endDate', e.target.value)}
                  min={form.startDate || new Date().toISOString().split('T')[0]}
                  className={input(errors.endDate)}
                />
              </Field>
            </div>

            <Field label="Timezone">
              <select
                value={form.timezone}
                onChange={(e) => set('timezone', e.target.value)}
                className={input()}
              >
                {TIMEZONES.map((tz) => <option key={tz} value={tz}>{tz.replace(/_/g, ' ')}</option>)}
              </select>
            </Field>
          </div>
        )}

        {/* ── Step 3: Ad Creative ── */}
        {step === 2 && (
          <div className="space-y-6">
            <StepHeader Icon={Palette} title="Ad Creative" desc="Design your ad content and upload assets." />

            <Field label="Ad Format" error={errors.adFormat} required>
              <select
                value={form.adFormat}
                onChange={(e) => set('adFormat', e.target.value)}
                className={input(errors.adFormat)}
              >
                <option value="">Select a format...</option>
                {AD_FORMATS.map((f) => <option key={f} value={f}>{f}</option>)}
              </select>
            </Field>

            <Field label="Headline" error={errors.headline} required>
              <input
                type="text"
                value={form.headline}
                onChange={(e) => set('headline', e.target.value)}
                placeholder="Grab attention with a compelling headline"
                maxLength={60}
                className={input(errors.headline)}
              />
              <CharCount current={form.headline.length} max={60} />
            </Field>

            <Field label="Description" error={errors.description}>
              <textarea
                value={form.description}
                onChange={(e) => set('description', e.target.value)}
                placeholder="Describe what you're promoting (optional)"
                rows={3}
                maxLength={150}
                className={input(errors.description)}
              />
              <CharCount current={form.description.length} max={150} />
            </Field>

            <Field label="Call-to-Action Text">
              <input
                type="text"
                value={form.ctaText}
                onChange={(e) => set('ctaText', e.target.value)}
                placeholder="e.g. Learn More, Shop Now, Sign Up"
                className={input()}
              />
            </Field>

            <Field label="Creative Asset">
              <label className="flex flex-col items-center justify-center gap-3 p-8 rounded-xl border-2 border-dashed border-white/10 hover:border-indigo-500/30 cursor-pointer transition-colors">
                <Upload className="w-8 h-8 text-neutral-500" />
                <span className="text-sm text-neutral-400">
                  {form.creativeFile ? form.creativeFile.name : 'Click to upload image or video'}
                </span>
                <span className="text-xs text-neutral-600">PNG, JPG, MP4 up to 50MB</span>
                <input
                  type="file"
                  accept="image/*,video/*"
                  className="hidden"
                  onChange={(e) => set('creativeFile', e.target.files?.[0] || null)}
                />
              </label>
            </Field>
          </div>
        )}

        {/* ── Step 4: Targeting ── */}
        {step === 3 && (
          <div className="space-y-6">
            <StepHeader Icon={Target} title="Targeting" desc="Define who should see your ads." />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Field label="Min Age" error={errors.ageMin}>
                <input
                  type="number"
                  min="13"
                  max="100"
                  value={form.ageMin}
                  onChange={(e) => set('ageMin', e.target.value)}
                  className={input(errors.ageMin)}
                />
              </Field>
              <Field label="Max Age" error={errors.ageMax}>
                <input
                  type="number"
                  min="13"
                  max="100"
                  value={form.ageMax}
                  onChange={(e) => set('ageMax', e.target.value)}
                  className={input(errors.ageMax)}
                />
              </Field>
            </div>

            <Field label="Gender">
              <div className="flex flex-wrap gap-2">
                {GENDERS.map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => toggleGender(g)}
                    className={`px-4 py-2 rounded-lg text-xs font-medium border transition-all ${
                      form.genders.includes(g)
                        ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30'
                        : 'bg-neutral-900/30 text-neutral-400 border-white/5 hover:border-white/10'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </Field>

            <Field label="Locations">
              <input
                type="text"
                value={form.locations}
                onChange={(e) => set('locations', e.target.value)}
                placeholder="e.g. United States, Canada, United Kingdom"
                className={input()}
              />
              <span className="text-xs text-neutral-600 mt-1 block">Separate multiple locations with commas</span>
            </Field>

            <Field label="Interests">
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={form.interestInput}
                  onChange={(e) => set('interestInput', e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addInterest(); } }}
                  placeholder="Type an interest and press Enter"
                  className={`${input()} flex-1`}
                />
                <button
                  type="button"
                  onClick={addInterest}
                  className="px-3 py-2 rounded-lg bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/30 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              {form.interests.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {form.interests.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs"
                    >
                      {tag}
                      <button type="button" onClick={() => removeInterest(tag)} className="hover:text-white transition-colors">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </Field>

            <Field label="Device Types" error={errors.devices}>
              <div className="flex flex-wrap gap-2">
                {DEVICES.map(({ key, label, Icon }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => toggleDevice(key)}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium border transition-all ${
                      form.devices.includes(key)
                        ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30'
                        : 'bg-neutral-900/30 text-neutral-400 border-white/5 hover:border-white/10'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {label}
                  </button>
                ))}
              </div>
            </Field>
          </div>
        )}

        {/* ── Step 5: Review & Launch ── */}
        {step === 4 && (
          <div className="space-y-6">
            <StepHeader Icon={Rocket} title="Review & Launch" desc="Confirm your settings and launch your campaign." />

            {errors.submit && (
              <div className="flex items-center gap-2 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {errors.submit}
              </div>
            )}

            {/* Estimate cards */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Est. Reach', value: estReach.toLocaleString(), Icon: Users },
                { label: 'Est. Impressions', value: estImpressions.toLocaleString(), Icon: Eye },
                { label: 'Est. Clicks', value: estClicks.toLocaleString(), Icon: MousePointer },
              ].map((stat) => (
                <div key={stat.label} className="relative rounded-xl bg-neutral-900/50 border border-white/5 p-4 text-center">
                  <stat.Icon className="w-4 h-4 text-indigo-400 mx-auto mb-1" />
                  <div className="text-lg font-semibold text-white">{stat.value}</div>
                  <div className="text-[10px] text-neutral-500">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Summary sections */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left column: details */}
              <div className="space-y-4">
                <ReviewSection title="Campaign Basics" stepIndex={0} goTo={goTo}>
                  <ReviewRow label="Name" value={form.name} />
                  <ReviewRow label="Objective" value={form.objective} />
                  <ReviewRow label="Audience" value={form.audienceDescription || '—'} />
                </ReviewSection>

                <ReviewSection title="Budget & Schedule" stepIndex={1} goTo={goTo}>
                  <ReviewRow label="Daily Budget" value={formatMoney(dailyNum)} />
                  <ReviewRow label="Total Budget" value={formatMoney(totalNum)} />
                  <ReviewRow label="Dates" value={form.startDate && form.endDate ? `${form.startDate} → ${form.endDate}` : '—'} />
                  <ReviewRow label="Timezone" value={form.timezone.replace(/_/g, ' ')} />
                </ReviewSection>

                <ReviewSection title="Targeting" stepIndex={3} goTo={goTo}>
                  <ReviewRow label="Age" value={`${form.ageMin} – ${form.ageMax}`} />
                  <ReviewRow label="Gender" value={form.genders.join(', ')} />
                  <ReviewRow label="Locations" value={form.locations || '—'} />
                  <ReviewRow label="Interests" value={form.interests.length > 0 ? form.interests.join(', ') : '—'} />
                  <ReviewRow label="Devices" value={form.devices.join(', ')} />
                </ReviewSection>
              </div>

              {/* Right column: ad preview */}
              <div>
                <ReviewSection title="Ad Preview" stepIndex={2} goTo={goTo}>
                  <div className="rounded-xl bg-black/50 border border-white/5 overflow-hidden">
                    {/* Mock ad preview */}
                    <div className="aspect-video bg-neutral-800/50 flex items-center justify-center">
                      {form.creativeFile ? (
                        <span className="text-xs text-neutral-400">{form.creativeFile.name}</span>
                      ) : (
                        <div className="text-center">
                          <Palette className="w-8 h-8 text-neutral-600 mx-auto mb-2" />
                          <span className="text-xs text-neutral-600">Ad creative preview</span>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-medium bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 mb-2">
                        {form.adFormat || 'Ad Format'}
                      </span>
                      <h3 className="text-sm font-medium text-white mb-1">{form.headline || 'Your headline here'}</h3>
                      <p className="text-xs text-neutral-400 mb-3">{form.description || 'Your description will appear here'}</p>
                      {form.ctaText && (
                        <span className="inline-block px-4 py-1.5 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs font-medium">
                          {form.ctaText}
                        </span>
                      )}
                    </div>
                  </div>
                </ReviewSection>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation buttons */}
      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={handleCancel}
          className="px-4 py-2.5 rounded-lg text-xs font-medium text-neutral-400 hover:text-white border border-white/5 hover:border-white/10 transition-all"
        >
          Cancel
        </button>

        <div className="flex items-center gap-3">
          {step > 0 && (
            <button
              type="button"
              onClick={prev}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-medium text-neutral-300 bg-neutral-900/30 border border-white/10 hover:border-white/20 transition-all"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Previous
            </button>
          )}

          {step < 4 && (
            <button
              type="button"
              onClick={next}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-medium text-white bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 transition-all"
            >
              Next
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}

          {step === 4 && (
            <>
              <button
                type="button"
                onClick={() => handleLaunch(true)}
                disabled={submitting}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-medium text-neutral-300 bg-neutral-900/30 border border-white/10 hover:border-white/20 transition-all disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                Save as Draft
              </button>
              <button
                type="button"
                onClick={() => handleLaunch(false)}
                disabled={submitting}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-medium text-white bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 transition-all disabled:opacity-50"
              >
                <Rocket className="w-3.5 h-3.5" />
                {submitting ? 'Launching...' : 'Launch Campaign'}
              </button>
            </>
          )}
        </div>
      </div>
    </Shell>
  );
}

// ── Shared components ──

function StepHeader({ Icon, title, desc }) {
  return (
    <div className="flex items-center gap-3 mb-2">
      <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
        <Icon className="w-5 h-5 text-indigo-400" />
      </div>
      <div>
        <h2 className="text-lg font-medium text-white">{title}</h2>
        <p className="text-xs text-neutral-500">{desc}</p>
      </div>
    </div>
  );
}

function Field({ label, error, required, children }) {
  return (
    <div>
      <label className="block text-xs font-medium text-neutral-300 mb-2">
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>
      {children}
      {error && (
        <p className="flex items-center gap-1 text-red-400 text-xs mt-1.5">
          <AlertCircle className="w-3 h-3" />
          {error}
        </p>
      )}
    </div>
  );
}

function CharCount({ current, max }) {
  const over = current > max;
  return (
    <div className={`text-right text-[10px] mt-1 ${over ? 'text-red-400' : 'text-neutral-600'}`}>
      {current}/{max}
    </div>
  );
}

function ReviewSection({ title, stepIndex, goTo, children }) {
  return (
    <div className="rounded-xl bg-neutral-900/50 border border-white/5 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-white">{title}</h3>
        <button
          type="button"
          onClick={() => goTo(stepIndex)}
          className="text-[10px] text-indigo-400 hover:text-indigo-300 transition-colors"
        >
          Edit
        </button>
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function ReviewRow({ label, value }) {
  return (
    <div className="flex justify-between text-xs">
      <span className="text-neutral-500">{label}</span>
      <span className="text-neutral-300 text-right max-w-[60%] truncate">{value}</span>
    </div>
  );
}

function input(error) {
  return `w-full px-4 py-2.5 rounded-lg bg-neutral-900/50 border text-sm text-white placeholder-neutral-500 focus:outline-none transition-colors ${
    error ? 'border-red-500/30 focus:border-red-500/50' : 'border-white/10 focus:border-indigo-500/30'
  }`;
}

/** AETHER shell wrapper */
function Shell({ children }) {
  return (
    <div className="min-h-screen bg-black text-white antialiased selection:bg-indigo-500/30 selection:text-indigo-200">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            backgroundSize: '40px 40px',
            backgroundImage: `linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px),
                             linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px)`,
            maskImage: 'radial-gradient(ellipse at center, black 40%, transparent 80%)',
          }}
        />
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-900/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-purple-900/10 rounded-full blur-[120px]" />
      </div>
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {children}
      </div>
    </div>
  );
}
