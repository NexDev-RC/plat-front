import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { serverGetPaginated, serverGet } from '@/lib/server-client'
import { AdminDashboard } from '@/components/admin/AdminDashboard'
import type { User, Course, PaginatedResponse } from '@/types'

export const metadata = { title: 'Panel de administración — EduFlow' }

export default async function AdminPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('access_token')?.value
  if (!token) redirect('/login?redirect=/admin')

  const [usersResult, coursesResult] = await Promise.allSettled([
    serverGetPaginated<User>('/users', { page: 1, limit: 200 }),
    // manage/my devuelve TODOS los cursos del instructor/admin (publicados Y borradores)
    serverGet<Course[]>('/courses/manage/my'),
  ])

  const usersData = usersResult.status === 'fulfilled'
    ? usersResult.value
    : { data: [] as User[], total: 0, page: 1, limit: 200, totalPages: 1 }

  const allCourses = coursesResult.status === 'fulfilled'
    ? coursesResult.value
    : [] as Course[]

  return (
    <AdminDashboard
      initialUsers={usersData.data}
      initialCourses={allCourses}
      usersTotal={usersData.total}
      coursesTotal={allCourses.length}
    />
  )
}
