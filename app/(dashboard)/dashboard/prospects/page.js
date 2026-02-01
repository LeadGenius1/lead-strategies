'use client'

import { useState, useEffect } from 'react'
import api from '@/lib/api'
import AgentService from '@/lib/agents'
import toast from 'react-hot-toast'
import { Target, Mail, Eye, MessageSquare, Plus, Loader2, User, Building2, Send, Sparkles, Search } from 'lucide-react'
import AdvancedLeadFilters from '@/components/AdvancedLeadFilters'

const INITIAL_COLOR_CLASSES = [
  { bg: 'bg-indigo-500/20', border: 'border-indigo-500/30', text: 'text-indigo-400' },
  { bg: 'bg-purple-500/20', border: 'border-purple-500/30', text: 'text-purple-400' },
  { bg: 'bg-cyan-500/20', border: 'border-cyan-500/30', text: 'text-cyan-400' },
  { bg: 'bg-emerald-500/20', border: 'border-emerald-500/30', text: 'text-emerald-400' },
  { bg: 'bg-pink-500/20', border: 'border-pink-500/30', text: 'text-pink-400' },
]
const getInitialColorClasses = (name) => {
  const index = name ? name.charCodeAt(0) % INITIAL_COLOR_CLASSES.length : 0
  return INITIAL_COLOR_CLASSES[index]
}

