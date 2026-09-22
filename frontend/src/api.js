const apiBaseUrl =
  import.meta.env.MODE === 'development'
    // relative path so the Vite dev server proxy forwards it (works over LAN/mobile too)
    ? ''
    : import.meta.env.VITE_API_URL.replace(/\/$/, '')

export const apiFetch = (path, options = {}) => {
  return fetch(apiBaseUrl + path, {
    ...options,
    credentials: 'include'
  })
}
