import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { Users, BookOpen, Plus, GraduationCap, UserCog } from 'lucide-react'
import { getUsers } from '@/services/users.service'
import { getMyCourses } from '@/services/courses.service'
import { AdminUsersTable } from '@/components/admin/AdminUsersTable'
import { AdminCoursesTable } from '@/components/admin/AdminCoursesTable'

export const metadata = { title: 'Panel de administración — EduFlow' }

export default async function AdminPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('access_token')?.value
  if (!token) redirect('/login?redirect=/admin')

  const [usersResult, coursesResult] = await Promise.allSettled([
    getUsers(1, 100),
    getMyCourses(),   // admin usa endpoint manage/my — trae todos los cursos suyos
  ])

  const usersData   = usersResult.status   === 'fulfilled' ? usersResult.value          : { data: [], total: 0 }
  const coursesData = coursesResult.status === 'fulfilled' ? coursesResult.value        : []

  const students    = usersData.data.filter((u) => u.role === 'student')
  const instructors = usersData.data.filter((u) => u.role === 'instructor')
  const published   = Array.isArray(coursesData) ? coursesData.filter((c: any) => c.isPublished || c.is_published) : []

  return (
    <div className="container-page section-padding">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Panel de administración</h1>
        <p className="mt-1 text-gray-500 dark:text-gray-400">Gestión completa de la plataforma EduFlow</p>
      </div>

      {/* Stats */}
      <div className="mb-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: 'Usuarios totales',  value: usersData.total,     icon: Users,       color: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300' },
          { label: 'Estudiantes',       value: students.length,     icon: GraduationCap, color: 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300' },
          { label: 'Instructores',      value: instructors.length,  icon: UserCog,     color: 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300' },
          { label: 'Cursos publicados', value: published.length,    icon: BookOpen,    color: 'bg-amber-100 text-amber-600 dark:bg-amber-900 dark:text-amber-300' },
        ].map((stat) => (
          <div key={stat.label} className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${stat.color}`}>
              <stat.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{stat.value}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Gestión de cursos */}
      <section className="mb-12">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Cursos</h2>
            <p className="text-sm text-gray-500">Crea, edita, publica o elimina cursos</p>
          </div>
          <Link href="/admin/courses/new"
            className="flex items-center gap-1.5 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 transition-colors">
            <Plus className="h-4 w-4" /> Nuevo curso
          </Link>
        </div>
        <AdminCoursesTable initialCourses={Array.isArray(coursesData) ? coursesData : []} />
      </section>

      {/* Gestión de usuarios */}
      <section>
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Usuarios</h2>
          <p className="text-sm text-gray-500">Cambia roles o elimina usuarios de la plataforma</p>
        </div>
        <AdminUsersTable initialUsers={usersData.data} />
      </section>
    </div>
  )
}
