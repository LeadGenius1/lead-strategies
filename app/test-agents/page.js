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
    <div className="min-h-screen bg-black p-8 text-white">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">AI Agent Integration Test</h1>
          <Link
            href="/dashboard"
            className="text-sm text-neutral-400 hover:text-white transition-colors"
          >
            ← Back to Dashboard
          </Link>
        </div>
        <p className="text-neutral-500 text-sm mb-8">
          Knowledge API: {typeof window !== 'undefined' && (process.env.NEXT_PUBLIC_KNOWLEDGE_API_URL || 'https://als-knowledge-agent-production.up.railway.app')}
        </p>

        <div className="flex flex-wrap gap-3 mb-8">
          <button
            onClick={testHealth}
            disabled={loading}
            className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-300 rounded-xl text-sm font-medium disabled:opacity-50"
          >
            Test Health
          </button>
          <button
            onClick={testChunks}
            disabled={loading}
            className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 text-green-300 rounded-xl text-sm font-medium disabled:opacity-50"
          >
            Get Chunks
          </button>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-3 py-2 bg-black border border-white/10 rounded-xl text-sm text-white placeholder-neutral-500 w-48 focus:outline-none focus:border-purple-500/50"
              placeholder="Search query"
            />
            <button
              onClick={testSearch}
              disabled={loading}
              className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 text-purple-300 rounded-xl text-sm font-medium disabled:opacity-50"
            >
              Search
            </button>
          </div>
          <button
            onClick={testContext}
            disabled={loading}
            className="px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 text-amber-300 rounded-xl text-sm font-medium disabled:opacity-50"
          >
            Get Context
          </button>
        </div>

        {loading && (
          <p className="text-neutral-400 text-sm mb-4">Loading…</p>
        )}
        {error && (
          <div className="mb-4 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm">
            {error}
          </div>
        )}
        <pre className="bg-neutral-900 border border-white/10 p-4 rounded-xl overflow-auto text-sm text-neutral-300 max-h-[60vh]">
          {result != null ? JSON.stringify(result, null, 2) : 'Click a button to see JSON result.'}
        </pre>
      </div>
    </div>
  )
}
