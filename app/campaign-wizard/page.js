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
    // Simulate launch delay
    await new Promise((r) => setTimeout(r, 1500));
    setLaunching(false);
    setStep(6);
  };

  /* ── Shared input classes ── */
  const inputCls =
    'w-full px-4 py-3 rounded-xl bg-gray-800/60 border border-gray-700 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/60 transition-colors';
  const labelCls = 'block text-sm font-medium text-gray-300 mb-1.5';
  const selectCls =
    'w-full px-4 py-3 rounded-xl bg-gray-800/60 border border-gray-700 text-sm text-gray-300 focus:outline-none focus:border-purple-500/60 transition-colors appearance-none cursor-pointer';

  /* ────────────────────────────────────────── */
  /*                 RENDER                     */
  /* ────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-gray-950 text-white antialiased selection:bg-purple-500/30 selection:text-purple-200">
      {/* Background */}
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
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-900/15 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-900/10 rounded-full blur-[120px]" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 py-10">
        {/* Header */}
        <div className="mb-8 text-center">
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">
            &larr; Back to Dashboard
          </Link>
          <h1 className="mt-3 text-3xl md:text-4xl font-semibold tracking-tight bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent">
            Campaign Wizard
          </h1>
          <p className="text-gray-500 text-sm mt-1">Create an AI-powered outreach campaign in minutes</p>
        </div>

        {/* ── Progress Bar ── */}
        {step < 6 && (
          <div className="mb-10">
            <div className="flex items-center justify-between mb-3">
              {STEPS.filter((s) => s.num <= 5).map((s) => {
                const done = step > s.num;
                const active = step === s.num;
                const Icon = s.icon;
                return (
                  <div key={s.num} className="flex flex-col items-center gap-1 flex-1">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                        done
                          ? 'bg-purple-600 text-white'
                          : active
                          ? 'bg-purple-600/20 border-2 border-purple-500 text-purple-400'
                          : 'bg-gray-800 border border-gray-700 text-gray-600'
                      }`}
                    >
                      {done ? <CheckCircle2 className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                    </div>
                    <span
                      className={`text-[11px] hidden sm:block ${
                        done || active ? 'text-purple-400' : 'text-gray-600'
                      }`}
                    >
                      {s.label}
                    </span>
                  </div>
                );
              })}
            </div>
            {/* Bar */}
            <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-600 to-indigo-500 rounded-full transition-all duration-500"
                style={{ width: `${((step - 1) / 4) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════ */}
        {/*   STEP 1 — Campaign Goal                  */}
        {/* ══════════════════════════════════════════ */}
        {step === 1 && (
          <div className="space-y-5">
            <h2 className="text-xl font-semibold text-white">What&apos;s the goal of this campaign?</h2>
            <p className="text-sm text-gray-400">Choose the primary objective — this helps our AI craft the perfect email sequence.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {GOALS.map((g) => {
                const Icon = g.icon;
                const selected = goal === g.id;
                return (
                  <button
                    key={g.id}
                    onClick={() => setGoal(g.id)}
                    className={`relative text-left p-5 rounded-2xl border transition-all ${
                      selected
                        ? 'bg-purple-600/10 border-purple-500/50 shadow-lg shadow-purple-500/5'
                        : 'bg-gray-900/60 border-gray-800 hover:border-gray-700'
                    }`}
                  >
                    {selected && (
                      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent" />
                    )}
                    <Icon className={`w-6 h-6 mb-3 ${selected ? 'text-purple-400' : 'text-gray-600'}`} />
                    <h3 className={`text-sm font-medium ${selected ? 'text-white' : 'text-gray-300'}`}>{g.label}</h3>
                    <p className="text-xs text-gray-500 mt-1">{g.desc}</p>
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
          <div className="space-y-5">
            <h2 className="text-xl font-semibold text-white">Who are you targeting?</h2>
            <p className="text-sm text-gray-400">Define your ideal prospect. The more specific, the better your results.</p>

            <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6 space-y-5">
              {/* Industry */}
              <div>
                <label className={labelCls}>
                  <Building2 className="w-3.5 h-3.5 inline mr-1 -mt-0.5" /> Industry *
                </label>
                <div className="relative">
                  <select value={industry} onChange={(e) => setIndustry(e.target.value)} className={selectCls}>
                    <option value="">Select industry...</option>
                    {INDUSTRIES.map((i) => (
                      <option key={i} value={i}>{i}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                </div>
              </div>

              {/* Job title */}
              <div>
                <label className={labelCls}>
                  <Briefcase className="w-3.5 h-3.5 inline mr-1 -mt-0.5" /> Job Title *
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
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                </div>
              </div>

              {/* Location */}
              <div>
                <label className={labelCls}>
                  <MapPin className="w-3.5 h-3.5 inline mr-1 -mt-0.5" /> Location
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
          <div className="space-y-5">
            <h2 className="text-xl font-semibold text-white">Campaign Details</h2>
            <p className="text-sm text-gray-400">Configure how your campaign runs.</p>

            <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6 space-y-5">
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
                <label className={labelCls}>Daily Send Limit: <span className="text-purple-400 font-semibold">{dailyLimit}</span></label>
                <input
                  type="range"
                  min={10}
                  max={200}
                  step={10}
                  value={dailyLimit}
                  onChange={(e) => setDailyLimit(Number(e.target.value))}
                  className="w-full accent-purple-500 cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-600 mt-1">
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
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════ */}
        {/*   STEP 4 — Email Sequence (AI)            */}
        {/* ══════════════════════════════════════════ */}
        {step === 4 && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-white">AI Email Sequence</h2>
                <p className="text-sm text-gray-400 mt-1">Your AI-generated 3-email sequence. Edit or regenerate as needed.</p>
              </div>
              <button
                onClick={generateEmails}
                disabled={generating}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-purple-600/20 border border-purple-500/30 text-purple-400 text-sm hover:bg-purple-600/30 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${generating ? 'animate-spin' : ''}`} />
                Regenerate
              </button>
            </div>

            {generating && (
              <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-12 text-center">
                <Sparkles className="w-8 h-8 text-purple-400 mx-auto mb-3 animate-pulse" />
                <p className="text-sm text-gray-400">AI is crafting your email sequence...</p>
              </div>
            )}

            {genError && (
              <div className="bg-red-900/20 border border-red-800/40 rounded-xl p-4 text-sm text-red-400">
                {genError}
              </div>
            )}

            {!generating && emails.length > 0 && (
              <div className="space-y-4">
                {emails.map((email, idx) => (
                  <div key={idx} className="bg-gray-900/60 border border-gray-800 rounded-2xl p-5 space-y-3">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Mail className="w-3.5 h-3.5" />
                      <span>Email {idx + 1}</span>
                      <span className="text-gray-700">|</span>
                      <Clock className="w-3 h-3" />
                      <span>{idx === 0 ? 'Day 1' : idx === 1 ? 'Day 4' : 'Day 8'}</span>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Subject</label>
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
                      <label className="text-xs text-gray-500 mb-1 block">Body</label>
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
              <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-12 text-center">
                <Sparkles className="w-8 h-8 text-gray-700 mx-auto mb-3" />
                <p className="text-sm text-gray-500 mb-4">Click &quot;Generate&quot; to create your AI email sequence.</p>
                <button
                  onClick={generateEmails}
                  className="px-6 py-2.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium transition-colors"
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
          <div className="space-y-5">
            <h2 className="text-xl font-semibold text-white">Review & Launch</h2>
            <p className="text-sm text-gray-400">Double-check your campaign details before launching.</p>

            <div className="bg-gray-900/60 border border-gray-800 rounded-2xl divide-y divide-gray-800">
              {/* Goal */}
              <div className="p-5 flex justify-between items-center">
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Campaign Goal</p>
                  <p className="text-sm text-white">{GOALS.find((g) => g.id === goal)?.label}</p>
                </div>
                <button onClick={() => setStep(1)} className="text-xs text-purple-400 hover:text-purple-300 transition-colors">Edit</button>
              </div>

              {/* Audience */}
              <div className="p-5 flex justify-between items-center">
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Target Audience</p>
                  <p className="text-sm text-white">{jobTitle} at {industry} companies</p>
                  <p className="text-xs text-gray-500">{companySize ? `${companySize} employees` : 'Any size'}{location ? ` · ${location}` : ''}</p>
                </div>
                <button onClick={() => setStep(2)} className="text-xs text-purple-400 hover:text-purple-300 transition-colors">Edit</button>
              </div>

              {/* Details */}
              <div className="p-5 flex justify-between items-center">
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Campaign Settings</p>
                  <p className="text-sm text-white">{campaignName}</p>
                  <p className="text-xs text-gray-500">From: {fromName} · {dailyLimit}/day · {sendStart}–{sendEnd} {timezone}</p>
                </div>
                <button onClick={() => setStep(3)} className="text-xs text-purple-400 hover:text-purple-300 transition-colors">Edit</button>
              </div>

              {/* Emails */}
              <div className="p-5 flex justify-between items-center">
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Email Sequence</p>
                  <p className="text-sm text-white">{emails.length} emails</p>
                  <div className="flex gap-2 mt-1">
                    {emails.map((e, i) => (
                      <span key={i} className="text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded">{e.subject?.slice(0, 30)}{e.subject?.length > 30 ? '…' : ''}</span>
                    ))}
                  </div>
                </div>
                <button onClick={() => setStep(4)} className="text-xs text-purple-400 hover:text-purple-300 transition-colors">Edit</button>
              </div>
            </div>

            {/* Launch button */}
            <button
              onClick={launchCampaign}
              disabled={launching}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-500 hover:from-purple-700 hover:to-indigo-600 text-white font-medium text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
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
          <div className="text-center py-12">
            <div className="w-20 h-20 rounded-full bg-green-600/20 border-2 border-green-500/40 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-green-400" />
            </div>
            <h2 className="text-2xl font-semibold text-white mb-2">Campaign Launched!</h2>
            <p className="text-gray-400 text-sm max-w-md mx-auto mb-8">
              Your campaign &quot;{campaignName}&quot; is now active. Emails will begin sending within 24 hours based on your configured schedule.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link
                href="/"
                className="px-6 py-3 rounded-xl bg-gray-800 border border-gray-700 text-sm text-gray-300 hover:border-gray-600 transition-colors"
              >
                Go to Dashboard
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
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-500 hover:from-purple-700 hover:to-indigo-600 text-white text-sm font-medium transition-all"
              >
                Create Another Campaign
              </button>
            </div>
          </div>
        )}

        {/* ── Navigation Buttons ── */}
        {step >= 1 && step <= 5 && (
          <div className="flex items-center justify-between mt-8">
            {step > 1 ? (
              <button
                onClick={prev}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gray-800/60 border border-gray-700 text-sm text-gray-300 hover:border-gray-600 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
            ) : (
              <div />
            )}

            {step < 5 && (
              <button
                onClick={next}
                disabled={!canNext() || (step === 4 && generating)}
                className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {step === 3 && emails.length === 0 ? 'Generate & Continue' : 'Continue'}
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-center gap-4 text-xs text-gray-600 mt-12 pb-4">
          <Link href="/policy" className="hover:text-gray-400 transition-colors">Terms of Service</Link>
          <Link href="/policy" className="hover:text-gray-400 transition-colors">Privacy Policy</Link>
          <Link href="/policy" className="hover:text-gray-400 transition-colors">Acceptable Use</Link>
        </div>
      </div>
    </div>
  );
}
