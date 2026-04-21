import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import Link from 'next/link'
import Image from 'next/image'
import { Clock, BookOpen, Award, TrendingUp, Calendar, Download, PlayCircle, CheckCircle } from 'lucide-react'
import { getMyEnrollments } from '@/services/enrollments.service'
import { getMyCertificates } from '@/services/certificates.service'
import { formatDuration, formatDate } from '@/lib/utils'
import type { Enrollment, Certificate } from '@/types'

export const metadata = { title: 'Mi aprendizaje' }

export default async function DashboardPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('access_token')?.value
  if (!token) redirect('/login?redirect=/dashboard')

  let enrollments: Enrollment[] = []
  let certificates: Certificate[] = []
  let apiError = false

  try {
    const [enrollmentsData, certificatesData] = await Promise.allSettled([
      getMyEnrollments(),
      getMyCertificates()
    ])
    
    enrollments = enrollmentsData.status === 'fulfilled' ? enrollmentsData.value : []
    certificates = certificatesData.status === 'fulfilled' ? certificatesData.value : []
  } catch {
    apiError = true
  }

  const inProgress = enrollments.filter((e) => !e.completedAt)
  const completed  = enrollments.filter((e) => !!e.completedAt)
  const totalHours = enrollments.reduce((sum, e) => sum + (e.course?.totalDuration ?? 0), 0)
  const avgProgress = enrollments.length > 0 
    ? Math.round(enrollments.reduce((sum, e) => sum + e.progress, 0) / enrollments.length)
    : 0

  return (
    <div className="container-page section-padding">
      <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-gray-100">Mi aprendizaje</h1>
      <p className="mb-8 text-gray-500 dark:text-gray-400">Continúa donde lo dejaste</p>

      {apiError && (
        <div className="mb-8 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-800 dark:bg-red-950 dark:text-red-400">
          No se pudo conectar con el servidor. Verifica que el backend esté activo.
        </div>
      )}

      {/* Stats */}
      <div className="mb-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard icon={BookOpen} label="Cursos inscritos"   value={enrollments.length} />
        <StatCard icon={Clock}    label="Horas de contenido" value={Math.round(totalHours / 3600)} />
        <StatCard icon={Award}    label="Completados"        value={completed.length} />
        <StatCard icon={TrendingUp} label="Progreso promedio" value={avgProgress} />
        <StatCard icon={Calendar} label="Certificados"      value={certificates.length} />
      </div>

      {/* En progreso */}
      {inProgress.length > 0 && (
        <section className="mb-10">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">En progreso</h2>
            <Link href="/courses?filter=in-progress" className="text-sm text-primary-600 hover:underline">
              Ver todos
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {inProgress.slice(0, 6).map((e) => <EnrollmentCard key={e.id} enrollment={e} />)}
          </div>
          {inProgress.length > 6 && (
            <div className="mt-4 text-center">
              <Link href="/courses?filter=in-progress" className="text-sm text-primary-600 hover:underline">
                Ver {inProgress.length - 6} cursos más en progreso
              </Link>
            </div>
          )}
        </section>
      )}

      {/* Certificados */}
      {certificates.length > 0 && (
        <section className="mb-10">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Mis certificados</h2>
            <Link href="/certificates" className="text-sm text-primary-600 hover:underline">
              Ver todos
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {certificates.slice(0, 3).map((cert) => <CertificateCard key={cert.id} certificate={cert} />)}
          </div>
          {certificates.length > 3 && (
            <div className="mt-4 text-center">
              <Link href="/certificates" className="text-sm text-primary-600 hover:underline">
                Ver {certificates.length - 3} certificados más
              </Link>
            </div>
          )}
        </section>
      )}

      {/* Completados */}
      {completed.length > 0 && (
        <section className="mb-10">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Completados</h2>
            <Link href="/courses?filter=completed" className="text-sm text-primary-600 hover:underline">
              Ver todos
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {completed.slice(0, 3).map((e) => <EnrollmentCard key={e.id} enrollment={e} showCertificate />)}
          </div>
          {completed.length > 3 && (
            <div className="mt-4 text-center">
              <Link href="/courses?filter=completed" className="text-sm text-primary-600 hover:underline">
                Ver {completed.length - 3} cursos más completados
              </Link>
            </div>
          )}
        </section>
      )}

      {/* Historial de aprendizaje */}
      {enrollments.length > 0 && (
        <section className="mb-10">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Historial de aprendizaje</h2>
            <Link href="/history" className="text-sm text-primary-600 hover:underline">
              Ver historial completo
            </Link>
          </div>
          <div className="space-y-3">
            {enrollments
              .sort((a, b) => new Date(b.enrolledAt).getTime() - new Date(a.enrolledAt).getTime())
              .slice(0, 5)
              .map((e) => <HistoryItem key={e.id} enrollment={e} />)}
          </div>
        </section>
      )}

      {!apiError && enrollments.length === 0 && (
        <div className="flex flex-col items-center rounded-2xl border border-dashed border-gray-300 py-20 text-center dark:border-gray-700">
          <span className="text-6xl">📚</span>
          <h2 className="mt-4 text-xl font-semibold text-gray-700 dark:text-gray-300">Aún no tienes cursos</h2>
          <p className="mt-2 text-gray-500">Explora el catálogo y comienza a aprender hoy.</p>
          <Link href="/courses" className="mt-5 rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-700">
            Explorar cursos
          </Link>
        </div>
      )}
    </div>
  )
}

