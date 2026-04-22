import axios, { AxiosError } from 'axios'

/**
 * Determina la URL base correcta según el contexto:
 * - Servidor (SSR): llama directamente al backend NestJS
 * - Cliente (browser): usa la URL del backend directamente también
 *   (evitamos el proxy de Next.js para no tener colisión de rutas)
 */
function getBaseURL(): string {
  const backendUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'
  return `${backendUrl}/api`
}

const apiClient = axios.create({
  baseURL: getBaseURL(),
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

// ── Request: adjunta JWT desde localStorage (solo en cliente) ─────────────────
apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  }
  return config
})

// ── Response: manejo global de errores ────────────────────────────────────────
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message: string; statusCode?: number }>) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('access_token')
      window.location.href = '/login'
    }
    const message =
      error.response?.data?.message ??
      error.message ??
      'Error de conexión con el servidor'
    return Promise.reject(new Error(String(message)))
  }
)

export default apiClient

/**
 * Crea un cliente autenticado con un token específico.
 * Usado en Server Components para pasar el token desde la cookie.
 */
export function createAuthClient(token: string) {
  const client = axios.create({
    baseURL: getBaseURL(),
    timeout: 15000,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  })

  client.interceptors.response.use(
    (response) => response,
    (error: AxiosError<{ message: string }>) => {
      const message = error.response?.data?.message ?? error.message
      return Promise.reject(new Error(String(message)))
    }
  )

  return client
}
