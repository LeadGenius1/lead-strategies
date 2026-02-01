/**
 * AI Agent service client - Knowledge Base + Backend agent APIs
 * Used by dashboards and Copilot to call als-knowledge-agent and backend agent endpoints.
 */

const KNOWLEDGE_API = process.env.NEXT_PUBLIC_KNOWLEDGE_API_URL || 'https://als-knowledge-agent-production.up.railway.app'
const BACKEND_API = process.env.NEXT_PUBLIC_API_URL || 'https://api.aileadstrategies.com'

/**
 * Get knowledge chunks (list or by platform)
 * @param {Object} params - { platform?, audience?, tag?, limit? }
 * @returns {Promise<{ count: number, chunks: Array }>}
 */
export async function getKnowledgeChunks(params = {}) {
  const search = new URLSearchParams(params).toString()
  const url = search ? `${KNOWLEDGE_API}/api/v1/chunks?${search}` : `${KNOWLEDGE_API}/api/v1/chunks`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Knowledge API error: ${res.status}`)
  return res.json()
}

/**
 * Get a single chunk by ID
 * @param {string} id - e.g. als_kb_001
 * @returns {Promise<Object>}
 */
export async function getKnowledgeChunk(id) {
  const res = await fetch(`${KNOWLEDGE_API}/api/v1/chunks/${encodeURIComponent(id)}`)
  if (!res.ok) throw new Error(`Knowledge API error: ${res.status}`)
  return res.json()
}

/**
 * Search knowledge chunks by query (for AI context)
 * @param {string} query - search text
 * @param {Object} options - { platform?, limit? }
 * @returns {Promise<{ query, count, results }>}
 */
export async function searchKnowledge(query, options = {}) {
  const res = await fetch(`${KNOWLEDGE_API}/api/v1/search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, ...options }),
  })
  if (!res.ok) throw new Error(`Knowledge API error: ${res.status}`)
  return res.json()
}

/**
 * Get combined context for an AI agent (platform/audience/query)
 * @param {Object} params - { query?, platform?, audience?, maxChunks? }
 * @returns {Promise<{ chunkCount, chunkIds, context }>}
 */
export async function getAgentContext(params = {}) {
  const res = await fetch(`${KNOWLEDGE_API}/api/v1/context`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  })
  if (!res.ok) throw new Error(`Knowledge API error: ${res.status}`)
  return res.json()
}

/**
 * Health check for Knowledge Agent
 * @returns {Promise<{ status: string, service: string }>}
 */
export async function checkKnowledgeHealth() {
  const res = await fetch(`${KNOWLEDGE_API}/health`)
  if (!res.ok) throw new Error(`Knowledge health check failed: ${res.status}`)
  return res.json()
}

const AgentService = {
  getKnowledgeChunks,
  getKnowledgeChunk,
  searchKnowledge,
  getAgentContext,
  checkKnowledgeHealth,
  KNOWLEDGE_API,
  BACKEND_API,
}

export default AgentService
