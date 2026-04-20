import axios, { AxiosError } from 'axios'

const apiClient = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL}/api`,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
})

// ── Request: adjunta JWT desde localStorage ───────────────────────────────────
apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('access_token')
    if (token) config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// ── Response: manejo global de errores ───────────────────────────────────────
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message: string }>) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('access_token')
        window.location.href = '/login'
      }
    }
    // Re-lanzar con el mensaje del backend si existe
    const message = error.response?.data?.message ?? error.message
    return Promise.reject(new Error(message))
  }
)

export default apiClient
