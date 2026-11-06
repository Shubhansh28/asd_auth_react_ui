import { request } from './client'

const adminOptions = { redirectOnUnauthorized: true, redirectOnForbiddenTo: '/items' }

export const getUserOverview = () => request('/admin/users/overview', { method: 'GET' }, adminOptions)
export const getUserHistory = (userId) => request(`/admin/users/${userId}/history`, { method: 'GET' }, adminOptions)
export const updateUserRole = (userId, role) => request(`/admin/users/${userId}/role`, {
  method: 'PATCH',
  body: JSON.stringify({ role }),
}, adminOptions)
