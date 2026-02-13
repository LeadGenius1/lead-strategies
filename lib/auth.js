import api from './api'
import Cookies from 'js-cookie'
import { AUTH_ENDPOINTS } from './auth-endpoints'

export async function login(email, password) {
  const response = await api.post(AUTH_ENDPOINTS.LOGIN, { email, password })
  
  // Backend returns: { success: true, token: "...", data: { user: {...} } }
  const responseData = response.data
  
  // Token is at top level
  const token = responseData.token
  // User is inside data object
  const user = responseData.data?.user || responseData.user
  const subscription = responseData.data?.subscription || responseData.subscription
  
  console.log('[Auth] Login response - token:', token ? 'received' : 'MISSING')
  console.log('[Auth] Login response - user:', user ? user.email : 'MISSING')
  
  if (token) {
    Cookies.set('token', token, { expires: 7 })
    console.log('[Auth] Token saved to cookie')
  } else {
    console.error('[Auth] No token received from backend!')
  }
  
  return { user, subscription, token }
}

export async function signup(userData) {
  const response = await api.post(AUTH_ENDPOINTS.SIGNUP, userData)
  
  // Backend returns: { success: true, token: "...", data: { user: {...}, subscription: {...} } }
  const responseData = response.data
  
  // Token is at top level
  const token = responseData.token
  // User and subscription are inside data object
  const user = responseData.data?.user || responseData.user
  const subscription = responseData.data?.subscription || responseData.subscription
  
  console.log('[Auth] Signup response - token:', token ? 'received' : 'MISSING')
  console.log('[Auth] Signup response - user:', user ? user.email : 'MISSING')
  
  if (token) {
    Cookies.set('token', token, { expires: 7 })
    console.log('[Auth] Token saved to cookie')
  } else {
    console.error('[Auth] No token received from backend!')
  }
  
  return { user, subscription, token }
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
