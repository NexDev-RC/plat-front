import apiClient from '@/lib/api-client'
import type { Enrollment, ApiResponse } from '@/types'

/** GET /api/enrollments/me */
export async function getMyEnrollments(): Promise<Enrollment[]> {
  const { data } = await apiClient.get<ApiResponse<Enrollment[]>>('/enrollments/me')
  return data.data
}

/** GET /api/enrollments/:courseId */
export async function getCourseProgress(courseId: string): Promise<Enrollment> {
  const { data } = await apiClient.get<ApiResponse<Enrollment>>(`/enrollments/${courseId}`)
  return data.data
}

/** POST /api/enrollments */
export async function enrollInCourse(courseId: string): Promise<Enrollment> {
  const { data } = await apiClient.post<ApiResponse<Enrollment>>('/enrollments', { courseId })
  return data.data
}

/** POST /api/enrollments/:courseId/complete-lesson */
export async function completeLesson(
  courseId: string,
  lessonId: string
): Promise<{ progress: number; completedLessons: string[] }> {
  const { data } = await apiClient.post<ApiResponse<{ progress: number; completedLessons: string[] }>>(
    `/enrollments/${courseId}/complete-lesson`,
    { lessonId }
  )
  return data.data
}
