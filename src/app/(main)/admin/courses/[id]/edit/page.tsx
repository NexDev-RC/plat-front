import { redirect, notFound } from 'next/navigation'
import { cookies } from 'next/headers'
import { serverGet } from '@/lib/server-client'
import { CourseForm } from '@/components/admin/CourseForm'
import type { Course, Category } from '@/types'

interface Props { params: Promise<{ id: string }> }

export const metadata = { title: 'Editar curso — Admin' }

export default async function AdminEditCoursePage({ params }: Props) {
  const cookieStore = await cookies()
  const token = cookieStore.get('access_token')?.value
  if (!token) redirect('/login')

  const { id } = await params

  let course: Course | null = null
  let categories: Category[] = []

  try {
    ;[course, categories] = await Promise.all([
      serverGet<Course>(`/courses/manage/${id}`),
      serverGet<Category[]>('/categories'),
    ])
  } catch {
    notFound()
  }

  if (!course) notFound()

  return (
    <div className="container-page section-padding max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Editar curso</h1>
        <p className="mt-1 text-sm text-gray-500 line-clamp-1">{course.title}</p>
      </div>
      <CourseForm categories={categories} course={course} redirectOnSuccess="/admin" />
    </div>
  )
}
