import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { getUsers } from '@/services/users.service'
import { getCourses } from '@/services/courses.service'
import { AdminDashboard } from '@/components/admin/AdminDashboard'

export const metadata = { title: 'Panel de administración — EduFlow' }

export default async function AdminPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('access_token')?.value
  if (!token) redirect('/login?redirect=/admin')

  const [usersResult, coursesResult] = await Promise.allSettled([
    getUsers(1, 200),
    // El admin necesita ver todos los cursos (publicados y borradores)
    // Usamos getCourses con limite alto; en producción habría paginación server-side
    getCourses({ limit: 200, sortBy: 'newest' }),
  ])

  const usersData   = usersResult.status   === 'fulfilled' ? usersResult.value   : { data: [], total: 0, page: 1, limit: 200, totalPages: 1 }
  const coursesData = coursesResult.status === 'fulfilled' ? coursesResult.value : { data: [], total: 0, page: 1, limit: 200, totalPages: 1 }

  return (
    <AdminDashboard
      initialUsers={usersData.data}
      initialCourses={coursesData.data}
      usersTotal={usersData.total}
      coursesTotal={coursesData.total}
    />
  )
}
