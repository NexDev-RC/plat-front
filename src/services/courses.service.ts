import apiClient from '@/lib/api-client'
import type { Course, PaginatedResponse, CourseFilters, ApiResponse } from '@/types'

export interface CreateCoursePayload {
  title: string
  description: string
  shortDescription: string
  thumbnailUrl?: string
  previewVideoUrl?: string
  price: number
  discountPrice?: number
  level: 'beginner' | 'intermediate' | 'advanced'
  language: string
  categoryId: string
  tags?: string[]
  sections?: {
    title: string
    order: number
    lessons?: {
      title: string
      description?: string
      videoUrl?: string
      duration: number
      order: number
      isFree?: boolean
    }[]
  }[]
}

export type UpdateCoursePayload = Partial<CreateCoursePayload & { isPublished: boolean }>

/** GET /api/courses — catálogo público con filtros y paginación */
export async function getCourses(
  filters: CourseFilters = {}
): Promise<PaginatedResponse<Course>> {
  const { data } = await apiClient.get<ApiResponse<PaginatedResponse<Course>>>('/courses', {
    params: filters,
  })
  return data.data
}

/** GET /api/courses/featured — top 8 por rating */
export async function getFeaturedCourses(): Promise<Course[]> {
  const { data } = await apiClient.get<ApiResponse<Course[]>>('/courses/featured')
  return data.data
}

/** GET /api/courses/:slugOrId — detalle público */
export async function getCourseBySlug(slugOrId: string): Promise<Course> {
  const { data } = await apiClient.get<ApiResponse<Course>>(`/courses/${slugOrId}`)
  return data.data
}

/** GET /api/courses/manage/my — cursos del instructor autenticado */
export async function getMyCourses(): Promise<Course[]> {
  const { data } = await apiClient.get<ApiResponse<Course[]>>('/courses/manage/my')
  console.log(data.data)
  return data.data
}

/** GET /api/courses/manage/:id — admin/instructor, incluye no publicados */
export async function getCourseAdmin(id: string): Promise<Course> {
  const { data } = await apiClient.get<ApiResponse<Course>>(`/courses/manage/${id}`)
  return data.data
}

/** POST /api/courses */
export async function createCourse(payload: CreateCoursePayload): Promise<Course> {
  const { data } = await apiClient.post<ApiResponse<Course>>('/courses', payload)
  return data.data
}

/** PATCH /api/courses/:id */
export async function updateCourse(id: string, payload: UpdateCoursePayload): Promise<Course> {
  const { data } = await apiClient.patch<ApiResponse<Course>>(`/courses/${id}`, payload)
  return data.data
}

/** PATCH /api/courses/:id/publish — toggle publicado/borrador */
export async function togglePublishCourse(id: string): Promise<{ isPublished: boolean }> {
  const { data } = await apiClient.patch<ApiResponse<{ isPublished: boolean }>>(
    `/courses/${id}/publish`
  )
  return data.data
}

/** DELETE /api/courses/:id */
export async function deleteCourse(id: string): Promise<void> {
  await apiClient.delete(`/courses/${id}`)
}
