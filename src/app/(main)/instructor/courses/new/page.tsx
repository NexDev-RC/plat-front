import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { getCategories } from '@/services/categories.service'
import { CourseForm } from '@/components/instructor/CourseForm'

export const metadata = { title: 'Crear nuevo curso' }

export default async function NewCoursePage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('access_token')?.value
  if (!token) redirect('/login')

  let categories = []
  try {
    categories = await getCategories()
  } catch {
    categories = []
  }

  return (
    <div className="container-page section-padding max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Crear nuevo curso</h1>
        <p className="mt-1 text-gray-500">Completa la información básica de tu curso</p>
      </div>
      <CourseForm categories={categories} />
    </div>
  )
}
