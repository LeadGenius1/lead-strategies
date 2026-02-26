'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Target, Users, Settings, Sparkles, CheckCircle2, Rocket,
  ArrowRight, ArrowLeft, RefreshCw, Mail, Clock, Send,
  Building2, MapPin, Briefcase, ChevronDown,
} from 'lucide-react';

const GOALS = [
  { id: 'lead_gen', label: 'Lead Generation', desc: 'Generate new business leads and prospects', icon: Target },
  { id: 'demo_booking', label: 'Demo Booking', desc: 'Book product demos and sales calls', icon: Rocket },
  { id: 'event_promo', label: 'Event Promotion', desc: 'Promote webinars, conferences, or events', icon: Users },
  { id: 'partnership', label: 'Partnership Outreach', desc: 'Find strategic partners and collaborators', icon: Building2 },
];

const INDUSTRIES = [
  'Technology', 'Healthcare', 'Finance', 'Real Estate', 'E-commerce',
  'Education', 'Marketing', 'Manufacturing', 'Legal', 'Consulting', 'Other',
];

const COMPANY_SIZES = [
  '1-10', '11-50', '51-200', '201-500', '501-1000', '1000+',
];

const TIMEZONES = [
  'US/Eastern', 'US/Central', 'US/Mountain', 'US/Pacific',
  'Europe/London', 'Europe/Berlin', 'Asia/Tokyo', 'Australia/Sydney',
];

const STEPS = [
  { num: 1, label: 'Goal', icon: Target },
  { num: 2, label: 'Audience', icon: Users },
  { num: 3, label: 'Details', icon: Settings },
  { num: 4, label: 'Emails', icon: Mail },
  { num: 5, label: 'Review', icon: CheckCircle2 },
  { num: 6, label: 'Success', icon: Rocket },
];

