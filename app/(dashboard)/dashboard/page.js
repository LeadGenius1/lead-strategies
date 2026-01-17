'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import { getCurrentUser } from '@/lib/auth'
import DailyEmailStatus from '@/components/DailyEmailStatus'
import toast from 'react-hot-toast'

const STATS = [
  { label: 'Total Websites', key: 'websites', icon: '🌐', color: 'text-blue-400' },
  { label: 'Active Campaigns', key: 'campaigns', icon: '📧', color: 'text-green-400' },
  { label: 'Total Prospects', key: 'prospects', icon: '👥', color: 'text-purple-400' },
  { label: 'Emails Sent', key: 'emailsSent', icon: '✉️', color: 'text-yellow-400' },
]

const PLATFORMS = [
  { name: 'LeadSite.AI', description: 'AI-powered lead generation', icon: '🎯', status: 'active' },
  { name: 'LeadSite.IO', description: 'Website builder platform', icon: '🏗️', status: 'active' },
  { name: 'ClientContact.IO', description: '22+ channel outreach', icon: '💬', status: 'active' },
  { name: 'Tackle.IO', description: 'Enterprise AI SDR', icon: '🚀', status: 'active' },
  { name: 'VideoSite.IO', description: 'Video marketing platform', icon: '🎬', status: 'coming' },
]

export default function DashboardPage() {
  const router = useRouter()
  const [stats, setStats] = useState({
    websites: 0,
    campaigns: 0,
    prospects: 0,
    emailsSent: 0,
  })
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [aiAgentStarted, setAiAgentStarted] = useState(false)
  const [startingAgent, setStartingAgent] = useState(false)

  useEffect(() => {
    async function loadDashboard() {
      try {
        const currentUser = await getCurrentUser()
        setUser(currentUser)
        
        // Check if AI agent has been started
        const agentStatus = localStorage.getItem('aiAgentStarted')
        setAiAgentStarted(agentStatus === 'true')
        
        const response = await api.get('/api/analytics/dashboard')
        setStats(response.data)
      } catch (error) {
        console.error('Error loading dashboard:', error)
        // Use placeholder data
        setStats({
          websites: 0,
          campaigns: 0,
          prospects: 0,
          emailsSent: 0,
        })
      } finally {
        setLoading(false)
      }
    }

    loadDashboard()
  }, [])

  const handleStartAIAgent = async () => {
    setStartingAgent(true)
    
    try {
      // Trigger AI agent to start fetching prospects
      const response = await api.post('/api/ai-agent/start', {
        userId: user?.id
      })
      
      if (response.data?.success) {
        setAiAgentStarted(true)
        localStorage.setItem('aiAgentStarted', 'true')
        toast.success('🤖 AI Agent activated! Finding your ideal prospects...')
        
        // Refresh stats after a moment
        setTimeout(() => {
          window.location.reload()
        }, 2000)
      }
    } catch (error) {
      console.error('Error starting AI agent:', error)
      toast.error('Failed to start AI agent. Please try again.')
    } finally {
      setStartingAgent(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-dark-text">
            Welcome back, {user?.name?.split(' ')[0] || 'there'}! 👋
          </h1>
          <p className="text-dark-textMuted mt-1">Let's grow your business today</p>
        </div>
        
        {/* AI Agent Start Button */}
        {!aiAgentStarted && (
          <button
            onClick={handleStartAIAgent}
            disabled={startingAgent}
            className="relative px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold rounded-xl transition disabled:opacity-50 shadow-2xl"
            style={{
              animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            }}
          >
            <span className="relative z-10 flex items-center gap-2">
              <span className="text-2xl">🚀</span>
              {startingAgent ? 'Starting...' : 'START AI AGENT'}
            </span>
            {/* Pulsating glow effect */}
            <div className="absolute inset-0 rounded-xl bg-purple-500 opacity-75 blur-xl animate-pulse"></div>
          </button>
        )}
        
        {aiAgentStarted && (
          <div className="px-6 py-3 bg-green-500/20 border border-green-500/30 text-green-400 rounded-xl flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            <span className="font-semibold">AI Agent Active</span>
          </div>
        )}
      </div>

      {/* AI Agent Welcome Message (First Time) */}
      {!aiAgentStarted && (
        <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-2xl p-8">
          <div className="flex items-start gap-6">
            <div className="w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
              <span className="text-4xl">🤖</span>
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-white mb-3">Your AI Agent is Ready!</h3>
              <p className="text-dark-textMuted text-lg mb-4">
                Click the <strong className="text-white">START AI AGENT</strong> button to begin finding your ideal customers. 
                Our AI will analyze your business profile and automatically discover the best prospects for your services.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🎯</span>
                  <span className="text-sm text-dark-text">Finds ideal prospects</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">✍️</span>
                  <span className="text-sm text-dark-text">Writes personalized emails</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">📤</span>
                  <span className="text-sm text-dark-text">Sends daily at 8 AM</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Daily AI Agent Status */}
      {aiAgentStarted && <DailyEmailStatus />}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {STATS.map((stat) => (
          <div
            key={stat.key}
            className="bg-dark-surface border border-dark-border rounded-xl p-6"
          >
            <div className="flex items-center justify-between">
              <span className="text-2xl">{stat.icon}</span>
              <span className={`text-3xl font-bold ${stat.color}`}>
                {loading ? '...' : stats[stat.key]?.toLocaleString() || 0}
              </span>
            </div>
            <p className="text-dark-textMuted mt-2">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Platform Overview */}
      <div>
        <h2 className="text-xl font-semibold text-dark-text mb-4">Your Platforms</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {PLATFORMS.map((platform) => (
            <div
              key={platform.name}
              className="bg-dark-surface border border-dark-border rounded-xl p-6 hover:border-dark-primary transition cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <span className="text-3xl">{platform.icon}</span>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  platform.status === 'active' 
                    ? 'bg-green-500/20 text-green-400' 
                    : 'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {platform.status === 'active' ? 'Active' : 'Coming Soon'}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-dark-text mt-4">{platform.name}</h3>
              <p className="text-dark-textMuted text-sm mt-1">{platform.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold text-dark-text mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-4">
          <button 
            onClick={() => router.push('/dashboard/websites')}
            className="px-6 py-3 bg-dark-primary hover:bg-dark-primaryHover text-white rounded-lg transition"
          >
            + New Website
          </button>
          <button 
            onClick={() => router.push('/dashboard/campaigns')}
            className="px-6 py-3 bg-dark-surface border border-dark-border hover:border-dark-primary text-dark-text rounded-lg transition"
          >
            + Create Campaign
          </button>
          <button 
            onClick={() => router.push('/dashboard/prospects')}
            className="px-6 py-3 bg-dark-surface border border-dark-border hover:border-dark-primary text-dark-text rounded-lg transition"
          >
            + Add Prospect
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-xl font-semibold text-dark-text mb-4">Recent Activity</h2>
        <div className="bg-dark-surface border border-dark-border rounded-xl overflow-hidden">
          <div className="p-6 text-center text-dark-textMuted">
            <p>No recent activity yet. Start by analyzing a website or creating a campaign!</p>
          </div>
        </div>
      </div>
    </div>
  )
}
