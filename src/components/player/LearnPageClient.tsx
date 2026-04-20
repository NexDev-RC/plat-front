'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { CheckCircle, Circle, ChevronLeft, ChevronRight, Menu, X, BookOpen, Home } from 'lucide-react'
import { cn, formatDuration } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { completeLesson } from '@/services/enrollments.service'
import type { Course, Lesson } from '@/types'

interface Props {
  course: Course
  currentLessonId: string
  completedLessons: string[]
}

export function LearnPageClient({ course, currentLessonId: initialLessonId, completedLessons: initialCompleted }: Props) {
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen]     = useState(false)
  const [currentId, setCurrentId]         = useState(initialLessonId)
  const [completed, setCompleted]         = useState<Set<string>>(new Set(initialCompleted))
  const [savingLesson, setSavingLesson]   = useState(false)

  // Aplanar todas las lecciones en orden
  const allLessons: Lesson[] = course.sections
    .slice()
    .sort((a, b) => a.order - b.order)
    .flatMap((s) => [...s.lessons].sort((a, b) => a.order - b.order))

  const currentIndex  = allLessons.findIndex((l) => l.id === currentId)
  const currentLesson = allLessons[currentIndex]
  const prevLesson    = allLessons[currentIndex - 1]
  const nextLesson    = allLessons[currentIndex + 1]
  const progress      = allLessons.length > 0 ? Math.round((completed.size / allLessons.length) * 100) : 0

  const goToLesson = useCallback((lessonId: string) => {
    setCurrentId(lessonId)
    setSidebarOpen(false)
    router.replace(`/learn/${course.id}?lesson=${lessonId}`, { scroll: false })
  }, [course.id, router])

  const handleComplete = useCallback(async (lessonId: string) => {
    if (completed.has(lessonId) || savingLesson) return
    setSavingLesson(true)
    try {
      await completeLesson(course.id, lessonId)
      setCompleted((prev) => new Set([...prev, lessonId]))
    } catch {
      // silencioso — el progreso local se mantiene
    } finally {
      setSavingLesson(false)
    }
  }, [completed, savingLesson, course.id])

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-gray-950 text-white">
      {/* Top bar */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-gray-800 px-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen((v) => !v)}
            className="flex items-center gap-2 rounded-md p-1.5 text-sm text-gray-300 hover:bg-gray-800 hover:text-white"
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            <span className="hidden sm:inline">Contenido</span>
          </button>
          <Link href="/" className="hidden items-center gap-1.5 text-sm text-gray-400 hover:text-white sm:flex">
            <Home className="h-4 w-4" /> EduFlow
          </Link>
          <span className="hidden text-gray-600 sm:inline">·</span>
          <span className="hidden max-w-xs truncate text-sm text-gray-300 sm:inline">{course.title}</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-2 sm:flex">
            <div className="h-2 w-32 overflow-hidden rounded-full bg-gray-700">
              <div className="h-full rounded-full bg-primary-500 transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>
            <span className="text-xs text-gray-400">{progress}% completado</span>
          </div>
          <Link href="/dashboard" className="rounded-md px-3 py-1.5 text-xs text-gray-400 hover:bg-gray-800 hover:text-white">
            Mi dashboard
          </Link>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className={cn(
          'absolute inset-y-14 left-0 z-30 w-72 overflow-y-auto border-r border-gray-800 bg-gray-900 transition-transform scrollbar-thin',
          'lg:relative lg:inset-auto lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}>
          {course.sections
            .slice()
            .sort((a, b) => a.order - b.order)
            .map((section) => (
              <div key={section.id}>
                <div className="sticky top-0 bg-gray-900/95 px-4 py-3 backdrop-blur">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">{section.title}</p>
                </div>
                {[...section.lessons]
                  .sort((a, b) => a.order - b.order)
                  .map((lesson) => {
                    const isActive = lesson.id === currentId
                    const isDone   = completed.has(lesson.id)
                    return (
                      <button
                        key={lesson.id}
                        onClick={() => goToLesson(lesson.id)}
                        className={cn(
                          'flex w-full items-start gap-3 px-4 py-3 text-left text-sm transition-colors',
                          isActive ? 'bg-primary-900 text-primary-200' : 'text-gray-300 hover:bg-gray-800'
                        )}
                      >
                        {isDone
                          ? <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-green-400" />
                          : <Circle     className="mt-0.5 h-4 w-4 shrink-0 text-gray-600" />
                        }
                        <div className="min-w-0">
                          <p className="leading-snug line-clamp-2">{lesson.title}</p>
                          <p className="mt-0.5 text-xs text-gray-500">{formatDuration(lesson.duration)}</p>
                        </div>
                      </button>
                    )
                  })}
              </div>
            ))}
        </aside>

        {/* Área principal */}
        <main className="flex flex-1 flex-col overflow-y-auto">
          {/* Video */}
          <div className="aspect-video w-full bg-black">
            {currentLesson?.videoUrl ? (
              <video
                key={currentLesson.id}
                src={currentLesson.videoUrl}
                controls
                className="h-full w-full"
                onEnded={() => handleComplete(currentLesson.id)}
              />
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-3 text-gray-500">
                <BookOpen className="h-16 w-16 opacity-30" />
                <p className="text-sm">Video no disponible aún</p>
              </div>
            )}
          </div>

          {/* Info de la lección */}
          <div className="flex-1 p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <h1 className="text-xl font-bold text-white">{currentLesson?.title}</h1>
                {currentLesson?.description && (
                  <p className="mt-2 text-sm text-gray-400">{currentLesson.description}</p>
                )}
              </div>
              <Button
                size="sm"
                variant={completed.has(currentId) ? 'secondary' : 'primary'}
                loading={savingLesson}
                onClick={() => handleComplete(currentId)}
                className="shrink-0"
              >
                {completed.has(currentId) ? (
                  <><CheckCircle className="h-4 w-4" /> Completada</>
                ) : 'Marcar como completada'}
              </Button>
            </div>

            {/* Navegación */}
            <div className="mt-8 flex items-center justify-between border-t border-gray-800 pt-6">
              <Button
                variant="outline"
                size="sm"
                disabled={!prevLesson}
                onClick={() => prevLesson && goToLesson(prevLesson.id)}
                className="border-gray-700 text-gray-300 hover:text-white"
              >
                <ChevronLeft className="h-4 w-4" /> Anterior
              </Button>

              <span className="text-xs text-gray-500">
                {currentIndex + 1} / {allLessons.length}
              </span>

              <Button
                size="sm"
                disabled={!nextLesson}
                onClick={() => nextLesson && goToLesson(nextLesson.id)}
              >
                Siguiente <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
