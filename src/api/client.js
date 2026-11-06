import { messageForStatus } from '../utils/auth'

export const API_URL = (import.meta.env.VITE_API_URL || 'https://user-login-auth-9q25.onrender.com').replace(/\/+$/, '')

function navigateTo(path) {
  if (window.location.pathname !== path) window.location.assign(path)
}

function apiError(response, data, fallback) {
  const error = new Error(messageForStatus(response.status, data.message || fallback))
  error.status = response.status
  return error
}

/**
 * The backend session is an HttpOnly cookie. Every API request therefore uses
 * `credentials: 'include'`; no token is read or stored in browser JavaScript.
 */
export async function request(path, options = {}, { redirectOnUnauthorized = false, redirectOnForbiddenTo } = {}) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 15000)

  try {
    const response = await fetch(`${API_URL}${path}`, {
      ...options,
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', ...options.headers },
      signal: controller.signal,
    })
    const data = await response.json().catch(() => ({}))

    if (!response.ok) {
      const error = apiError(response, data, 'Unable to complete that request.')
      if (response.status === 401 && redirectOnUnauthorized) navigateTo('/auth')
      if (response.status === 403 && redirectOnForbiddenTo) navigateTo(redirectOnForbiddenTo)
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
