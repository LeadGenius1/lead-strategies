'use client'

import { useState, useEffect } from 'react'
import api from '@/lib/api'
import { 
  Plus, 
  GripVertical, 
  MoreVertical, 
  User,
  Building2,
  DollarSign,
  Calendar
} from 'lucide-react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

function SortableDeal({ deal }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: deal.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value || 0)
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group p-4 rounded-xl bg-black/50 border border-white/10 hover:border-indigo-500/30 cursor-pointer transition-all"
      {...attributes}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2 cursor-grab active:cursor-grabbing" {...listeners}>
          <GripVertical className="w-4 h-4 text-neutral-600" />
        </div>
        <button className="p-1 rounded-lg hover:bg-white/10 text-neutral-500 opacity-0 group-hover:opacity-100 transition-opacity">
          <MoreVertical className="w-4 h-4" />
        </button>
      </div>
      
      <h4 className="font-medium text-white text-sm mb-1">{deal.name}</h4>
      
      {deal.company && (
        <div className="flex items-center gap-1 text-xs text-neutral-500 mb-2">
          <Building2 className="w-3 h-3" />
          <span>{deal.company.name}</span>
        </div>
      )}

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
        <span className="text-sm font-medium text-emerald-400">
          {formatCurrency(parseFloat(deal.value || 0))}
        </span>
        {deal.contacts && deal.contacts.length > 0 && (
          <div className="flex items-center gap-1 text-xs text-neutral-500">
            <User className="w-3 h-3" />
            <span>{deal.contacts[0].firstName} {deal.contacts[0].lastName}</span>
          </div>
        )}
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

      {deal.expectedClose && (
        <div className="flex items-center gap-1 text-xs text-neutral-500 mt-2">
          <Calendar className="w-3 h-3" />
          <span>{new Date(deal.expectedClose).toLocaleDateString()}</span>
        </div>
      )}
    </div>
  )
}

function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value || 0)
}

