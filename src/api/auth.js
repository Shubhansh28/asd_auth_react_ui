import { setToken, setUser } from '../utils/auth'

const API_URL = (import.meta.env.VITE_API_URL || 'https://user-login-auth-9q25.onrender.com').replace(/\/+$/, '')

async function request(path, body) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 30000)

  try {
    const response = await fetch(`${API_URL}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    })
    const data = await response.json().catch(() => ({}))

    if (!response.ok) throw new Error(data.message || 'Something went wrong. Please try again.')
    return data
  } catch (error) {
    if (error.name === 'AbortError') throw new Error('The server took too long to respond. Please try again in a moment.')
    if (error instanceof TypeError) throw new Error('The server cannot be reached from this website. Please contact the administrator.')
    throw error
  } finally {
    clearTimeout(timeout)
  }
}

export async function login(credentials) {
  const data = await request('/login', credentials)
  if (!data.token) throw new Error('The server did not return an authentication token.')
  setToken(data.token)
  if (data.user?.id && data.user?.username) setUser(data.user)
  return data
}

export async function signup(credentials) {
  return request('/signup', credentials)
}
