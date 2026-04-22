'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { useAuthStore } from '@/store/auth.store'
import { enrollInCourse, getCourseProgress } from '@/services/enrollments.service'

interface Props {
  courseId:   string
  courseSlug: string
}

type EnrollState = 'loading' | 'guest' | 'enrolled' | 'not-enrolled'

export function EnrollButton({ courseId, courseSlug }: Props) {
  const router = useRouter()
  const { user, isAuthenticated, _hasHydrated } = useAuthStore()

  const [state,     setState]     = useState<EnrollState>('loading')
  const [enrolling, setEnrolling] = useState(false)

  // Verificar inscripción al montar
  useEffect(() => {
    if (!_hasHydrated) return

    if (!isAuthenticated) {
      setState('guest')
      return
    }

    // Tanto admin como student pueden inscribirse y ver el reproductor
    getCourseProgress(courseId)
      .then(() => setState('enrolled'))
      .catch(() => setState('not-enrolled'))
  }, [_hasHydrated, isAuthenticated, courseId])

  // ── Skeleton durante hidratación ──────────────────────────────────────────
  if (state === 'loading') {
    return <div className="mt-4 h-12 w-full animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700" />
  }

  // ── No autenticado → ir al login ──────────────────────────────────────────
  if (state === 'guest') {
    return (
      <Button
        fullWidth size="lg" className="mt-4"
        onClick={() => router.push(`/login?redirect=/courses/${courseSlug}`)}
      >
        Iniciar sesión para inscribirse
      </Button>
    )
  }

  // ── Ya inscrito → ir al reproductor ──────────────────────────────────────
  if (state === 'enrolled') {
    return (
      <Button
        fullWidth size="lg" variant="secondary" className="mt-4"
        onClick={() => router.push(`/learn/${courseId}`)}
      >
        Continuar aprendiendo →
      </Button>
    )
  }

  // ── No inscrito → inscribirse (student, instructor, admin) ────────────────
  async function handleEnroll() {
    setEnrolling(true)
    try {
      await enrollInCourse(courseId)
      setState('enrolled')
      router.push(`/learn/${courseId}`)
    } catch (err: any) {
      if (err?.message?.toLowerCase().includes('ya estás inscrito')) {
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
