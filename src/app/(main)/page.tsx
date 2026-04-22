import Link from 'next/link'
import { ArrowRight, TrendingUp, Shield, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'
import { buttonBase, sizeClasses } from '@/components/ui/Button'
import { CourseCard } from '@/components/courses/CourseCard'
import { serverGet, serverGetPaginated } from '@/lib/server-client'
import type { Course, Category } from '@/types'

const FEATURES = [
  { icon: TrendingUp, title: 'Aprende a tu ritmo',    desc: 'Accede a los cursos en cualquier momento y desde cualquier dispositivo.' },
  { icon: Shield,     title: 'Certificados válidos',  desc: 'Obtén certificados reconocidos al completar cada curso.' },
  { icon: Zap,        title: 'Instructores expertos', desc: 'Aprende de profesionales con experiencia real en la industria.' },
]

const CATEGORY_ICONS: Record<string, string> = {
  programacion: '💻', diseno: '🎨', 'data-science': '📊',
  marketing: '📣', negocios: '💼', fotografia: '📷',
}

export default async function HomePage() {
  const [featuredResult, categoriesResult] = await Promise.allSettled([
    serverGet<Course[]>('/courses/featured'),
    serverGet<Category[]>('/categories'),
  ])

  const featuredCourses = featuredResult.status   === 'fulfilled' ? featuredResult.value   : []
  const categories      = categoriesResult.status === 'fulfilled' ? categoriesResult.value : []

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-950 via-primary-800 to-primary-600 text-white">
        <div className="container-page section-padding text-center">
          <h1 className="mx-auto max-w-3xl text-4xl font-bold leading-tight sm:text-5xl md:text-6xl">
            Aprende las habilidades del futuro,{' '}
            <span className="text-accent-400">hoy</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg text-primary-200">
            Cursos de calidad en programación, diseño, negocios y más.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link href="/courses" className={cn(buttonBase, sizeClasses['lg'], 'bg-accent-500 text-white hover:bg-accent-600')}>
              Explorar cursos <ArrowRight className="h-5 w-5" />
            </Link>
            <Link href="/register" className={cn(buttonBase, sizeClasses['lg'], 'border border-white/30 text-white hover:bg-white/10')}>
              Crear cuenta gratis
            </Link>
          </div>
        </div>
      </section>

      {/* Categorías */}
      {categories.length > 0 && (
        <section className="section-padding">
          <div className="container-page">
            <h2 className="mb-8 text-2xl font-bold text-gray-900 dark:text-gray-100">Explora por categoría</h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6">
              {categories.map((cat) => (
                <Link key={cat.id} href={`/courses?categoryId=${cat.id}`}
                  className="flex flex-col items-center gap-2 rounded-xl border border-gray-200 p-4 text-center transition hover:border-primary-300 hover:bg-primary-50 dark:border-gray-800 dark:hover:border-primary-700 dark:hover:bg-primary-950">
                  <span className="text-3xl">{CATEGORY_ICONS[cat.slug] ?? '📚'}</span>
                  <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{cat.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Cursos destacados */}
      {featuredCourses.length > 0 && (
        <section className="section-padding bg-gray-50 dark:bg-gray-900">
          <div className="container-page">
            <div className="mb-8 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Cursos destacados</h2>
              <Link href="/courses" className="flex items-center gap-1 text-sm font-medium text-primary-600 hover:underline">
                Ver todos <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {featuredCourses.map((course) => <CourseCard key={course.id} course={course} />)}
            </div>
          </div>
        </section>
      )}

      {/* Estado vacío cuando no hay cursos */}
      {featuredCourses.length === 0 && categories.length === 0 && (
        <section className="section-padding">
          <div className="container-page py-10 text-center">
            <p className="text-5xl mb-4">🚀</p>
            <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300">La plataforma está lista</h2>
            <p className="mt-2 text-gray-500">Los primeros cursos aparecerán aquí cuando sean publicados.</p>
          </div>
        </section>
      )}

      {/* Features */}
      <section className="section-padding">
        <div className="container-page">
          <h2 className="mb-12 text-center text-2xl font-bold text-gray-900 dark:text-gray-100">¿Por qué EduFlow?</h2>
          <div className="grid gap-8 md:grid-cols-3">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex flex-col items-center text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-100 text-primary-600 dark:bg-primary-900 dark:text-primary-300">
                  <Icon className="h-7 w-7" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding bg-primary-600 text-white">
        <div className="container-page text-center">
          <h2 className="text-3xl font-bold">¿Listo para empezar?</h2>
          <p className="mt-3 text-primary-200">Únete gratis y accede a todos los cursos.</p>
          <Link href="/register" className={cn(buttonBase, sizeClasses['lg'], 'mt-6 bg-white text-primary-700 hover:bg-primary-50')}>
            Comenzar ahora
          </Link>
        </div>
      </section>
    </>
  )
}
