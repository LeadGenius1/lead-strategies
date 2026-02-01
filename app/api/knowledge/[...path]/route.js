/**
 * Knowledge API proxy – avoids CORS by routing browser requests through same origin.
 * Upstream: https://als-knowledge-agent-production.up.railway.app
 */

import { NextRequest, NextResponse } from 'next/server'

const KNOWLEDGE_API = process.env.NEXT_PUBLIC_KNOWLEDGE_API_URL || 'https://als-knowledge-agent-production.up.railway.app'

function buildUpstreamUrl(pathSegments, searchParams) {
  const path = Array.isArray(pathSegments) && pathSegments.length ? pathSegments.join('/') : ''
  const base = KNOWLEDGE_API.replace(/\/$/, '')
  const pathPart = path ? `/${path}` : ''
  const query = searchParams?.toString?.() ? `?${searchParams.toString()}` : ''
  return `${base}${pathPart}${query}`
}

export async function GET(request, { params }) {
  try {
    const pathSegments = params?.path ?? []
    const url = buildUpstreamUrl(pathSegments, request.nextUrl?.searchParams)
    const response = await fetch(url, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(15000),
    })
    const contentType = response.headers.get('content-type') || ''
    const data = contentType.includes('application/json')
      ? await response.json()
      : { text: await response.text() }
    if (!response.ok) {
      return NextResponse.json(data, { status: response.status })
    }
    return NextResponse.json(data)
  } catch (error) {
    console.error('[knowledge proxy] GET error:', error)
    return NextResponse.json(
      { error: error.message || 'Proxy request failed' },
      { status: 502 }
    )
  }
}

export async function POST(request, { params }) {
  try {
    const pathSegments = params?.path ?? []
    const url = buildUpstreamUrl(pathSegments, null)
    let body
    try {
      body = await request.json()
    } catch {
      body = {}
    }
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(15000),
    })
    const contentType = response.headers.get('content-type') || ''
    const data = contentType.includes('application/json')
      ? await response.json()
      : { text: await response.text() }
    if (!response.ok) {
      return NextResponse.json(data, { status: response.status })
    }
    return NextResponse.json(data)
  } catch (error) {
    console.error('[knowledge proxy] POST error:', error)
    return NextResponse.json(
      { error: error.message || 'Proxy request failed' },
      { status: 502 }
    )
  }
}
