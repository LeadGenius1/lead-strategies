'use client'

import { useState, useEffect } from 'react'
import api from '@/lib/api'
import {
  Bot,
  Play,
  Square,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Loader2,
  ChevronRight,
  Activity
} from 'lucide-react'

// Agent icons mapping
const agentIcons = {
  'lead-hunter': '🎯',
  'copy-writer': '✍️',
  'compliance-guardian': '⚖️',
  'warmup-conductor': '🔥',
  'engagement-analyzer': '📊',
  'analytics-brain': '🧠',
  'healing-sentinel': '🛡️'
}

export default function AgentsPage() {
  const [agents, setAgents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [runningAgent, setRunningAgent] = useState(null)
  const [selectedAgent, setSelectedAgent] = useState(null)
  const [logs, setLogs] = useState([])

  useEffect(() => {
    loadAgentStatus()
    // Refresh every 5 seconds
    const interval = setInterval(loadAgentStatus, 5000)
    return () => clearInterval(interval)
  }, [])

  async function loadAgentStatus() {
    try {
      // Try authenticated endpoint first, fall back to health endpoint
      let response
      try {
        response = await api.get('/api/v1/agents/status')
      } catch (authError) {
        // Fall back to public health endpoint
        response = await api.get('/api/v1/agents/health')
        // Transform health response to match status format
        if (response.data?.agents) {
          response.data.data = Object.entries(response.data.agents).map(([id, agent]) => ({
            id,
            ...agent,
            status: agent.status === 'ready' ? 'idle' : agent.status
          }))
        }
      }

      const agentData = response.data?.data || []
      setAgents(agentData)
      setError(null)
    } catch (err) {
      console.error('Failed to load agents:', err)
      setError('Failed to load agent status')
    } finally {
      setLoading(false)
    }
  }

  async function runAgent(agentId) {
    setRunningAgent(agentId)
    try {
      await api.post(`/api/v1/agents/${agentId}/run`, {})
      // Refresh status after triggering
      setTimeout(loadAgentStatus, 1000)
    } catch (err) {
      console.error('Failed to run agent:', err)
      alert(`Failed to run agent: ${err.response?.data?.error || err.message}`)
    } finally {
      setRunningAgent(null)
    }
  }

  async function stopAgent(agentId) {
    try {
      await api.post(`/api/v1/agents/${agentId}/stop`, {})
      loadAgentStatus()
    } catch (err) {
      console.error('Failed to stop agent:', err)
    }
  }

  async function viewLogs(agentId) {
    setSelectedAgent(agentId)
    try {
      const response = await api.get(`/api/v1/agents/${agentId}/logs`)
      setLogs(response.data?.data || [])
    } catch (err) {
      console.error('Failed to load logs:', err)
      setLogs([])
    }
  }

  function getStatusColor(status) {
    switch (status) {
      case 'running': return 'text-green-400 bg-green-500/20 border-green-500/30'
      case 'completed': return 'text-blue-400 bg-blue-500/20 border-blue-500/30'
      case 'idle': return 'text-neutral-400 bg-neutral-500/20 border-neutral-500/30'
      case 'ready': return 'text-neutral-400 bg-neutral-500/20 border-neutral-500/30'
      case 'error': return 'text-red-400 bg-red-500/20 border-red-500/30'
      case 'disabled': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30'
      default: return 'text-neutral-400 bg-neutral-500/20 border-neutral-500/30'
    }
  }

  function getStatusIcon(status) {
    switch (status) {
      case 'running': return <Loader2 className="w-4 h-4 animate-spin" />
      case 'completed': return <CheckCircle2 className="w-4 h-4" />
      case 'error': return <XCircle className="w-4 h-4" />
      case 'disabled': return <AlertTriangle className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  const summary = {
    total: agents.length,
    running: agents.filter(a => a.status === 'running').length,
    ready: agents.filter(a => ['idle', 'ready', 'completed'].includes(a.status)).length,
    error: agents.filter(a => a.status === 'error').length,
    disabled: agents.filter(a => a.status === 'disabled').length
  }

  return (
    <div className="relative min-h-screen bg-black p-6">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[400px] h-[400px] bg-purple-900/10 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-indigo-900/10 rounded-full blur-[100px]"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-medium tracking-tight text-white flex items-center gap-3">
              <Bot className="w-8 h-8 text-purple-400" />
              AI Agents Control Center
            </h1>
            <p className="text-neutral-500 mt-1 text-sm">
              Monitor and control your 7 AI agents
            </p>
          </div>
          <button
            onClick={loadAgentStatus}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm text-white transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="p-4 rounded-xl bg-neutral-900/50 border border-white/10">
            <div className="text-2xl font-bold text-white">{summary.total}</div>
            <div className="text-xs text-neutral-500">Total Agents</div>
          </div>
          <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20">
            <div className="text-2xl font-bold text-green-400">{summary.running}</div>
            <div className="text-xs text-green-400/70">Running</div>
          </div>
          <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
            <div className="text-2xl font-bold text-blue-400">{summary.ready}</div>
            <div className="text-xs text-blue-400/70">Ready</div>
          </div>
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
            <div className="text-2xl font-bold text-red-400">{summary.error}</div>
            <div className="text-xs text-red-400/70">Errors</div>
          </div>
          <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
            <div className="text-2xl font-bold text-yellow-400">{summary.disabled}</div>
            <div className="text-xs text-yellow-400/70">Disabled</div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
            {error}
          </div>
        )}

        {/* Agents Grid */}
        {loading && agents.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {agents.map((agent) => (
              <div
                key={agent.id}
                className={`group relative p-6 rounded-2xl bg-neutral-900/50 border transition-all duration-300 ${
                  agent.status === 'error' ? 'border-red-500/30' :
                  agent.status === 'running' ? 'border-green-500/30' :
                  'border-white/10 hover:border-purple-500/30'
                }`}
              >
                {/* Agent Icon & Status */}
                <div className="flex items-start justify-between mb-4">
                  <div className="text-4xl">{agentIcons[agent.id] || '🤖'}</div>
                  <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(agent.status)}`}>
                    {getStatusIcon(agent.status)}
                    {agent.status}
                  </div>
                </div>

                {/* Agent Info */}
                <h3 className="text-lg font-medium text-white mb-1">{agent.name}</h3>
                <p className="text-sm text-neutral-500 mb-4 line-clamp-2">{agent.description}</p>

                {/* Trigger Info */}
                <div className="text-xs text-neutral-600 mb-4 flex items-center gap-1">
                  <Activity className="w-3 h-3" />
                  {agent.trigger}
                </div>

                {/* Last Run */}
                {agent.lastRun && (
                  <div className="text-xs text-neutral-500 mb-4">
                    Last run: {new Date(agent.lastRun).toLocaleString()}
                  </div>
                )}

                {/* Error Message */}
                {agent.error && agent.status === 'error' && (
                  <div className="text-xs text-red-400 bg-red-500/10 rounded-lg p-2 mb-4">
                    {agent.error}
                  </div>
                )}

                {/* API Key Status */}
                <div className={`text-xs mb-4 ${agent.apiKeyConfigured ? 'text-green-400' : 'text-yellow-400'}`}>
                  {agent.apiKeyConfigured ? '✓ API Key configured' : '⚠ Missing API Key'}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  {agent.status === 'running' ? (
                    <button
                      onClick={() => stopAgent(agent.id)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-sm transition-all"
                    >
                      <Square className="w-4 h-4" />
                      Stop
                    </button>
                  ) : (
                    <button
                      onClick={() => runAgent(agent.id)}
                      disabled={runningAgent === agent.id || !agent.apiKeyConfigured}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-purple-500 hover:bg-purple-600 disabled:bg-neutral-700 disabled:text-neutral-500 text-white rounded-lg text-sm transition-all"
                    >
                      {runningAgent === agent.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Play className="w-4 h-4" />
                      )}
                      Run
                    </button>
                  )}
                  <button
                    onClick={() => viewLogs(agent.id)}
                    className="px-3 py-2 bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white rounded-lg text-sm transition-all"
                  >
                    Logs
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Logs Modal */}
        {selectedAgent && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-neutral-900 border border-white/10 rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-white/10">
                <h3 className="text-lg font-medium text-white flex items-center gap-2">
                  {agentIcons[selectedAgent]} {agents.find(a => a.id === selectedAgent)?.name} Logs
                </h3>
                <button
                  onClick={() => setSelectedAgent(null)}
                  className="text-neutral-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
              <div className="p-4 overflow-y-auto max-h-96 font-mono text-sm">
                {logs.length === 0 ? (
                  <p className="text-neutral-500">No logs available</p>
                ) : (
                  logs.map((log, i) => (
                    <div
                      key={i}
                      className={`mb-2 ${
                        log.level === 'error' ? 'text-red-400' :
                        log.level === 'warn' ? 'text-yellow-400' :
                        'text-neutral-400'
                      }`}
                    >
                      <span className="text-neutral-600">[{log.timestamp}]</span> {log.message}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
