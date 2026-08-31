const apiBaseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:3001').replace(/\/$/, '')

export const apiFetch = (path, options = {}) =>
  fetch(`${apiBaseUrl}${path}`, { credentials: 'include', ...options })