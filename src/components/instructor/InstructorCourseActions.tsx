'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Pencil, Trash2, Eye, EyeOff } from 'lucide-react'
import { togglePublishCourse, deleteCourse } from '@/services/courses.service'

interface Props {
  courseId: string
  isPublished: boolean
  editHref: string
}

export function InstructorCourseActions({ courseId, isPublished: initialPublished, editHref }: Props) {
  const router = useRouter()
  const [published, setPublished] = useState(initialPublished)
  const [loading, setLoading]     = useState(false)

  async function handleToggle() {
    setLoading(true)
    try {
      const result = await togglePublishCourse(courseId)
      setPublished(result.isPublished)
    } catch (err: any) {
      alert(err?.message ?? 'Error al cambiar estado')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete() {
    if (!confirm('¿Eliminar este curso? Esta acción no se puede deshacer.')) return
    setLoading(true)
    try {
      await deleteCourse(courseId)
      router.refresh()
    } catch (err: any) {
      alert(err?.message ?? 'Error al eliminar el curso')
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-end gap-1">
      {/* Publicar / despublicar */}
      <button
        onClick={handleToggle}
        disabled={loading}
        title={published ? 'Despublicar' : 'Publicar'}
        className={`rounded-md p-1.5 transition disabled:opacity-40 ${
          published
            ? 'text-green-600 hover:bg-green-50 dark:hover:bg-green-950'
            : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
        }`}
      >
        {published ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
      </button>

      {/* Editar */}
      <Link
        href={editHref}
        className="rounded-md p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-300"
        title="Editar curso"
      >
        <Pencil className="h-4 w-4" />
      </Link>

      {/* Eliminar */}
      <button
        onClick={handleDelete}
        disabled={loading}
        title="Eliminar curso"
        className="rounded-md p-1.5 text-gray-400 transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950 disabled:opacity-40"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  )
}
