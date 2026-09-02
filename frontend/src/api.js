const apiBaseUrl =
  import.meta.env.MODE === 'development'
    ? 'http://localhost:3000'
    : import.meta.env.VITE_API_URL.replace(/\/$/, '')

export const apiFetch = (path, options = {}) => {
  return fetch(apiBaseUrl + path, {
    ...options,
    credentials: 'include'
  })
}

