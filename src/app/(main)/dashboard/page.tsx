import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import Link from 'next/link'
import Image from 'next/image'
import { Clock, BookOpen, Award, Shield, ArrowRight } from 'lucide-react'
import { getMyEnrollments } from '@/services/enrollments.service'
import { formatDuration } from '@/lib/utils'
import type { Enrollment } from '@/types'

export const metadata = { title: 'Mi aprendizaje — EduFlow' }

export default async function DashboardPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('access_token')?.value
  if (!token) redirect('/login?redirect=/dashboard')

  let enrollments: Enrollment[] = []
  let apiError = false

  try {
    enrollments = await getMyEnrollments()
  } catch {
    apiError = true
  }

  const inProgress = enrollments.filter((e) => !e.completedAt)
  const completed  = enrollments.filter((e) => !!e.completedAt)
  const totalHours = enrollments.reduce((sum, e) => sum + (e.course?.totalDuration ?? 0), 0)

  return (
    <div className="container-page section-padding">
      <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-gray-100">Mi aprendizaje</h1>
      <p className="mb-8 text-gray-500 dark:text-gray-400">Continúa donde lo dejaste</p>

      {/* Banner de acceso rápido al panel admin (se muestra solo si hay cookie de admin) */}
      <AdminBanner />

      {apiError && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-800 dark:bg-red-950 dark:text-red-400">
          No se pudo conectar con el servidor. Verifica que el backend esté activo.
        </div>
      )}

      {/* Stats */}
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
        <StatCard icon={BookOpen} label="Cursos inscritos"   value={enrollments.length} />
        <StatCard icon={Clock}    label="Horas de contenido" value={Math.round(totalHours / 3600)} />
        <StatCard icon={Award}    label="Completados"        value={completed.length} />
      </div>

      {/* En progreso */}
      {inProgress.length > 0 && (
        <section className="mb-10">
          <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">En progreso</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {inProgress.map((e) => <EnrollmentCard key={e.id} enrollment={e} />)}
          </div>
        </section>
      )}

      {/* Completados */}
      {completed.length > 0 && (
        <section className="mb-10">
          <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">Completados</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {completed.map((e) => <EnrollmentCard key={e.id} enrollment={e} showCertificate />)}
          </div>
        </section>
      )}

      {/* Estado vacío */}
      {!apiError && enrollments.length === 0 && (
        <div className="flex flex-col items-center rounded-2xl border border-dashed border-gray-300 py-20 text-center dark:border-gray-700">
          <span className="text-6xl">📚</span>
          <h2 className="mt-4 text-xl font-semibold text-gray-700 dark:text-gray-300">Aún no tienes cursos</h2>
          <p className="mt-2 text-gray-500">Explora el catálogo y comienza a aprender hoy.</p>
          <Link href="/courses"
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-700">
            Explorar cursos <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}
    </div>
  )
}

// Banner solo para admins (detectado del store en client)
function AdminBanner() {
  // Este componente es server — no puede leer el store.
  // Mostramos un banner client-side en un componente separado
  return <AdminBannerClient />
}

// Importamos inline para evitar archivo extra
import { AdminBannerClient } from '@/components/admin/AdminBannerClient'

function StatCard({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: number }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100 text-primary-600 dark:bg-primary-900 dark:text-primary-300">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
      </div>
    </div>
  )
}

function EnrollmentCard({ enrollment, showCertificate = false }: { enrollment: Enrollment; showCertificate?: boolean }) {
  const { course, progress, lastWatchedLessonId } = enrollment
  if (!course) return null
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
      <div className="relative aspect-video bg-gray-100 dark:bg-gray-800">
        {course.thumbnailUrl && (
          <Image src={course.thumbnailUrl} alt={course.title} fill className="object-cover" />
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold leading-snug text-gray-900 dark:text-gray-100 line-clamp-2">{course.title}</h3>
        <p className="mt-1 text-xs text-gray-500">{course.instructor?.name}</p>

        <div className="mt-3">
          <div className="mb-1 flex justify-between text-xs text-gray-500">
            <span>{progress}% completado</span>
            <span>{formatDuration(course.totalDuration ?? 0)}</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
            <div className="h-full rounded-full bg-primary-600 transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <div className="mt-3">
          {showCertificate ? (
            <Link href={`/certificate/${enrollment.id}`}
              className="flex items-center justify-center gap-1.5 rounded-lg bg-green-100 py-2 text-sm font-medium text-green-700 hover:bg-green-200 dark:bg-green-900 dark:text-green-300">
              <Award className="h-4 w-4" /> Ver certificado
            </Link>
          ) : (
            <Link
              href={`/learn/${course.id}${lastWatchedLessonId ? `?lesson=${lastWatchedLessonId}` : ''}`}
              className="block w-full rounded-lg bg-primary-600 py-2 text-center text-sm font-medium text-white hover:bg-primary-700">
              Continuar
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
