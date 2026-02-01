'use client'

import { useState } from 'react'
import Link from 'next/link'
import AgentService from '@/lib/agents'

export default function TestAgentsPage() {
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('lead generation pricing')

  const testHealth = async () => {
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const data = await AgentService.checkKnowledgeHealth()
      setResult(data)
    } catch (err) {
      setError(err.message || 'Health check failed')
      setResult(null)
    } finally {
      setLoading(false)
    }
  }

  const testChunks = async () => {
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const data = await AgentService.getKnowledgeChunks()
      setResult(data)
    } catch (err) {
      setError(err.message || 'Get chunks failed')
      setResult(null)
    } finally {
      setLoading(false)
    }
  }

  const testSearch = async () => {
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const data = await AgentService.searchKnowledge(searchQuery, { limit: 5 })
      setResult(data)
    } catch (err) {
      setError(err.message || 'Search failed')
      setResult(null)
    } finally {
      setLoading(false)
    }
  }

  const testContext = async () => {
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const data = await AgentService.getAgentContext({ platform: 'leadsite_ai', query: searchQuery, maxChunks: 3 })
      setResult(data)
    } catch (err) {
      setError(err.message || 'Context failed')
      setResult(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen p-8 text-white font-sans relative z-10">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-medium tracking-tight text-white">AI Agent Integration Test</h1>
          <Link
            href="/dashboard"
            className="text-sm text-neutral-400 hover:text-white transition-colors font-light"
          >
            ← Back to Dashboard
          </Link>
        </div>
        <p className="text-neutral-500 text-sm mb-8 font-light">
          Knowledge API: {typeof window !== 'undefined' && (process.env.NEXT_PUBLIC_KNOWLEDGE_API_URL || 'https://als-knowledge-agent-production.up.railway.app')}
        </p>

        <div className="flex flex-wrap gap-3 mb-8">
          <button
            onClick={testHealth}
            disabled={loading}
            className="px-4 py-2 bg-neutral-900/30 border border-white/10 hover:border-indigo-500/50 text-white rounded-xl text-sm font-medium disabled:opacity-50 transition-all duration-500"
          >
            Test Health
          </button>
          <button
            onClick={testChunks}
            disabled={loading}
            className="px-4 py-2 bg-neutral-900/30 border border-white/10 hover:border-indigo-500/50 text-white rounded-xl text-sm font-medium disabled:opacity-50 transition-all duration-500"
          >
            Get Chunks
          </button>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-3 py-2 bg-black/50 border border-white/10 rounded-xl text-sm text-white placeholder-neutral-500 w-48 focus:outline-none focus:border-indigo-500/50 transition-colors font-light"
              placeholder="Search query"
            />
            <button
              onClick={testSearch}
              disabled={loading}
              className="px-4 py-2 bg-neutral-900/30 border border-white/10 hover:border-indigo-500/50 text-white rounded-xl text-sm font-medium disabled:opacity-50 transition-all duration-500"
            >
              Search
            </button>
          </div>
          <button
            onClick={testContext}
            disabled={loading}
            className="px-4 py-2 bg-neutral-900/30 border border-white/10 hover:border-indigo-500/50 text-white rounded-xl text-sm font-medium disabled:opacity-50 transition-all duration-500"
          >
            Get Context
          </button>
        </div>

        {loading && (
          <p className="text-neutral-400 text-sm mb-4">Loading…</p>
        )}
        {error && (
          <div className="mb-4 p-4 rounded-2xl bg-neutral-900/30 border border-white/10 border-red-500/30 text-red-300 text-sm font-light">
            {error}
          </div>
        )}
        <pre className="rounded-2xl bg-neutral-900/30 border border-white/10 p-4 overflow-auto text-sm text-neutral-400 max-h-[60vh] font-light">
          {result != null ? JSON.stringify(result, null, 2) : 'Click a button to see JSON result.'}
        </pre>
      </div>
    </div>
  )
}
