'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import api from '@/lib/api'
import AgentService from '@/lib/agents'
import { 
  Briefcase, 
  DollarSign, 
  Calendar, 
  TrendingUp, 
  Plus, 
  GripVertical, 
  MoreVertical, 
  User,
  Sparkles,
  AlertCircle,
  Lightbulb,
  Target,
  PenLine,
  Shield,
  Flame,
  BarChart3,
  Brain,
  Wrench
} from 'lucide-react'

const SEVEN_AGENTS = [
  { id: 'lead-hunter', name: 'Lead Hunter', icon: Target, stat: 'Leads', iconBg: 'bg-indigo-500/10', iconBorder: 'border-indigo-500/20', iconColor: 'text-indigo-400' },
  { id: 'copy-writer', name: 'Copy Writer', icon: PenLine, stat: 'Emails', iconBg: 'bg-purple-500/10', iconBorder: 'border-purple-500/20', iconColor: 'text-purple-400' },
  { id: 'compliance-guardian', name: 'Compliance Guardian', icon: Shield, stat: 'Checks', iconBg: 'bg-emerald-500/10', iconBorder: 'border-emerald-500/20', iconColor: 'text-emerald-400' },
  { id: 'warmup-conductor', name: 'Warmup Conductor', icon: Flame, stat: 'Accounts', iconBg: 'bg-orange-500/10', iconBorder: 'border-orange-500/20', iconColor: 'text-orange-400' },
  { id: 'engagement-analyzer', name: 'Engagement Analyzer', icon: BarChart3, stat: 'Analyzed', iconBg: 'bg-cyan-500/10', iconBorder: 'border-cyan-500/20', iconColor: 'text-cyan-400' },
  { id: 'analytics-brain', name: 'Analytics Brain', icon: Brain, stat: 'Predictions', iconBg: 'bg-violet-500/10', iconBorder: 'border-violet-500/20', iconColor: 'text-violet-400' },
  { id: 'healing-sentinel', name: 'Healing Sentinel', icon: Wrench, stat: 'Health', iconBg: 'bg-rose-500/10', iconBorder: 'border-rose-500/20', iconColor: 'text-rose-400' },
]

