/**
 * POST /api/auth/register
 * Alias for registration – same behavior as POST /api/v1/auth/signup.
 * Some clients may call /api/auth/register; api.aileadstrategies.com is the frontend so we handle it here.
 */

import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

export const dynamic = 'force-dynamic'

export async function POST(request) {
  try {
    const body = await request.json()
    const { email, name, company, password, tier } = body || {}

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json(
        { success: false, message: 'Valid email is required' },
        { status: 400 }
      )
    }

    const secret = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET
    if (!secret) {
      return NextResponse.json(
        { success: false, message: 'Server misconfiguration' },
        { status: 500 }
      )
    }

    const id = 'user_' + Buffer.from(email).toString('base64').slice(0, 16)
    const token = jwt.sign(
      { id, email, name: name || email.split('@')[0], role: 'user', tier: tier || 'leadsite-ai' },
      secret,
      { expiresIn: '7d' }
    )

    const user = {
      id,
      email,
      name: name || email.split('@')[0],
      company: company || null,
      tier: tier || 'leadsite-ai',
    }

    return NextResponse.json({
      success: true,
      token,
      data: { user },
    })
  } catch (error) {
    console.error('[auth/register]', error)
    return NextResponse.json(
      { success: false, message: error?.message || 'Registration failed' },
      { status: 500 }
    )
  }
}
