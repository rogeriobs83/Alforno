const apiBaseUrl =
  import.meta.env.MODE === 'development'
    ? 'http://localhost:3001'
    : import.meta.env.VITE_API_URL.replace(/\/$/, '')
