import { messageForStatus } from '../utils/auth'

const API_URL = (import.meta.env.VITE_API_URL || 'https://user-login-auth-9q25.onrender.com').replace(/\/+$/, '')

function redirectToLogin() {
  if (window.location.pathname !== '/auth') window.location.assign('/auth')
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

    if (!response.ok) {
      const error = new Error(messageForStatus(response.status, data.message || 'Unable to complete that request.'))
      error.status = response.status
      if (response.status === 401) redirectToLogin()
      throw error
    }
    return data
  } catch (error) {
    if (error.name === 'AbortError') throw new Error('The server took too long to respond. Please try again in a moment.')
    if (error instanceof TypeError) throw new Error('The server cannot be reached from this website. Please try again later.')
    throw error
  } finally {
    clearTimeout(timeout)
  }
}

export const getItems = () => request('/items')
export const createItem = (item) => request('/items', { method: 'POST', body: JSON.stringify(item) })
export const updateItem = (id, changes) => request(`/items/${id}`, { method: 'PATCH', body: JSON.stringify(changes) })
export const updateItemStatus = (id, status) => request(`/items/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) })
export const deleteItem = (id) => request(`/items/${id}`, { method: 'DELETE' })
