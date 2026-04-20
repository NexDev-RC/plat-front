import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import Link from 'next/link'
import Image from 'next/image'
import { Plus, Eye, EyeOff, Pencil, Trash2 } from 'lucide-react'
import { getMyCourses } from '@/services/courses.service'
import { InstructorCourseActions } from '@/components/instructor/InstructorCourseActions'
import { formatPrice } from '@/lib/utils'

export const metadata = { title: 'Mis cursos — Instructor' }

export default async function InstructorCoursesPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('access_token')?.value
  if (!token) redirect('/login?redirect=/instructor/courses')

  let courses: any[] = []
  try {
    courses = await getMyCourses()
  } catch {
    redirect('/dashboard')
  }

  return (
    <div className="container-page section-padding">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Mis cursos</h1>
          <p className="mt-1 text-gray-500 dark:text-gray-400">Gestiona tus cursos publicados y borradores</p>
        </div>
        <Link
          href="/instructor/courses/new"
          className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-700"
        >
          <Plus className="h-4 w-4" /> Nuevo curso
        </Link>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-3 gap-4">
        {[
          { label: 'Total cursos',    value: courses.length },
          { label: 'Publicados',      value: courses.filter((c) => c.is_published ?? c.isPublished).length },
          { label: 'Borradores',      value: courses.filter((c) => !(c.is_published ?? c.isPublished)).length },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{s.value}</p>
            <p className="text-xs text-gray-500">{s.label}</p>
          </div>
        ))}
      </div>

      {courses.length === 0 ? (
        <div className="flex flex-col items-center rounded-2xl border border-dashed border-gray-300 py-20 text-center dark:border-gray-700">
          <span className="text-5xl">📝</span>
          <h2 className="mt-4 text-lg font-semibold text-gray-700 dark:text-gray-300">Aún no tienes cursos</h2>
          <p className="mt-2 text-gray-500">Crea tu primer curso y comparte tu conocimiento</p>
          <Link href="/instructor/courses/new" className="mt-5 flex items-center gap-2 rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-700">
            <Plus className="h-4 w-4" /> Crear mi primer curso
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-400">Curso</th>
                <th className="hidden px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-400 sm:table-cell">Estado</th>
                <th className="hidden px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-400 md:table-cell">Precio</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600 dark:text-gray-400">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-800 dark:bg-gray-950">
              {courses.map((course) => {
                const isPublished = course.is_published ?? course.isPublished
                return (
                  <tr key={course.id}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative h-12 w-20 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                          {course.thumbnail_url ?? course.thumbnailUrl ? (
                            <Image
                              src={course.thumbnail_url ?? course.thumbnailUrl}
                              alt={course.title}
                              fill className="object-cover"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-xl">📚</div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 dark:text-gray-100 line-clamp-1">{course.title}</p>
                          <p className="text-xs text-gray-500">
                            {course.total_lessons ?? course.totalLessons ?? 0} lecciones
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="hidden px-4 py-3 sm:table-cell">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
                        isPublished
                          ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                          : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                      }`}>
                        {isPublished ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                        {isPublished ? 'Publicado' : 'Borrador'}
                      </span>
                    </td>
                    <td className="hidden px-4 py-3 text-gray-700 dark:text-gray-300 md:table-cell">
                      {formatPrice(course.price)}
                    </td>
                    <td className="px-4 py-3">
                      {/* Acciones client-side (publicar/eliminar) */}
                      <InstructorCourseActions
                        courseId={course.id}
                        isPublished={isPublished}
                        editHref={`/instructor/courses/${course.id}/edit`}
                      />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
