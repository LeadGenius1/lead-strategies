'use client';

import { useState, useEffect } from 'react';
import CopilotChat from '@/components/CopilotChat';
import AutoScheduler from './components/AutoScheduler';
import EmailDatabase from './components/EmailDatabase';
import api from '@/lib/api';
import { Search, MessageSquare } from 'lucide-react';

const SIMPLIFIED_PLATFORMS = ['leadsite.ai', 'leadsite.io', 'clientcontact.io', 'ultralead.ai'];

export default function LeadHunterPage() {
  const [simplified, setSimplified] = useState(false);
  const [mode, setMode] = useState('chat'); // 'chat' | 'wizard'
  const [step, setStep] = useState('search');
  const [leads, setLeads] = useState([]);
  const [selectedEmails, setSelectedEmails] = useState([]);
  const [schedule, setSchedule] = useState(null);
  const [searchParams, setSearchParams] = useState({ industry: '', titles: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const host = typeof window !== 'undefined' ? window.location.hostname.replace(/^www\./, '').split(':')[0] : '';
    setSimplified(SIMPLIFIED_PLATFORMS.includes(host));
  }, []);

  async function handleSearch() {
    setLoading(true);
    setError(null);
    try {
      const jobTitles = searchParams.titles
        ? searchParams.titles.split(/[,;]/).map((t) => t.trim()).filter(Boolean)
        : ['CEO', 'CTO', 'VP Sales'];
      const res = await api.post('/api/v1/leads/discover', {
        jobTitles,
        industry: searchParams.industry || undefined,
        limit: 100,
      });
      const data = res.data?.data || res.data || {};
      setLeads(Array.isArray(data.leads) ? data.leads : []);
      setStep('emails');
    } catch (err) {
      setError(err.response?.data?.error || 'Lead discovery failed');
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateCampaign() {
    setLoading(true);
    try {
      const firstEmail = selectedEmails[0];
      const startDate = schedule?.startDate ? new Date(`${schedule.startDate}T${schedule.startTime}`) : null;
      await api.post('/api/v1/campaigns', {
        name: `Campaign ${new Date().toISOString().split('T')[0]}`,
        subject: firstEmail?.subject || 'Follow up',
        htmlContent: firstEmail?.htmlContent || firstEmail?.body || '',
        leadIds: leads.map((l) => l.id),
        scheduledAt: startDate?.toISOString() || null,
      });
      window.location.href = '/campaigns';
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create campaign');
    } finally {
      setLoading(false);
    }
  }

  const bgStyle = {
    backgroundSize: '40px 40px',
    backgroundImage: 'linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px)',
  };

  return (
    <div className="relative min-h-screen bg-black overflow-hidden">
      <div className="fixed inset-0 pointer-events-none opacity-20" style={bgStyle} />

      <div className="relative z-10 p-4 md:p-6">
        <div className="max-w-4xl lg:max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-lg font-medium text-white flex items-center gap-2">
              <Search className="w-5 h-5 text-indigo-400" />
              Lead Hunter
            </h1>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setMode('chat')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  mode === 'chat' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'bg-white/5 text-neutral-400 border border-white/10 hover:border-white/20'
                }`}
              >
                <MessageSquare className="w-4 h-4 inline mr-2" />
                AI Chat
              </button>
              <button
                type="button"
                onClick={() => setMode('wizard')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  mode === 'wizard' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'bg-white/5 text-neutral-400 border border-white/10 hover:border-white/20'
                }`}
              >
                <Search className="w-4 h-4 inline mr-2" />
                Campaign Wizard
              </button>
            </div>
          </div>

          {(simplified || mode === 'chat') ? (
            <div className="h-[calc(100vh-12rem)]">
              <CopilotChat />
            </div>
          ) : (
            <div className="space-y-6">
              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-2 text-red-400 text-sm">
                  {error}
                </div>
              )}

              <div className="flex gap-2 mb-6">
                {['search', 'emails', 'schedule', 'confirm'].map((s, idx) => (
                  <div key={s} className="flex-1 flex items-center">
                    <div
                      className={`flex items-center justify-center w-8 h-8 rounded-full border text-sm font-medium ${
                        ['search', 'emails', 'schedule', 'confirm'].indexOf(step) >= idx
                          ? 'bg-indigo-500/20 border-indigo-500/30 text-indigo-300'
                          : 'bg-white/5 border-white/10 text-neutral-500'
                      }`}
                    >
                      {idx + 1}
                    </div>
                    {idx < 3 && <div className="flex-1 h-0.5 bg-white/10 mx-1" />}
                  </div>
                ))}
              </div>

              {step === 'search' && (
                <div className="bg-neutral-900/50 border border-white/10 rounded-xl p-6">
                  <h2 className="text-base font-medium text-white mb-4">Find Leads</h2>
                  <div className="space-y-4">
                    <input
                      type="text"
                      placeholder="Industry (e.g., Technology, Healthcare)"
                      value={searchParams.industry}
                      onChange={(e) => setSearchParams({ ...searchParams, industry: e.target.value })}
                      className="w-full px-4 py-2.5 bg-black/50 border border-white/10 rounded-lg text-white text-sm font-light placeholder-neutral-500 focus:outline-none focus:border-indigo-500/50"
                    />
                    <input
                      type="text"
                      placeholder="Job Titles (e.g., CEO, CTO, VP Marketing)"
                      value={searchParams.titles}
                      onChange={(e) => setSearchParams({ ...searchParams, titles: e.target.value })}
                      className="w-full px-4 py-2.5 bg-black/50 border border-white/10 rounded-lg text-white text-sm font-light placeholder-neutral-500 focus:outline-none focus:border-indigo-500/50"
                    />
                    <button
                      type="button"
                      onClick={handleSearch}
                      disabled={loading}
                      className="w-full px-6 py-3 bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/30 text-indigo-300 font-medium rounded-lg transition-all disabled:opacity-50"
                    >
                      {loading ? 'Searching...' : 'Find Leads'}
                    </button>
                  </div>
                </div>
              )}

              {step === 'emails' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h2 className="text-base font-medium text-white mb-4">Found {leads.length} Leads</h2>
                    <div className="bg-neutral-900/50 border border-white/10 rounded-xl p-6 max-h-96 overflow-y-auto space-y-2">
                      {leads.map((lead) => (
                        <div key={lead.id} className="p-3 bg-white/5 rounded-lg border border-white/5">
                          <p className="text-white font-medium text-sm">{lead.name || lead.email}</p>
                          <p className="text-neutral-400 text-xs">
                            {lead.title} at {lead.company}
                          </p>
                        </div>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => setStep('schedule')}
                      disabled={selectedEmails.length === 0}
                      className="w-full mt-4 px-6 py-3 bg-indigo-500/20 hover:bg-indigo-500/30 disabled:opacity-50 disabled:cursor-not-allowed border border-indigo-500/30 text-indigo-300 font-medium rounded-lg transition-all"
                    >
                      Next: Schedule Campaign
                    </button>
                  </div>
                  <EmailDatabase onSelectEmails={(emails) => setSelectedEmails(emails)} />
                </div>
              )}

              {step === 'schedule' && (
                <AutoScheduler
                  onSchedule={(sched) => {
                    setSchedule(sched);
                    setStep('confirm');
                  }}
                />
              )}

              {step === 'confirm' && schedule && (
                <div className="bg-neutral-900/50 border border-white/10 rounded-xl p-6">
                  <h2 className="text-base font-medium text-white mb-4">Ready to Launch</h2>
                  <div className="space-y-2 text-neutral-300 text-sm font-light mb-6">
                    <p>{leads.length} leads selected</p>
                    <p>{selectedEmails.length} email template(s) ready</p>
                    <p>Scheduled to start {schedule.startDate}</p>
                    <p>{schedule.dailyLimit} emails/day</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleCreateCampaign}
                    disabled={loading}
                    className="w-full px-6 py-3 bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/30 text-indigo-300 font-medium rounded-lg transition-all disabled:opacity-50"
                  >
                    {loading ? 'Creating...' : 'Launch Campaign'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
