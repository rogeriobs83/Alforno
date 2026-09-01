const apiBaseUrl =
  import.meta.env.MODE === 'development'
    ? 'http://localhost:3001'
    : import.meta.env.VITE_API_URL.replace(/\/$/, '')

export const apiFetch = (path, options = {}) => {
  return fetch(`${apiBaseUrl}${path}`, { credentials: 'include', ...options })
}
