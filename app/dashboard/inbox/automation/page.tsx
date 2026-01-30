'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Footer from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Plus, Edit, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';

interface AutoResponse {
  id: string;
  name: string;
  triggerType: string;
  triggerValue?: string;
  responseContent: string;
  responseDelay?: number;
  channels: string[];
  isActive: boolean;
  priority: number;
  conditions?: any;
  createdAt: string;
  updatedAt: string;
}

export default function AutomationPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [autoResponses, setAutoResponses] = useState<AutoResponse[]>([]);
  const [loadingRules, setLoadingRules] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingRule, setEditingRule] = useState<AutoResponse | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    triggerType: 'keyword',
    triggerValue: '',
    responseContent: '',
    responseDelay: 0,
    channels: [] as string[],
    isActive: true,
    priority: 1,
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const availableChannels = [
    'email',
    'sms',
    'whatsapp',
    'messenger',
    'instagram',
    'linkedin',
    'twitter',
    'slack',
  ];

  const triggerTypes = [
    { value: 'keyword', label: 'Keyword Match' },
    { value: 'first_message', label: 'First Message' },
    { value: 'time_based', label: 'Time-Based' },
    { value: 'channel', label: 'Channel-Specific' },
  ];

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login?redirect=/dashboard/inbox/automation');
    } else if (user) {
      fetchAutoResponses();
    }
  }, [user, loading, router]);

  const fetchAutoResponses = async () => {
    setLoadingRules(true);
    try {
      const response = await fetch('/api/v1/auto-responses', {
        credentials: 'include',
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setAutoResponses(result.data || []);
        }
      }
    } catch (error) {
      console.error('Fetch auto-responses error:', error);
    } finally {
      setLoadingRules(false);
    }
  };

  const handleCreate = () => {
    setEditingRule(null);
    setFormData({
      name: '',
      triggerType: 'keyword',
      triggerValue: '',
      responseContent: '',
      responseDelay: 0,
      channels: [],
      isActive: true,
      priority: 1,
    });
    setError(null);
    setSuccess(null);
    setShowCreateModal(true);
  };

  const handleEdit = (rule: AutoResponse) => {
    setEditingRule(rule);
    setFormData({
      name: rule.name,
      triggerType: rule.triggerType,
      triggerValue: rule.triggerValue || '',
      responseContent: rule.responseContent,
      responseDelay: rule.responseDelay || 0,
      channels: rule.channels,
      isActive: rule.isActive,
      priority: rule.priority,
    });
    setError(null);
    setSuccess(null);
    setShowCreateModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      const url = editingRule
        ? `/api/v1/auto-responses/${editingRule.id}`
        : '/api/v1/auto-responses';
      
      const method = editingRule ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
        credentials: 'include',
      });

      const result = await response.json();

      if (result.success) {
        setSuccess(editingRule ? 'Auto-response updated successfully!' : 'Auto-response created successfully!');
        fetchAutoResponses();
        setTimeout(() => {
          setShowCreateModal(false);
          setSuccess(null);
        }, 1500);
      } else {
        setError(result.error || 'Failed to save auto-response');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleToggle = async (id: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/v1/auto-responses/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive }),
        credentials: 'include',
      });

      const result = await response.json();

      if (result.success) {
        fetchAutoResponses();
      } else {
        setError(result.error || 'Failed to toggle auto-response');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this auto-response rule?')) return;

    try {
      const response = await fetch(`/api/v1/auto-responses/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      const result = await response.json();

      if (result.success) {
        setSuccess('Auto-response deleted successfully!');
        fetchAutoResponses();
        setTimeout(() => setSuccess(null), 2000);
      } else {
        setError(result.error || 'Failed to delete auto-response');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const toggleChannel = (channel: string) => {
    setFormData(prev => ({
      ...prev,
      channels: prev.channels.includes(channel)
        ? prev.channels.filter(c => c !== channel)
        : [...prev.channels, channel],
    }));
  };

  if (loading || loadingRules) {
    return (
      <div className="min-h-screen bg-[#030303] flex items-center justify-center">
        <div className="text-white font-geist">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#030303]">
      {/* Grid Background */}
      <div className="grid-overlay">
        <div className="grid-inner">
          <div className="grid-line-v"></div>
          <div className="grid-line-v hidden md:block"></div>
          <div className="grid-line-v hidden lg:block"></div>
          <div className="grid-line-v"></div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4">
        <div className="border-subtle flex bg-black/90 w-full max-w-6xl border p-2 shadow-2xl backdrop-blur-xl gap-1 items-center justify-between">
          <Link href="/" className="bg-white/5 hover:bg-white/10 px-5 py-2 text-xs tracking-widest uppercase transition-all text-neutral-300 font-geist">
            AI LEAD
          </Link>
          
          <div className="hidden md:flex items-center gap-1">
            <Link href="/dashboard" className="hover:text-white px-4 py-2 text-xs tracking-widest uppercase transition-colors text-neutral-500 font-geist">
              Dashboard
            </Link>
            <Link href="/dashboard/inbox" className="hover:text-white px-4 py-2 text-xs tracking-widest uppercase transition-colors text-neutral-500 font-geist">
              Inbox
            </Link>
            <Link href="/dashboard/inbox/templates" className="hover:text-white px-4 py-2 text-xs tracking-widest uppercase transition-colors text-neutral-500 font-geist">
              Templates
            </Link>
            <Link href="/dashboard/inbox/automation" className="bg-white/5 px-4 py-2 text-xs tracking-widest uppercase text-white font-geist">
              Automation
            </Link>
          </div>

          <div className="px-6 text-2xl text-white uppercase flex items-center gap-2 tracking-tighter font-space-grotesk font-light">
            <div className="w-1.5 h-1.5 bg-purple-500 animate-pulse shadow-[0_0_8px_rgba(168,85,247,0.5)]"></div>
            {user.firstName}
          </div>

          <button
            onClick={logout}
            className="bg-transparent border border-subtle text-white px-5 py-2 text-xs tracking-widest uppercase hover:bg-white/5 transition-colors font-geist"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Automation Content */}
      <section className="relative pt-40 pb-20 md:pt-52 md:pb-32 z-10">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Header */}
          <div className="flex items-end justify-between mb-8">
            <div>
              <h1 className="text-5xl md:text-7xl uppercase mb-4 text-white tracking-tighter font-bold" style={{ fontFamily: 'Inter, sans-serif', letterSpacing: '-0.02em' }}>
                Auto <span className="text-gradient">Responses</span>
              </h1>
              <p className="text-neutral-400" style={{ fontFamily: 'Inter, sans-serif' }}>
                Automate responses based on triggers and conditions
              </p>
            </div>
            <button
              onClick={handleCreate}
              className="bg-white text-black px-6 py-3 text-xs font-bold tracking-widest uppercase hover:bg-neutral-200 transition-colors font-geist flex items-center gap-2"
            >
              <Plus size={16} />
              New Rule
            </button>
          </div>

          {/* Success/Error Messages */}
          {success && (
            <div className="bg-green-500/10 border border-green-500/30 p-4 text-green-400 text-sm font-geist mb-6">
              {success}
            </div>
          )}
          {error && !showCreateModal && (
            <div className="bg-red-500/10 border border-red-500/30 p-4 text-red-400 text-sm font-geist mb-6">
              {error}
            </div>
          )}

          {/* Auto-Response Rules List */}
          {autoResponses.length === 0 ? (
            <div className="bg-[#050505] border border-subtle p-12 text-center">
              <p className="text-neutral-500 font-geist mb-4">No auto-response rules created yet.</p>
              <button
                onClick={handleCreate}
                className="bg-white text-black px-6 py-2 text-xs font-bold tracking-widest uppercase hover:bg-neutral-200 transition-colors font-geist inline-flex items-center gap-2"
              >
                <Plus size={16} />
                Create Your First Rule
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {autoResponses
                .sort((a, b) => b.priority - a.priority)
                .map((rule) => (
                  <div
                    key={rule.id}
                    className={`bg-[#050505] border p-6 transition-all ${
                      rule.isActive ? 'border-purple-500/30' : 'border-subtle opacity-60'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="text-xl font-bold text-white font-space-grotesk">
                            {rule.name}
                          </h3>
                          <span className="text-xs px-2 py-1 bg-purple-500/20 text-purple-400 border border-purple-500/30 font-geist uppercase">
                            {triggerTypes.find(t => t.value === rule.triggerType)?.label}
                          </span>
                          <span className="text-xs px-2 py-1 bg-neutral-500/20 text-neutral-400 border border-neutral-500/30 font-geist">
                            Priority: {rule.priority}
                          </span>
                        </div>

                        {rule.triggerValue && (
                          <p className="text-sm text-neutral-400 font-geist mb-2">
                            <span className="text-neutral-600">Trigger: </span>
                            <span className="text-purple-400">{rule.triggerValue}</span>
                          </p>
                        )}

                        <p className="text-sm text-neutral-300 font-geist mb-3">
                          {rule.responseContent}
                        </p>

                        {rule.channels.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-3">
                            <span className="text-xs text-neutral-600 font-geist">Channels:</span>
                            {rule.channels.map(channel => (
                              <span
                                key={channel}
                                className="text-xs px-2 py-1 bg-white/5 text-white border border-subtle font-geist uppercase"
                              >
                                {channel}
                              </span>
                            ))}
                          </div>
                        )}

                        {rule.responseDelay && rule.responseDelay > 0 && (
                          <p className="text-xs text-neutral-600 font-geist">
                            Delay: {rule.responseDelay} seconds
                          </p>
                        )}
                      </div>

                      <div className="flex items-start gap-2">
                        <button
                          onClick={() => handleToggle(rule.id, !rule.isActive)}
                          className={`p-2 transition-colors ${
                            rule.isActive
                              ? 'text-green-400 hover:text-green-300'
                              : 'text-neutral-600 hover:text-neutral-500'
                          }`}
                          title={rule.isActive ? 'Disable' : 'Enable'}
                        >
                          {rule.isActive ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
                        </button>
                        <button
                          onClick={() => handleEdit(rule)}
                          className="bg-white/5 hover:bg-white/10 border border-subtle text-white px-4 py-2 text-xs font-bold tracking-widest uppercase transition-colors font-geist"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(rule.id)}
                          className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 px-4 py-2 text-xs font-bold tracking-widest uppercase transition-colors font-geist"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </section>

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#050505] border border-subtle max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-subtle">
              <h2 className="text-2xl font-bold text-white font-space-grotesk">
                {editingRule ? 'Edit Auto-Response' : 'Create Auto-Response'}
              </h2>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              {error && (
                <div className="bg-red-500/10 border border-red-500/30 p-3 text-red-400 text-sm font-geist mb-4">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-neutral-400 font-geist mb-2">
                    Rule Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Welcome New Contacts"
                    className="w-full bg-[#030303] border border-subtle px-4 py-3 text-white outline-none focus:border-purple-500 transition-colors font-geist"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-neutral-400 font-geist mb-2">
                      Trigger Type *
                    </label>
                    <select
                      value={formData.triggerType}
                      onChange={(e) => setFormData({ ...formData, triggerType: e.target.value })}
                      className="w-full bg-[#030303] border border-subtle px-4 py-3 text-white outline-none focus:border-purple-500 transition-colors font-geist"
                      required
                    >
                      {triggerTypes.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm text-neutral-400 font-geist mb-2">
                      Priority (1-10)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                      className="w-full bg-[#030303] border border-subtle px-4 py-3 text-white outline-none focus:border-purple-500 transition-colors font-geist"
                    />
                  </div>
                </div>

                {formData.triggerType === 'keyword' && (
                  <div>
                    <label className="block text-sm text-neutral-400 font-geist mb-2">
                      Keyword(s) *
                    </label>
                    <input
                      type="text"
                      value={formData.triggerValue}
                      onChange={(e) => setFormData({ ...formData, triggerValue: e.target.value })}
                      placeholder="hello, hi, support"
                      className="w-full bg-[#030303] border border-subtle px-4 py-3 text-white outline-none focus:border-purple-500 transition-colors font-geist"
                      required
                    />
                    <p className="text-xs text-neutral-600 font-geist mt-2">
                      Comma-separated keywords to trigger this response
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-sm text-neutral-400 font-geist mb-2">
                    Response Message *
                  </label>
                  <textarea
                    value={formData.responseContent}
                    onChange={(e) => setFormData({ ...formData, responseContent: e.target.value })}
                    placeholder="Thank you for reaching out! We'll get back to you shortly."
                    className="w-full bg-[#030303] border border-subtle px-4 py-3 text-white outline-none focus:border-purple-500 transition-colors font-geist min-h-[120px] resize-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm text-neutral-400 font-geist mb-2">
                    Response Delay (seconds)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.responseDelay}
                    onChange={(e) => setFormData({ ...formData, responseDelay: parseInt(e.target.value) })}
                    className="w-full bg-[#030303] border border-subtle px-4 py-3 text-white outline-none focus:border-purple-500 transition-colors font-geist"
                  />
                  <p className="text-xs text-neutral-600 font-geist mt-2">
                    Wait before sending the response (0 = immediate)
                  </p>
                </div>

                <div>
                  <label className="block text-sm text-neutral-400 font-geist mb-3">
                    Apply to Channels
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {availableChannels.map(channel => (
                      <button
                        key={channel}
                        type="button"
                        onClick={() => toggleChannel(channel)}
                        className={`px-3 py-2 text-xs font-bold tracking-widest uppercase transition-colors font-geist ${
                          formData.channels.includes(channel)
                            ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                            : 'bg-white/5 text-neutral-400 border border-subtle hover:bg-white/10'
                        }`}
                      >
                        {channel}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-neutral-600 font-geist mt-2">
                    Leave empty to apply to all channels
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <label htmlFor="isActive" className="text-sm text-neutral-400 font-geist">
                    Active (rule will be applied automatically)
                  </label>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 bg-transparent border border-subtle text-white px-6 py-3 text-xs font-bold tracking-widest uppercase hover:bg-white/5 transition-colors font-geist"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-white text-black px-6 py-3 text-xs font-bold tracking-widest uppercase hover:bg-neutral-200 transition-colors font-geist"
                >
                  {editingRule ? 'Update Rule' : 'Create Rule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
