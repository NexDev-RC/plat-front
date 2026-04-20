import apiClient from '@/lib/api-client'
import type { Category, ApiResponse } from '@/types'

/** GET /api/categories — público */
export async function getCategories(): Promise<Category[]> {
  const { data } = await apiClient.get<ApiResponse<Category[]>>('/categories')
  return data.data
}

/** POST /api/categories — solo admin */
export async function createCategory(name: string): Promise<Category> {
  const { data } = await apiClient.post<ApiResponse<Category>>('/categories', { name })
  return data.data
}

/** DELETE /api/categories/:id — solo admin */
export async function deleteCategory(id: string): Promise<void> {
  await apiClient.delete(`/categories/${id}`)
}
