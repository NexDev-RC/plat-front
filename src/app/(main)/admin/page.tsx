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
    serverGetPaginated<Course>('/courses', { limit: 200, sortBy: 'newest' }),
  ])

  const usersData   = usersResult.status   === 'fulfilled'
    ? usersResult.value
    : { data: [] as User[],   total: 0, page: 1, limit: 200, totalPages: 1 }

  const coursesData = coursesResult.status === 'fulfilled'
    ? coursesResult.value
    : { data: [] as Course[], total: 0, page: 1, limit: 200, totalPages: 1 }

  return (
    <AdminDashboard
      initialUsers={usersData.data}
      initialCourses={coursesData.data}
      usersTotal={usersData.total}
      coursesTotal={coursesData.total}
    />
  )
}
