'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Settings, CreditCard, Sun, Moon, Loader2, ExternalLink, Brain, Plug, Trash2 } from 'lucide-react';
import { getMemories, deleteMemory, clearMemories, getMcpProviders, getMcpConnections, connectMcpProvider, disconnectMcpProvider } from '@/lib/assistant/api';

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

const PLAN_PRICE_IDS = {
  'leadsite-ai': process.env.NEXT_PUBLIC_STRIPE_PRICE_LEADSITE_AI_STARTER || null,
  'leadsite-io': process.env.NEXT_PUBLIC_STRIPE_PRICE_LEADSITE_IO_STARTER || null,
  clientcontact: process.env.NEXT_PUBLIC_STRIPE_PRICE_CLIENTCONTACT_STARTER || null,
  ultralead: process.env.NEXT_PUBLIC_STRIPE_PRICE_ULTRALEAD || null,
};

const CATEGORY_LABELS = {
  preference: 'Preferences',
  business: 'Business',
  contact: 'Contacts',
  decision: 'Decisions',
  general: 'General',
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

  // Memory state
  const [memories, setMemories] = useState([]);
  const [memoriesLoading, setMemoriesLoading] = useState(true);

  // Integrations state
  const [providers, setProviders] = useState([]);
  const [connections, setConnections] = useState([]);
  const [integrationsLoading, setIntegrationsLoading] = useState(true);
  const [connectModal, setConnectModal] = useState(null); // provider object
  const [connectConfig, setConnectConfig] = useState({});
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    loadUserData();
    loadMemories();
    loadIntegrations();
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

  async function loadMemories() {
    try {
      const data = await getMemories();
      setMemories(data.memories || []);
    } catch {
      // Not critical
    } finally {
      setMemoriesLoading(false);
    }
  }

  async function loadIntegrations() {
    try {
      const [provData, connData] = await Promise.all([
        getMcpProviders(),
        getMcpConnections().catch(() => ({ connections: [] })),
      ]);
      setProviders(provData.providers || []);
      setConnections(connData.connections || []);
    } catch {
      // Not critical
    } finally {
      setIntegrationsLoading(false);
    }
  }

  async function handleDeleteMemory(id) {
    try {
      await deleteMemory(id);
      setMemories((prev) => prev.filter((m) => m.id !== id));
      toast.success('Memory deleted');
    } catch {
      toast.error('Failed to delete memory');
    }
  }

  async function handleClearMemories() {
    if (!confirm('Clear all Lead Hunter memories? This cannot be undone.')) return;
    try {
      await clearMemories();
      setMemories([]);
      toast.success('All memories cleared');
    } catch {
      toast.error('Failed to clear memories');
    }
  }

  async function handleConnect() {
    if (!connectModal) return;
    setConnecting(true);
    try {
      const result = await connectMcpProvider(connectModal.id, connectConfig);
      if (result.success) {
        toast.success(`${connectModal.name} connected`);
        setConnectModal(null);
        setConnectConfig({});
        loadIntegrations();
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Connection failed');
    } finally {
      setConnecting(false);
    }
  }

  async function handleDisconnect(connectionId, name) {
    if (!confirm(`Disconnect ${name}?`)) return;
    try {
      await disconnectMcpProvider(connectionId);
      toast.success(`${name} disconnected`);
      loadIntegrations();
    } catch {
      toast.error('Failed to disconnect');
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
    const priceId = PLAN_PRICE_IDS[subscription.planTier];
    if (!priceId) {
      router.push('/pricing');
      return;
    }

    setBillingLoading('subscribe');
    try {
      const res = await api.post('/api/v1/stripe/create-checkout', { priceId });
      const url = res.data?.data?.url;
      if (url) {
        window.location.href = url;
      } else {
        toast.error('Could not create checkout session');
      }
    } catch (err) {
      const msg = err.response?.data?.error || err.message;
      toast.error(msg || 'Could not create checkout session');
    } finally {
      setBillingLoading(null);
    }
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

  // Group memories by category
  const groupedMemories = {};
  for (const m of memories) {
    const cat = m.category || 'general';
    if (!groupedMemories[cat]) groupedMemories[cat] = [];
    groupedMemories[cat].push(m);
  }

  return (
    <div className={`${CHAT_STYLE.container} p-4 md:p-6`}>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-2 mb-6">
          <Settings className="w-5 h-5 text-neutral-500" />
          <h1 className="text-lg font-medium text-white">Settings</h1>
        </div>

        {/* Subscription & Billing */}
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
                  disabled={billingLoading === 'subscribe'}
                  className="px-4 py-2.5 bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/30 text-indigo-300 rounded-lg text-sm font-medium transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-wait"
                >
                  {billingLoading === 'subscribe' ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CreditCard className="w-4 h-4" />
                  )}
                  {billingLoading === 'subscribe' ? 'Redirecting...' : 'Subscribe Now'}
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

        {/* Lead Hunter Memory */}
        <div className={CHAT_STYLE.card}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-white flex items-center gap-2">
              <Brain className="w-4 h-4 text-indigo-400" />
              Lead Hunter Memory
              {memories.length > 0 && (
                <span className="px-1.5 py-0.5 text-[10px] bg-indigo-500/20 text-indigo-300 rounded-full">
                  {memories.length}
                </span>
              )}
            </h2>
            {memories.length > 0 && (
              <button
                onClick={handleClearMemories}
                className="text-xs text-red-400 hover:text-red-300 transition-colors"
              >
                Clear All
              </button>
            )}
          </div>

          {memoriesLoading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="w-5 h-5 text-neutral-600 animate-spin" />
            </div>
          ) : memories.length === 0 ? (
            <p className="text-xs text-neutral-600 text-center py-4">
              No memories yet. Lead Hunter will remember important facts as you chat.
            </p>
          ) : (
            <div className="space-y-3">
              {Object.entries(groupedMemories).map(([cat, items]) => (
                <div key={cat}>
                  <p className="text-[10px] text-neutral-500 uppercase tracking-wider mb-1.5">
                    {CATEGORY_LABELS[cat] || cat}
                  </p>
                  <div className="space-y-1">
                    {items.map((m) => (
                      <div key={m.id} className="flex items-start justify-between gap-2 px-2 py-1.5 bg-black/30 rounded-lg border border-white/5">
                        <div className="min-w-0">
                          <p className="text-xs text-neutral-300 font-medium">{m.key}</p>
                          <p className="text-[11px] text-neutral-500 truncate">{m.value}</p>
                        </div>
                        <button
                          onClick={() => handleDeleteMemory(m.id)}
                          className="text-neutral-600 hover:text-red-400 transition-colors flex-shrink-0 mt-0.5"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Integrations */}
        <div className={CHAT_STYLE.card}>
          <h2 className="text-sm font-medium text-white mb-4 flex items-center gap-2">
            <Plug className="w-4 h-4 text-indigo-400" />
            Integrations
          </h2>

          {integrationsLoading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="w-5 h-5 text-neutral-600 animate-spin" />
            </div>
          ) : (
            <div className="grid gap-3">
              {providers.map((provider) => {
                const conn = connections.find((c) => c.provider === provider.id && c.status === 'active');
                return (
                  <div key={provider.id} className="flex items-center justify-between px-3 py-3 bg-black/30 rounded-lg border border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 text-xs font-bold">
                        {provider.name[0]}
                      </div>
                      <div>
                        <p className="text-sm text-white font-medium">{provider.name}</p>
                        <p className="text-[11px] text-neutral-500">{provider.description}</p>
                      </div>
                    </div>
                    <div>
                      {conn ? (
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 text-[10px] bg-green-500/20 text-green-400 rounded-full">Connected</span>
                          <button
                            onClick={() => handleDisconnect(conn.id, provider.name)}
                            className="text-xs text-neutral-500 hover:text-red-400 transition-colors"
                          >
                            Disconnect
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => { setConnectModal(provider); setConnectConfig({}); }}
                          className="px-3 py-1.5 text-xs bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/30 text-indigo-300 rounded-lg transition-colors"
                        >
                          Connect
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Appearance */}
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

      {/* Connect Modal */}
      {connectModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setConnectModal(null)}>
          <div className="bg-neutral-900 border border-white/10 rounded-xl p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-sm font-medium text-white mb-4">Connect {connectModal.name}</h3>

            <div className="space-y-3 mb-4">
              {connectModal.requiredConfig.map((field) => (
                <div key={field}>
                  <label className="text-xs text-neutral-500 uppercase tracking-wide mb-1 block">{field.replace(/([A-Z])/g, ' $1').trim()}</label>
                  <input
                    type={field.toLowerCase().includes('key') || field.toLowerCase().includes('token') || field.toLowerCase().includes('secret') ? 'password' : 'text'}
                    value={connectConfig[field] || ''}
                    onChange={(e) => setConnectConfig((prev) => ({ ...prev, [field]: e.target.value }))}
                    placeholder={`Enter ${field}`}
                    className={CHAT_STYLE.input}
                  />
                </div>
              ))}
            </div>

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setConnectModal(null)}
                className="px-4 py-2 text-sm text-neutral-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConnect}
                disabled={connecting || connectModal.requiredConfig.some((f) => !connectConfig[f])}
                className="px-4 py-2 bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/30 text-indigo-300 rounded-lg text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-wait flex items-center gap-2"
              >
                {connecting && <Loader2 className="w-4 h-4 animate-spin" />}
                {connecting ? 'Connecting...' : 'Connect'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
