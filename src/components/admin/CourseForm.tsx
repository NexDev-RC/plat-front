'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, ChevronDown, ChevronUp, GripVertical } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { createCourse, updateCourse } from '@/services/courses.service'
import type { Category, Course } from '@/types'

interface LessonDraft {
  id:          string
  title:       string
  description: string
  videoUrl:    string
  duration:    number
  order:       number
  isFree:      boolean
}

interface SectionDraft {
  id:      string
  title:   string
  order:   number
  lessons: LessonDraft[]
}

function uid() {
  return Math.random().toString(36).slice(2)
}

interface Props {
  categories:        Category[]
  course?:           Course
  redirectOnSuccess: string
}

const inputClass = 'w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100'
const labelClass = 'mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300'

export function CourseForm({ categories, course, redirectOnSuccess }: Props) {
  const router = useRouter()
  const isEdit = !!course

  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  // ── Campos básicos ─────────────────────────────────────────────────────────
  const [title,         setTitle]         = useState(course?.title          ?? '')
  const [shortDesc,     setShortDesc]     = useState(course?.shortDescription ?? '')
  const [description,   setDescription]   = useState(course?.description    ?? '')
  const [thumbnailUrl,  setThumbnailUrl]  = useState(course?.thumbnailUrl   ?? '')
  const [previewUrl,    setPreviewUrl]    = useState(course?.previewVideoUrl ?? '')
  const [price,         setPrice]         = useState(String(course?.price   ?? 0))
  const [discountPrice, setDiscountPrice] = useState(course?.discountPrice != null ? String(course.discountPrice) : '')
  const [level,         setLevel]         = useState<'beginner'|'intermediate'|'advanced'>(course?.level ?? 'beginner')
  const [language,      setLanguage]      = useState(course?.language       ?? 'Español')
  const [categoryId,    setCategoryId]    = useState(course?.category?.id   ?? '')
  const [tags,          setTags]          = useState(course?.tags?.join(', ') ?? '')

  // ── Secciones y lecciones ──────────────────────────────────────────────────
  const [sections, setSections] = useState<SectionDraft[]>(() => {
    if (!course?.sections?.length) return []
    return course.sections
      .slice()
      .sort((a, b) => a.order - b.order)
      .map((s, si) => ({
        id:      s.id,
        title:   s.title,
        order:   s.order,
        lessons: s.lessons
          .slice()
          .sort((a, b) => a.order - b.order)
          .map((l, li) => ({
            id:          l.id,
            title:       l.title,
            description: l.description ?? '',
            videoUrl:    l.videoUrl    ?? '',
            duration:    l.duration,
            order:       l.order,
            isFree:      l.isFree,
          })),
      }))
  })

  const [expandedSection, setExpandedSection] = useState<string | null>(
    sections[0]?.id ?? null
  )

  // ── Secciones helpers ──────────────────────────────────────────────────────
  function addSection() {
    const id = uid()
    setSections((prev) => [...prev, { id, title: '', order: prev.length + 1, lessons: [] }])
    setExpandedSection(id)
  }

  function removeSection(id: string) {
    setSections((prev) => prev.filter((s) => s.id !== id).map((s, i) => ({ ...s, order: i + 1 })))
  }

  function updateSection(id: string, title: string) {
    setSections((prev) => prev.map((s) => s.id === id ? { ...s, title } : s))
  }

  // ── Lecciones helpers ──────────────────────────────────────────────────────
  function addLesson(sectionId: string) {
    setSections((prev) => prev.map((s) => {
      if (s.id !== sectionId) return s
      return {
        ...s,
        lessons: [...s.lessons, {
          id: uid(), title: '', description: '', videoUrl: '',
          duration: 0, order: s.lessons.length + 1, isFree: false,
        }],
      }
    }))
  }

  function removeLesson(sectionId: string, lessonId: string) {
    setSections((prev) => prev.map((s) => {
      if (s.id !== sectionId) return s
      return {
        ...s,
        lessons: s.lessons.filter((l) => l.id !== lessonId).map((l, i) => ({ ...l, order: i + 1 })),
      }
    }))
  }

  function updateLesson(sectionId: string, lessonId: string, field: keyof LessonDraft, value: any) {
    setSections((prev) => prev.map((s) => {
      if (s.id !== sectionId) return s
      return {
        ...s,
        lessons: s.lessons.map((l) => l.id === lessonId ? { ...l, [field]: value } : l),
      }
    }))
  }

  // ── Submit ─────────────────────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!categoryId) { setError('Selecciona una categoría'); return }

    const payload = {
      title,
      description,
      shortDescription: shortDesc,
      thumbnailUrl:     thumbnailUrl || undefined,
      previewVideoUrl:  previewUrl   || undefined,
      price:            Number(price),
      discountPrice:    discountPrice ? Number(discountPrice) : undefined,
      level,
      language,
      categoryId,
      tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
      sections: sections.map((s) => ({
        title:   s.title,
        order:   s.order,
        lessons: s.lessons.map((l) => ({
          title:       l.title,
          description: l.description || undefined,
          videoUrl:    l.videoUrl    || undefined,
          duration:    Number(l.duration),
          order:       l.order,
          isFree:      l.isFree,
        })),
      })),
    }

    setLoading(true)
    try {
      if (isEdit) {
        await updateCourse(course!.id, payload)
      } else {
        await createCourse(payload)
      }
      router.push(redirectOnSuccess)
      router.refresh()
    } catch (err: any) {
      setError(err?.message ?? 'Error al guardar el curso')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-950 dark:text-red-400">{error}</div>
      )}

      {/* Información básica */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        <h2 className="mb-5 font-semibold text-gray-900 dark:text-gray-100">Información básica</h2>
        <div className="space-y-4">
          <div>
            <label className={labelClass}>Título *</label>
            <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: React y Next.js: Desarrollo Web Moderno" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Descripción corta *</label>
            <input type="text" required value={shortDesc} onChange={(e) => setShortDesc(e.target.value)}
              placeholder="Frase que resume el valor del curso" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Descripción completa *</label>
            <textarea required rows={5} value={description} onChange={(e) => setDescription(e.target.value)}
              placeholder="Explica en detalle qué aprenderán los estudiantes..."
              className={`${inputClass} resize-none`} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>URL de portada</label>
              <input type="url" value={thumbnailUrl} onChange={(e) => setThumbnailUrl(e.target.value)}
                placeholder="https://..." className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>URL de video preview</label>
              <input type="url" value={previewUrl} onChange={(e) => setPreviewUrl(e.target.value)}
                placeholder="https://..." className={inputClass} />
            </div>
          </div>
          <div>
            <label className={labelClass}>Tags (separados por coma)</label>
            <input type="text" value={tags} onChange={(e) => setTags(e.target.value)}
              placeholder="React, TypeScript, Next.js..." className={inputClass} />
          </div>
        </div>
      </div>

      {/* Precio y configuración */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        <h2 className="mb-5 font-semibold text-gray-900 dark:text-gray-100">Precio y configuración</h2>
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

      {/* Secciones y lecciones */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900 dark:text-gray-100">Contenido del curso</h2>
          <button type="button" onClick={addSection}
            className="flex items-center gap-1.5 rounded-lg border border-primary-300 px-3 py-1.5 text-sm font-medium text-primary-600 hover:bg-primary-50 dark:border-primary-700 dark:hover:bg-primary-950">
            <Plus className="h-4 w-4" /> Agregar sección
          </button>
        </div>

        {sections.length === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-300 py-10 text-center dark:border-gray-700">
            <p className="text-sm text-gray-500">No hay secciones aún. Agrega una para empezar.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sections.map((section) => (
              <div key={section.id} className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
                {/* Header de sección */}
                <div className="flex items-center gap-2 bg-gray-50 px-4 py-3 dark:bg-gray-800">
                  <GripVertical className="h-4 w-4 shrink-0 text-gray-400" />
                  <input
                    type="text"
                    value={section.title}
                    onChange={(e) => updateSection(section.id, e.target.value)}
                    placeholder="Nombre de la sección"
                    className="flex-1 bg-transparent text-sm font-medium text-gray-900 outline-none placeholder:text-gray-400 dark:text-gray-100"
                  />
                  <button type="button" onClick={() => setExpandedSection(expandedSection === section.id ? null : section.id)}
                    className="rounded p-1 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
                    {expandedSection === section.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </button>
                  <button type="button" onClick={() => removeSection(section.id)}
                    className="rounded p-1 text-gray-400 hover:text-red-500">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                {/* Lecciones */}
                {expandedSection === section.id && (
                  <div className="divide-y divide-gray-100 dark:divide-gray-800">
                    {section.lessons.map((lesson) => (
                      <div key={lesson.id} className="p-4">
                        <div className="grid gap-3 sm:grid-cols-2">
                          <div className="sm:col-span-2">
                            <label className="mb-1 block text-xs font-medium text-gray-500">Título de la lección *</label>
                            <input type="text" value={lesson.title}
                              onChange={(e) => updateLesson(section.id, lesson.id, 'title', e.target.value)}
                              placeholder="Nombre de la lección"
                              className={`${inputClass} text-xs py-2`} />
                          </div>
                          <div>
                            <label className="mb-1 block text-xs font-medium text-gray-500">URL del video</label>
                            <input type="url" value={lesson.videoUrl}
                              onChange={(e) => updateLesson(section.id, lesson.id, 'videoUrl', e.target.value)}
                              placeholder="https://..."
                              className={`${inputClass} text-xs py-2`} />
                          </div>
                          <div>
                            <label className="mb-1 block text-xs font-medium text-gray-500">Duración (segundos) *</label>
                            <input type="number" min="0" value={lesson.duration}
                              onChange={(e) => updateLesson(section.id, lesson.id, 'duration', Number(e.target.value))}
                              className={`${inputClass} text-xs py-2`} />
                          </div>
                          <div className="sm:col-span-2 flex items-center justify-between">
                            <label className="flex cursor-pointer items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                              <input type="checkbox" checked={lesson.isFree}
                                onChange={(e) => updateLesson(section.id, lesson.id, 'isFree', e.target.checked)}
                                className="accent-primary-600" />
                              Lección gratuita (preview)
                            </label>
                            <button type="button" onClick={() => removeLesson(section.id, lesson.id)}
                              className="text-xs text-red-500 hover:text-red-700">
                              Eliminar lección
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                    <div className="p-3">
                      <button type="button" onClick={() => addLesson(section.id)}
                        className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-gray-300 py-2 text-xs text-gray-500 hover:border-primary-400 hover:text-primary-600 dark:border-gray-700">
                        <Plus className="h-3.5 w-3.5" /> Agregar lección
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
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
