import api from './api'
import Cookies from 'js-cookie'
import { AUTH_ENDPOINTS } from './auth-endpoints'

/** User-facing message for auth failures - never show 401, 404, or technical codes */
function toUserMessage(data, status) {
  const msg = data?.error || data?.message
  if (typeof msg === 'string' && msg.trim()) return msg
  if (status === 401) return 'Wrong email or password. Check your spelling or use Forgot password.'
  if (status === 404) return 'Login service unavailable. Please try again in a few minutes.'
  if (status === 400) return 'Please check your email and password, then try again.'
  if (status >= 500) return 'Server error. Please try again in a few minutes.'
  return 'Login failed. Please check your email and password.'
}

/** Same-origin auth call - uses /api/auth/* proxy to avoid CORS and cross-origin issues */
async function authFetch(url, body) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const data = await res.json()
  // Proxy may return 200 with success: false for auth errors (so client never sees 401)
  if (!res.ok || data.success === false) {
    const err = new Error(toUserMessage(data, res.status))
    err.response = { status: res.status, data }
    throw err
  }
  return data
}

export async function login(email, password) {
  const data = await authFetch('/api/auth/login', {
    email: (email || '').trim().toLowerCase(),
    password: password || '',
  })
  const token = data.token
  const user = data.data?.user || data.user
  const subscription = data.data?.subscription || data.subscription

  if (token) {
    const isProd = typeof window !== 'undefined' && location?.protocol === 'https'
    Cookies.set('token', token, { expires: 7, secure: isProd, sameSite: 'lax' })
  }
  return { user, subscription, token }
}

/** Wrapped login that throws with user-friendly message (never "401") */
export async function loginWithErrorHandling(email, password) {
  try {
    return await login(email, password)
  } catch (error) {
    throw new Error(error.message || toUserMessage(error?.response?.data, error?.response?.status))
  }
}

export async function signup(userData) {
  try {
    const data = await authFetch('/api/auth/signup', userData)
    const token = data.token
    const user = data.data?.user || data.user
    const subscription = data.data?.subscription || data.subscription

    if (token) {
      const isProd = typeof window !== 'undefined' && location?.protocol === 'https'
      Cookies.set('token', token, { expires: 7, secure: isProd, sameSite: 'lax' })
    }
    return { user, subscription, token }
  } catch (error) {
    throw new Error(error.message || toUserMessage(error?.response?.data, error?.response?.status))
  }
}

export async function logout() {
  Cookies.remove('token')
  if (typeof window !== 'undefined') {
    window.location.href = '/login'
  }
}

export function getToken() {
  return Cookies.get('token')
}

export async function getCurrentUser() {
  try {
    const token = Cookies.get('token')
    console.log('[Auth] getCurrentUser - token exists:', !!token)
    
    if (!token) {
      console.log('[Auth] No token in cookies, returning null')
      return null
    }
    
    const response = await api.get(AUTH_ENDPOINTS.ME)
    
    // Backend returns: { success: true, data: { user: {...}, tierLimits: {...}, tierFeatures: [...] } }
    const responseData = response.data
    console.log('[Auth] getCurrentUser response:', responseData?.success ? 'success' : 'failed')
    
    const user = responseData.data?.user || responseData.user || responseData
    return { user, subscription: responseData.data }
  } catch (error) {
    console.error('[Auth] getCurrentUser error:', error.message)
    return null
  }
}

export async function forgotPassword(email) {
  const response = await api.post(AUTH_ENDPOINTS.FORGOT_PASSWORD, { email })
  return response.data
}

export async function resetPassword(token, newPassword) {
  const response = await api.post(AUTH_ENDPOINTS.RESET_PASSWORD, { token, password: newPassword })
  return response.data
}
