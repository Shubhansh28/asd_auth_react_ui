import { messageForStatus } from '../utils/auth'

const API_URL = (import.meta.env.VITE_API_URL || 'https://user-login-auth-9q25.onrender.com').replace(/\/+$/, '')

function apiError(response, data, fallback) {
  const error = new Error(data.message || messageForStatus(response.status, fallback))
  error.status = response.status
  return error
}

async function request(path, options = {}) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 30000)

  try {
    const response = await fetch(`${API_URL}${path}`, {
      ...options,
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', ...options.headers },
      signal: controller.signal,
    })
    const data = await response.json().catch(() => ({}))
    if (!response.ok) throw apiError(response, data, 'Unable to complete that request.')
    return data
  } catch (error) {
    if (error.name === 'AbortError') throw new Error('The server took too long to respond. Please try again in a moment.')
    if (error instanceof TypeError) throw new Error('The server cannot be reached from this website. Please try again later.')
    throw error
  } finally {
    clearTimeout(timeout)
  }
}

export async function getCurrentUser() {
  try {
    const data = await request('/me', { method: 'GET' })
    return data.user || null
  } catch (error) {
    if (error.status === 401) return null
    throw error
  }
}

export async function login(credentials) {
  try {
    const data = await request('/login', { method: 'POST', body: JSON.stringify(credentials) })
    return data.user || getCurrentUser()
  } catch (error) {
    if (error.status === 401) throw new Error('Your username or password is incorrect.')
    throw error
  }
}

export const signup = (credentials) => request('/signup', { method: 'POST', body: JSON.stringify(credentials) })

export async function logout() {
  try {
    await request('/logout', { method: 'POST' })
  } catch (error) {
    if (error.status !== 401) throw error
  }
}
