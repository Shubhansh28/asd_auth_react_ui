export const isAdmin = (user) => user?.role === 'admin'

// UI visibility improves clarity, while the backend remains the permission authority.
export const canManageOwnItem = (user, item) => Boolean(user?.id && item?.userId === user.id)
