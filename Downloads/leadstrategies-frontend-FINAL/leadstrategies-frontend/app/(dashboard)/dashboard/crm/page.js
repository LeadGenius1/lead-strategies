'use client'

import { useState } from 'react'

const PIPELINE_STAGES = [
  { id: 'lead', name: 'Lead', deals: [
    { id: 1, company: 'TechCorp', value: 25000, contact: 'John Smith' },
    { id: 2, company: 'Startup.io', value: 15000, contact: 'Sarah Johnson' },
  ]},
  { id: 'qualified', name: 'Qualified', deals: [
    { id: 3, company: 'Enterprise Inc', value: 50000, contact: 'Mike Chen' },
  ]},
  { id: 'proposal', name: 'Proposal', deals: [
    { id: 4, company: 'Growth Co', value: 35000, contact: 'Lisa Wang' },
    { id: 5, company: 'Scale LLC', value: 28000, contact: 'David Park' },
  ]},
  { id: 'negotiation', name: 'Negotiation', deals: [
    { id: 6, company: 'Big Corp', value: 75000, contact: 'Alex Turner' },
  ]},
  { id: 'closed', name: 'Closed Won', deals: [
    { id: 7, company: 'Success Inc', value: 45000, contact: 'Emma Wilson' },
  ]},
]

export default function CRMPage() {
  const [view, setView] = useState('pipeline')

  const totalValue = PIPELINE_STAGES.reduce((sum, stage) => 
    sum + stage.deals.reduce((s, d) => s + d.value, 0), 0
  )

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-dark-text">CRM</h1>
          <p className="text-dark-textMuted mt-1">Manage your deals and pipeline</p>
        </div>
        <div className="flex gap-4">
          <div className="flex bg-dark-surface border border-dark-border rounded-lg p-1">
            <button
              onClick={() => setView('pipeline')}
              className={`px-4 py-2 rounded-md text-sm transition ${
                view === 'pipeline' ? 'bg-dark-primary text-white' : 'text-dark-textMuted'
              }`}
            >
              Pipeline
            </button>
            <button
              onClick={() => setView('list')}
              className={`px-4 py-2 rounded-md text-sm transition ${
                view === 'list' ? 'bg-dark-primary text-white' : 'text-dark-textMuted'
              }`}
            >
              List
            </button>
          </div>
          <button className="px-6 py-3 bg-dark-primary hover:bg-dark-primaryHover text-white rounded-lg transition">
            + New Deal
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Pipeline Value', value: `$${(totalValue / 1000).toFixed(0)}k`, icon: '💰' },
          { label: 'Open Deals', value: PIPELINE_STAGES.slice(0, 4).reduce((s, stage) => s + stage.deals.length, 0), icon: '📊' },
          { label: 'Won This Month', value: '$45,000', icon: '🎉' },
          { label: 'Avg Deal Size', value: '$32,500', icon: '📈' },
        ].map((stat) => (
          <div key={stat.label} className="bg-dark-surface border border-dark-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{stat.icon}</span>
              <div>
                <p className="text-2xl font-bold text-dark-text">{stat.value}</p>
                <p className="text-sm text-dark-textMuted">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pipeline View */}
      {view === 'pipeline' ? (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {PIPELINE_STAGES.map((stage) => (
            <div key={stage.id} className="flex-shrink-0 w-72">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-dark-text">{stage.name}</h3>
                <span className="text-sm text-dark-textMuted">
                  ${stage.deals.reduce((s, d) => s + d.value, 0).toLocaleString()}
                </span>
              </div>
              <div className="space-y-3">
                {stage.deals.map((deal) => (
                  <div
                    key={deal.id}
                    className="bg-dark-surface border border-dark-border rounded-lg p-4 hover:border-dark-primary transition cursor-pointer"
                  >
                    <h4 className="font-medium text-dark-text">{deal.company}</h4>
                    <p className="text-sm text-dark-textMuted mt-1">{deal.contact}</p>
                    <p className="text-dark-primary font-semibold mt-2">
                      ${deal.value.toLocaleString()}
                    </p>
                  </div>
                ))}
                <button className="w-full py-3 border border-dashed border-dark-border rounded-lg text-dark-textMuted hover:border-dark-primary hover:text-dark-text transition">
                  + Add Deal
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-dark-surface border border-dark-border rounded-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-dark-surfaceHover">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-medium text-dark-textMuted">Company</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-dark-textMuted">Contact</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-dark-textMuted">Stage</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-dark-textMuted">Value</th>
                <th className="text-right px-6 py-4 text-sm font-medium text-dark-textMuted">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-border">
              {PIPELINE_STAGES.flatMap((stage) =>
                stage.deals.map((deal) => (
                  <tr key={deal.id} className="hover:bg-dark-surfaceHover transition">
                    <td className="px-6 py-4 font-medium text-dark-text">{deal.company}</td>
                    <td className="px-6 py-4 text-dark-textMuted">{deal.contact}</td>
                    <td className="px-6 py-4">
                      <span className="text-xs px-2 py-1 rounded-full bg-dark-primary/20 text-dark-primary">
                        {stage.name}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-dark-text">${deal.value.toLocaleString()}</td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-dark-primary hover:text-dark-primaryHover text-sm">
                        Edit
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
