import { redirect, notFound } from 'next/navigation'
import { cookies } from 'next/headers'
import { getCourseAdmin } from '@/services/courses.service'
import { getCategories } from '@/services/categories.service'
import { CourseForm } from '@/components/admin/CourseForm'

interface Props { params: Promise<{ id: string }> }

export const metadata = { title: 'Editar curso' }

export default async function AdminEditCoursePage({ params }: Props) {
  const cookieStore = await cookies()
  const token = cookieStore.get('access_token')?.value
  if (!token) redirect('/login')

  const { id } = await params

  let course, categories
  try {
    ;[course, categories] = await Promise.all([getCourseAdmin(id), getCategories()])
  } catch {
    notFound()
  }

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
