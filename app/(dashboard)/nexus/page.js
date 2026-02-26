'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';

const STATUS_BADGE = {
  COMPLETED: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  IN_PROGRESS: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/20',
  NOT_STARTED: 'bg-neutral-500/15 text-neutral-400 border-neutral-500/20',
  BLOCKED: 'bg-red-500/15 text-red-400 border-red-500/20',
};

const PLATFORM_META = {
  'leadsite-io': { label: 'LeadSite.IO', features: ['AI Builder', 'Templates', 'Publishing', 'Lead Forms', 'Analytics'] },
  'leadsite-ai': { label: 'LeadSite.AI', features: ['Lead Hunter', 'Proactive Hunter', 'Prospects', 'Campaigns', 'Replies'] },
  'clientcontact-io': { label: 'ClientContact.IO', features: ['Unified Inbox', 'Channel Manager', 'Auto-Responder'] },
  'videosite-ai': { label: 'VideoSite.AI', features: ['Video Upload', 'Monetization', 'Creator Payouts'] },
  'ultralead': { label: 'UltraLead', features: ['CRM', 'Deals', 'AI Agents', 'SMS', 'Copywriter', 'Analytics', 'Teams'] },
};

function ProgressBar({ value, className = '' }) {
  return (
    <div className={`w-full bg-white/5 rounded-full h-1.5 ${className}`}>
      <div
        className="h-1.5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}

function StatusBadge({ status }) {
  const cls = STATUS_BADGE[status] || STATUS_BADGE.NOT_STARTED;
  const label = (status || 'NOT_STARTED').replace(/_/g, ' ');
  return (
    <span className={`text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 rounded border ${cls}`}>
      {label}
    </span>
  );
}

function BlueprintCard({ title, subtitle, status, progress, items }) {
  return (
    <div className="relative rounded-xl bg-neutral-900/30 border border-white/[0.06] p-5 overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent" />
      <div className="flex items-start justify-between mb-3">
        <div className="min-w-0 mr-3">
          <h3 className="text-sm font-semibold text-white truncate">{title}</h3>
          {subtitle && <p className="text-xs text-neutral-500 mt-0.5 truncate">{subtitle}</p>}
        </div>
        <StatusBadge status={status} />
      </div>
      <div className="flex items-center gap-3 mb-4">
        <ProgressBar value={progress} className="flex-1" />
        <span className="text-xs text-neutral-500 tabular-nums w-8 text-right">{progress}%</span>
      </div>
      {items && items.length > 0 && (
        <ul className="space-y-1.5">
          {items.map((item, i) => {
            const done = item.status === 'COMPLETED' || item.status === 'working';
            const inProgress = item.status === 'IN_PROGRESS';
            return (
              <li key={i} className="flex items-center gap-2 text-xs">
                <span className={`w-1 h-1 rounded-full flex-shrink-0 ${done ? 'bg-emerald-400' : inProgress ? 'bg-indigo-400' : 'bg-neutral-600'}`} />
                <span className={done ? 'text-neutral-300' : inProgress ? 'text-neutral-400' : 'text-neutral-500'}>{item.name || item}</span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default function NexusDashboard() {
  const [modules, setModules] = useState([]);
  const [moduleStats, setModuleStats] = useState(null);
  const [platforms, setPlatforms] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [summaryRes, verifyRes] = await Promise.allSettled([
        api.get('/api/v1/nexus/summary'),
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://api.aileadstrategies.com'}/api/v1/nexus/verification-status`),
      ]);

      if (summaryRes.status === 'fulfilled') {
        const d = summaryRes.value?.data?.data || summaryRes.value?.data || {};
        setModules(Array.isArray(d.modules) ? d.modules : []);
        setModuleStats(d.stats || null);
      }

      if (verifyRes.status === 'fulfilled' && verifyRes.value?.ok) {
        const vj = await verifyRes.value.json();
        if (vj.platforms) setPlatforms(vj.platforms);
      }
    } catch (err) {
      console.error('NEXUS load error:', err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-indigo-500 border-t-transparent" />
      </div>
    );
  }

  const overallProgress = moduleStats?.avgProgress ?? 0;

  return (
    <div className="min-h-screen bg-[#050505] text-white antialiased selection:bg-indigo-500/30 p-6 md:p-8">
      <div className="max-w-6xl mx-auto space-y-10">

        {/* Header */}
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <h1 className="font-space-grotesk text-2xl md:text-3xl font-semibold tracking-tight text-white uppercase">
              NEXUS Blueprint
            </h1>
          </div>
          <p className="text-neutral-500 text-sm font-geist">
            Platform health and strategic module progress
          </p>
        </div>

        {/* Summary Stats */}
        {moduleStats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Modules', value: moduleStats.total },
              { label: 'In Progress', value: moduleStats.inProgress },
              { label: 'Completed', value: moduleStats.completed },
              { label: 'Overall', value: `${overallProgress}%` },
            ].map((s) => (
              <div key={s.label} className="relative rounded-xl bg-neutral-900/30 border border-white/[0.06] p-4 overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent" />
                <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-medium">{s.label}</p>
                <p className="text-xl font-semibold text-white mt-1 tabular-nums">{s.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* Platform Verification */}
        {platforms && (
          <section>
            <h2 className="font-space-grotesk text-sm font-semibold text-neutral-400 uppercase tracking-widest mb-4">
              Platform Status
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(platforms).map(([key, data]) => {
                const meta = PLATFORM_META[key] || { label: key, features: [] };
                const progress = data.total > 0 ? Math.round((data.working / data.total) * 100) : 0;
                const status = data.working === data.total && data.total > 0
                  ? 'COMPLETED'
                  : data.working > 0
                    ? 'IN_PROGRESS'
                    : 'NOT_STARTED';
                const items = meta.features.map((f) => ({ name: f, status: 'NOT_STARTED' }));
                return (
                  <BlueprintCard
                    key={key}
                    title={meta.label}
                    subtitle={`${data.total} features`}
                    status={status}
                    progress={progress}
                    items={items}
                  />
                );
              })}
            </div>
          </section>
        )}

        {/* Strategic Modules */}
        {modules.length > 0 && (
          <section>
            <h2 className="font-space-grotesk text-sm font-semibold text-neutral-400 uppercase tracking-widest mb-4">
              Strategic Modules
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {modules.map((m) => {
                const initiatives = Array.isArray(m.initiatives) ? m.initiatives : [];
                return (
                  <BlueprintCard
                    key={m.id}
                    title={m.title}
                    subtitle={m.category}
                    status={m.status}
                    progress={m.progress}
                    items={initiatives}
                  />
                );
              })}
            </div>
          </section>
        )}

        {/* Empty state */}
        {modules.length === 0 && !platforms && (
          <div className="text-center py-20">
            <p className="text-neutral-500 text-sm">No blueprint data available yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
