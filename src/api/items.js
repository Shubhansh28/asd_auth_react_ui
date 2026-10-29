import { getToken } from '../utils/auth'

const API_URL = (import.meta.env.VITE_API_URL || 'https://user-login-auth-9q25.onrender.com').replace(/\/+$/, '')

async function request(path, options = {}) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 30000)

  try {
    const response = await fetch(`${API_URL}${path}`, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken()}`,
        ...options.headers,
      },
    })
    const data = await response.json().catch(() => ({}))
    if (!response.ok) throw new Error(data.message || 'Unable to reach your lost items right now.')
    return data
  } catch (error) {
    if (error.name === 'AbortError') throw new Error('The server took too long to respond. Please try again in a moment.')
    if (error instanceof TypeError) throw new Error('The server cannot be reached from this website. Please contact the administrator.')
    throw error
  } finally {
    clearTimeout(timeout)
  }
}

export const getItems = () => request('/items')

export const createItem = (item) => request('/items', {
  method: 'POST',
  body: JSON.stringify(item),
})
