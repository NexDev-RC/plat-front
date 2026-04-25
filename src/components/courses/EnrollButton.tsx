'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useAuthStore } from '@/store/auth.store'
import { enrollInCourse, getCourseProgress } from '@/services/enrollments.service'

interface Props {
  courseId:   string   // UUID del curso (para la API)
  courseSlug: string   // slug (para la URL pública)
}

type State = 'checking' | 'guest' | 'enrolled' | 'not-enrolled'

export function EnrollButton({ courseId, courseSlug }: Props) {
  const router = useRouter()
  const { isAuthenticated, _hasHydrated } = useAuthStore()

  const [state,     setState]     = useState<State>('checking')
  const [enrolling, setEnrolling] = useState(false)

  useEffect(() => {
    if (!_hasHydrated) return

    if (!isAuthenticated) {
      setState('guest')
      return
    }

    // Verificar si ya está inscrito usando el ID del curso
    getCourseProgress(courseId)
      .then(() => setState('enrolled'))
      .catch(() => setState('not-enrolled'))
  }, [_hasHydrated, isAuthenticated, courseId])

  // Skeleton mientras hidrata o verifica
  if (state === 'checking') {
    return (
      <div className="mt-4 h-12 w-full animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700" />
    )
  }

  // No autenticado
  if (state === 'guest') {
    return (
      <Button fullWidth size="lg" className="mt-4"
        onClick={() => router.push(`/login?redirect=/courses/${courseSlug}`)}>
        Iniciar sesión para inscribirse
      </Button>
    )
  }

  // Ya inscrito
  if (state === 'enrolled') {
    return (
      <Button fullWidth size="lg" variant="secondary" className="mt-4 gap-2"
        onClick={() => router.push(`/learn/${courseId}`)}>
        <CheckCircle className="h-4 w-4" /> Continuar aprendiendo
      </Button>
    )
  }

  // No inscrito → botón de inscripción
  async function handleEnroll() {
    setEnrolling(true)
    try {
      await enrollInCourse(courseId)
      setState('enrolled')
      router.push(`/learn/${courseId}`)
    } catch (err: any) {
      const msg = (err?.message ?? '').toLowerCase()
      if (msg.includes('ya estás inscrito') || msg.includes('already enrolled')) {
        setState('enrolled')
        router.push(`/learn/${courseId}`)
      } else {
        alert(err?.message ?? 'Error al inscribirse. Intenta de nuevo.')
        setEnrolling(false)
      }
    }
  }

  return (
    <Button fullWidth size="lg" className="mt-4" loading={enrolling} onClick={handleEnroll}>
      Inscribirse ahora
    </Button>
  )
}
