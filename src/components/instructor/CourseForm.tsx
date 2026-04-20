'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { createCourse, updateCourse } from '@/services/courses.service'
import type { Category, Course } from '@/types'

interface Props {
  categories: Category[]
  course?: Course   // si viene, es modo edición
}

export function CourseForm({ categories, course }: Props) {
  const router  = useRouter()
  const isEdit  = !!course

  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  // Campos del curso
  const [title, setTitle]               = useState(course?.title ?? '')
  const [description, setDescription]   = useState(course?.description ?? '')
  const [shortDesc, setShortDesc]       = useState(course?.shortDescription ?? '')
  const [thumbnailUrl, setThumbnailUrl] = useState(course?.thumbnailUrl ?? '')
  const [price, setPrice]               = useState(String(course?.price ?? 0))
  const [discountPrice, setDiscountPrice] = useState(String(course?.discountPrice ?? ''))
  const [level, setLevel]               = useState<'beginner' | 'intermediate' | 'advanced'>(course?.level ?? 'beginner')
  const [language, setLanguage]         = useState(course?.language ?? 'Español')
  const [categoryId, setCategoryId]     = useState(course?.category?.id ?? '')
  const [tags, setTags]                 = useState(course?.tags?.join(', ') ?? '')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!categoryId) { setError('Selecciona una categoría'); return }

    setLoading(true)
    try {
      const payload = {
        title,
        description,
        shortDescription: shortDesc,
        thumbnailUrl: thumbnailUrl || undefined,
        price: Number(price),
        discountPrice: discountPrice ? Number(discountPrice) : undefined,
        level,
        language,
        categoryId,
        tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
      }

      if (isEdit) {
        await updateCourse(course!.id, payload)
      } else {
        await createCourse(payload)
      }

      router.push('/instructor/courses')
      router.refresh()
    } catch (err: any) {
      setError(err?.message ?? 'Error al guardar el curso')
    } finally {
      setLoading(false)
    }
  }

  const inputClass = 'w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100'
  const labelClass = 'mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300'

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-950 dark:text-red-400">{error}</p>
      )}

      {/* Información básica */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        <h2 className="mb-4 font-semibold text-gray-900 dark:text-gray-100">Información básica</h2>
        <div className="space-y-4">
          <div>
            <label className={labelClass}>Título del curso *</label>
            <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: React y Next.js 15: Desarrollo Web Moderno" className={inputClass} />
          </div>

          <div>
            <label className={labelClass}>Descripción corta *</label>
            <input type="text" required value={shortDesc} onChange={(e) => setShortDesc(e.target.value)}
              placeholder="Una frase que describa el valor del curso" className={inputClass} />
          </div>

          <div>
            <label className={labelClass}>Descripción completa *</label>
            <textarea required rows={4} value={description} onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe en detalle lo que aprenderán los estudiantes..."
              className={`${inputClass} resize-none`} />
          </div>

          <div>
            <label className={labelClass}>URL de la imagen de portada</label>
            <input type="url" value={thumbnailUrl} onChange={(e) => setThumbnailUrl(e.target.value)}
              placeholder="https://..." className={inputClass} />
          </div>

          <div>
            <label className={labelClass}>Tags (separados por coma)</label>
            <input type="text" value={tags} onChange={(e) => setTags(e.target.value)}
              placeholder="React, TypeScript, Next.js, Tailwind..." className={inputClass} />
          </div>
        </div>
      </div>

      {/* Precio y nivel */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        <h2 className="mb-4 font-semibold text-gray-900 dark:text-gray-100">Precio y configuración</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Precio (USD) *</label>
            <input type="number" required min="0" step="0.01" value={price}
              onChange={(e) => setPrice(e.target.value)} className={inputClass} />
          </div>

          <div>
            <label className={labelClass}>Precio con descuento (USD)</label>
            <input type="number" min="0" step="0.01" value={discountPrice}
              onChange={(e) => setDiscountPrice(e.target.value)}
              placeholder="Dejar vacío si no aplica" className={inputClass} />
          </div>

          <div>
            <label className={labelClass}>Nivel *</label>
            <select value={level} onChange={(e) => setLevel(e.target.value as any)} className={inputClass}>
              <option value="beginner">Principiante</option>
              <option value="intermediate">Intermedio</option>
              <option value="advanced">Avanzado</option>
            </select>
          </div>

          <div>
            <label className={labelClass}>Idioma *</label>
            <input type="text" value={language} onChange={(e) => setLanguage(e.target.value)} className={inputClass} />
          </div>

          <div className="sm:col-span-2">
            <label className={labelClass}>Categoría *</label>
            <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className={inputClass}>
              <option value="">Seleccionar categoría...</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Acciones */}
      <div className="flex items-center justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => router.back()}>Cancelar</Button>
        <Button type="submit" loading={loading}>
          {isEdit ? 'Guardar cambios' : 'Crear curso'}
        </Button>
      </div>
    </form>
  )
}