export default function CRMPage() {
  const [dashboard, setDashboard] = useState(null)
  const [forecast, setForecast] = useState(null)
  const [pipeline, setPipeline] = useState(null)
  const [deals, setDeals] = useState([])
  const [loading, setLoading] = useState(true)
  const [agentsStatus, setAgentsStatus] = useState(null)

  useEffect(() => {
    loadCRMData()
  }, [])

  useEffect(() => {
    AgentService.checkKnowledgeHealth()
      .then((data) => setAgentsStatus(data?.status === 'healthy' ? 'active' : 'degraded'))
      .catch(() => setAgentsStatus('unavailable'))
  }, [])

  async function loadCRMData() {
    try {
      const [dashboardRes, forecastRes, pipelineRes] = await Promise.all([
        api.get('/api/v1/clientcontact/dashboard').catch(() => ({ data: { data: {} } })),
        api.get('/api/v1/clientcontact/ai/pipeline/forecast').catch(() => ({ data: { data: {} } })),
        api.get('/api/v1/clientcontact/deals/pipeline').catch(() => ({ data: { data: {} } }))
      ])

      setDashboard(dashboardRes.data?.data || dashboardRes.data || {})
      setForecast(forecastRes.data?.data || forecastRes.data || {})
      
      const pipelineData = pipelineRes.data?.data || pipelineRes.data || {}
      
      // Transform pipeline data for display
      const stages = ['lead', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost']
      const pipelineStages = stages.map(stage => ({
        id: stage,
        label: stage.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
        deals: pipelineData[stage]?.deals || [],
        count: pipelineData[stage]?.count || 0,
        totalValue: parseFloat(pipelineData[stage]?.totalValue || 0)
      }))

      setPipeline(pipelineStages)
      
      // Flatten all deals for display
      const allDeals = stages.reduce((acc, stage) => {
        const stageDeals = pipelineData[stage]?.deals || []
        return [...acc, ...stageDeals]
      }, [])
      setDeals(allDeals)

    } catch (error) {
      console.error('CRM load error:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value || 0)
  }

  const stageColors = {
    lead: 'blue',
    qualified: 'indigo',
    proposal: 'purple',
    negotiation: 'orange',
    closed_won: 'emerald',
    closed_lost: 'red'
  }

  const stats = [
    { 
      label: 'Total Pipeline', 
      value: formatCurrency(forecast?.totalPipeline || dashboard?.overview?.deals?.pipelineValue || 0), 
      icon: DollarSign, 
      color: 'indigo' 
    },
    { 
      label: 'Active Deals', 
      value: dashboard?.overview?.deals?.open || 0, 
      icon: Briefcase, 
      color: 'purple' 
    },
    { 
      label: 'Weighted Pipeline', 
      value: formatCurrency(forecast?.weightedPipeline || 0), 
      icon: TrendingUp, 
      color: 'cyan' 
    },
    { 
      label: 'This Month', 
      value: formatCurrency(forecast?.expectedRevenue?.thisMonth || 0), 
      icon: Calendar, 
      color: 'emerald' 
    },
  ]

  if (loading) {
    return (
      <div className="relative min-h-screen bg-black p-6 flex items-center justify-center">
        <div className="text-neutral-500">Loading CRM...</div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen p-6">
      <div className="relative z-10 max-w-full mx-auto space-y-8 font-sans">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-medium tracking-tight text-white">CRM Pipeline</h1>
            <p className="text-neutral-400 mt-1 text-sm font-light">Track deals through your sales pipeline</p>
          </div>
          <button className="px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white rounded-xl text-sm font-medium transition-all flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Deal
          </button>
        </div>

        {/* 7 AI Agents Status */}
        <div className="rounded-2xl bg-neutral-900/50 border border-white/10 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-purple-400" />
            <h2 className="text-lg font-semibold text-white">7 AI Agents</h2>
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              agentsStatus === 'active' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
              agentsStatus === 'unavailable' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
              'bg-neutral-500/20 text-neutral-400 border border-neutral-500/30'
            }`}>
              {agentsStatus === 'active' ? 'Active' : agentsStatus === 'unavailable' ? 'Unavailable' : 'Checking...'}
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
            {SEVEN_AGENTS.map((agent) => {
              const Icon = agent.icon
              return (
                <div
                  key={agent.id}
                  className="group relative p-4 rounded-xl bg-neutral-900/30 border border-white/10 hover:border-indigo-500/50 transition-all duration-500 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" aria-hidden="true" />
                  <div className="relative z-10">
                    <div className={`w-9 h-9 rounded-lg ${agent.iconBg} border ${agent.iconBorder} flex items-center justify-center mb-3`}>
                      <Icon className={`w-4 h-4 ${agent.iconColor}`} />
                    </div>
                    <p className="text-sm font-medium text-white truncate">{agent.name}</p>
                    <p className="text-xs text-neutral-500 mt-0.5 font-light">
                      {agentsStatus === 'active' ? 'Active' : agentsStatus === 'unavailable' ? '—' : '…'}
                    </p>
                    <p className="text-xs text-neutral-400 mt-1 font-light">{agent.stat}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <div key={stat.label} className="group relative p-5 rounded-2xl bg-neutral-900/30 border border-white/10 hover:border-indigo-500/50 transition-all duration-500 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" aria-hidden="true" />
                <div className="relative z-10 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-neutral-400">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-medium text-white">{stat.value}</p>
                    <p className="text-xs text-neutral-500 font-light">{stat.label}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* AI Insights */}
        {forecast?.insights && forecast.insights.length > 0 && (
          <div className="rounded-2xl bg-purple-900/20 border border-purple-500/30 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-purple-400" />
              <h2 className="text-lg font-medium text-purple-300">AI Insights</h2>
            </div>
            <ul className="space-y-2">
              {forecast.insights.map((insight, i) => (
                <li key={i} className="text-purple-200 text-sm flex items-start gap-2">
                  <span className="text-purple-400 mt-1">•</span>
                  <span>{insight}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* AI Recommendations */}
        {forecast?.recommendations && forecast.recommendations.length > 0 && (
          <div className="rounded-2xl bg-blue-900/20 border border-blue-500/30 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb className="w-5 h-5 text-blue-400" />
              <h2 className="text-lg font-semibold text-blue-300">AI Recommendations</h2>
            </div>
            <div className="space-y-3">
              {forecast.recommendations.map((rec, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-black/30 rounded-lg">
                  <span className="text-blue-400 mt-0.5">→</span>
                  <span className="text-blue-200 text-sm">{rec}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* At Risk Deals */}
        {forecast?.atRiskDeals && forecast.atRiskDeals.length > 0 && (
          <div className="rounded-2xl bg-red-900/20 border border-red-500/30 p-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <h2 className="text-lg font-medium text-red-300">Deals at Risk</h2>
            </div>
            <ul className="space-y-2">
              {forecast.atRiskDeals.map((dealTitle, i) => (
                <li key={i} className="text-red-200 text-sm">• {dealTitle}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Pipeline Board */}
        {pipeline && pipeline.length > 0 && (
          <div className="flex gap-4 overflow-x-auto pb-4">
            {pipeline.filter(stage => stage.id !== 'closed_lost').map((stage) => (
              <div key={stage.id} className="flex-shrink-0 w-72">
                <div className="rounded-2xl bg-neutral-900/50 border border-white/10">
                  {/* Stage Header */}
                  <div className="p-4 border-b border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full bg-${stageColors[stage.id] || 'blue'}-500`}></div>
                      <span className="font-medium text-white">{stage.label}</span>
                      <span className="text-xs text-neutral-500 bg-white/5 px-2 py-0.5 rounded-full">
                        {stage.count}
                      </span>
                    </div>
                    <button className="p-1 rounded-lg hover:bg-white/10 text-neutral-500">
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Stage Value */}
                  <div className="px-4 py-2 border-b border-white/5">
                    <p className="text-xs text-neutral-500">Total Value</p>
                    <p className="text-sm font-medium text-emerald-400">{formatCurrency(stage.totalValue)}</p>
                  </div>

                  {/* Deals */}
                  <div className="p-3 space-y-3 min-h-[200px]">
                    {stage.deals.map((deal) => (
                      <Link
                        key={deal.id}
                        href={`/dashboard/crm/deals/${deal.id}`}
                        className="group block p-4 rounded-xl bg-black/50 border border-white/10 hover:border-indigo-500/30 cursor-pointer transition-all"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <GripVertical className="w-4 h-4 text-neutral-600 cursor-grab" />
                          </div>
                          <button 
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                            }}
                            className="p-1 rounded-lg hover:bg-white/10 text-neutral-500 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </div>
                        <h4 className="font-medium text-white text-sm">{deal.name}</h4>
                        <p className="text-xs text-neutral-500 mt-1">{deal.company?.name || 'No company'}</p>
                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
                          <span className="text-sm font-medium text-emerald-400">
                            {formatCurrency(parseFloat(deal.value || 0))}
                          </span>
                          <div className="flex items-center gap-1 text-xs text-neutral-500">
                            <User className="w-3 h-3" />
                            {deal.contacts?.[0]?.firstName || ''} {deal.contacts?.[0]?.lastName || ''}
                          </div>
                        </div>
                        {deal.probability !== undefined && (
                          <div className="mt-2">
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span className="text-neutral-500">Probability</span>
                              <span className="text-neutral-400">{deal.probability}%</span>
                            </div>
                            <div className="w-full bg-neutral-800 rounded-full h-1.5">
                              <div 
                                className={`h-1.5 rounded-full ${
                                  deal.probability >= 70 ? 'bg-emerald-500' :
                                  deal.probability >= 40 ? 'bg-yellow-500' :
                                  'bg-red-500'
                                }`}
                                style={{ width: `${deal.probability}%` }}
                              ></div>
                            </div>
                          </div>
                        )}
                      </Link>
                    ))}
                    {stage.deals.length === 0 && (
                      <div className="text-center py-8 text-neutral-500 text-sm">
                        No deals in this stage
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Quick Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link 
            href="/dashboard/crm/deals" 
            className="p-5 rounded-2xl bg-neutral-900/50 border border-white/10 hover:border-indigo-500/30 transition"
          >
            <h3 className="font-semibold text-white mb-1">Deals</h3>
            <p className="text-sm text-neutral-500">{dashboard?.overview?.dealCount || 0} total</p>
          </Link>
          <Link 
            href="/dashboard/crm/contacts" 
            className="p-5 rounded-2xl bg-neutral-900/50 border border-white/10 hover:border-indigo-500/30 transition"
          >
            <h3 className="font-semibold text-white mb-1">Contacts</h3>
            <p className="text-sm text-neutral-500">{dashboard?.overview?.contactCount || 0} total</p>
          </Link>
          <Link 
            href="/dashboard/crm/companies" 
            className="p-5 rounded-2xl bg-neutral-900/50 border border-white/10 hover:border-indigo-500/30 transition"
          >
            <h3 className="font-semibold text-white mb-1">Companies</h3>
            <p className="text-sm text-neutral-500">{dashboard?.overview?.companyCount || 0} total</p>
          </Link>
          <Link 
            href="/dashboard/crm/activities" 
            className="p-5 rounded-2xl bg-neutral-900/50 border border-white/10 hover:border-indigo-500/30 transition"
          >
            <h3 className="font-semibold text-white mb-1">Activities</h3>
            <p className="text-sm text-neutral-500">{dashboard?.overview?.activities?.activityCount || 0} total</p>
          </Link>
        </div>
      </div>
    </div>
  )
}