export default function CampaignWizardPage() {
  const [step, setStep] = useState(1);

  // Step 1
  const [goal, setGoal] = useState('');

  // Step 2
  const [industry, setIndustry] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [companySize, setCompanySize] = useState('');
  const [location, setLocation] = useState('');

  // Step 3
  const [campaignName, setCampaignName] = useState('');
  const [fromName, setFromName] = useState('');
  const [dailyLimit, setDailyLimit] = useState(50);
  const [sendStart, setSendStart] = useState('09:00');
  const [sendEnd, setSendEnd] = useState('17:00');
  const [timezone, setTimezone] = useState('US/Eastern');

  // Step 4
  const [emails, setEmails] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState('');

  // Step 5 / 6
  const [launching, setLaunching] = useState(false);

  /* ── Navigation ── */
  const canNext = () => {
    if (step === 1) return !!goal;
    if (step === 2) return !!industry && !!jobTitle;
    if (step === 3) return !!campaignName && !!fromName;
    if (step === 4) return emails.length === 3;
    return true;
  };

  const next = () => {
    if (step === 4 && emails.length === 0) {
      generateEmails();
      return;
    }
    setStep((s) => Math.min(6, s + 1));
  };
  const prev = () => setStep((s) => Math.max(1, s - 1));

  /* ── AI Email Generation ── */
  const generateEmails = async () => {
    setGenerating(true);
    setGenError('');
    try {
      const goalLabel = GOALS.find((g) => g.id === goal)?.label || goal;
      const res = await fetch('/api/campaign-wizard/generate-emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goal: goalLabel, industry, jobTitle, companySize, location }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Generation failed');
      setEmails(data.emails);
      if (step === 3) setStep(4);
    } catch (err) {
      setGenError(err.message);
    } finally {
      setGenerating(false);
    }
  };

  /* ── Launch (placeholder) ── */
  const launchCampaign = async () => {
    setLaunching(true);
    await new Promise((r) => setTimeout(r, 1500));
    setLaunching(false);
    setStep(6);
  };

  /* ── Shared AETHER input classes ── */
  const inputCls =
    'w-full px-4 py-3 bg-[#0a0a0a] border border-white/[0.08] text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-all font-geist';
  const labelCls = 'block text-xs uppercase tracking-wider text-neutral-400 mb-2 font-geist';
  const selectCls =
    'w-full px-4 py-3 bg-[#0a0a0a] border border-white/[0.08] text-sm text-neutral-300 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-all appearance-none cursor-pointer font-geist';

  /* ────────────────────────────────────────── */
  /*                 RENDER                     */
  /* ────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-[#050505] text-white antialiased selection:bg-purple-500/30 selection:text-purple-200">
      {/* AETHER Grid Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            backgroundSize: '40px 40px',
            backgroundImage: `linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px),
                             linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)`,
            maskImage: 'radial-gradient(ellipse at center, black 40%, transparent 80%)',
          }}
        />
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-purple-950/20 rounded-full blur-[150px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-violet-950/15 rounded-full blur-[150px]" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 py-10">
        {/* Header */}
        <div className="mb-10 text-center">
          <Link href="/" className="inline-block px-3 py-1.5 bg-white/5 hover:bg-white/10 text-[10px] tracking-widest uppercase transition-all text-neutral-400 font-geist mb-6">
            &larr; BACK TO DASHBOARD
          </Link>
          <h1 className="text-3xl sm:text-4xl md:text-5xl uppercase tracking-tighter font-space-grotesk font-light text-white leading-[1.1]">
            Campaign <span className="text-gradient">Wizard</span>
          </h1>
          <p className="text-neutral-400 text-sm font-geist mt-3 tracking-tight">
            Create an AI-powered outreach campaign in minutes
          </p>
        </div>

        {/* ── Progress Bar ── */}
        {step < 6 && (
          <div className="mb-10">
            {/* Step indicators */}
            <div className="flex items-center justify-between mb-4">
              {STEPS.filter((s) => s.num <= 5).map((s, idx) => {
                const done = step > s.num;
                const active = step === s.num;
                const Icon = s.icon;
                return (
                  <div key={s.num} className="flex flex-col items-center gap-1.5 flex-1 relative">
                    {/* Connector line */}
                    {idx > 0 && (
                      <div className="absolute top-[18px] -left-1/2 w-full h-px">
                        <div className={`h-full transition-all duration-500 ${step > s.num - 1 ? 'bg-gradient-to-r from-purple-600 to-violet-600' : 'bg-white/[0.06]'}`} />
                      </div>
                    )}
                    <div
                      className={`relative w-9 h-9 rounded-full flex items-center justify-center text-sm transition-all ${
                        done
                          ? 'bg-gradient-to-br from-purple-600 to-violet-600 text-white shadow-lg shadow-purple-500/20'
                          : active
                          ? 'bg-purple-500/10 border border-purple-500/50 text-purple-400 shadow-lg shadow-purple-500/10'
                          : 'bg-white/[0.03] border border-white/[0.06] text-neutral-600'
                      }`}
                    >
                      {done ? <CheckCircle2 className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                    </div>
                    <span
                      className={`text-[10px] uppercase tracking-widest hidden sm:block font-geist ${
                        done ? 'text-purple-400' : active ? 'text-white' : 'text-neutral-600'
                      }`}
                    >
                      {s.label}
                    </span>
                  </div>
                );
              })}
            </div>
            {/* Progress bar track */}
            <div className="h-px bg-white/[0.06] overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-600 to-violet-600 transition-all duration-500"
                style={{ width: `${((step - 1) / 4) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════ */}
        {/*   STEP 1 — Campaign Goal                  */}
        {/* ══════════════════════════════════════════ */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl uppercase tracking-tighter font-space-grotesk font-light text-white mb-2">
                Campaign <span className="text-gradient">Goal</span>
              </h2>
              <p className="text-sm text-neutral-400 font-geist">Choose the primary objective — this helps our AI craft the perfect email sequence.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {GOALS.map((g) => {
                const Icon = g.icon;
                const selected = goal === g.id;
                return (
                  <button
                    key={g.id}
                    onClick={() => setGoal(g.id)}
                    className={`group relative text-left p-6 border transition-all backdrop-blur-sm ${
                      selected
                        ? 'bg-purple-500/10 border-purple-500/40 shadow-xl shadow-purple-500/5'
                        : 'bg-white/[0.02] border-white/[0.06] hover:border-white/[0.12] hover:bg-white/[0.04]'
                    }`}
                  >
                    {/* Top glow line */}
                    <div className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent transition-opacity ${selected ? 'opacity-100' : 'opacity-0'}`} />
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-4 transition-all ${
                      selected
                        ? 'bg-gradient-to-br from-purple-600 to-violet-600 shadow-lg shadow-purple-500/20'
                        : 'bg-white/[0.05] border border-white/[0.08] group-hover:border-white/[0.15]'
                    }`}>
                      <Icon className={`w-5 h-5 ${selected ? 'text-white' : 'text-neutral-500 group-hover:text-neutral-400'}`} />
                    </div>
                    <h3 className={`text-sm font-space-grotesk uppercase tracking-wider ${selected ? 'text-white' : 'text-neutral-300'}`}>{g.label}</h3>
                    <p className="text-xs text-neutral-500 font-geist mt-1.5 leading-relaxed">{g.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════ */}
        {/*   STEP 2 — Target Audience                */}
        {/* ══════════════════════════════════════════ */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl uppercase tracking-tighter font-space-grotesk font-light text-white mb-2">
                Target <span className="text-gradient">Audience</span>
              </h2>
              <p className="text-sm text-neutral-400 font-geist">Define your ideal prospect. The more specific, the better your results.</p>
            </div>

            <div className="bg-[#050505] border border-white/[0.06] backdrop-blur-sm p-6 sm:p-8 space-y-6">
              {/* Top glow */}
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent" />

              {/* Industry */}
              <div>
                <label className={labelCls}>
                  <Building2 className="w-3 h-3 inline mr-1.5 -mt-0.5 text-purple-400" /> Industry *
                </label>
                <div className="relative">
                  <select value={industry} onChange={(e) => setIndustry(e.target.value)} className={selectCls}>
                    <option value="">Select industry...</option>
                    {INDUSTRIES.map((i) => (
                      <option key={i} value={i}>{i}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600 pointer-events-none" />
                </div>
              </div>

              {/* Job title */}
              <div>
                <label className={labelCls}>
                  <Briefcase className="w-3 h-3 inline mr-1.5 -mt-0.5 text-purple-400" /> Job Title *
                </label>
                <input
                  type="text"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="e.g. VP of Marketing, CEO, CTO"
                  className={inputCls}
                />
              </div>

              {/* Company Size */}
              <div>
                <label className={labelCls}>Company Size (employees)</label>
                <div className="relative">
                  <select value={companySize} onChange={(e) => setCompanySize(e.target.value)} className={selectCls}>
                    <option value="">Any size</option>
                    {COMPANY_SIZES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600 pointer-events-none" />
                </div>
              </div>

              {/* Location */}
              <div>
                <label className={labelCls}>
                  <MapPin className="w-3 h-3 inline mr-1.5 -mt-0.5 text-purple-400" /> Location
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. United States, New York, Europe"
                  className={inputCls}
                />
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════ */}
        {/*   STEP 3 — Campaign Details               */}
        {/* ══════════════════════════════════════════ */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl uppercase tracking-tighter font-space-grotesk font-light text-white mb-2">
                Campaign <span className="text-gradient">Details</span>
              </h2>
              <p className="text-sm text-neutral-400 font-geist">Configure how your campaign runs.</p>
            </div>

            <div className="bg-[#050505] border border-white/[0.06] backdrop-blur-sm p-6 sm:p-8 space-y-6 relative">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent" />

              {/* Name */}
              <div>
                <label className={labelCls}>Campaign Name *</label>
                <input
                  type="text"
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                  placeholder="e.g. Q1 SaaS Outreach"
                  className={inputCls}
                />
              </div>

              {/* From Name */}
              <div>
                <label className={labelCls}>From Name *</label>
                <input
                  type="text"
                  value={fromName}
                  onChange={(e) => setFromName(e.target.value)}
                  placeholder="e.g. Michael from AILS"
                  className={inputCls}
                />
              </div>

              {/* Daily Limit */}
              <div>
                <label className={labelCls}>
                  Daily Send Limit: <span className="text-purple-400 font-semibold normal-case">{dailyLimit}</span>
                </label>
                <input
                  type="range"
                  min={10}
                  max={200}
                  step={10}
                  value={dailyLimit}
                  onChange={(e) => setDailyLimit(Number(e.target.value))}
                  className="w-full accent-purple-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-neutral-600 font-geist uppercase tracking-wider mt-1.5">
                  <span>10</span>
                  <span>200</span>
                </div>
              </div>

              {/* Send Window */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Send Start</label>
                  <input type="time" value={sendStart} onChange={(e) => setSendStart(e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Send End</label>
                  <input type="time" value={sendEnd} onChange={(e) => setSendEnd(e.target.value)} className={inputCls} />
                </div>
              </div>

              {/* Timezone */}
              <div>
                <label className={labelCls}>Timezone</label>
                <div className="relative">
                  <select value={timezone} onChange={(e) => setTimezone(e.target.value)} className={selectCls}>
                    {TIMEZONES.map((tz) => (
                      <option key={tz} value={tz}>{tz}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════ */}
        {/*   STEP 4 — Email Sequence (AI)            */}
        {/* ══════════════════════════════════════════ */}
        {step === 4 && (
          <div className="space-y-6">
            <div className="flex items-start sm:items-center justify-between gap-4 flex-col sm:flex-row">
              <div>
                <h2 className="text-2xl uppercase tracking-tighter font-space-grotesk font-light text-white mb-2">
                  AI Email <span className="text-gradient">Sequence</span>
                </h2>
                <p className="text-sm text-neutral-400 font-geist">Your AI-generated 3-email sequence. Edit or regenerate.</p>
              </div>
              <button
                onClick={generateEmails}
                disabled={generating}
                className="flex items-center gap-1.5 px-4 py-2 bg-white/[0.03] border border-purple-500/30 text-purple-400 text-[11px] uppercase tracking-widest font-geist hover:bg-purple-500/10 transition-all disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${generating ? 'animate-spin' : ''}`} />
                Regenerate
              </button>
            </div>

            {generating && (
              <div className="bg-[#050505] border border-white/[0.06] p-16 text-center relative">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent animate-pulse" />
                <Sparkles className="w-10 h-10 text-purple-400 mx-auto mb-4 animate-pulse" />
                <p className="text-sm text-neutral-400 font-geist">AI is crafting your email sequence...</p>
                <p className="text-[10px] text-neutral-600 font-geist uppercase tracking-widest mt-2">Powered by Claude</p>
              </div>
            )}

            {genError && (
              <div className="bg-red-950/20 border border-red-500/20 p-4 text-sm text-red-400 font-geist">
                {genError}
              </div>
            )}

            {!generating && emails.length > 0 && (
              <div className="space-y-4">
                {emails.map((email, idx) => (
                  <div key={idx} className="bg-[#050505] border border-white/[0.06] backdrop-blur-sm p-5 sm:p-6 space-y-4 relative">
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/20 to-transparent" />
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-600 to-violet-600 flex items-center justify-center">
                        <Mail className="w-3.5 h-3.5 text-white" />
                      </div>
                      <span className="text-[10px] uppercase tracking-widest text-neutral-400 font-geist">Email {idx + 1}</span>
                      <span className="text-white/[0.06]">|</span>
                      <Clock className="w-3 h-3 text-neutral-600" />
                      <span className="text-[10px] uppercase tracking-widest text-neutral-500 font-geist">{idx === 0 ? 'Day 1' : idx === 1 ? 'Day 4' : 'Day 8'}</span>
                    </div>
                    <div>
                      <label className="text-[10px] uppercase tracking-widest text-neutral-500 font-geist mb-1.5 block">Subject</label>
                      <input
                        type="text"
                        value={email.subject}
                        onChange={(e) => {
                          const updated = [...emails];
                          updated[idx] = { ...updated[idx], subject: e.target.value };
                          setEmails(updated);
                        }}
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase tracking-widest text-neutral-500 font-geist mb-1.5 block">Body</label>
                      <textarea
                        value={email.body}
                        onChange={(e) => {
                          const updated = [...emails];
                          updated[idx] = { ...updated[idx], body: e.target.value };
                          setEmails(updated);
                        }}
                        rows={4}
                        className={`${inputCls} resize-none`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!generating && emails.length === 0 && !genError && (
              <div className="bg-[#050505] border border-white/[0.06] p-16 text-center relative">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                <Sparkles className="w-10 h-10 text-neutral-700 mx-auto mb-4" />
                <p className="text-sm text-neutral-500 font-geist mb-6">Click below to generate your AI email sequence.</p>
                <button
                  onClick={generateEmails}
                  className="px-8 py-3 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white text-xs uppercase tracking-widest font-geist transition-all shadow-lg shadow-purple-500/20"
                >
                  Generate Emails
                </button>
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════ */}
        {/*   STEP 5 — Review & Confirm               */}
        {/* ══════════════════════════════════════════ */}
        {step === 5 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl uppercase tracking-tighter font-space-grotesk font-light text-white mb-2">
                Review & <span className="text-gradient">Launch</span>
              </h2>
              <p className="text-sm text-neutral-400 font-geist">Double-check your campaign details before launching.</p>
            </div>

            <div className="bg-[#050505] border border-white/[0.06] backdrop-blur-sm divide-y divide-white/[0.06] relative">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent" />

              {/* Goal */}
              <div className="p-5 sm:p-6 flex justify-between items-center">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-neutral-500 font-geist mb-1">Campaign Goal</p>
                  <p className="text-sm text-white font-space-grotesk">{GOALS.find((g) => g.id === goal)?.label}</p>
                </div>
                <button onClick={() => setStep(1)} className="text-[10px] uppercase tracking-widest text-purple-400 hover:text-purple-300 transition-colors font-geist">Edit</button>
              </div>

              {/* Audience */}
              <div className="p-5 sm:p-6 flex justify-between items-center">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-neutral-500 font-geist mb-1">Target Audience</p>
                  <p className="text-sm text-white font-space-grotesk">{jobTitle} at {industry} companies</p>
                  <p className="text-xs text-neutral-500 font-geist mt-0.5">{companySize ? `${companySize} employees` : 'Any size'}{location ? ` · ${location}` : ''}</p>
                </div>
                <button onClick={() => setStep(2)} className="text-[10px] uppercase tracking-widest text-purple-400 hover:text-purple-300 transition-colors font-geist">Edit</button>
              </div>

              {/* Details */}
              <div className="p-5 sm:p-6 flex justify-between items-center">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-neutral-500 font-geist mb-1">Campaign Settings</p>
                  <p className="text-sm text-white font-space-grotesk">{campaignName}</p>
                  <p className="text-xs text-neutral-500 font-geist mt-0.5">From: {fromName} · {dailyLimit}/day · {sendStart}–{sendEnd} {timezone}</p>
                </div>
                <button onClick={() => setStep(3)} className="text-[10px] uppercase tracking-widest text-purple-400 hover:text-purple-300 transition-colors font-geist">Edit</button>
              </div>

              {/* Emails */}
              <div className="p-5 sm:p-6 flex justify-between items-center">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-neutral-500 font-geist mb-1">Email Sequence</p>
                  <p className="text-sm text-white font-space-grotesk">{emails.length} emails</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {emails.map((e, i) => (
                      <span key={i} className="text-[10px] text-neutral-400 bg-white/[0.04] border border-white/[0.06] px-2.5 py-1 font-geist">
                        {e.subject?.slice(0, 30)}{e.subject?.length > 30 ? '...' : ''}
                      </span>
                    ))}
                  </div>
                </div>
                <button onClick={() => setStep(4)} className="text-[10px] uppercase tracking-widest text-purple-400 hover:text-purple-300 transition-colors font-geist">Edit</button>
              </div>
            </div>

            {/* Launch button */}
            <button
              onClick={launchCampaign}
              disabled={launching}
              className="w-full py-4 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white text-xs uppercase tracking-widest font-geist transition-all flex items-center justify-center gap-2.5 disabled:opacity-50 shadow-xl shadow-purple-500/20"
            >
              {launching ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Launching Campaign...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Launch Campaign
                </>
              )}
            </button>
          </div>
        )}

        {/* ══════════════════════════════════════════ */}
        {/*   STEP 6 — Success                        */}
        {/* ══════════════════════════════════════════ */}
        {step === 6 && (
          <div className="text-center py-16">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-600/20 to-emerald-600/20 border border-green-500/30 flex items-center justify-center mx-auto mb-8 shadow-xl shadow-green-500/10">
              <CheckCircle2 className="w-10 h-10 text-green-400" />
            </div>
            <h2 className="text-3xl uppercase tracking-tighter font-space-grotesk font-light text-white mb-3">
              Campaign <span className="text-green-400">Launched</span>
            </h2>
            <p className="text-neutral-400 text-sm font-geist max-w-md mx-auto mb-10 leading-relaxed">
              Your campaign &quot;{campaignName}&quot; is now active. Emails will begin sending within 24 hours based on your configured schedule.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link
                href="/"
                className="px-6 py-3 bg-white/[0.03] border border-white/[0.08] text-xs uppercase tracking-widest text-neutral-300 font-geist hover:bg-white/[0.06] hover:border-white/[0.12] transition-all"
              >
                Dashboard
              </Link>
              <button
                onClick={() => {
                  setStep(1);
                  setGoal('');
                  setIndustry('');
                  setJobTitle('');
                  setCompanySize('');
                  setLocation('');
                  setCampaignName('');
                  setFromName('');
                  setDailyLimit(50);
                  setSendStart('09:00');
                  setSendEnd('17:00');
                  setTimezone('US/Eastern');
                  setEmails([]);
                  setGenError('');
                }}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white text-xs uppercase tracking-widest font-geist transition-all shadow-lg shadow-purple-500/20"
              >
                Create Another
              </button>
            </div>
          </div>
        )}

        {/* ── Navigation Buttons ── */}
        {step >= 1 && step <= 5 && (
          <div className="flex items-center justify-between mt-10">
            {step > 1 ? (
              <button
                onClick={prev}
                className="flex items-center gap-2 px-5 py-2.5 bg-white/[0.03] border border-white/[0.08] text-xs uppercase tracking-widest text-neutral-300 font-geist hover:bg-white/[0.06] hover:border-white/[0.12] transition-all"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back
              </button>
            ) : (
              <div />
            )}

            {step < 5 && (
              <button
                onClick={next}
                disabled={!canNext() || (step === 4 && generating)}
                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white text-xs uppercase tracking-widest font-geist transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-lg shadow-purple-500/20"
              >
                {step === 3 && emails.length === 0 ? 'Generate & Continue' : 'Continue'}
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-center gap-6 text-[10px] uppercase tracking-widest text-neutral-600 font-geist mt-16 pb-6 border-t border-white/[0.04] pt-6">
          <Link href="/policy" className="hover:text-neutral-400 transition-colors">Terms of Service</Link>
          <Link href="/policy" className="hover:text-neutral-400 transition-colors">Privacy Policy</Link>
          <Link href="/policy" className="hover:text-neutral-400 transition-colors">Acceptable Use</Link>
        </div>
      </div>
    </div>
  );
}
