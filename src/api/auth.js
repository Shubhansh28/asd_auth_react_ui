import { request } from './client'

export async function getCurrentUser() {
  try {
    const data = await request('/me', { method: 'GET' })
    return data.user || null
  } catch (error) {
    if (error.status === 401 || error.status === 403) return null
    throw error
  }
}

export async function login(credentials) {
  try {
    await request('/login', { method: 'POST', body: JSON.stringify(credentials) })
    // Login only returns a basic user. Fetch /me so role-based UI comes from
    // the authenticated backend session rather than the login response.
    const user = await getCurrentUser()
    if (!user) throw new Error('We could not confirm your session. Please log in again.')
    return user
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
