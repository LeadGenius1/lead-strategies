'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { EmailCampaign, DEFAULT_TEMPLATES, validateCampaign } from '@/lib/campaigns';
import { Lead } from '@/lib/leads';

export default function NewCampaignPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [campaign, setCampaign] = useState<Partial<EmailCampaign>>({
    name: '',
    subject: '',
    template: '',
    status: 'draft',
    leadIds: [],
  });
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login?redirect=/dashboard/campaigns/new');
    } else if (user) {
      fetchLeads();
    }
  }, [user, loading, router]);

  const fetchLeads = async () => {
    try {
      const response = await fetch('/api/leads', {
        credentials: 'include',
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setLeads(result.data?.leads || result.data || []);
        }
      }
    } catch (error) {
      console.error('Fetch leads error:', error);
    }
  };

  const handleTemplateSelect = (templateId: string) => {
    const template = DEFAULT_TEMPLATES.find(t => t.id === templateId);
    if (template) {
      setSelectedTemplate(templateId);
      setCampaign(prev => ({
        ...prev,
        subject: template.subject,
        template: template.body,
      }));
    }
  };

  const handleGenerateAI = async () => {
    if (!user) return;
    
    if (selectedLeads.length === 0) {
      setError('Please select at least one lead');
      return;
    }

    const lead = leads.find(l => l.id === selectedLeads[0]);
    if (!lead) return;

    setGenerating(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/generate-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          leadInfo: {
            firstName: lead.firstName,
            lastName: lead.lastName,
            company: lead.company,
            title: lead.title,
            industry: lead.industry,
            senderName: `${user.firstName} ${user.lastName}`,
          },
          campaignType: 'introduction',
          tone: 'professional',
          length: 'medium',
        }),
        credentials: 'include',
      });

      const result = await response.json();

      if (result.success) {
        setCampaign(prev => ({
          ...prev,
          subject: result.data.subject,
          template: result.data.body,
        }));
      } else {
        setError(result.error || 'Failed to generate email');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = async () => {
    const validation = validateCampaign({
      ...campaign,
      leadIds: selectedLeads,
    });

    if (!validation.valid) {
      setError(validation.errors.join(', '));
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const response = await fetch('/api/campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...campaign,
          leadIds: selectedLeads,
          recipientCount: selectedLeads.length,
        }),
        credentials: 'include',
      });

      const result = await response.json();

      if (result.success) {
        router.push(`/dashboard/campaigns/${result.data.id}`);
      } else {
        setError(result.error || 'Failed to create campaign');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
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
            <Link href="/dashboard/leads" className="hover:text-white px-4 py-2 text-xs tracking-widest uppercase transition-colors text-neutral-500 font-geist">
              Leads
            </Link>
            <Link href="/dashboard/campaigns" className="bg-white/5 px-4 py-2 text-xs tracking-widest uppercase text-white font-geist">
              Campaigns
            </Link>
            <Link href="/dashboard/analytics" className="hover:text-white px-4 py-2 text-xs tracking-widest uppercase transition-colors text-neutral-500 font-geist">
              Analytics
            </Link>
            <Link href="/dashboard/settings" className="hover:text-white px-4 py-2 text-xs tracking-widest uppercase transition-colors text-neutral-500 font-geist">
              Settings
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

      {/* Campaign Builder Content */}
      <section className="relative pt-40 pb-20 md:pt-52 md:pb-32 z-10">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="mb-8">
            <Link href="/dashboard/campaigns" className="text-purple-400 hover:text-purple-300 font-geist text-sm uppercase tracking-widest mb-4 inline-block">
              ← Back to Campaigns
            </Link>
            <h1 className="text-5xl md:text-7xl uppercase mb-4 text-white tracking-tighter font-space-grotesk font-light">
              New <span className="text-gradient">Campaign</span>
            </h1>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 p-4 text-red-400 text-sm font-geist mb-6">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-[#050505] border border-subtle p-6">
                <label className="block text-xs uppercase tracking-widest text-neutral-500 font-geist mb-2">
                  Campaign Name
                </label>
                <input
                  type="text"
                  value={campaign.name || ''}
                  onChange={(e) => setCampaign(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Q1 Product Launch"
                  className="w-full bg-transparent border border-subtle p-3 text-white outline-none focus:border-purple-500 transition-colors font-geist"
                />
              </div>

              <div className="bg-[#050505] border border-subtle p-6">
                <label className="block text-xs uppercase tracking-widest text-neutral-500 font-geist mb-2">
                  Email Subject
                </label>
                <input
                  type="text"
                  value={campaign.subject || ''}
                  onChange={(e) => setCampaign(prev => ({ ...prev, subject: e.target.value }))}
                  placeholder="Email subject line"
                  className="w-full bg-transparent border border-subtle p-3 text-white outline-none focus:border-purple-500 transition-colors font-geist"
                />
              </div>

              <div className="bg-[#050505] border border-subtle p-6">
                <label className="block text-xs uppercase tracking-widest text-neutral-500 font-geist mb-2">
                  Email Body
                </label>
                <textarea
                  rows={12}
                  value={campaign.template || ''}
                  onChange={(e) => setCampaign(prev => ({ ...prev, template: e.target.value }))}
                  placeholder="Email body content. Use {{variableName}} for personalization."
                  className="w-full bg-transparent border border-subtle p-3 text-white outline-none focus:border-purple-500 transition-colors font-geist"
                />
                <p className="text-xs text-neutral-500 font-geist mt-2">
                  Available variables: {'{{firstName}}'}, {'{{lastName}}'}, {'{{company}}'}, {'{{title}}'}, {'{{industry}}'}
                </p>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Templates */}
              <div className="bg-[#050505] border border-subtle p-6">
                <h3 className="text-sm uppercase tracking-widest text-white font-geist mb-4">Templates</h3>
                <div className="space-y-2">
                  {DEFAULT_TEMPLATES.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => handleTemplateSelect(template.id)}
                      className={`w-full text-left p-3 border transition-all font-geist text-sm ${
                        selectedTemplate === template.id
                          ? 'border-purple-500 bg-purple-500/5 text-white'
                          : 'border-subtle hover:border-purple-500/30 text-neutral-300'
                      }`}
                    >
                      {template.name}
                    </button>
                  ))}
                </div>
                <button
                  onClick={handleGenerateAI}
                  disabled={generating || selectedLeads.length === 0}
                  className="w-full mt-4 bg-purple-500 text-white px-4 py-2 text-xs font-bold tracking-widest uppercase hover:bg-purple-600 transition-colors font-geist disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {generating ? (
                    <>
                      <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Generating...
                    </>
                  ) : (
                    '✨ Generate with AI'
                  )}
                </button>
              </div>

              {/* Recipients */}
              <div className="bg-[#050505] border border-subtle p-6">
                <h3 className="text-sm uppercase tracking-widest text-white font-geist mb-4">
                  Recipients ({selectedLeads.length})
                </h3>
                <div className="max-h-64 overflow-y-auto space-y-2">
                  {leads.map((lead) => (
                    <label key={lead.id} className="flex items-center gap-2 p-2 hover:bg-white/5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedLeads.includes(lead.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedLeads(prev => [...prev, lead.id]);
                          } else {
                            setSelectedLeads(prev => prev.filter(id => id !== lead.id));
                          }
                        }}
                        className="w-4 h-4"
                      />
                      <span className="text-sm text-neutral-300 font-geist">
                        {lead.firstName} {lead.lastName} ({lead.email})
                      </span>
                    </label>
                  ))}
                </div>
                {leads.length === 0 && (
                  <p className="text-sm text-neutral-500 font-geist">
                    <Link href="/dashboard/leads/import" className="text-purple-400 hover:text-purple-300">
                      Import leads first
                    </Link>
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="bg-[#050505] border border-subtle p-6">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full bg-white text-black px-6 py-3 text-sm font-bold tracking-widest uppercase hover:bg-neutral-200 transition-colors font-geist disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <>
                      <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </>
                  ) : (
                    'Save Campaign'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-subtle bg-black py-8 relative z-10">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex flex-col md:flex-row justify-between items-center text-[10px] uppercase tracking-widest text-neutral-600">
            <p className="font-geist">© 2025 AI Lead Strategies LLC. All Rights Reserved.</p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <Link href="/privacy" className="hover:text-white transition-colors font-geist">Privacy</Link>
              <Link href="/terms" className="hover:text-white transition-colors font-geist">Terms</Link>
              <Link href="/support" className="hover:text-white transition-colors font-geist">Support</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