export default function DealsPage() {
  const [pipeline, setPipeline] = useState(null)
  const [deals, setDeals] = useState({})
  const [loading, setLoading] = useState(true)
  const [activeId, setActiveId] = useState(null)
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  useEffect(() => {
    loadPipeline()
  }, [])

  async function loadPipeline() {
    try {
      const [pipelineRes, dealsRes] = await Promise.all([
        api.get('/api/v1/clientcontact/pipelines').catch(() => ({ data: { data: [] } })),
        api.get('/api/v1/tackle/deals/pipeline').catch(() => ({ data: { data: {} } }))
      ])

      const pipelines = pipelineRes.data?.data || pipelineRes.data || []
      const defaultPipeline = pipelines.find(p => p.isDefault) || pipelines[0] || null
      
      setPipeline(defaultPipeline)

      const pipelineData = dealsRes.data?.data || dealsRes.data || {}
      
      // Organize deals by stage
      const dealsByStage = {}
      if (defaultPipeline && defaultPipeline.stages) {
        defaultPipeline.stages.forEach(stage => {
          dealsByStage[stage.id] = []
        })
      }

      // Map deals to stages
      Object.keys(pipelineData).forEach(stageKey => {
        if (pipelineData[stageKey]?.deals) {
          dealsByStage[stageKey] = pipelineData[stageKey].deals
        }
      })

      setDeals(dealsByStage)

    } catch (error) {
      console.error('Pipeline load error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDragStart = (event) => {
    setActiveId(event.active.id)
  }

  const handleDragEnd = async (event) => {
    const { active, over } = event
    setActiveId(null)

    if (!over) return

    const dealId = active.id
    const sourceStageId = Object.keys(deals).find(stageId => 
      deals[stageId].some(d => d.id === dealId)
    )
    const targetStageId = over.id

    if (sourceStageId === targetStageId) {
      // Same stage - just reorder
      const stageDeals = [...deals[sourceStageId]]
      const oldIndex = stageDeals.findIndex(d => d.id === dealId)
      const newIndex = stageDeals.findIndex(d => d.id === targetStageId)
      
      if (oldIndex !== newIndex) {
        const newDeals = { ...deals }
        newDeals[sourceStageId] = arrayMove(stageDeals, oldIndex, newIndex)
        setDeals(newDeals)
      }
      return
    }

    // Different stage - move deal
    try {
      await api.put(`/api/v1/clientcontact/deals/${dealId}/stage`, {
        stage: targetStageId
      })

      // Optimistic update
      const newDeals = { ...deals }
      const deal = newDeals[sourceStageId].find(d => d.id === dealId)
      if (deal) {
        newDeals[sourceStageId] = newDeals[sourceStageId].filter(d => d.id !== dealId)
        newDeals[targetStageId] = [...(newDeals[targetStageId] || []), { ...deal, stage: targetStageId }]
        setDeals(newDeals)
      }

      // Reload to get accurate data
      loadPipeline()
    } catch (err) {
      console.error('Move error:', err)
      alert('Failed to move deal: ' + (err.response?.data?.error || err.message))
      // Reload on error
      loadPipeline()
    }
  }

  const getDealsForStage = (stageId) => {
    return deals[stageId] || []
  }

  const getActiveDeal = () => {
    if (!activeId) return null
    for (const stageDeals of Object.values(deals)) {
      const deal = stageDeals.find(d => d.id === activeId)
      if (deal) return deal
    }
    return null
  }

  if (loading) {
    return (
      <div className="relative min-h-screen bg-black p-6 flex items-center justify-center">
        <div className="text-neutral-500">Loading pipeline...</div>
      </div>
    )
  }

  if (!pipeline || !pipeline.stages || pipeline.stages.length === 0) {
    return (
      <div className="relative min-h-screen bg-black p-6">
        <div className="max-w-4xl mx-auto text-center py-12">
          <h2 className="text-2xl font-medium text-white mb-4">No Pipeline Found</h2>
          <p className="text-neutral-500 mb-6">Create a pipeline to start managing deals.</p>
          <button className="px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white rounded-xl text-sm font-medium transition-all flex items-center gap-2 mx-auto">
            <Plus className="w-4 h-4" />
            Create Pipeline
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen bg-black p-6">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[400px] h-[400px] bg-purple-900/10 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-emerald-900/10 rounded-full blur-[100px]"></div>
      </div>

      <div className="relative z-10 max-w-full">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-medium tracking-tight text-white">Pipeline: {pipeline.name}</h1>
            <p className="text-neutral-500 mt-1 text-sm">Manage and track your sales deals</p>
          </div>
          <button className="px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white rounded-xl text-sm font-medium transition-all flex items-center gap-2">
            <Plus className="w-4 h-4" />
            New Deal
          </button>
        </div>

        {/* Pipeline Kanban */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-4 overflow-x-auto pb-4">
            {pipeline.stages.map((stage) => {
              const stageDeals = getDealsForStage(stage.id)
              const stageValue = stageDeals.reduce((sum, d) => sum + parseFloat(d.value || 0), 0)
              
              return (
                <div key={stage.id} className="flex-shrink-0 w-72">
                  <div className="rounded-2xl bg-neutral-900/50 border border-white/10">
                    {/* Stage Header */}
                    <div className="p-4 border-b border-white/10">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {stage.color && (
                            <div 
                              className="w-2 h-2 rounded-full" 
                              style={{ backgroundColor: stage.color }}
                            ></div>
                          )}
                          <span className="font-medium text-white">{stage.name}</span>
                          <span className="text-xs text-neutral-500 bg-white/5 px-2 py-0.5 rounded-full">
                            {stageDeals.length}
                          </span>
                        </div>
                        <button className="p-1 rounded-lg hover:bg-white/10 text-neutral-500">
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="mt-2">
                        <p className="text-xs text-neutral-500">Total Value</p>
                        <p className="text-sm font-medium text-emerald-400">{formatCurrency(stageValue)}</p>
                      </div>
                    </div>

                    {/* Deals */}
                    <SortableContext
                      id={stage.id}
                      items={stageDeals.map(d => d.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="p-3 space-y-3 min-h-[200px] max-h-[600px] overflow-y-auto">
                        {stageDeals.map((deal) => (
                          <SortableDeal key={deal.id} deal={deal} />
                        ))}
                        
                        {stageDeals.length === 0 && (
                          <div className="text-center py-8 text-neutral-500 text-sm">
                            No deals in this stage
                          </div>
                        )}
                      </div>
                    </SortableContext>
                  </div>
                </div>
              )
            })}
          </div>
          <DragOverlay>
            {activeId && getActiveDeal() && (
              <div className="p-4 rounded-xl bg-black/90 border border-indigo-500/50 shadow-lg w-72">
                <h4 className="font-medium text-white text-sm">{getActiveDeal().name}</h4>
              </div>
            )}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  )
}
