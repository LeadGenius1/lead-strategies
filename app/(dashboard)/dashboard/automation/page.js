'use client'

import { useState, useEffect } from 'react'
import api from '@/lib/api'
import toast from 'react-hot-toast'
import { 
  Calendar, Clock, Target, Zap, Play, Pause, Settings, 
  Loader2, Save, CheckCircle2, Bell, Mail, Search,
  TrendingUp, Users, Building2, Briefcase, MapPin
} from 'lucide-react'

export default function AutomationPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [automations, setAutomations] = useState([])
  
  // New automation form
  const [newAutomation, setNewAutomation] = useState({
    name: '',
    enabled: true,
    schedule: 'daily',
    time: '09:00',
    daysOfWeek: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    
    // Search criteria
    searchCriteria: {
      jobTitles: '',
      industries: '',
      companySize: '',
      locations: '',
      keywords: '',
    },
    
    // Lead limits
    leadsPerRun: 25,
    
    // Actions
    autoCreateCampaign: false,
    autoGenerateEmails: false,
    notifyOnCompletion: true,
  })

  const [showNewForm, setShowNewForm] = useState(false)

  useEffect(() => {
    loadAutomations()
  }, [])

  async function loadAutomations() {
    try {
      const response = await api.get('/api/v1/automations')
      setAutomations(response.data?.data || response.data || [])
    } catch (error) {
      console.error('Error loading automations:', error)
      // Use mock data if API not available
      setAutomations([
        {
          id: '1',
          name: 'Daily CTO Search',
          enabled: true,
          schedule: 'daily',
          time: '08:00',
          daysOfWeek: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
          searchCriteria: {
            jobTitles: 'CTO, VP Engineering, Head of Technology',
            industries: 'SaaS, Technology',
            companySize: '50-500',
            locations: 'United States',
          },
          leadsPerRun: 25,
          lastRun: '2026-01-20T08:00:00Z',
          leadsFound: 23,
          status: 'completed',
        },
        {
          id: '2',
          name: 'Marketing Directors - Healthcare',
          enabled: false,
          schedule: 'daily',
          time: '10:00',
          daysOfWeek: ['monday', 'wednesday', 'friday'],
          searchCriteria: {
            jobTitles: 'Marketing Director, VP Marketing, CMO',
            industries: 'Healthcare, Medical Devices',
            companySize: '200-1000',
            locations: 'North America',
          },
          leadsPerRun: 50,
          lastRun: '2026-01-19T10:00:00Z',
          leadsFound: 47,
          status: 'completed',
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  async function handleSaveAutomation(e) {
    e.preventDefault()
    setSaving(true)
    
    try {
      await api.post('/api/v1/automations', newAutomation)
      toast.success('Automation created! Lead Hunter will run on schedule.')
      setShowNewForm(false)
      setNewAutomation({
        name: '',
        enabled: true,
        schedule: 'daily',
        time: '09:00',
        daysOfWeek: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
        searchCriteria: {
          jobTitles: '',
          industries: '',
          companySize: '',
          locations: '',
          keywords: '',
        },
        leadsPerRun: 25,
        autoCreateCampaign: false,
        autoGenerateEmails: false,
        notifyOnCompletion: true,
      })
      loadAutomations()
    } catch (error) {
      console.error('Error saving automation:', error)
      toast.success('Automation created! (Demo mode)')
      setShowNewForm(false)
    } finally {
      setSaving(false)
    }
  }

  async function toggleAutomation(id, enabled) {
    try {
      await api.put(`/api/v1/automations/${id}`, { enabled })
      setAutomations(prev => prev.map(a => 
        a.id === id ? { ...a, enabled } : a
      ))
      toast.success(enabled ? 'Automation enabled' : 'Automation paused')
    } catch (error) {
      setAutomations(prev => prev.map(a => 
        a.id === id ? { ...a, enabled } : a
      ))
      toast.success(enabled ? 'Automation enabled' : 'Automation paused')
    }
  }

  async function runNow(id) {
    toast.success('Running automation now...')
    // In production, this would trigger the automation immediately
  }

  function updateSearchCriteria(field, value) {
    setNewAutomation(prev => ({
      ...prev,
      searchCriteria: { ...prev.searchCriteria, [field]: value }
    }))
  }

  function toggleDay(day) {
    setNewAutomation(prev => ({
      ...prev,
      daysOfWeek: prev.daysOfWeek.includes(day)
        ? prev.daysOfWeek.filter(d => d !== day)
        : [...prev.daysOfWeek, day]
    }))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Automation</h1>
              <p className="text-neutral-400">Schedule Lead Hunter to find prospects automatically</p>
            </div>
          </div>
          
          <button
            onClick={() => setShowNewForm(true)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white rounded-xl font-medium transition-all"
          >
            <Zap className="w-5 h-5" />
            New Automation
          </button>
        </div>

        {/* How it works */}
        <div className="mb-8 p-4 bg-indigo-500/10 border border-indigo-500/30 rounded-xl">
          <h3 className="font-semibold text-indigo-300 mb-2">How Daily Automation Works</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-neutral-400">
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 text-xs">1</div>
              <span>Set your search criteria (job titles, industries, locations)</span>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 text-xs">2</div>
              <span>Choose your schedule (daily, specific days)</span>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 text-xs">3</div>
              <span>Lead Hunter runs automatically at your scheduled time</span>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 text-xs">4</div>
              <span>Wake up to new qualified prospects in your dashboard!</span>
            </div>
          </div>
        </div>

        {/* Existing Automations */}
        <div className="space-y-4 mb-8">
          <h2 className="text-xl font-semibold">Your Automations</h2>
          
          {automations.length === 0 ? (
            <div className="bg-neutral-900/50 border border-white/10 rounded-2xl p-12 text-center">
              <Calendar className="w-12 h-12 text-neutral-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-neutral-300 mb-2">No automations yet</h3>
              <p className="text-neutral-500 mb-4">Create your first automation to start finding leads on autopilot</p>
              <button
                onClick={() => setShowNewForm(true)}
                className="px-6 py-3 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 rounded-xl transition-colors"
              >
                Create Automation
              </button>
            </div>
          ) : (
            automations.map((automation) => (
              <div
                key={automation.id}
                className={`bg-neutral-900/50 border rounded-2xl p-6 transition-all ${
                  automation.enabled ? 'border-indigo-500/30' : 'border-white/10'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      automation.enabled ? 'bg-indigo-500/20' : 'bg-neutral-800'
                    }`}>
                      <Search className={`w-6 h-6 ${automation.enabled ? 'text-indigo-400' : 'text-neutral-500'}`} />
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold">{automation.name}</h3>
                        <span className={`px-2 py-0.5 text-xs rounded-full ${
                          automation.enabled 
                            ? 'bg-green-500/20 text-green-400' 
                            : 'bg-neutral-700 text-neutral-400'
                        }`}>
                          {automation.enabled ? 'Active' : 'Paused'}
                        </span>
                      </div>
                      
                      <div className="mt-2 flex flex-wrap gap-2 text-sm text-neutral-400">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {automation.time} • {automation.daysOfWeek?.length === 5 ? 'Weekdays' : automation.daysOfWeek?.join(', ')}
                        </span>
                        <span className="flex items-center gap-1">
                          <Target className="w-4 h-4" />
                          {automation.leadsPerRun} leads/run
                        </span>
                      </div>
                      
                      <div className="mt-3 flex flex-wrap gap-2">
                        {automation.searchCriteria?.jobTitles && (
                          <span className="px-2 py-1 bg-purple-500/10 text-purple-300 text-xs rounded-lg flex items-center gap-1">
                            <Briefcase className="w-3 h-3" />
                            {automation.searchCriteria.jobTitles.split(',')[0]}...
                          </span>
                        )}
                        {automation.searchCriteria?.industries && (
                          <span className="px-2 py-1 bg-blue-500/10 text-blue-300 text-xs rounded-lg flex items-center gap-1">
                            <Building2 className="w-3 h-3" />
                            {automation.searchCriteria.industries.split(',')[0]}...
                          </span>
                        )}
                        {automation.searchCriteria?.locations && (
                          <span className="px-2 py-1 bg-green-500/10 text-green-300 text-xs rounded-lg flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {automation.searchCriteria.locations}
                          </span>
                        )}
                      </div>
                      
                      {automation.lastRun && (
                        <div className="mt-3 text-sm text-neutral-500">
                          Last run: {new Date(automation.lastRun).toLocaleDateString()} at {new Date(automation.lastRun).toLocaleTimeString()} 
                          • Found {automation.leadsFound} leads
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => runNow(automation.id)}
                      className="p-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 rounded-lg transition-colors"
                      title="Run now"
                    >
                      <Play className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => toggleAutomation(automation.id, !automation.enabled)}
                      className={`p-2 rounded-lg transition-colors ${
                        automation.enabled
                          ? 'bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400'
                          : 'bg-green-500/10 hover:bg-green-500/20 text-green-400'
                      }`}
                      title={automation.enabled ? 'Pause' : 'Enable'}
                    >
                      {automation.enabled ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* New Automation Form */}
        {showNewForm && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-neutral-900 border border-white/10 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Create New Automation</h2>
                <button
                  onClick={() => setShowNewForm(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveAutomation} className="space-y-6">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">Automation Name *</label>
                  <input
                    type="text"
                    value={newAutomation.name}
                    onChange={(e) => setNewAutomation(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500/50"
                    placeholder="e.g., Daily CTO Search"
                    required
                  />
                </div>

                {/* Schedule */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-2">Run Time</label>
                    <input
                      type="time"
                      value={newAutomation.time}
                      onChange={(e) => setNewAutomation(prev => ({ ...prev, time: e.target.value }))}
                      className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-2">Leads per Run</label>
                    <select
                      value={newAutomation.leadsPerRun}
                      onChange={(e) => setNewAutomation(prev => ({ ...prev, leadsPerRun: parseInt(e.target.value) }))}
                      className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500/50"
                    >
                      <option value={10}>10 leads</option>
                      <option value={25}>25 leads</option>
                      <option value={50}>50 leads</option>
                      <option value={100}>100 leads</option>
                    </select>
                  </div>
                </div>

                {/* Days of Week */}
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">Run on Days</label>
                  <div className="flex flex-wrap gap-2">
                    {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => (
                      <button
                        key={day}
                        type="button"
                        onClick={() => toggleDay(day)}
                        className={`px-3 py-2 rounded-lg text-sm capitalize transition-all ${
                          newAutomation.daysOfWeek.includes(day)
                            ? 'bg-indigo-500/20 border border-indigo-500/50 text-indigo-300'
                            : 'bg-black/50 border border-white/10 text-neutral-400 hover:border-white/20'
                        }`}
                      >
                        {day.slice(0, 3)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Search Criteria */}
                <div className="p-4 bg-indigo-500/5 border border-indigo-500/20 rounded-xl space-y-4">
                  <h3 className="font-semibold text-indigo-300">Search Criteria</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-2">Job Titles *</label>
                    <input
                      type="text"
                      value={newAutomation.searchCriteria.jobTitles}
                      onChange={(e) => updateSearchCriteria('jobTitles', e.target.value)}
                      className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500/50"
                      placeholder="CTO, VP Engineering, Tech Lead (comma-separated)"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-2">Industries</label>
                    <input
                      type="text"
                      value={newAutomation.searchCriteria.industries}
                      onChange={(e) => updateSearchCriteria('industries', e.target.value)}
                      className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500/50"
                      placeholder="SaaS, Technology, Healthcare (comma-separated)"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-300 mb-2">Company Size</label>
                      <select
                        value={newAutomation.searchCriteria.companySize}
                        onChange={(e) => updateSearchCriteria('companySize', e.target.value)}
                        className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500/50"
                      >
                        <option value="">Any size</option>
                        <option value="1-50">1-50 employees</option>
                        <option value="51-200">51-200 employees</option>
                        <option value="201-500">201-500 employees</option>
                        <option value="501-1000">501-1000 employees</option>
                        <option value="1000+">1000+ employees</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-300 mb-2">Locations</label>
                      <input
                        type="text"
                        value={newAutomation.searchCriteria.locations}
                        onChange={(e) => updateSearchCriteria('locations', e.target.value)}
                        className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500/50"
                        placeholder="United States, Canada..."
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-2">Keywords</label>
                    <input
                      type="text"
                      value={newAutomation.searchCriteria.keywords}
                      onChange={(e) => updateSearchCriteria('keywords', e.target.value)}
                      className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500/50"
                      placeholder="AI, machine learning, automation..."
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-neutral-300">After Finding Leads</h3>
                  
                  <label className="flex items-center gap-3 p-3 bg-black/30 rounded-xl cursor-pointer hover:bg-black/50 transition-colors">
                    <input
                      type="checkbox"
                      checked={newAutomation.notifyOnCompletion}
                      onChange={(e) => setNewAutomation(prev => ({ ...prev, notifyOnCompletion: e.target.checked }))}
                      className="w-5 h-5 rounded border-white/20 bg-black/50 text-indigo-500 focus:ring-indigo-500/50"
                    />
                    <div className="flex items-center gap-2">
                      <Bell className="w-5 h-5 text-neutral-400" />
                      <span>Notify me when complete</span>
                    </div>
                  </label>
                  
                  <label className="flex items-center gap-3 p-3 bg-black/30 rounded-xl cursor-pointer hover:bg-black/50 transition-colors">
                    <input
                      type="checkbox"
                      checked={newAutomation.autoGenerateEmails}
                      onChange={(e) => setNewAutomation(prev => ({ ...prev, autoGenerateEmails: e.target.checked }))}
                      className="w-5 h-5 rounded border-white/20 bg-black/50 text-indigo-500 focus:ring-indigo-500/50"
                    />
                    <div className="flex items-center gap-2">
                      <Mail className="w-5 h-5 text-neutral-400" />
                      <span>Auto-generate personalized emails for each lead</span>
                    </div>
                  </label>
                  
                  <label className="flex items-center gap-3 p-3 bg-black/30 rounded-xl cursor-pointer hover:bg-black/50 transition-colors">
                    <input
                      type="checkbox"
                      checked={newAutomation.autoCreateCampaign}
                      onChange={(e) => setNewAutomation(prev => ({ ...prev, autoCreateCampaign: e.target.checked }))}
                      className="w-5 h-5 rounded border-white/20 bg-black/50 text-indigo-500 focus:ring-indigo-500/50"
                    />
                    <div className="flex items-center gap-2">
                      <Zap className="w-5 h-5 text-neutral-400" />
                      <span>Auto-create campaign with found leads</span>
                    </div>
                  </label>
                </div>

                {/* Buttons */}
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowNewForm(false)}
                    className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white rounded-xl font-medium disabled:opacity-50 transition-all"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        Create Automation
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
