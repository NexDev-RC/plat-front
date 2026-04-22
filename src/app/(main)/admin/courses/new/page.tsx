import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { serverGet } from '@/lib/server-client'
import { CourseForm } from '@/components/admin/CourseForm'
import type { Category } from '@/types'

export const metadata = { title: 'Crear nuevo curso — Admin' }

export default async function AdminNewCoursePage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('access_token')?.value
  if (!token) redirect('/login')

  let categories: Category[] = []
  try { categories = await serverGet<Category[]>('/categories') } catch {}

  return (
    <div className="container-page section-padding max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Crear nuevo curso</h1>
        <p className="mt-1 text-gray-500">Completa la información del curso</p>
      </div>
      <CourseForm categories={categories} redirectOnSuccess="/admin" />
    </div>
  )
}
