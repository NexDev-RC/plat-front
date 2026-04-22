'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Pencil, Trash2, Eye, EyeOff, ExternalLink, Search, BookOpen } from 'lucide-react'
import { deleteCourse, togglePublishCourse } from '@/services/courses.service'
import { formatPrice } from '@/lib/utils'
import { LevelBadge } from '@/components/ui/Badge'
import type { Course } from '@/types'

const LEVEL_LABELS: Record<string, string> = {
  beginner:     'Principiante',
  intermediate: 'Intermedio',
  advanced:     'Avanzado',
}

export function AdminCoursesPanel({ initialCourses }: { initialCourses: Course[] }) {
  const router               = useRouter()
  const [courses, setCourses] = useState<Course[]>(initialCourses)
  const [loading, setLoading] = useState<string | null>(null)
  const [error,   setError]   = useState('')
  const [search,  setSearch]  = useState('')
  const [filter,  setFilter]  = useState<'all' | 'published' | 'draft'>('all')

  // ── Filtrado local ──────────────────────────────────────────────────────────
  const filtered = courses.filter((c) => {
    const matchSearch = !search || c.title.toLowerCase().includes(search.toLowerCase())
    const matchFilter =
      filter === 'all' ||
      (filter === 'published' && c.isPublished) ||
      (filter === 'draft' && !c.isPublished)
    return matchSearch && matchFilter
  })

  // ── Publicar / despublicar ──────────────────────────────────────────────────
  async function handleToggle(courseId: string) {
    setLoading(courseId)
    setError('')
    try {
      const { isPublished } = await togglePublishCourse(courseId)
      setCourses((prev) => prev.map((c) => c.id === courseId ? { ...c, isPublished } : c))
    } catch (err: any) {
      setError(err?.message ?? 'Error al cambiar el estado del curso')
    } finally {
      setLoading(null)
    }
  }

  // ── Eliminar ────────────────────────────────────────────────────────────────
  async function handleDelete(course: Course) {
    if (!confirm(`¿Eliminar el curso "${course.title}"?\nEsta acción no se puede deshacer.`)) return
    setLoading(course.id)
    setError('')
    try {
      await deleteCourse(course.id)
      setCourses((prev) => prev.filter((c) => c.id !== course.id))
    } catch (err: any) {
      setError(err?.message ?? 'Error al eliminar el curso')
      setLoading(null)
    }
  }

  const published = courses.filter((c) => c.isPublished).length
  const drafts    = courses.filter((c) => !c.isPublished).length

  return (
    <div>
      {error && (
        <p className="mb-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600 dark:bg-red-950 dark:text-red-400">{error}</p>
      )}

      {/* Filtros rápidos */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar curso..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-primary-400 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
          />
        </div>
        <div className="flex gap-1.5">
          {[
            { id: 'all',       label: `Todos (${courses.length})` },
            { id: 'published', label: `Publicados (${published})` },
            { id: 'draft',     label: `Borradores (${drafts})` },
          ].map((f) => (
            <button key={f.id}
              onClick={() => setFilter(f.id as any)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                filter === f.id
                  ? 'bg-primary-600 text-white'
                  : 'border border-gray-300 text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800'
              }`}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tabla */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center rounded-xl border border-dashed border-gray-300 py-16 text-center dark:border-gray-700">
          <BookOpen className="h-10 w-10 text-gray-300 dark:text-gray-600" />
          <p className="mt-3 font-medium text-gray-500">No hay cursos que mostrar</p>
          <Link href="/admin/courses/new"
            className="mt-4 text-sm text-primary-600 hover:underline">
            Crear el primer curso
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-900/60">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-400">Curso</th>
                <th className="hidden px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-400 sm:table-cell">Nivel</th>
                <th className="hidden px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-400 md:table-cell">Precio</th>
                <th className="hidden px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-400 lg:table-cell">Estado</th>
                <th className="hidden px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-400 xl:table-cell">Estudiantes</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600 dark:text-gray-400">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white dark:divide-gray-800 dark:bg-gray-950">
              {filtered.map((course) => (
                <tr key={course.id}
                  className={`${loading === course.id ? 'opacity-40 pointer-events-none' : 'hover:bg-gray-50 dark:hover:bg-gray-900/40'}`}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative h-12 w-20 shrink-0 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
                        {course.thumbnailUrl ? (
                          <Image src={course.thumbnailUrl} alt={course.title} fill className="object-cover" />
                        ) : (
                          <div className="flex h-full items-center justify-center text-lg">📚</div>
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
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      course.isPublished
                        ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                        : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                    }`}>
                      {course.isPublished ? 'Publicado' : 'Borrador'}
                    </span>
                  </td>
                  <td className="hidden px-4 py-3 text-gray-500 dark:text-gray-400 xl:table-cell">
                    {(course.totalStudents ?? 0).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      {/* Ver en catálogo */}
                      <Link href={`/courses/${course.slug}`} target="_blank"
                        className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-200"
                        title="Ver en catálogo">
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                      {/* Publicar / Despublicar */}
                      <button onClick={() => handleToggle(course.id)} disabled={!!loading}
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
                        className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-primary-600 dark:hover:bg-gray-800 dark:hover:text-primary-400"
                        title="Editar">
                        <Pencil className="h-4 w-4" />
                      </Link>
                      {/* Eliminar */}
                      <button onClick={() => handleDelete(course)} disabled={!!loading}
                        title="Eliminar"
                        className="rounded-md p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950 dark:hover:text-red-400 disabled:opacity-40">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="border-t border-gray-100 bg-gray-50 px-4 py-2 text-right text-xs text-gray-400 dark:border-gray-800 dark:bg-gray-900">
            {filtered.length} de {courses.length} cursos
          </div>
        </div>
      )}
    </div>
  )
}
