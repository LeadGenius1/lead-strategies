'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Script from 'next/script'
import { isAuthenticated, getCurrentUser } from '../../../lib/auth'
import { dealsAPI, pipelinesAPI } from '../../../lib/api'

export default function DealsPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [deals, setDeals] = useState([])
  const [pipelines, setPipelines] = useState([])
  const [selectedPipeline, setSelectedPipeline] = useState(null)
  const [pipelineView, setPipelineView] = useState({})
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState('pipeline') // 'pipeline' or 'list'

  useEffect(() => {
    if (typeof window !== 'undefined' && window.lucide) {
      window.lucide.createIcons()
    }

    if (!isAuthenticated()) {
      router.push('/login')
      return
    }

    setUser(getCurrentUser())
    fetchData()
  }, [router])

  const fetchData = async () => {
    try {
      const [pipelinesData, dealsData] = await Promise.all([
        pipelinesAPI.getAll().catch(() => ({ pipelines: [] })),
        dealsAPI.getAll().catch(() => ({ deals: [] }))
      ])

      setPipelines(pipelinesData.pipelines || [])
      setDeals(dealsData.deals || [])

      // Get pipeline view for first pipeline
      if (pipelinesData.pipelines?.length > 0) {
        setSelectedPipeline(pipelinesData.pipelines[0])
        const pipelineDeals = await dealsAPI.getPipeline(pipelinesData.pipelines[0].id).catch(() => ({}))
        setPipelineView(pipelineDeals)
      }
    } catch (err) {
      console.error('Failed to fetch deals:', err)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(value || 0)
  }

  const handleDragStart = (e, dealId) => {
    e.dataTransfer.setData('dealId', dealId)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
  }

  const handleDrop = async (e, stageId) => {
    e.preventDefault()
    const dealId = e.dataTransfer.getData('dealId')

    try {
      await dealsAPI.updateStage(dealId, stageId)
      // Refresh pipeline view
      if (selectedPipeline) {
        const pipelineDeals = await dealsAPI.getPipeline(selectedPipeline.id)
        setPipelineView(pipelineDeals)
      }
    } catch (err) {
      console.error('Failed to update deal stage:', err)
    }
  }

  if (loading) {
    return (
      <div className="bg-[#050505] text-white antialiased min-h-screen flex items-center justify-center">
        <div className="text-zinc-400">Loading...</div>
      </div>
    )
  }

  return (
    <>
      <Script
        src="https://unpkg.com/lucide@latest"
        strategy="afterInteractive"
        onLoad={() => {
          if (typeof window !== 'undefined' && window.lucide) {
            window.lucide.createIcons()
          }
        }}
      />

      <div className="bg-[#050505] text-white antialiased min-h-screen">
        {/* Navigation */}
        <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-black/80 backdrop-blur-xl">
          <div className="max-w-[1800px] mx-auto px-6 h-16 flex items-center justify-between">
            <Link href="/dashboard" className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-tr from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                <i data-lucide="target" className="w-4 h-4 text-white"></i>
              </div>
              <span className="text-sm font-bold tracking-widest uppercase text-white">Tackle.IO</span>
            </Link>

            <div className="hidden md:flex items-center gap-8 text-xs font-medium text-zinc-400">
              <Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
              <Link href="/dashboard/deals" className="text-white">Deals</Link>
              <Link href="/dashboard/contacts" className="hover:text-white transition-colors">Contacts</Link>
              <Link href="/dashboard/companies" className="hover:text-white transition-colors">Companies</Link>
              <Link href="/dashboard/activities" className="hover:text-white transition-colors">Activities</Link>
              <Link href="/dashboard/analytics" className="hover:text-white transition-colors">Analytics</Link>
            </div>

            <div className="flex items-center gap-4">
              <Link
                href="/dashboard/deals/new"
                className="text-xs font-medium bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded-lg transition-all text-white flex items-center gap-2"
              >
                <i data-lucide="plus" className="w-4 h-4"></i>
                New Deal
              </Link>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="pt-24 pb-20 px-6 max-w-[1800px] mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight mb-2">Deals Pipeline</h1>
              <p className="text-zinc-400 text-sm">Drag and drop deals between stages to update their status.</p>
            </div>

            <div className="flex items-center gap-4">
              {/* View Toggle */}
              <div className="flex items-center bg-zinc-900/50 border border-white/5 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('pipeline')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                    viewMode === 'pipeline' ? 'bg-white/10 text-white' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <i data-lucide="columns" className="w-4 h-4"></i>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                    viewMode === 'list' ? 'bg-white/10 text-white' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <i data-lucide="list" className="w-4 h-4"></i>
                </button>
              </div>

              {/* Pipeline Selector */}
              {pipelines.length > 0 && (
                <select
                  value={selectedPipeline?.id || ''}
                  onChange={async (e) => {
                    const pipeline = pipelines.find(p => p.id === e.target.value)
                    setSelectedPipeline(pipeline)
                    if (pipeline) {
                      const pipelineDeals = await dealsAPI.getPipeline(pipeline.id)
                      setPipelineView(pipelineDeals)
                    }
                  }}
                  className="bg-zinc-900/50 border border-white/5 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-orange-500/50"
                >
                  {pipelines.map((pipeline) => (
                    <option key={pipeline.id} value={pipeline.id}>
                      {pipeline.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {viewMode === 'pipeline' ? (
            /* Pipeline View (Kanban) */
            <div className="flex gap-4 overflow-x-auto pb-4">
              {selectedPipeline?.stages?.map((stage) => (
                <div
                  key={stage.id}
                  className="flex-shrink-0 w-80"
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, stage.id)}
                >
                  <div className="bg-zinc-900/30 rounded-2xl border border-white/5 p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: stage.color || '#6366f1' }}
                        ></div>
                        <h3 className="text-sm font-medium text-white">{stage.name}</h3>
                      </div>
                      <span className="text-xs text-zinc-400 bg-zinc-800 px-2 py-1 rounded-full">
                        {pipelineView.stages?.[stage.id]?.length || 0}
                      </span>
                    </div>

                    <div className="space-y-3 min-h-[200px]">
                      {(pipelineView.stages?.[stage.id] || []).map((deal) => (
                        <div
                          key={deal.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, deal.id)}
                          className="bg-black/50 border border-white/5 rounded-xl p-4 cursor-grab active:cursor-grabbing hover:border-orange-500/30 transition-all"
                        >
                          <Link href={`/dashboard/deals/${deal.id}`}>
                            <h4 className="text-sm font-medium text-white mb-2">{deal.title}</h4>
                            <div className="flex items-center justify-between text-xs text-zinc-400">
                              <span>{deal.company?.name || 'No company'}</span>
                              <span className="text-orange-400 font-medium">{formatCurrency(deal.value)}</span>
                            </div>
                            {deal.contact && (
                              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/5">
                                <div className="w-6 h-6 rounded-full bg-zinc-700 flex items-center justify-center text-xs text-white">
                                  {deal.contact.name?.charAt(0) || '?'}
                                </div>
                                <span className="text-xs text-zinc-400">{deal.contact.name}</span>
                              </div>
                            )}
                          </Link>
                        </div>
                      ))}
                    </div>

                    <button className="w-full mt-4 py-2 text-xs text-zinc-400 hover:text-white border border-dashed border-white/10 rounded-lg hover:border-white/30 transition-all">
                      + Add Deal
                    </button>
                  </div>
                </div>
              )) || (
                <div className="flex-1 text-center py-20 text-zinc-400">
                  No pipeline configured. Create a pipeline to start managing deals.
                </div>
              )}
            </div>
          ) : (
            /* List View */
            <div className="rounded-2xl bg-zinc-900/30 border border-white/5 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="text-left text-xs font-medium text-zinc-400 px-6 py-4">Deal</th>
                    <th className="text-left text-xs font-medium text-zinc-400 px-6 py-4">Company</th>
                    <th className="text-left text-xs font-medium text-zinc-400 px-6 py-4">Contact</th>
                    <th className="text-left text-xs font-medium text-zinc-400 px-6 py-4">Stage</th>
                    <th className="text-right text-xs font-medium text-zinc-400 px-6 py-4">Value</th>
                    <th className="text-right text-xs font-medium text-zinc-400 px-6 py-4">Expected Close</th>
                  </tr>
                </thead>
                <tbody>
                  {deals.length > 0 ? (
                    deals.map((deal) => (
                      <tr key={deal.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4">
                          <Link href={`/dashboard/deals/${deal.id}`} className="text-sm font-medium text-white hover:text-orange-400 transition-colors">
                            {deal.title}
                          </Link>
                        </td>
                        <td className="px-6 py-4 text-sm text-zinc-400">{deal.company?.name || '-'}</td>
                        <td className="px-6 py-4 text-sm text-zinc-400">{deal.contact?.name || '-'}</td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-2 text-xs text-zinc-400">
                            <span
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: deal.stage?.color || '#6366f1' }}
                            ></span>
                            {deal.stage?.name || 'Unknown'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-right font-medium text-orange-400">
                          {formatCurrency(deal.value)}
                        </td>
                        <td className="px-6 py-4 text-sm text-right text-zinc-400">
                          {deal.expectedCloseDate ? new Date(deal.expectedCloseDate).toLocaleDateString() : '-'}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-zinc-400">
                        No deals yet. Create your first deal to get started.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>
    </>
  )
}
