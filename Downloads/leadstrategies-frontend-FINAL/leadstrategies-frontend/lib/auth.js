import api from './api'
import Cookies from 'js-cookie'

export async function login(email, password) {
  const response = await api.post('/api/auth/login', { email, password })
  const { token, user, subscription } = response.data
  
  Cookies.set('token', token, { expires: 7 })
  
  return { user, subscription, token }
}

export async function signup(userData) {
  const response = await api.post('/api/auth/signup', userData)
  const { token, user, subscription } = response.data
  
  Cookies.set('token', token, { expires: 7 })
  
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
    return response.data
  } catch (error) {
    return null
  }
}


