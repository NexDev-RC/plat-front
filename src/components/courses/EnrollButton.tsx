'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Pencil } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useAuthStore } from '@/store/auth.store'
import { enrollInCourse, getCourseProgress } from '@/services/enrollments.service'

interface Props {
  courseId:   string
  courseSlug: string
}

export function EnrollButton({ courseId, courseSlug }: Props) {
  const router = useRouter()
  const { user, isAuthenticated, _hasHydrated } = useAuthStore()

  const [loading,  setLoading]  = useState(false)
  const [enrolled, setEnrolled] = useState(false)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    if (!_hasHydrated) return

    // Admin: no necesita verificar inscripción
    if (!isAuthenticated || user?.role === 'admin' || user?.role === 'instructor') {
      setChecking(false)
      return
    }

    // Student: verificar si ya está inscrito
    getCourseProgress(courseId)
      .then(() => setEnrolled(true))
      .catch(() => setEnrolled(false))
      .finally(() => setChecking(false))
  }, [_hasHydrated, isAuthenticated, user, courseId])

  // ── Aún hidratando ────────────────────────────────────────────────────────
  if (!_hasHydrated || checking) {
    return <div className="mt-4 h-12 w-full animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700" />
  }

  // ── Admin: ver botón de editar ────────────────────────────────────────────
  if (user?.role === 'admin') {
    return (
      <div className="mt-4 flex gap-2">
        <Link
          href={`/admin/courses/${courseId}/edit`}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary-600 py-3 text-sm font-medium text-white hover:bg-primary-700"
        >
          <Pencil className="h-4 w-4" /> Editar curso
        </Link>
      </div>
    )
  }

  // ── Instructor: solo ver (no se inscribe) ─────────────────────────────────
  if (user?.role === 'instructor') {
    return (
      <p className="mt-4 rounded-lg bg-gray-100 py-3 text-center text-sm text-gray-500 dark:bg-gray-800">
        Los instructores no pueden inscribirse en cursos.
      </p>
    )
  }

  // ── No autenticado ────────────────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <Button fullWidth size="lg" className="mt-4" onClick={() => router.push(`/login?redirect=/courses/${courseSlug}`)}>
        Iniciar sesión para inscribirse
      </Button>
    )
  }

  // ── Student ya inscrito ───────────────────────────────────────────────────
  if (enrolled) {
    return (
      <Button fullWidth size="lg" className="mt-4" onClick={() => router.push(`/learn/${courseId}`)}>
        Continuar aprendiendo
      </Button>
    )
  }

  // ── Student: inscribirse ──────────────────────────────────────────────────
  async function handleEnroll() {
    setLoading(true)
    try {
      await enrollInCourse(courseId)
      setEnrolled(true)
      router.push(`/learn/${courseId}`)
    } catch (err: any) {
      if (err?.message?.includes('Ya estás inscrito')) {
        setEnrolled(true)
        router.push(`/learn/${courseId}`)
      } else {
        alert(err?.message ?? 'Error al inscribirse. Intenta de nuevo.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button fullWidth size="lg" className="mt-4" loading={loading} onClick={handleEnroll}>
      Inscribirse ahora
    </Button>
  )
}
