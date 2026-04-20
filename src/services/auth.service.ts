import apiClient from '@/lib/api-client'
import type { User, ApiResponse } from '@/types'

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  name: string
  email: string
  password: string
  role?: 'student' | 'instructor'
}

export interface AuthResponse {
  user: User
  access_token: string
}

/** POST /api/auth/login */
export async function login(payload: LoginPayload): Promise<AuthResponse> {
  const { data } = await apiClient.post<ApiResponse<AuthResponse>>('/auth/login', payload)
  return data.data
}

/** POST /api/auth/register */
export async function register(payload: RegisterPayload): Promise<AuthResponse> {
  const { data } = await apiClient.post<ApiResponse<AuthResponse>>('/auth/register', payload)
  return data.data
}

/** GET /api/auth/me */
export async function getMe(): Promise<User> {
  const { data } = await apiClient.get<ApiResponse<User>>('/auth/me')
  return data.data
}

/** POST /api/auth/logout */
export async function logoutApi(): Promise<void> {
  await apiClient.post('/auth/logout')
}
