import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { Users, BookOpen, Plus } from 'lucide-react'
import { getUsers } from '@/services/users.service'
import { getCourses } from '@/services/courses.service'
import { AdminUsersTable } from '@/components/admin/AdminUsersTable'
import { AdminCoursesTable } from '@/components/admin/AdminCoursesTable'

export const metadata = { title: 'Panel de administración' }

export default async function AdminPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('access_token')?.value
  if (!token) redirect('/login?redirect=/admin')

  const [usersResult, coursesResult] = await Promise.allSettled([
    getUsers(1, 100),
    getCourses({ limit: 100 }),
  ])

  const usersData   = usersResult.status   === 'fulfilled' ? usersResult.value   : { data: [], total: 0 }
  const coursesData = coursesResult.status === 'fulfilled' ? coursesResult.value : { data: [], total: 0 }

  return (
    <div className="container-page section-padding">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Panel de administración</h1>
        <p className="mt-1 text-gray-500 dark:text-gray-400">Gestión completa de la plataforma</p>
      </div>

      {/* Stats */}
      <div className="mb-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: 'Usuarios totales',  value: usersData.total,   icon: Users },
          { label: 'Estudiantes',       value: usersData.data.filter((u) => u.role === 'student').length,    icon: Users },
          { label: 'Instructores',      value: usersData.data.filter((u) => u.role === 'instructor').length, icon: Users },
          { label: 'Cursos publicados', value: coursesData.total, icon: BookOpen },
        ].map((stat) => (
          <div key={stat.label} className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100 text-primary-600 dark:bg-primary-900 dark:text-primary-300">
              <stat.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{stat.value}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Sección de cursos */}
      <section className="mb-12">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Gestión de cursos</h2>
          <Link href="/admin/courses/new"
            className="flex items-center gap-1.5 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700">
            <Plus className="h-4 w-4" /> Nuevo curso
          </Link>
        </div>
        <AdminCoursesTable initialCourses={coursesData.data} />
      </section>

      {/* Sección de usuarios */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">Gestión de usuarios</h2>
        <AdminUsersTable initialUsers={usersData.data} />
      </section>
    </div>
  )
}
