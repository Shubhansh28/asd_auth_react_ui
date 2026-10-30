const TOKEN_KEY = 'token'
const USER_KEY = 'user'

export const getToken = () => localStorage.getItem(TOKEN_KEY)
export const setToken = (token) => localStorage.setItem(TOKEN_KEY, token)
export const getUser = () => {
  try { return JSON.parse(localStorage.getItem(USER_KEY)) } catch { return null }
}
export const setUser = (user) => localStorage.setItem(USER_KEY, JSON.stringify({ id: user.id, username: user.username }))
export const removeToken = () => {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}
export const isAuthenticated = () => Boolean(getToken())
