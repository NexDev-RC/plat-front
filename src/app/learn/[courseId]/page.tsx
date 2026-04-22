import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { serverGet } from '@/lib/server-client'
import { LearnPageClient } from '@/components/player/LearnPageClient'
import type { Course, Enrollment } from '@/types'

interface Props {
  params:       Promise<{ courseId: string }>
  searchParams: Promise<{ lesson?: string }>
}

export default async function LearnPage({ params, searchParams }: Props) {
  const cookieStore = await cookies()
  const token = cookieStore.get('access_token')?.value
  if (!token) redirect('/login?redirect=/dashboard')

  const { courseId }         = await params
  const { lesson: lessonId } = await searchParams

  // 1. Cargar el curso
  let course: Course | null = null
  try {
    course = await serverGet<Course>(`/courses/${courseId}`)
  } catch {
    redirect('/dashboard')
  }

  if (!course) redirect('/dashboard')

  // 2. Verificar inscripción y cargar progreso
  let completedLessons: string[] = []
  let currentLessonId = lessonId ?? ''

  try {
    const enrollment = await serverGet<Enrollment>(`/enrollments/${courseId}`)
    completedLessons = enrollment.completedLessons ?? []
    if (!currentLessonId && enrollment.lastWatchedLessonId) {
      currentLessonId = enrollment.lastWatchedLessonId
    }
  } catch {
    // No inscrito → redirigir al detalle del curso
    redirect(`/courses/${courseId}`)
  }

  // 3. Si no hay lección activa, usar la primera
  if (!currentLessonId) {
    const firstLesson = course.sections
      ?.slice()
      .sort((a, b) => a.order - b.order)[0]
      ?.lessons
      ?.slice()
      .sort((a, b) => a.order - b.order)[0]
    if (firstLesson) currentLessonId = firstLesson.id
  }

  return (
    <LearnPageClient
      course={course}
      currentLessonId={currentLessonId}
      completedLessons={completedLessons}
    />
  )
}
