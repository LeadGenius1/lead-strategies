'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { User, Building2, Target, Save, Loader2 } from 'lucide-react';

const CHAT_STYLE = {
  container: 'bg-black min-h-screen',
  card: 'bg-neutral-900/50 border border-white/10 rounded-xl p-4 sm:p-6',
  input: 'w-full px-3 py-2.5 bg-black/50 border border-white/10 rounded-lg text-white placeholder-neutral-600 text-sm font-light focus:outline-none focus:border-indigo-500/50',
  label: 'text-xs text-neutral-500 uppercase tracking-wide mb-1.5 block',
  button: 'px-4 py-2.5 bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/30 text-indigo-300 rounded-lg text-sm font-medium transition-all flex items-center gap-2',
};

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    jobTitle: '',
    companyName: '',
    companyWebsite: '',
    companySize: '',
    industry: '',
    location: '',
    productsServices: '',
    uniqueValueProposition: '',
    targetAudience: '',
    idealCustomerProfile: '',
    keyBenefits: '',
    painPointsSolved: '',
    competitorDifferentiation: '',
    preferredTone: 'professional',
    callToAction: '',
    testimonialHighlight: '',
  });

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      const res = await api.get('/api/v1/users/profile');
      const data = res.data?.data || res.data || {};
      setProfile({
        name: data.name ?? '',
        email: data.email ?? '',
        phone: data.phone ?? '',
        jobTitle: data.jobTitle ?? '',
        companyName: data.companyName ?? '',
        companyWebsite: data.companyWebsite ?? '',
        companySize: data.companySize ?? '',
        industry: data.industry ?? '',
        location: data.location ?? '',
        productsServices: data.productsServices ?? '',
        uniqueValueProposition: data.uniqueValueProposition ?? '',
        targetAudience: data.targetAudience ?? '',
        idealCustomerProfile: data.idealCustomerProfile ?? '',
        keyBenefits: data.keyBenefits ?? '',
        painPointsSolved: data.painPointsSolved ?? '',
        competitorDifferentiation: data.competitorDifferentiation ?? '',
        preferredTone: data.preferredTone ?? 'professional',
        callToAction: data.callToAction ?? '',
        testimonialHighlight: data.testimonialHighlight ?? '',
      });
    } catch (err) {
      console.error('Profile load error:', err);
      toast.error('Could not load profile');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/api/v1/users/profile', {
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
        jobTitle: profile.jobTitle,
        companyName: profile.companyName,
        companyWebsite: profile.companyWebsite,
        companySize: profile.companySize,
        industry: profile.industry,
        location: profile.location,
        productsServices: profile.productsServices,
        uniqueValueProposition: profile.uniqueValueProposition,
        targetAudience: profile.targetAudience,
        idealCustomerProfile: profile.idealCustomerProfile,
        keyBenefits: profile.keyBenefits,
        painPointsSolved: profile.painPointsSolved,
        competitorDifferentiation: profile.competitorDifferentiation,
        preferredTone: profile.preferredTone,
        callToAction: profile.callToAction,
        testimonialHighlight: profile.testimonialHighlight,
      });
      toast.success('Profile saved');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className={`${CHAT_STYLE.container} p-4 md:p-6`}>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-2 mb-6">
          <User className="w-5 h-5 text-neutral-500" />
          <h1 className="text-lg font-medium text-white">Profile & Business Info</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className={CHAT_STYLE.card}>
            <h2 className="text-sm font-medium text-white mb-4 flex items-center gap-2">
              <User className="w-4 h-4 text-indigo-400" />
              Personal
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={CHAT_STYLE.label}>Name</label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
                  className={CHAT_STYLE.input}
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className={CHAT_STYLE.label}>Email</label>
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
                  className={CHAT_STYLE.input}
                  placeholder="you@company.com"
                />
              </div>
              <div>
                <label className={CHAT_STYLE.label}>Phone</label>
                <input
                  type="tel"
                  value={profile.phone}
                  onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))}
                  className={CHAT_STYLE.input}
                  placeholder="+1 234 567 8900"
                />
              </div>
              <div>
                <label className={CHAT_STYLE.label}>Job title</label>
                <input
                  type="text"
                  value={profile.jobTitle}
                  onChange={(e) => setProfile((p) => ({ ...p, jobTitle: e.target.value }))}
                  className={CHAT_STYLE.input}
                  placeholder="e.g. Founder, Sales Director"
                />
              </div>
            </div>
          </div>

          <div className={CHAT_STYLE.card}>
            <h2 className="text-sm font-medium text-white mb-4 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-indigo-400" />
              Company
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className={CHAT_STYLE.label}>Company name</label>
                <input
                  type="text"
                  value={profile.companyName}
                  onChange={(e) => setProfile((p) => ({ ...p, companyName: e.target.value }))}
                  className={CHAT_STYLE.input}
                  placeholder="Your company"
                />
              </div>
              <div>
                <label className={CHAT_STYLE.label}>Website</label>
                <input
                  type="url"
                  value={profile.companyWebsite}
                  onChange={(e) => setProfile((p) => ({ ...p, companyWebsite: e.target.value }))}
                  className={CHAT_STYLE.input}
                  placeholder="https://"
                />
              </div>
              <div>
                <label className={CHAT_STYLE.label}>Company size</label>
                <input
                  type="text"
                  value={profile.companySize}
                  onChange={(e) => setProfile((p) => ({ ...p, companySize: e.target.value }))}
                  className={CHAT_STYLE.input}
                  placeholder="e.g. 1-10, 11-50"
                />
              </div>
              <div>
                <label className={CHAT_STYLE.label}>Industry</label>
                <input
                  type="text"
                  value={profile.industry}
                  onChange={(e) => setProfile((p) => ({ ...p, industry: e.target.value }))}
                  className={CHAT_STYLE.input}
                  placeholder="e.g. SaaS, Healthcare"
                />
              </div>
              <div>
                <label className={CHAT_STYLE.label}>Location</label>
                <input
                  type="text"
                  value={profile.location}
                  onChange={(e) => setProfile((p) => ({ ...p, location: e.target.value }))}
                  className={CHAT_STYLE.input}
                  placeholder="City, Country"
                />
              </div>
            </div>
          </div>

          <div className={CHAT_STYLE.card}>
            <h2 className="text-sm font-medium text-white mb-2 flex items-center gap-2">
              <Target className="w-4 h-4 text-indigo-400" />
              For Lead Hunter
            </h2>
            <p className="text-xs text-neutral-500 mb-4">
              Critical for better leads and personalized emails. Fill these out for best results.
            </p>
            <div className="space-y-4">
              <div>
                <label className={CHAT_STYLE.label}>Products & services *</label>
                <textarea
                  value={profile.productsServices}
                  onChange={(e) => setProfile((p) => ({ ...p, productsServices: e.target.value }))}
                  className={`${CHAT_STYLE.input} min-h-[80px] resize-y`}
                  placeholder="What do you offer? (Used by AI to find better leads)"
                  rows={3}
                />
              </div>
              <div>
                <label className={CHAT_STYLE.label}>Unique value proposition</label>
                <textarea
                  value={profile.uniqueValueProposition}
                  onChange={(e) => setProfile((p) => ({ ...p, uniqueValueProposition: e.target.value }))}
                  className={`${CHAT_STYLE.input} min-h-[60px] resize-y`}
                  placeholder="What makes you different from competitors?"
                  rows={2}
                />
              </div>
              <div>
                <label className={CHAT_STYLE.label}>Key benefits</label>
                <textarea
                  value={profile.keyBenefits}
                  onChange={(e) => setProfile((p) => ({ ...p, keyBenefits: e.target.value }))}
                  className={`${CHAT_STYLE.input} min-h-[60px] resize-y`}
                  placeholder="Main benefits customers get"
                  rows={2}
                />
              </div>
              <div>
                <label className={CHAT_STYLE.label}>Target audience *</label>
                <textarea
                  value={profile.targetAudience}
                  onChange={(e) => setProfile((p) => ({ ...p, targetAudience: e.target.value }))}
                  className={`${CHAT_STYLE.input} min-h-[60px] resize-y`}
                  placeholder="Who are your ideal customers?"
                  rows={2}
                />
              </div>
              <div>
                <label className={CHAT_STYLE.label}>Ideal customer profile</label>
                <textarea
                  value={profile.idealCustomerProfile}
                  onChange={(e) => setProfile((p) => ({ ...p, idealCustomerProfile: e.target.value }))}
                  className={`${CHAT_STYLE.input} min-h-[60px] resize-y`}
                  placeholder="Job titles, company types, etc."
                  rows={2}
                />
              </div>
              <div>
                <label className={CHAT_STYLE.label}>Pain points you solve</label>
                <textarea
                  value={profile.painPointsSolved}
                  onChange={(e) => setProfile((p) => ({ ...p, painPointsSolved: e.target.value }))}
                  className={`${CHAT_STYLE.input} min-h-[60px] resize-y`}
                  placeholder="What problems do you solve for customers?"
                  rows={2}
                />
              </div>
              <div>
                <label className={CHAT_STYLE.label}>Competitor differentiation</label>
                <input
                  type="text"
                  value={profile.competitorDifferentiation}
                  onChange={(e) => setProfile((p) => ({ ...p, competitorDifferentiation: e.target.value }))}
                  className={CHAT_STYLE.input}
                  placeholder="How you stand out vs competitors"
                />
              </div>
              <div>
                <label className={CHAT_STYLE.label}>Preferred tone</label>
                <select
                  value={profile.preferredTone}
                  onChange={(e) => setProfile((p) => ({ ...p, preferredTone: e.target.value }))}
                  className={CHAT_STYLE.input}
                >
                  <option value="professional">Professional</option>
                  <option value="friendly">Friendly</option>
                  <option value="formal">Formal</option>
                  <option value="casual">Casual</option>
                  <option value="direct">Direct</option>
                </select>
              </div>
              <div>
                <label className={CHAT_STYLE.label}>Call to action</label>
                <input
                  type="text"
                  value={profile.callToAction}
                  onChange={(e) => setProfile((p) => ({ ...p, callToAction: e.target.value }))}
                  className={CHAT_STYLE.input}
                  placeholder="e.g. Book a call, Reply to schedule"
                />
              </div>
              <div>
                <label className={CHAT_STYLE.label}>Testimonial to highlight</label>
                <textarea
                  value={profile.testimonialHighlight}
                  onChange={(e) => setProfile((p) => ({ ...p, testimonialHighlight: e.target.value }))}
                  className={`${CHAT_STYLE.input} min-h-[60px] resize-y`}
                  placeholder="Quote or social proof to use in emails"
                  rows={2}
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className={`${CHAT_STYLE.button} disabled:opacity-50`}
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save profile
          </button>
        </form>
      </div>
    </div>
  );
}
