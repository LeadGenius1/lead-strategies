import { authAPI } from './api'

export const isAuthenticated = () => {
  if (typeof window === 'undefined') return false
  return !!localStorage.getItem('token')
}

export const getCurrentUser = () => {
  if (typeof window === 'undefined') return null
  const userStr = localStorage.getItem('user')
  if (!userStr) return null
  try {
    return JSON.parse(userStr)
  } catch {
    return null
  }
}

export const getToken = () => {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('token')
}

export const login = async (email, password) => {
  return await authAPI.login(email, password)
}

export const register = async (userData) => {
  return await authAPI.register(userData)
}

export const logout = async () => {
  await authAPI.logout()
  if (typeof window !== 'undefined') {
    window.location.href = '/login'
  }
}

