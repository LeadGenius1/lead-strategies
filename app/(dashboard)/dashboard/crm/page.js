'use client'

import { useState } from 'react'
import { Briefcase, DollarSign, Calendar, TrendingUp, Plus, GripVertical, MoreVertical, User } from 'lucide-react'

export default function CRMPage() {
  const [deals, setDeals] = useState({
    lead: [
      { id: 1, name: 'CloudScale Enterprise', company: 'CloudScale Inc', value: 45000, contact: 'Sarah Chen' },
      { id: 2, name: 'DataFlow Integration', company: 'DataFlow AI', value: 28000, contact: 'Michael Torres' },
    ],
    qualified: [
      { id: 3, name: 'TechStartup Expansion', company: 'TechStartup Co', value: 65000, contact: 'Jennifer Park' },
    ],
    proposal: [
      { id: 4, name: 'Enterprise Package', company: 'MegaCorp', value: 120000, contact: 'David Kim' },
    ],
    negotiation: [
      { id: 5, name: 'Annual Contract', company: 'GlobalTech', value: 85000, contact: 'Emily Zhang' },
    ],
    closed: [
      { id: 6, name: 'Q4 Deal', company: 'FastGrowth Inc', value: 52000, contact: 'James Wilson' },
    ],
  })

  const stages = [
    { id: 'lead', label: 'Lead', color: 'blue' },
    { id: 'qualified', label: 'Qualified', color: 'indigo' },
    { id: 'proposal', label: 'Proposal', color: 'purple' },
    { id: 'negotiation', label: 'Negotiation', color: 'orange' },
    { id: 'closed', label: 'Closed Won', color: 'emerald' },
  ]

  const stats = [
    { label: 'Total Pipeline', value: '$395K', icon: DollarSign, color: 'indigo' },
    { label: 'Active Deals', value: '12', icon: Briefcase, color: 'purple' },
    { label: 'Avg Deal Size', value: '$33K', icon: TrendingUp, color: 'cyan' },
    { label: 'Expected Close', value: '8', icon: Calendar, color: 'emerald' },
  ]

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  return (
    <div className="relative min-h-screen bg-black p-6">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[400px] h-[400px] bg-purple-900/10 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-emerald-900/10 rounded-full blur-[100px]"></div>
      </div>

      <div className="relative z-10 max-w-full mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-medium tracking-tight text-white">CRM Pipeline</h1>
            <p className="text-neutral-500 mt-1 text-sm">Track deals through your sales pipeline</p>
          </div>
          <button className="px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white rounded-xl text-sm font-medium transition-all flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Deal
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <div key={stat.label} className="p-5 rounded-2xl bg-neutral-900/50 border border-white/10">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl bg-${stat.color}-500/10 border border-${stat.color}-500/20 flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 text-${stat.color}-400`} />
                  </div>
                  <div>
                    <p className="text-2xl font-medium text-white">{stat.value}</p>
                    <p className="text-xs text-neutral-500">{stat.label}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Pipeline Board */}
        <div className="flex gap-4 overflow-x-auto pb-4">
          {stages.map((stage) => (
            <div key={stage.id} className="flex-shrink-0 w-72">
              <div className={`rounded-2xl bg-neutral-900/50 border border-white/10`}>
                {/* Stage Header */}
                <div className={`p-4 border-b border-white/10 flex items-center justify-between`}>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full bg-${stage.color}-500`}></div>
                    <span className="font-medium text-white">{stage.label}</span>
                    <span className="text-xs text-neutral-500 bg-white/5 px-2 py-0.5 rounded-full">
                      {deals[stage.id]?.length || 0}
                    </span>
                  </div>
                  <button className="p-1 rounded-lg hover:bg-white/10 text-neutral-500">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Deals */}
                <div className="p-3 space-y-3 min-h-[200px]">
                  {deals[stage.id]?.map((deal) => (
                    <div
                      key={deal.id}
                      className="group p-4 rounded-xl bg-black/50 border border-white/10 hover:border-indigo-500/30 cursor-pointer transition-all"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <GripVertical className="w-4 h-4 text-neutral-600 cursor-grab" />
                        </div>
                        <button className="p-1 rounded-lg hover:bg-white/10 text-neutral-500 opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                      <h4 className="font-medium text-white text-sm">{deal.name}</h4>
                      <p className="text-xs text-neutral-500 mt-1">{deal.company}</p>
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
                        <span className="text-sm font-medium text-emerald-400">{formatCurrency(deal.value)}</span>
                        <div className="flex items-center gap-1 text-xs text-neutral-500">
                          <User className="w-3 h-3" />
                          {deal.contact}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
