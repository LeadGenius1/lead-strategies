'use client';

import { useState, useRef, useEffect } from 'react';
import { useMarketStrategy } from '@/lib/market-strategy/useMarketStrategy';
import { getHistory, getJobStatus } from '@/lib/market-strategy/api';
import api from '@/lib/api';
import {
  NEXUS_AGENTS, STAGES, AGENT_MAP, AGENT_COLORS,
  BUDGET_OPTIONS, PLATFORM_OPTIONS, AGENT_STATUS,
} from '@/lib/market-strategy/constants';
import { AetherInput, AetherSelect, AetherTextarea } from '@/components/aether/AetherInput';
import AetherCard from '@/components/aether/AetherCard';
import AetherBadge from '@/components/aether/AetherBadge';
import AetherButton from '@/components/aether/AetherButton';

// ═══ Shared Sub-Components (AETHER patterns from nexus/page.js) ═══

const STATUS_BADGE = {
  completed: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  running:   'bg-indigo-500/15 text-indigo-400 border-indigo-500/20',
  pending:   'bg-neutral-500/15 text-neutral-400 border-neutral-500/20',
  failed:    'bg-red-500/15 text-red-400 border-red-500/20',
};

function StatusBadge({ status }) {
  const cls = STATUS_BADGE[status] || STATUS_BADGE.pending;
  return (
    <span className={`text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 rounded border font-mono ${cls}`}>
      {status}
    </span>
  );
}

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

function SectionHeader({ badge, title, subtitle }) {
  return (
    <div className="mb-6">
      {badge && (
        <AetherBadge variant="live" className="mb-3">{badge}</AetherBadge>
      )}
      <h2 className="text-2xl md:text-3xl font-medium tracking-tight text-white mb-2">{title}</h2>
      {subtitle && <p className="text-neutral-500 text-sm font-light">{subtitle}</p>}
    </div>
  );
}

// ═══ Agent Card ═══

