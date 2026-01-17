import api from './api'
import Cookies from 'js-cookie'

export async function login(email, password) {
  const response = await api.post('/api/auth/login', { email, password })
  // Backend returns: { success: true, token, data: { user, subscription } }
  const data = response.data
  const token = data.token || data.data?.token
  const user = data.user || data.data?.user
  const subscription = data.subscription || data.data?.subscription
  
  if (token) {
    Cookies.set('token', token, { expires: 7 })
  }
  
  return { user, subscription, token }
}

export async function signup(userData) {
  const response = await api.post('/api/auth/signup', userData)
  // Backend returns: { success: true, token, data: { user, subscription } }
  const data = response.data
  const token = data.token || data.data?.token
  const user = data.user || data.data?.user
  const subscription = data.subscription || data.data?.subscription
  
  if (token) {
    Cookies.set('token', token, { expires: 7 })
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
    const response = await api.get('/api/auth/me')
    // Backend returns: { success: true, data: { user, tierLimits, tierFeatures } }
    const data = response.data
    return data.user || data.data?.user || data
  } catch (error) {
    return null
  }
}

export async function forgotPassword(email) {
  const response = await api.post('/api/auth/forgot-password', { email })
  return response.data
}

export async function resetPassword(token, newPassword) {
  const response = await api.post('/api/auth/reset-password', { token, password: newPassword })
  return response.data
}


