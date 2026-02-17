'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Settings, CreditCard, Sun, Moon, Mail, Loader2, ExternalLink } from 'lucide-react';
import EmailAccountsSection from '@/components/profile/EmailAccountsSection';

const CHAT_STYLE = {
  container: 'bg-black min-h-screen',
  card: 'bg-neutral-900/50 border border-white/10 rounded-xl p-4 sm:p-6',
  input: 'w-full px-3 py-2.5 bg-black/50 border border-white/10 rounded-lg text-white placeholder-neutral-600 text-sm font-light focus:outline-none focus:border-indigo-500/50',
  label: 'text-xs text-neutral-500 uppercase tracking-wide mb-1.5 block',
  button: 'px-4 py-2.5 bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/30 text-indigo-300 rounded-lg text-sm font-medium transition-all flex items-center gap-2',
};

const PLAN_LABELS = {
  free: 'Free',
  'leadsite-ai': 'LeadSite.AI',
  'leadsite-io': 'LeadSite.IO',
  clientcontact: 'ClientContact.IO',
  ultralead: 'UltraLead.AI',
  videosite: 'VideoSite.AI',
};

export default function SettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState({
    planTier: 'free',
    status: 'trial',
    trialEndsAt: null,
  });
  const [theme, setTheme] = useState('dark');
  const [billingLoading, setBillingLoading] = useState(null);

  useEffect(() => {
    loadUserData();
    const saved = localStorage.getItem('theme') || 'dark';
    setTheme(saved);
    document.documentElement.classList.toggle('dark', saved === 'dark');
  }, []);

  async function loadUserData() {
    try {
      const res = await api.get('/api/v1/auth/me');
      const user = res.data?.data?.user || {};
      setSubscription({
        planTier: user.plan_tier || user.subscription_tier || 'free',
        status: user.subscriptionStatus || 'trial',
        trialEndsAt: user.trialEndsAt || null,
      });
    } catch (err) {
      console.error('Settings load error:', err);
      toast.error('Could not load account info');
    } finally {
      setLoading(false);
    }
  }

  function getTrialDaysRemaining() {
    if (!subscription.trialEndsAt) return null;
    const end = new Date(subscription.trialEndsAt);
    const now = new Date();
    const days = Math.max(0, Math.ceil((end - now) / (1000 * 60 * 60 * 24)));
    return days;
  }

  async function handleSubscribe() {
    router.push('/pricing');
  }

  async function handleManageBilling() {
    setBillingLoading('portal');
    try {
      const res = await api.post('/api/v1/stripe/create-portal', {});
      const url = res.data?.data?.url;
      if (url) {
        window.location.href = url;
      } else {
        toast.error('Could not open billing portal');
      }
    } catch (err) {
      const msg = err.response?.data?.error || err.message;
      toast.error(msg || 'Could not open billing portal');
    } finally {
      setBillingLoading(null);
    }
  }

  function toggleTheme() {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('theme', next);
    document.documentElement.classList.toggle('dark', next === 'dark');
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
      </div>
    );
  }

  const trialDays = getTrialDaysRemaining();
  const isActive = subscription.status === 'active';
  const isTrial = subscription.status === 'trial';
  const planLabel = PLAN_LABELS[subscription.planTier] || subscription.planTier;

  return (
    <div className={`${CHAT_STYLE.container} p-4 md:p-6`}>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-2 mb-6">
          <Settings className="w-5 h-5 text-neutral-500" />
          <h1 className="text-lg font-medium text-white">Settings</h1>
        </div>

        {/* ── Subscription & Billing ──────────────────────────── */}
        <div className={CHAT_STYLE.card}>
          <h2 className="text-sm font-medium text-white mb-4 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-indigo-400" />
            Subscription & Billing
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-neutral-500 uppercase tracking-wide">Current Plan</p>
                <p className="text-white font-medium">{planLabel}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-neutral-500 uppercase tracking-wide">Status</p>
                <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded ${
                  isActive ? 'bg-green-500/20 text-green-400' :
                  isTrial ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-red-500/20 text-red-400'
                }`}>
                  {isActive ? 'Active' : isTrial ? 'Trial' : subscription.status}
                </span>
              </div>
            </div>

            {isTrial && trialDays !== null && (
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg px-4 py-3">
                <p className="text-sm text-yellow-300">
                  {trialDays > 0
                    ? `${trialDays} day${trialDays !== 1 ? 's' : ''} remaining in your trial`
                    : 'Your trial has expired'}
                </p>
              </div>
            )}

            <div className="flex flex-wrap gap-3 pt-2">
              {!isActive && (
                <button
                  onClick={handleSubscribe}
                  className="px-4 py-2.5 bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/30 text-indigo-300 rounded-lg text-sm font-medium transition-all flex items-center gap-2"
                >
                  <CreditCard className="w-4 h-4" />
                  Subscribe Now
                </button>
              )}
              <button
                onClick={handleManageBilling}
                disabled={billingLoading === 'portal'}
                className="px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-300 rounded-lg text-sm font-medium transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-wait"
              >
                {billingLoading === 'portal' ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <ExternalLink className="w-4 h-4" />
                )}
                Manage Billing
              </button>
            </div>
          </div>
        </div>

        {/* ── Email Sending ───────────────────────────────────── */}
        <div>
          <EmailAccountsSection />
        </div>

        {/* ── Appearance ──────────────────────────────────────── */}
        <div className={CHAT_STYLE.card}>
          <h2 className="text-sm font-medium text-white mb-4 flex items-center gap-2">
            {theme === 'dark' ? <Moon className="w-4 h-4 text-indigo-400" /> : <Sun className="w-4 h-4 text-indigo-400" />}
            Appearance
          </h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white">Theme</p>
              <p className="text-xs text-neutral-500">{theme === 'dark' ? 'Dark mode' : 'Light mode'}</p>
            </div>
            <button
              onClick={toggleTheme}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                theme === 'dark' ? 'bg-indigo-500/30' : 'bg-neutral-600'
              }`}
            >
              <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                theme === 'dark' ? 'left-6' : 'left-0.5'
              }`} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