function AgentCard({ agentId, agentState, collapsed = false }) {
  const agent = AGENT_MAP[agentId];
  const color = AGENT_COLORS[agentId] || 'indigo';
  const { status, progress, message, cached, costUsd, error } = agentState;

  const accentMap = {
    indigo:  'via-indigo-500/50',
    purple:  'via-purple-500/50',
    emerald: 'via-emerald-500/50',
    amber:   'via-amber-500/50',
    rose:    'via-rose-500/50',
  };

  if (collapsed && status === 'completed') {
    return (
      <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-neutral-900/20 border border-white/[0.04]">
        <span className="text-sm">{agent?.icon}</span>
        <span className="text-xs text-neutral-400 flex-1">{agent?.name}</span>
        <StatusBadge status={status} />
      </div>
    );
  }

  return (
    <div className="relative rounded-xl bg-neutral-900/30 border border-white/[0.06] p-4 overflow-hidden">
      <div className={`absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent ${accentMap[color] || accentMap.indigo} to-transparent`} />
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="text-lg flex-shrink-0">{agent?.icon}</span>
          <div className="min-w-0">
            <h3 className="text-sm font-medium text-white truncate">{agent?.name}</h3>
            {message && status === 'running' && (
              <p className="text-[11px] text-neutral-500 mt-0.5 truncate">{message}</p>
            )}
            {error && status === 'failed' && (
              <p className="text-[11px] text-red-400 mt-0.5 truncate">{error}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {cached && (
            <span className="text-[9px] text-neutral-600 font-mono">CACHED</span>
          )}
          <StatusBadge status={status} />
        </div>
      </div>
      {(status === 'running' || status === 'completed') && (
        <div className="flex items-center gap-3">
          <ProgressBar value={progress} className="flex-1" />
          <span className="text-[10px] text-neutral-500 font-mono tabular-nums w-8 text-right">{progress}%</span>
        </div>
      )}
    </div>
  );
}

// ═══ STATE 1: Input Form ═══

function StrategyForm({ onSubmit, isRunning, initialData, profileLoaded }) {
  const [targetMarket, setTargetMarket] = useState('');
  const [icp, setIcp] = useState('');
  const [offer, setOffer] = useState('');
  const [budgetRange, setBudgetRange] = useState('');
  const [notes, setNotes] = useState('');
  const [competitors, setCompetitors] = useState([]);
  const [competitorInput, setCompetitorInput] = useState('');
  const [platforms, setPlatforms] = useState([]);
  const [errors, setErrors] = useState({});

  const competitorRef = useRef(null);

  // Auto-populate from BusinessProfile
  useEffect(() => {
    if (initialData) {
      if (initialData.targetMarket) setTargetMarket(initialData.targetMarket);
      if (initialData.icp) setIcp(initialData.icp);
      if (initialData.offer) setOffer(initialData.offer);
      if (initialData.budgetRange) setBudgetRange(initialData.budgetRange);
      if (initialData.uniqueValue) setNotes(initialData.uniqueValue);
      if (Array.isArray(initialData.competitors) && initialData.competitors.length > 0) {
        setCompetitors(initialData.competitors);
      }
      if (Array.isArray(initialData.platforms) && initialData.platforms.length > 0) {
        setPlatforms(initialData.platforms);
      }
    }
  }, [initialData]);

  function addCompetitor() {
    const val = competitorInput.trim();
    if (val && !competitors.includes(val)) {
      setCompetitors(prev => [...prev, val]);
      setCompetitorInput('');
      competitorRef.current?.focus();
    }
  }

  function removeCompetitor(idx) {
    setCompetitors(prev => prev.filter((_, i) => i !== idx));
  }

  function togglePlatform(id) {
    setPlatforms(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  }

  function handleSubmit(e) {
    e.preventDefault();
    const errs = {};
    if (!targetMarket.trim()) errs.targetMarket = 'Required';
    if (!icp.trim()) errs.icp = 'Required';
    if (!offer.trim()) errs.offer = 'Required';
    if (!budgetRange) errs.budgetRange = 'Required';
    if (competitors.length === 0) errs.competitors = 'Add at least one competitor';
    if (platforms.length === 0) errs.platforms = 'Select at least one platform';

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setErrors({});
    onSubmit({ targetMarket, icp, competitors, offer, budgetRange, platforms, notes });
  }

  return (
    <AetherCard hover={false} className="!p-6 md:!p-8">
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />
      <h3 className="text-lg font-medium text-white mb-1">Define Your Market Strategy</h3>
      <p className="text-sm text-neutral-500 mb-6">Nexus will analyze your market and build a custom strategy across your platforms.</p>

      {profileLoaded && (
        <div className="mb-4 px-4 py-2 rounded-lg bg-indigo-600/10 border border-indigo-500/20 text-indigo-300 text-sm">
          Pre-filled from your Nexus profile. Edit anything before running.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <AetherInput
            label="Target Market"
            placeholder="e.g. B2B SaaS companies in healthcare"
            value={targetMarket}
            onChange={(e) => setTargetMarket(e.target.value)}
            error={errors.targetMarket}
          />
          <AetherInput
            label="Your Offer"
            placeholder="e.g. AI-powered lead generation platform"
            value={offer}
            onChange={(e) => setOffer(e.target.value)}
            error={errors.offer}
          />
        </div>

        <AetherTextarea
          label="Ideal Customer Profile (ICP)"
          placeholder="Describe your ideal customer: role, company size, pain points, buying triggers..."
          value={icp}
          onChange={(e) => setIcp(e.target.value)}
          error={errors.icp}
          className="!min-h-[80px]"
        />

        {/* Competitors — tag input */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-neutral-300">Competitors</label>
          <div className="flex gap-2">
            <input
              ref={competitorRef}
              type="text"
              className="input-aether flex-1"
              placeholder="Competitor URL or name — press Enter to add"
              value={competitorInput}
              onChange={(e) => setCompetitorInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') { e.preventDefault(); addCompetitor(); }
              }}
            />
            <button
              type="button"
              onClick={addCompetitor}
              className="px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-neutral-400 hover:border-white/20 hover:text-white transition-all text-sm"
            >
              Add
            </button>
          </div>
          {competitors.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {competitors.map((c, i) => (
                <span key={i} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-neutral-800/50 border border-white/10 text-xs text-neutral-300">
                  {c}
                  <button type="button" onClick={() => removeCompetitor(i)} className="text-neutral-500 hover:text-red-400 transition-colors">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </span>
              ))}
            </div>
          )}
          {errors.competitors && <p className="text-xs text-red-400">{errors.competitors}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <AetherSelect
            label="Monthly Budget Range"
            options={[{ value: '', label: 'Select budget range...' }, ...BUDGET_OPTIONS]}
            value={budgetRange}
            onChange={(e) => setBudgetRange(e.target.value)}
            error={errors.budgetRange}
          />
          {/* Platforms — chip select */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-neutral-300">Platforms</label>
            <div className="flex flex-wrap gap-2">
              {PLATFORM_OPTIONS.map((p) => {
                const active = platforms.includes(p.id);
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => togglePlatform(p.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                      active
                        ? 'bg-indigo-500/15 border-indigo-500/30 text-indigo-300'
                        : 'bg-neutral-900/50 border-white/10 text-neutral-400 hover:border-white/20 hover:text-neutral-300'
                    }`}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>
            {errors.platforms && <p className="text-xs text-red-400">{errors.platforms}</p>}
          </div>
        </div>

        <AetherTextarea
          label="Additional Notes (optional)"
          placeholder="Any specific goals, constraints, or context..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="!min-h-[60px]"
        />

        <div className="flex justify-end pt-2">
          <AetherButton type="submit" disabled={isRunning}>
            Run Strategy
          </AetherButton>
        </div>
      </form>
    </AetherCard>
  );
}

// ═══ STATE 2/3: Pipeline Progress ═══

function PipelineProgress({ agents, stages, currentPhase }) {
  const isThinking = currentPhase === 'thinking';

  return (
    <div className="space-y-8">
      {/* Active stages */}
      {Object.entries(STAGES).map(([idx, stageDef]) => {
        const stageIdx = parseInt(idx, 10);
        const stageStatus = stages[stageIdx];
        const isActiveGroup = stageStatus === 'running';
        const isPast = stageStatus === 'completed';
        const isFuture = stageStatus === 'pending';

        // Collapsed completed stages when in "building" phase
        const collapsed = isPast && currentPhase === 'building';

        if (isFuture) return null;

        return (
          <div key={stageIdx}>
            <div className="flex items-center gap-3 mb-3">
              <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                isPast ? 'bg-emerald-400' : isActiveGroup ? 'bg-indigo-400 animate-pulse' : 'bg-neutral-600'
              }`} />
              <h3 className="font-space-grotesk text-sm font-semibold text-neutral-400 uppercase tracking-widest">
                {stageDef.label}
              </h3>
              {isPast && <StatusBadge status="completed" />}
            </div>

            {collapsed ? (
              <div className="space-y-1.5">
                {stageDef.agents.map(agentId => (
                  <AgentCard key={agentId} agentId={agentId} agentState={agents[agentId]} collapsed />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {stageDef.agents.map(agentId => (
                  <AgentCard key={agentId} agentId={agentId} agentState={agents[agentId]} />
                ))}
              </div>
            )}
          </div>
        );
      })}

      {/* Headline */}
      <div className="text-center py-4">
        <div className="inline-flex items-center gap-3">
          <div className="animate-spin rounded-full h-5 w-5 border-2 border-indigo-500 border-t-transparent" />
          <p className="text-sm text-neutral-400 font-light">
            {isThinking ? 'Nexus is analyzing your market...' : 'Nexus is building your strategy...'}
          </p>
        </div>
      </div>
    </div>
  );
}

// ═══ Text Cleaner — fixes double-encoded escape sequences ═══

function cleanText(val) {
  if (typeof val !== 'string') return val;
  return val
    .replace(/\\n/g, '\n')
    .replace(/\\t/g, '\t')
    .replace(/\\"/g, '"')
    .replace(/\\\\/g, '\\');
}

function deepParse(raw) {
  if (raw == null) return null;
  let data = raw;

  // Strip ```json / ``` code fence markers that LLMs sometimes wrap around JSON
  if (typeof data === 'string') {
    data = data
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/```\s*$/i, '')
      .trim();
  }

  // If string, try to parse as JSON (handles double-stringified data)
  if (typeof data === 'string') {
    try { data = JSON.parse(data); } catch { /* keep as string */ }
  }
  // Still a string? Try one more parse in case of triple-encoding
  if (typeof data === 'string') {
    try { data = JSON.parse(data); } catch { /* keep as string */ }
  }

  // Handle truncated output from pipeline
  if (data && typeof data === 'object' && data._truncated && typeof data.data === 'string') {
    try { data = JSON.parse(data.data); } catch { data = data.data; }
  }

  // Clean escape sequences in all string values
  if (typeof data === 'string') return cleanText(data);
  if (typeof data === 'object' && data !== null) {
    for (const key of Object.keys(data)) {
      if (typeof data[key] === 'string') data[key] = cleanText(data[key]);
    }
  }
  return data;
}

// ═══ Executive Summary Renderer ═══

function ExecSummaryCard({ output }) {
  const data = deepParse(output);

  // Plain text fallback
  if (typeof data === 'string') {
    return (
      <AetherCard hover={false} variant="indigo" className="!p-6">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />
        <div className="flex items-center gap-2.5 mb-4">
          <span className="text-lg">{AGENT_MAP['exec-summary']?.icon}</span>
          <h3 className="text-lg font-medium text-white">Executive Summary</h3>
          <StatusBadge status="completed" />
        </div>
        <div className="whitespace-pre-wrap text-sm text-neutral-300 leading-relaxed">{data}</div>
      </AetherCard>
    );
  }

  if (!data || typeof data !== 'object') return null;

  // Structured output
  return (
    <AetherCard hover={false} variant="indigo" className="!p-6">
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />
      <div className="flex items-center gap-2.5 mb-4">
        <span className="text-lg">{AGENT_MAP['exec-summary']?.icon}</span>
        <h3 className="text-lg font-medium text-white">Executive Summary</h3>
        <StatusBadge status="completed" />
      </div>

      {data.summary && (
        <div className="whitespace-pre-wrap text-sm text-neutral-300 leading-relaxed mb-5">
          {cleanText(data.summary)}
        </div>
      )}

      {data.actionItems?.length > 0 && (
        <div className="mb-5">
          <h4 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">Action Items</h4>
          <div className="space-y-2">
            {data.actionItems.map((item, i) => {
              const p = item.priority || i + 1;
              const priorityColor = p <= 1 ? 'bg-red-500/15 text-red-400 border-red-500/20'
                : p <= 2 ? 'bg-amber-500/15 text-amber-400 border-amber-500/20'
                : 'bg-blue-500/15 text-blue-400 border-blue-500/20';
              const deadlineStr = item.deadline
                ? (() => { try { const d = new Date(item.deadline); return isNaN(d) ? item.deadline : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); } catch { return item.deadline; } })()
                : null;
              return (
                <div key={i} className="flex items-start gap-2.5 text-sm text-neutral-300">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border mt-0.5 ${priorityColor}`}>P{p}</span>
                  <div className="flex-1">
                    <span>{cleanText(item.action || (typeof item === 'string' ? item : JSON.stringify(item)))}</span>
                    {item.owner && <span className="text-neutral-500 ml-1.5 text-xs">({item.owner})</span>}
                    {deadlineStr && <span className="text-neutral-600 ml-1.5 text-xs">Due: {deadlineStr}</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {data.kpis && Object.keys(data.kpis).length > 0 && (
        <div className="mb-5">
          <h4 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">Target KPIs</h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {Object.entries(data.kpis).map(([key, value]) => (
              <div key={key} className="bg-white/[0.03] rounded-lg px-3 py-2 border border-white/[0.06]">
                <div className="text-lg font-semibold text-white">{typeof value === 'number' ? value.toLocaleString() : String(value)}</div>
                <div className="text-[10px] text-neutral-500 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.timeline && Object.keys(data.timeline).length > 0 && (
        <div className="mb-5">
          <h4 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">Timeline</h4>
          <div className="space-y-1.5">
            {Object.entries(data.timeline).map(([period, milestone]) => (
              <div key={period} className="flex items-start gap-2 text-sm">
                <span className="text-xs font-medium text-indigo-400 min-w-[60px] capitalize">{period}</span>
                <span className="text-neutral-300">{cleanText(String(milestone))}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.risks?.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">Risks</h4>
          <div className="space-y-1.5">
            {data.risks.map((r, i) => (
              <div key={i} className="text-sm text-neutral-300">
                <span className="text-amber-400 mr-1">!</span>
                <span className="font-medium">{cleanText(r.risk || String(r))}</span>
                {r.mitigation && <span className="text-neutral-500 ml-1"> {cleanText(r.mitigation)}</span>}
              </div>
            ))}
          </div>
        </div>
      )}
    </AetherCard>
  );
}

// ═══ Agent Output Renderer ═══

function AgentOutputDisplay({ output }) {
  const data = deepParse(output);

  if (typeof data === 'string') {
    return <div className="whitespace-pre-wrap text-xs text-neutral-400 mt-3 leading-relaxed max-h-96 overflow-y-auto">{data}</div>;
  }

  if (!data || typeof data !== 'object') return null;

  return (
    <div className="mt-3 space-y-3 max-h-96 overflow-y-auto">
      {Object.entries(data).map(([key, value]) => {
        if (key.startsWith('_')) return null;
        return (
          <div key={key}>
            <h5 className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider mb-1">
              {key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').trim()}
            </h5>
            {typeof value === 'string' ? (
              <div className="whitespace-pre-wrap text-xs text-neutral-400 leading-relaxed">{cleanText(value)}</div>
            ) : Array.isArray(value) ? (
              <ul className="list-disc list-inside space-y-0.5 text-xs text-neutral-400">
                {value.map((item, i) => (
                  <li key={i}>{typeof item === 'string' ? cleanText(item) : JSON.stringify(item)}</li>
                ))}
              </ul>
            ) : (
              <pre className="whitespace-pre-wrap text-xs text-neutral-400 leading-relaxed">{JSON.stringify(value, null, 2)}</pre>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ═══ STATE 4: Results ═══

function StrategyResults({ outputs, agents, stats, onReset }) {
  const [expanded, setExpanded] = useState({});

  function toggle(agentId) {
    setExpanded(prev => ({ ...prev, [agentId]: !prev[agentId] }));
  }

  const agentOutputs = outputs?.agents || {};

  return (
    <div className="space-y-6">
      {/* Executive Summary — prominent card */}
      {agentOutputs['exec-summary']?.output && (
        <ExecSummaryCard output={agentOutputs['exec-summary'].output} />
      )}

      {/* Per-agent results — collapsible */}
      <div>
        <h3 className="font-space-grotesk text-sm font-semibold text-neutral-400 uppercase tracking-widest mb-4">
          Agent Deliverables
        </h3>
        <div className="space-y-2">
          {NEXUS_AGENTS.filter(a => a.id !== 'exec-summary').map(agent => {
            const data = agentOutputs[agent.id];
            const isExpanded = expanded[agent.id];
            const color = AGENT_COLORS[agent.id] || 'indigo';
            const accentMap = {
              indigo: 'via-indigo-500/50', purple: 'via-purple-500/50', emerald: 'via-emerald-500/50',
              amber: 'via-amber-500/50', rose: 'via-rose-500/50',
            };

            return (
              <div key={agent.id} className="relative rounded-xl bg-neutral-900/30 border border-white/[0.06] overflow-hidden">
                <div className={`absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent ${accentMap[color]} to-transparent`} />
                <button
                  onClick={() => toggle(agent.id)}
                  className="w-full flex items-center gap-3 p-4 text-left hover:bg-white/[0.02] transition-colors"
                >
                  <span className="text-sm">{agent.icon}</span>
                  <span className="text-sm font-medium text-white flex-1">{agent.name}</span>
                  <StatusBadge status={data?.status || 'pending'} />
                  <svg
                    className={`w-4 h-4 text-neutral-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {isExpanded && data?.output && (
                  <div className="px-4 pb-4 border-t border-white/[0.04]">
                    <AgentOutputDisplay output={data.output} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-3 pt-4">
        <AetherButton onClick={onReset}>
          Run Again
        </AetherButton>
        <AetherButton variant="secondary" disabled>
          Approve Strategy
        </AetherButton>
      </div>
    </div>
  );
}

// ═══ Debug Panel ═══

function DebugPanel({ logs, stats, agents }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-10">
      <button
        onClick={() => setOpen(!open)}
        className="text-[10px] text-neutral-600 hover:text-neutral-400 transition-colors font-mono uppercase tracking-wider"
      >
        {open ? '[ - ] Hide Debug Panel' : '[ + ] Show Debug Panel'}
      </button>

      {open && (
        <AetherCard hover={false} className="!p-4 mt-3">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-neutral-500/30 to-transparent" />

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            {[
              { label: 'Total Cost', value: `$${stats.totalCost.toFixed(4)}` },
              { label: 'Cache Hits', value: stats.cacheHits },
              { label: 'Completed', value: stats.agentsCompleted },
              { label: 'Failed', value: stats.agentsFailed },
            ].map(s => (
              <div key={s.label} className="rounded-lg bg-black/30 border border-white/[0.04] p-2.5">
                <p className="text-[9px] text-neutral-600 uppercase tracking-widest font-mono">{s.label}</p>
                <p className="text-sm font-medium text-white mt-0.5 tabular-nums">{s.value}</p>
              </div>
            ))}
          </div>

          {/* Per-agent costs */}
          <div className="mb-4">
            <p className="text-[9px] text-neutral-600 uppercase tracking-widest font-mono mb-2">Agent Costs</p>
            <div className="space-y-1">
              {NEXUS_AGENTS.map(a => (
                <div key={a.id} className="flex items-center justify-between text-[11px]">
                  <span className="text-neutral-500">{a.icon} {a.name}</span>
                  <span className="text-neutral-400 font-mono tabular-nums">
                    ${(agents[a.id]?.costUsd || 0).toFixed(4)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Execution log */}
          <div>
            <p className="text-[9px] text-neutral-600 uppercase tracking-widest font-mono mb-2">Execution Log</p>
            <div className="max-h-60 overflow-y-auto rounded-lg bg-black/50 border border-white/[0.04] p-3 space-y-0.5">
              {logs.length === 0 && (
                <p className="text-[10px] text-neutral-600 font-mono">No events yet.</p>
              )}
              {logs.map((log, i) => (
                <div key={i} className="text-[10px] font-mono leading-relaxed">
                  <span className="text-neutral-600">{new Date(log.ts).toLocaleTimeString()}</span>{' '}
                  <span className={`${
                    log.type === 'error' || log.type === 'agent_failed' ? 'text-red-400' :
                    log.type === 'agent_complete' || log.type === 'job_complete' ? 'text-emerald-400' :
                    'text-neutral-400'
                  }`}>
                    [{log.type}]
                  </span>{' '}
                  <span className="text-neutral-300">{log.message}</span>
                </div>
              ))}
            </div>
          </div>
        </AetherCard>
      )}
    </div>
  );
}

// ═══ PAGE ═══

export default function MarketStrategyPage() {
  const {
    jobId, isRunning, isReconnecting,
    agents, stages, currentPhase,
    logs, stats, outputs, error,
    executeStrategy, retryFailed, cancel, reset,
  } = useMarketStrategy();

  const [profileData, setProfileData] = useState(null);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [lastStrategy, setLastStrategy] = useState(null);

  // Load profile + strategy history on mount
  useEffect(() => {
    async function loadContext() {
      try {
        const { data } = await api.get('/api/v1/business-profile');
        if (data?.profile) {
          setProfileData(data.profile);
          setProfileLoaded(true);
        }
      } catch {
        // No profile — form stays empty
      }

      try {
        const historyData = await getHistory();
        if (historyData?.jobs?.length > 0) {
          const latest = historyData.jobs[0]; // sorted desc by score
          if (latest.status === 'completed' || latest.status === 'partial') {
            setLastStrategy(latest);
          }
        }
      } catch {
        // No history — that's fine
      }
    }
    loadContext();
  }, []);

  function viewResults() {
    if (lastStrategy?.jobId) {
      // Load the job results into the hook by re-running with that jobId
      window.location.hash = lastStrategy.jobId;
      window.location.reload();
    }
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white antialiased selection:bg-indigo-500/30 p-6 md:p-8">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* Header */}
        <div>
          <div className="flex items-center gap-3 mb-1">
            {isRunning && (
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500" />
              </span>
            )}
            {!isRunning && currentPhase === 'results' && (
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
            )}
            {!isRunning && currentPhase === 'idle' && (
              <span className="w-2 h-2 rounded-full bg-neutral-600" />
            )}
            <h1 className="font-space-grotesk text-2xl md:text-3xl font-semibold tracking-tight text-white uppercase">
              Market Strategy
            </h1>
          </div>
          <p className="text-neutral-500 text-sm font-light">
            AI-powered market analysis and strategy generation across your platforms
          </p>
        </div>

        {/* SSE reconnecting banner */}
        {isReconnecting && (
          <div className="rounded-lg border bg-amber-500/10 border-amber-500/20 px-4 py-2.5 flex items-center gap-2">
            <div className="animate-spin rounded-full h-3 w-3 border border-amber-400 border-t-transparent" />
            <span className="text-xs text-amber-400">Reconnecting to live feed...</span>
          </div>
        )}

        {/* Error banner */}
        {error && currentPhase === 'idle' && (
          <div className="rounded-lg border bg-red-500/10 border-red-500/20 px-4 py-3">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* Smart status banner: strategy already ran */}
        {currentPhase === 'idle' && lastStrategy && (
          <div className="p-4 rounded-lg bg-emerald-600/10 border border-emerald-500/20">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <p className="text-emerald-300 font-medium text-sm">Strategy Generated</p>
                <p className="text-neutral-500 text-xs mt-1">
                  {profileLoaded ? 'Built automatically from your Nexus profile. ' : ''}
                  Last run: {new Date(lastStrategy.createdAt).toLocaleDateString()}
                  {lastStrategy.totalCostUsd > 0 && ` — $${lastStrategy.totalCostUsd.toFixed(4)}`}
                </p>
              </div>
              <div className="flex gap-2">
                <AetherButton size="sm" variant="secondary" onClick={viewResults}>
                  View Results
                </AetherButton>
                <AetherButton size="sm" onClick={() => executeStrategy(profileData ? {
                  targetMarket: profileData.targetMarket || '',
                  icp: profileData.icp || '',
                  competitors: profileData.competitors || [],
                  offer: profileData.offer || '',
                  budgetRange: profileData.budgetRange || '',
                  platforms: profileData.platforms || [],
                  notes: profileData.uniqueValue || '',
                } : undefined)}>
                  Re-run Strategy
                </AetherButton>
              </div>
            </div>
          </div>
        )}

        {/* Smart status banner: no profile yet */}
        {currentPhase === 'idle' && !profileLoaded && !lastStrategy && (
          <div className="p-4 rounded-lg bg-amber-600/10 border border-amber-500/20">
            <p className="text-amber-300 text-sm">
              Complete your{' '}
              <a href="/nexus/setup" className="underline hover:text-amber-200 transition-colors">
                Nexus profile
              </a>{' '}
              first and your strategy will be built automatically.
            </p>
          </div>
        )}

        {/* Running controls */}
        {isRunning && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AetherBadge variant="live">PIPELINE ACTIVE</AetherBadge>
              {jobId && <span className="text-[10px] text-neutral-600 font-mono">{jobId}</span>}
            </div>
            <button
              onClick={cancel}
              className="px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs hover:bg-red-500/20 transition-colors"
            >
              Cancel
            </button>
          </div>
        )}

        {/* STATE 1: Idle — Show form */}
        {currentPhase === 'idle' && (
          <StrategyForm
            onSubmit={executeStrategy}
            isRunning={isRunning}
            initialData={profileData}
            profileLoaded={profileLoaded}
          />
        )}

        {/* STATE 2/3: Thinking / Building — Show pipeline */}
        {(currentPhase === 'thinking' || currentPhase === 'building') && (
          <PipelineProgress agents={agents} stages={stages} currentPhase={currentPhase} />
        )}

        {/* STATE 4: Results */}
        {currentPhase === 'results' && (
          <StrategyResults outputs={outputs} agents={agents} stats={stats} onReset={reset} />
        )}

        {/* Debug Panel — always available */}
        {currentPhase !== 'idle' && (
          <DebugPanel logs={logs} stats={stats} agents={agents} />
        )}
      </div>
    </div>
  );
}
