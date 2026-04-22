import apiClient from '@/lib/api-client'
import type { User, ApiResponse, PaginatedResponse } from '@/types'

export interface UpdateProfilePayload {
  name?: string
  avatarUrl?: string
  bio?: string
}

export interface CreateUserPayload {
  name: string
  email: string
  password: string
  role: 'student' | 'instructor' | 'admin'
}

/** GET /api/users — solo admin */
export async function getUsers(page = 1, limit = 50): Promise<PaginatedResponse<User>> {
  const { data } = await apiClient.get<ApiResponse<PaginatedResponse<User>>>('/users', {
    params: { page, limit },
  })
  return data.data
}

/** GET /api/users/me */
export async function getMyProfile(): Promise<User> {
  const { data } = await apiClient.get<ApiResponse<User>>('/users/me')
  return data.data
}

/** PATCH /api/users/me */
export async function updateMyProfile(payload: UpdateProfilePayload): Promise<User> {
  const { data } = await apiClient.patch<ApiResponse<User>>('/users/me', payload)
  return data.data
}

/** PATCH /api/users/:id/role — solo admin */
export async function updateUserRole(
  userId: string,
  role: 'student' | 'instructor' | 'admin'
): Promise<User> {
  const { data } = await apiClient.patch<ApiResponse<User>>(`/users/${userId}/role`, { role })
  return data.data
}

/** GET /api/users/:id — solo admin */
export async function getUserById(userId: string): Promise<User> {
  const { data } = await apiClient.get<ApiResponse<User>>(`/users/${userId}`)
  return data.data
}

/** DELETE /api/users/:id — solo admin */
export async function deleteUser(userId: string): Promise<void> {
  await apiClient.delete(`/users/${userId}`)
}

/**
 * Crear usuario: el admin usa el endpoint de registro con rol.
 * El backend /auth/register acepta el campo role.
 */
export async function createUserAsAdmin(payload: CreateUserPayload): Promise<User> {
  const { data } = await apiClient.post<ApiResponse<{ user: User; access_token: string }>>(
    '/auth/register',
    payload
  )
  return data.data.user
}
