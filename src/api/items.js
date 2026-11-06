import { request } from './client'

const authenticated = { redirectOnUnauthorized: true }

export const getItems = () => request('/items', { method: 'GET' }, authenticated)
export const createItem = (item) => request('/items', { method: 'POST', body: JSON.stringify(item) }, authenticated)
export const updateItem = (id, changes) => request(`/items/${id}`, { method: 'PATCH', body: JSON.stringify(changes) }, authenticated)
export const updateItemStatus = (id, status) => request(`/items/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }, authenticated)
export const deleteItem = (id) => request(`/items/${id}`, { method: 'DELETE' }, authenticated)
