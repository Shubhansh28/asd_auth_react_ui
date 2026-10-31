export const isAuthenticated = (user) => Boolean(user?.id)

export function messageForStatus(status, fallback = 'Something went wrong. Please try again.') {
  const messages = {
    400: 'Please check the information you entered and try again.',
    401: 'Your session has expired. Please log in again.',
    403: 'You do not have permission to make this change.',
    404: 'This item could not be found. It may have been removed.',
    500: 'The server is having trouble right now. Please try again shortly.',
  }

  return messages[status] || fallback
}
