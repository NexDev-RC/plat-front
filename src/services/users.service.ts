import apiClient from '@/lib/api-client'
import type { User, ApiResponse, PaginatedResponse } from '@/types'

export interface UpdateProfilePayload {
  name?: string
  avatarUrl?: string
  bio?: string
}

/** GET /api/users — solo admin */
export async function getUsers(page = 1, limit = 20): Promise<PaginatedResponse<User>> {
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

/** DELETE /api/users/:id — solo admin */
export async function deleteUser(userId: string): Promise<void> {
  await apiClient.delete(`/users/${userId}`)
}
