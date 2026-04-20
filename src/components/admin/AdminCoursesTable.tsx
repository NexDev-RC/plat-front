'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Pencil, Trash2, Eye, EyeOff, ExternalLink } from 'lucide-react'
import { deleteCourse, togglePublishCourse } from '@/services/courses.service'
import { formatPrice } from '@/lib/utils'
import { LevelBadge } from '@/components/ui/Badge'
import type { Course } from '@/types'

export function AdminCoursesTable({ initialCourses }: { initialCourses: Course[] }) {
  const router             = useRouter()
  const [courses, setCourses] = useState<Course[]>(initialCourses)
  const [loading, setLoading] = useState<string | null>(null)
  const [error,   setError]   = useState('')

  async function handleTogglePublish(courseId: string) {
    setLoading(courseId)
    setError('')
    try {
      const { isPublished } = await togglePublishCourse(courseId)
      setCourses((prev) =>
        prev.map((c) => (c.id === courseId ? { ...c, isPublished } : c))
      )
    } catch (err: any) {
      setError(err?.message ?? 'Error al cambiar estado del curso')
    } finally {
      setLoading(null)
    }
  }

  async function handleDelete(courseId: string, title: string) {
    if (!confirm(`¿Eliminar el curso "${title}"? Esta acción no se puede deshacer.`)) return
    setLoading(courseId)
    setError('')
    try {
      await deleteCourse(courseId)
      setCourses((prev) => prev.filter((c) => c.id !== courseId))
    } catch (err: any) {
      setError(err?.message ?? 'Error al eliminar el curso')
      setLoading(null)
    }
  }

  if (courses.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 py-12 text-center dark:border-gray-700">
        <p className="text-gray-500">No hay cursos publicados aún.</p>
        <Link href="/admin/courses/new" className="mt-3 inline-block text-sm text-primary-600 hover:underline">
          Crear el primer curso
        </Link>
      </div>
    )
  }

  return (
    <div>
      {error && (
        <p className="mb-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600 dark:bg-red-950 dark:text-red-400">{error}</p>
      )}
      <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-400">Curso</th>
              <th className="hidden px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-400 sm:table-cell">Nivel</th>
              <th className="hidden px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-400 md:table-cell">Precio</th>
              <th className="hidden px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-400 lg:table-cell">Estado</th>
              <th className="px-4 py-3 text-right font-medium text-gray-600 dark:text-gray-400">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-800 dark:bg-gray-950">
            {courses.map((course) => (
              <tr key={course.id} className={loading === course.id ? 'opacity-50 pointer-events-none' : ''}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="relative h-12 w-20 shrink-0 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
                      {course.thumbnailUrl ? (
                        <Image src={course.thumbnailUrl} alt={course.title} fill className="object-cover" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-xl">📚</div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 dark:text-gray-100 line-clamp-1">{course.title}</p>
                      <p className="text-xs text-gray-500">{course.instructor?.name}</p>
                    </div>
                  </div>
                </td>
                <td className="hidden px-4 py-3 sm:table-cell">
                  <LevelBadge level={course.level} />
                </td>
                <td className="hidden px-4 py-3 text-gray-700 dark:text-gray-300 md:table-cell">
                  {formatPrice(course.price, course.discountPrice)}
                </td>
                <td className="hidden px-4 py-3 lg:table-cell">
                  <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
                    course.isPublished
                      ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                      : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                  }`}>
                    {course.isPublished ? 'Publicado' : 'Borrador'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    {/* Ver en el catálogo */}
                    <Link href={`/courses/${course.slug}`} target="_blank"
                      className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800"
                      title="Ver curso">
                      <ExternalLink className="h-4 w-4" />
                    </Link>

                    {/* Publicar / despublicar */}
                    <button onClick={() => handleTogglePublish(course.id)} disabled={!!loading}
                      title={course.isPublished ? 'Despublicar' : 'Publicar'}
                      className={`rounded-md p-1.5 transition disabled:opacity-40 ${
                        course.isPublished
                          ? 'text-green-600 hover:bg-green-50 dark:hover:bg-green-950'
                          : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}>
                      {course.isPublished ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </button>

                    {/* Editar */}
                    <Link href={`/admin/courses/${course.id}/edit`}
                      className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-primary-600 dark:hover:bg-gray-800"
                      title="Editar">
                      <Pencil className="h-4 w-4" />
                    </Link>

                    {/* Eliminar */}
                    <button onClick={() => handleDelete(course.id, course.title)} disabled={!!loading}
                      title="Eliminar"
                      className="rounded-md p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950 disabled:opacity-40">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-right text-xs text-gray-400">{courses.length} cursos</p>
    </div>
  )
}
