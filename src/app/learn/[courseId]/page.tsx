import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { getCourseBySlug } from '@/services/courses.service'
import { getCourseProgress } from '@/services/enrollments.service'
import { LearnPageClient } from '@/components/player/LearnPageClient'

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

  // 1. Cargar el curso — si no existe redirigir
  let course
  try {
    course = await getCourseBySlug(courseId)
  } catch {
    redirect('/dashboard')
  }

  // 2. Verificar inscripción y cargar progreso
  let completedLessons: string[] = []
  let currentLessonId = lessonId ?? ''

  try {
    const progress = await getCourseProgress(courseId)
    completedLessons = progress.completedLessons ?? []
    if (!currentLessonId) currentLessonId = progress.lastWatchedLessonId ?? ''
  } catch {
    // No inscrito → redirigir al detalle del curso
    redirect(`/courses/${courseId}`)
  }

  // 3. Si no hay lección activa, usar la primera disponible
  if (!currentLessonId) {
    const firstLesson = course.sections
      .slice()
      .sort((a, b) => a.order - b.order)[0]
      ?.lessons
      .slice()
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
