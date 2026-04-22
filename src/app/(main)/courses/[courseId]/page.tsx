import { notFound } from 'next/navigation'
import Image from 'next/image'
import { Clock, Users, BookOpen, Globe, Award, CheckCircle } from 'lucide-react'
import { Badge, LevelBadge } from '@/components/ui/Badge'
import { Rating } from '@/components/ui/Rating'
import { EnrollButton } from '@/components/courses/EnrollButton'
import { serverGet } from '@/lib/server-client'
import { formatDuration, formatPrice } from '@/lib/utils'
import type { Course } from '@/types'
import type { Metadata } from 'next'

interface Props { params: { courseId: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { courseId } = await params
  try {
    const course = await serverGet<Course>(`/courses/${courseId}`)
    return { title: course.title, description: course.shortDescription }
  } catch {
    return { title: 'Curso no encontrado' }
  }
}

export default async function CourseDetailPage({ params }: Props) {
  const { courseId } = await params

  let course: Course | null = null
  try {
    course = await serverGet<Course>(`/courses/${courseId}`)
  } catch {
    notFound()
  }
  console.log('COURSE:', course)

  if (!course) notFound()

  const totalLessons = course.sections?.reduce((sum, s) => sum + (s.lessons?.length ?? 0), 0) ?? 0
  const hasDiscount  = course.discountPrice != null && course.discountPrice < course.price

  return (
    <div className="min-h-screen">
      {/* Hero oscuro */}
      <div className="bg-gray-900 text-white">
        <div className="container-page py-10 lg:flex lg:items-start lg:gap-10">
          <div className="flex-1">
            <div className="mb-3 flex flex-wrap gap-2">
              <LevelBadge level={course.level} />
              {course.category?.name && (
                <Badge variant="outline" className="border-gray-600 text-gray-300">
                  {course.category.name}
                </Badge>
              )}
            </div>

            <h1 className="text-3xl font-bold leading-snug">{course.title}</h1>
            <p className="mt-3 text-gray-300">{course.shortDescription}</p>

            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-gray-300">
              <Rating value={course.rating ?? 0} count={course.totalReviews ?? 0} />
              <span className="flex items-center gap-1.5">
                <Users className="h-4 w-4" />
                {(course.totalStudents ?? 0).toLocaleString()} estudiantes
              </span>
              <span className="flex items-center gap-1.5">
                <Globe className="h-4 w-4" />{course.language}
              </span>
            </div>

            {course.instructor?.name && (
              <p className="mt-3 text-sm text-gray-400">
                Instructor:{' '}
                <span className="font-medium text-primary-400">{course.instructor.name}</span>
              </p>
            )}
          </div>

          {/* Tarjeta desktop */}
          <div className="mt-8 hidden w-80 shrink-0 lg:block">
            <PurchaseCard course={course} totalLessons={totalLessons} />
          </div>
        </div>
      </div>

      <div className="container-page py-10 lg:flex lg:gap-10">
        <div className="flex-1 space-y-10">
          {/* Lo que aprenderás */}
          {course.tags && course.tags.length > 0 && (
            <section>
              <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-gray-100">Lo que aprenderás</h2>
              <div className="grid gap-2.5 rounded-xl border border-gray-200 p-5 dark:border-gray-800 sm:grid-cols-2">
                {course.tags.map((tag) => (
                  <div key={tag} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                    <span>{tag}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Contenido del curso */}
          {course.sections && course.sections.length > 0 && (
            <section>
              <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-gray-100">Contenido del curso</h2>
              <div className="mb-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
                <span>{course.sections.length} secciones</span>
                <span>·</span>
                <span>{totalLessons} lecciones</span>
                <span>·</span>
                <span>{formatDuration(course.totalDuration ?? 0)} de duración total</span>
              </div>
              <div className="divide-y divide-gray-200 overflow-hidden rounded-xl border border-gray-200 dark:divide-gray-800 dark:border-gray-800">
                {course.sections
                  .slice()
                  .sort((a, b) => a.order - b.order)
                  .map((section) => (
                    <details key={section.id} className="group">
                      <summary className="flex cursor-pointer items-center justify-between p-4 font-medium text-gray-900 hover:bg-gray-50 dark:text-gray-100 dark:hover:bg-gray-900">
                        <span>{section.title}</span>
                        <span className="text-sm font-normal text-gray-400">
                          {section.lessons?.length ?? 0} lecciones
                        </span>
                      </summary>
                      <ul className="divide-y divide-gray-100 bg-gray-50/50 dark:divide-gray-800 dark:bg-gray-900/50">
                        {(section.lessons ?? [])
                          .slice()
                          .sort((a, b) => a.order - b.order)
                          .map((lesson) => (
                            <li key={lesson.id} className="flex items-center justify-between px-5 py-3 text-sm">
                              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                                <BookOpen className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                                <span className={lesson.isFree ? 'text-primary-600 dark:text-primary-400' : ''}>
                                  {lesson.title}
                                </span>
                                {lesson.isFree && (
                                  <Badge variant="primary" className="text-[10px] px-1.5">Gratis</Badge>
                                )}
                              </div>
                              <span className="shrink-0 text-gray-400">
                                {formatDuration(lesson.duration)}
                              </span>
                            </li>
                          ))}
                      </ul>
                    </details>
                  ))}
              </div>
            </section>
          )}

          {/* Instructor */}
          {course.instructor && (
            <section>
              <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-gray-100">El instructor</h2>
              <div className="flex items-start gap-4 rounded-xl border border-gray-200 p-5 dark:border-gray-800">
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                  {course.instructor.avatarUrl ? (
                    <Image
                      src={course.instructor.avatarUrl}
                      alt={course.instructor.name}
                      width={64} height={64}
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-gray-400">
                      {course.instructor.name?.charAt(0)}
                    </div>
                  )}
                </div>
                <div>
                  <p className="font-semibold text-primary-600">{course.instructor.name}</p>
                  {course.instructor.bio && (
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{course.instructor.bio}</p>
                  )}
                </div>
              </div>
            </section>
          )}
        </div>

        {/* Tarjeta móvil */}
        <div className="mt-8 lg:hidden">
          <PurchaseCard course={course} totalLessons={totalLessons} />
        </div>
      </div>
    </div>
  )
}

function PurchaseCard({ course, totalLessons }: { course: Course; totalLessons: number }) {
  const hasDiscount = course.discountPrice != null && course.discountPrice < course.price

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl dark:border-gray-800 dark:bg-gray-900">
      {course.thumbnailUrl && (
        <div className="relative aspect-video w-full overflow-hidden bg-gray-100">
          <Image src={course.thumbnailUrl} alt={course.title} fill className="object-cover" />
        </div>
      )}
      <div className="p-5">
        <div className="flex items-baseline gap-3">
          <span className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            {formatPrice(course.price, course.discountPrice ?? undefined)}
          </span>
          {hasDiscount && (
            <span className="text-lg text-gray-400 line-through">{formatPrice(course.price)}</span>
          )}
        </div>

        <EnrollButton courseId={course.id} courseSlug={course.slug} />

        <p className="mt-3 text-center text-xs text-gray-400">Garantía de devolución de 30 días</p>

        <ul className="mt-5 space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <li className="flex items-center gap-2">
            <Clock    className="h-4 w-4 shrink-0 text-gray-400" />
            {formatDuration(course.totalDuration ?? 0)} de contenido
          </li>
          <li className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 shrink-0 text-gray-400" />
            {totalLessons} lecciones
          </li>
          <li className="flex items-center gap-2">
            <Award    className="h-4 w-4 shrink-0 text-gray-400" />
            Certificado al completar
          </li>
          <li className="flex items-center gap-2">
            <Globe    className="h-4 w-4 shrink-0 text-gray-400" />
            Acceso de por vida
          </li>
        </ul>
      </div>
    </div>
  )
}