export default function ProspectsPage() {
  const [prospects, setProspects] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [advancedFilters, setAdvancedFilters] = useState({})
  const [leadHunterQuery, setLeadHunterQuery] = useState('')
  const [leadHunterLoading, setLeadHunterLoading] = useState(false)
  const [leadHunterResults, setLeadHunterResults] = useState(null)
  const [aiHookForCards, setAiHookForCards] = useState(null)

  useEffect(() => {
    loadProspects()
  }, [filter, advancedFilters])

  async function loadProspects() {
    try {
      const params = filter !== 'all' ? `?status=${filter}` : ''
      const response = await api.get(`/api/leads${params}`)
      setProspects(response.data?.leads || response.data?.prospects || response.data || [])
    } catch (error) {
      console.error('Error loading prospects:', error)
    } finally {
      setLoading(false)
    }
  }

  const filters = ['all', 'new', 'contacted', 'qualified', 'converted']

  const getStatusStyle = (status) => {
    switch (status) {
      case 'new': return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'contacted': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'qualified': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
      case 'converted': return 'bg-purple-500/20 text-purple-400 border-purple-500/30'
      default: return 'bg-neutral-500/20 text-neutral-400 border-neutral-500/30'
    }
  }

  async function runLeadHunterSearch() {
    if (!leadHunterQuery.trim()) {
      toast.error('Enter a search term (e.g. industry, title)')
      return
    }
    setLeadHunterLoading(true)
    setLeadHunterResults(null)
    setAiHookForCards(null)
    try {
      const data = await AgentService.searchKnowledge(leadHunterQuery.trim(), { platform: 'leadsite_ai', limit: 5 })
      setLeadHunterResults(data)
      const firstSnippet = data?.results?.[0]?.content?.slice(0, 120)
      setAiHookForCards(firstSnippet ? `${firstSnippet}…` : null)
      toast.success(data?.results?.length ? `Found ${data.results.length} knowledge matches` : 'No matches')
    } catch (err) {
      console.error('Lead Hunter search error:', err)
      toast.error('Knowledge search unavailable. Backend Lead Hunter will be used when ready.')
      setLeadHunterResults({ error: err.message })
    } finally {
      setLeadHunterLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen bg-black p-6">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-indigo-900/10 rounded-full blur-[100px]"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-medium tracking-tight text-white">Prospects</h1>
            <p className="text-neutral-500 mt-1 text-sm">Manage and track your leads</p>
          </div>
          <button
            onClick={() => toast.success('Use Lead Hunter to find new prospects!')}
            className="px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white rounded-xl text-sm font-medium transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Prospect
          </button>
        </div>

        {/* Lead Hunter / AI search */}
        <div className="rounded-2xl bg-neutral-900/50 border border-white/10 p-5">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-5 h-5 text-purple-400" />
            <h2 className="text-base font-semibold text-white">Lead Hunter</h2>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="text"
              value={leadHunterQuery}
              onChange={(e) => setLeadHunterQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && runLeadHunterSearch()}
              placeholder="Search by industry, title, company (uses Knowledge API)"
              className="flex-1 min-w-[200px] px-4 py-2.5 rounded-xl bg-black border border-white/10 text-white placeholder-neutral-500 text-sm focus:outline-none focus:border-indigo-500/50"
            />
            <button
              onClick={runLeadHunterSearch}
              disabled={leadHunterLoading}
              className="px-4 py-2.5 bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/30 text-indigo-300 rounded-xl text-sm font-medium flex items-center gap-2 disabled:opacity-50"
            >
              {leadHunterLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              Search
            </button>
          </div>
          {leadHunterResults?.results?.length > 0 && (
            <div className="mt-3 p-3 rounded-xl bg-black/40 border border-white/5">
              <p className="text-xs text-neutral-500 mb-2">Knowledge context ({leadHunterResults.results.length} chunks)</p>
              <ul className="space-y-1 text-sm text-neutral-400">
                {leadHunterResults.results.slice(0, 3).map((r, i) => (
                  <li key={i} className="truncate">• {r.title || r.id}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4">
          <div className="flex gap-2">
            {filters.map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  filter === status
                    ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                    : 'bg-white/5 text-neutral-400 border border-white/10 hover:bg-white/10 hover:text-white'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
          <AdvancedLeadFilters
            onApply={(filters) => {
              setAdvancedFilters(filters);
            }}
            onReset={() => {
              setAdvancedFilters({});
            }}
          />
        </div>

        {/* Prospects Grid */}
        {loading ? (
          <div className="p-12 rounded-2xl bg-neutral-900/50 border border-white/10 text-center">
            <Loader2 className="w-8 h-8 text-indigo-400 animate-spin mx-auto mb-3" />
            <p className="text-neutral-500 text-sm">Loading prospects...</p>
          </div>
        ) : prospects.length === 0 ? (
          <div className="p-12 rounded-2xl bg-neutral-900/50 border border-white/10 text-center">
            <Target className="w-12 h-12 text-neutral-700 mx-auto mb-4" />
            <p className="text-neutral-400 mb-2">No prospects found</p>
            <p className="text-neutral-600 text-sm">Use Lead Hunter to discover new leads</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {prospects.map((prospect) => {
              const color = getInitialColor(prospect.name)
              return (
                <div
                  key={prospect.id}
                  className="group p-6 rounded-2xl bg-neutral-900/50 border border-white/10 hover:border-indigo-500/30 transition-all duration-300"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex gap-4">
                      <div className={`w-12 h-12 rounded-xl bg-${color}-500/20 border border-${color}-500/30 flex items-center justify-center text-lg font-medium text-${color}-400`}>
                        {prospect.name?.charAt(0) || '?'}
                      </div>
                      <div>
                        <h3 className="font-medium text-white">{prospect.name || 'Unknown'}</h3>
                        <p className="text-sm text-neutral-400">{prospect.email}</p>
                        {prospect.company && (
                          <p className="text-sm text-neutral-500 flex items-center gap-1 mt-1">
                            <Building2 className="w-3 h-3" />
                            {prospect.title} at {prospect.company}
                          </p>
                        )}
                      </div>
                    </div>
                    <span className={`text-xs px-3 py-1 rounded-full border ${getStatusStyle(prospect.status)}`}>
                      {prospect.status || 'new'}
                    </span>
                  </div>
                  {aiHookForCards && (
                    <div className="mt-3 p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
                      <p className="text-xs text-purple-400 font-medium mb-1">AI-suggested personalization</p>
                      <p className="text-sm text-neutral-300 line-clamp-2">{aiHookForCards}</p>
                    </div>
                  )}
                  <div className="flex gap-6 mt-4 pt-4 border-t border-white/5">
                    <span className="text-sm text-neutral-500 flex items-center gap-2">
                      <Mail className="w-4 h-4 text-cyan-400" />
                      {prospect.emails_sent || 0} emails
                    </span>
                    <span className="text-sm text-neutral-500 flex items-center gap-2">
                      <Eye className="w-4 h-4 text-indigo-400" />
                      {prospect.opens || 0} opens
                    </span>
                    <span className="text-sm text-neutral-500 flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-emerald-400" />
                      {prospect.replies || 0} replies
                    </span>
                  </div>
                  
                  <div className="flex gap-3 mt-4">
                    <button 
                      onClick={() => toast.success('Opening email composer...')}
                      className="px-4 py-2 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-sm rounded-xl transition-all flex items-center gap-2"
                    >
                      <Send className="w-4 h-4" />
                      Send Email
                    </button>
                    <button 
                      onClick={() => toast.success('Opening profile...')}
                      className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-300 text-sm rounded-xl transition-all flex items-center gap-2"
                    >
                      <User className="w-4 h-4" />
                      View Profile
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
