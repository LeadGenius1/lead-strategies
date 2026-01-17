'use client'

import { useState, useEffect } from 'react'
import api from '@/lib/api'
import toast from 'react-hot-toast'
import CreateDealModal from '@/components/CreateDealModal'
import EditDealModal from '@/components/EditDealModal'

const PIPELINE_STAGES = [
  { id: 'lead', name: 'Lead' },
  { id: 'qualified', name: 'Qualified' },
  { id: 'proposal', name: 'Proposal' },
  { id: 'negotiation', name: 'Negotiation' },
  { id: 'closed_won', name: 'Closed Won' },
]

export default function CRMPage() {
  const [view, setView] = useState('pipeline')
  const [deals, setDeals] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({})
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedDealId, setSelectedDealId] = useState(null)
  const [selectedStage, setSelectedStage] = useState(null)

  useEffect(() => {
    loadDeals()
  }, [view])

  async function loadDeals() {
    try {
      // Backend uses /api/tackle/deals with pipeline endpoint
      const endpoint = view === 'pipeline' ? '/api/tackle/deals/pipeline' : '/api/tackle/deals'
      const response = await api.get(endpoint)
      const data = response.data
      
      if (view === 'pipeline') {
        // Pipeline view returns stages object
        const pipeline = data.pipeline || data
        const allDeals = Object.values(pipeline).flatMap(stage => stage.deals || [])
        setDeals(allDeals)
        // Calculate stats from pipeline
        const stats = {
          totalValue: Object.values(pipeline).reduce((sum, stage) => sum + (stage.totalValue || 0), 0),
          totalDeals: Object.values(pipeline).reduce((sum, stage) => sum + (stage.count || 0), 0)
        }
        setStats(stats)
      } else {
        // List view returns deals array
        setDeals(data.deals || [])
        setStats(data.stats || {})
      }
    } catch (error) {
      console.error('Error loading deals:', error)
      setDeals([])
    } finally {
      setLoading(false)
    }
  }

  function handleDealCreated() {
    loadDeals()
  }

  function handleDealUpdated() {
    loadDeals()
  }

  function handleEditDeal(dealId) {
    setSelectedDealId(dealId)
    setShowEditModal(true)
  }

  function handleCreateDealInStage(stageId) {
    setSelectedStage(stageId)
    setShowCreateModal(true)
  }

  async function handleDeleteDeal(dealId) {
    if (!confirm('Are you sure you want to delete this deal?')) {
      return
    }

    try {
      await api.delete(`/api/tackle/deals/${dealId}`)
      toast.success('Deal deleted successfully')
      loadDeals()
    } catch (error) {
      toast.error('Failed to delete deal')
    }
  }

  function getDealsByStage(stageId) {
    return deals.filter(deal => deal.stage === stageId)
  }

  const totalValue = deals.reduce((sum, deal) => sum + (parseFloat(deal.value) || 0), 0)
  const openDeals = deals.filter(d => !d.stage.includes('closed')).length

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
          <button 
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-dark-primary hover:bg-dark-primaryHover text-white rounded-lg transition"
          >
            + New Deal
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Pipeline Value', value: `$${(totalValue / 1000).toFixed(0)}k`, icon: '💰' },
          { label: 'Open Deals', value: openDeals, icon: '📊' },
          { label: 'Won This Month', value: `$${deals.filter(d => d.stage === 'closed_won').reduce((sum, d) => sum + (parseFloat(d.value) || 0), 0).toLocaleString()}`, icon: '🎉' },
          { label: 'Avg Deal Size', value: deals.length > 0 ? `$${Math.round(totalValue / deals.length).toLocaleString()}` : '$0', icon: '📈' },
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
          {loading ? (
            <div className="w-full text-center py-8 text-dark-textMuted">Loading deals...</div>
          ) : (
            PIPELINE_STAGES.map((stage) => {
              const stageDeals = getDealsByStage(stage.id)
              const stageValue = stageDeals.reduce((sum, d) => sum + (parseFloat(d.value) || 0), 0)
              return (
                <div key={stage.id} className="flex-shrink-0 w-72">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-dark-text">{stage.name}</h3>
                    <span className="text-sm text-dark-textMuted">
                      ${stageValue.toLocaleString()}
                    </span>
                  </div>
                  <div className="space-y-3">
                    {stageDeals.map((deal) => (
                      <div
                        key={deal.id}
                        onClick={() => handleEditDeal(deal.id)}
                        className="bg-dark-surface border border-dark-border rounded-lg p-4 hover:border-dark-primary transition cursor-pointer"
                      >
                        <h4 className="font-medium text-dark-text">{deal.name || deal.company?.name || deal.company || 'Unnamed Deal'}</h4>
                        <p className="text-sm text-dark-textMuted mt-1">
                          {deal.contacts?.[0] ? `${deal.contacts[0].firstName} ${deal.contacts[0].lastName}` : deal.contact || 'No contact'}
                        </p>
                        <p className="text-dark-primary font-semibold mt-2">
                          ${parseFloat(deal.value || 0).toLocaleString()}
                        </p>
                      </div>
                    ))}
                    <button
                      onClick={() => handleCreateDealInStage(stage.id)}
                      className="w-full py-3 border border-dashed border-dark-border rounded-lg text-dark-textMuted hover:border-dark-primary hover:text-dark-text transition"
                    >
                      + Add Deal
                    </button>
                  </div>
                </div>
              )
            })
          )}
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

      <CreateDealModal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false)
          setSelectedStage(null)
        }}
        onSuccess={handleDealCreated}
        initialStage={selectedStage}
      />

      <EditDealModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false)
          setSelectedDealId(null)
        }}
        onSuccess={handleDealUpdated}
        dealId={selectedDealId}
      />
    </div>
  )
}
