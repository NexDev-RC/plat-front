import { cookies } from 'next/headers'
import { createAuthClient } from './api-client'
import type { ApiResponse, PaginatedResponse } from '@/types'

/**
 * Devuelve un cliente Axios con el JWT de la cookie del servidor.
 * Usar SOLO en Server Components / Route Handlers.
 */
export async function getServerClient() {
  const cookieStore = await cookies()
  const token = cookieStore.get('access_token')?.value ?? ''
  return createAuthClient(token)
}

/**
 * Helper: llamada GET autenticada desde el servidor.
 * Extrae automáticamente data.data del wrapper { statusCode, data }.
 */
export async function serverGet<T>(path: string): Promise<T> {
  const client = await getServerClient()
  const { data } = await client.get<ApiResponse<T>>(path)
  return data.data
}

/**
 * Helper: llamada GET paginada autenticada desde el servidor.
 */
export async function serverGetPaginated<T>(
  path: string,
  params?: Record<string, unknown>
): Promise<PaginatedResponse<T>> {
  const client = await getServerClient()
  const { data } = await client.get<ApiResponse<PaginatedResponse<T>>>(path, { params })
  return data.data
}