function StatCard({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: number }) {
  const displayValue = label === 'Progreso promedio' ? `${value}%` : value
  return (
    <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100 text-primary-600 dark:bg-primary-900 dark:text-primary-300">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{displayValue}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
      </div>
    </div>
  )
}

function EnrollmentCard({ enrollment, showCertificate = false }: { enrollment: Enrollment; showCertificate?: boolean }) {
  const { course, progress, lastWatchedLessonId, enrolledAt, completedAt } = enrollment
  if (!course) return null
  
  const currentLesson = course.sections
    .flatMap(s => s.lessons)
    .find(l => l.id === lastWatchedLessonId)
  
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white transition-shadow hover:shadow-lg dark:border-gray-800 dark:bg-gray-900">
      <div className="relative aspect-video bg-gray-100 dark:bg-gray-800">
        {course.thumbnailUrl && (
          <Image src={course.thumbnailUrl} alt={course.title} fill className="object-cover" />
        )}
        {showCertificate && (
          <div className="absolute top-2 right-2 rounded-full bg-green-500 p-1.5">
            <CheckCircle className="h-4 w-4 text-white" />
          </div>
        )}
        {!showCertificate && lastWatchedLessonId && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity hover:opacity-100">
            <PlayCircle className="h-12 w-12 text-white" />
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="mb-2">
          <span className="inline-flex rounded-full bg-primary-100 px-2 py-1 text-xs font-medium text-primary-700 dark:bg-primary-900 dark:text-primary-300">
            {course.level}
          </span>
          <span className="ml-2 text-xs text-gray-500">
            {course.category.name}
          </span>
        </div>
        <h3 className="font-semibold leading-snug text-gray-900 dark:text-gray-100 line-clamp-2">{course.title}</h3>
        <p className="mt-1 text-xs text-gray-500">{course.instructor?.name}</p>
        
        {currentLesson && !showCertificate && (
          <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">
            Última lección: {currentLesson.title}
          </p>
        )}
        
        <div className="mt-3">
          <div className="mb-1 flex justify-between text-xs text-gray-500">
            <span>{progress}% completado</span>
            <span>{formatDuration(course.totalDuration)}</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
            <div className="h-full rounded-full bg-primary-600 transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>
        
        <div className="mt-3 flex justify-between text-xs text-gray-500">
          <span>Inscrito: {formatDate(enrolledAt)}</span>
          {completedAt && <span>Completado: {formatDate(completedAt)}</span>}
        </div>
        
        <div className="mt-3">
          {showCertificate ? (
            <Link href={`/certificate/${enrollment.id}`} className="flex items-center justify-center gap-1.5 rounded-lg bg-green-100 py-2 text-sm font-medium text-green-700 hover:bg-green-200 dark:bg-green-900 dark:text-green-300">
              <Award className="h-4 w-4" /> Ver certificado
            </Link>
          ) : (
            <Link href={`/learn/${course.id}${lastWatchedLessonId ? `?lesson=${lastWatchedLessonId}` : ''}`}
              className="flex items-center justify-center gap-1.5 w-full rounded-lg bg-primary-600 py-2 text-sm font-medium text-white hover:bg-primary-700">
              <PlayCircle className="h-4 w-4" /> Continuar
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}

function CertificateCard({ certificate }: { certificate: Certificate }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 transition-shadow hover:shadow-lg dark:border-gray-800 dark:bg-gray-900">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300">
          <Award className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">{certificate.courseTitle}</h3>
          <p className="mt-1 text-xs text-gray-500">{certificate.instructorName}</p>
          <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">
            Emitido: {formatDate(certificate.issuedAt)}
          </p>
          <div className="mt-3 flex gap-2">
            <Link href={`/certificate/${certificate.id}`} className="flex items-center gap-1 rounded-lg bg-primary-100 px-3 py-1.5 text-xs font-medium text-primary-700 hover:bg-primary-200 dark:bg-primary-900 dark:text-primary-300">
              Ver
            </Link>
            <Link href={`/certificate/${certificate.id}/download`} className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800">
              <Download className="h-3 w-3" /> Descargar
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

function HistoryItem({ enrollment }: { enrollment: Enrollment }) {
  const { course, enrolledAt, completedAt, progress } = enrollment
  if (!course) return null
  
  return (
    <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-gray-900">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100 text-primary-600 dark:bg-primary-900 dark:text-primary-300">
        {completedAt ? <CheckCircle className="h-5 w-5" /> : <BookOpen className="h-5 w-5" />}
      </div>
      <div className="flex-1">
        <h4 className="font-medium text-gray-900 dark:text-gray-100">{course.title}</h4>
        <p className="text-xs text-gray-500">
          {completedAt ? `Completado ${formatDate(completedAt)}` : `Inscrito ${formatDate(enrolledAt)}`}
        </p>
      </div>
      <div className="text-right">
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{progress}%</p>
        <p className="text-xs text-gray-500">
          {completedAt ? 'Completado' : 'En progreso'}
        </p>
      </div>
    </div>
  )
}
