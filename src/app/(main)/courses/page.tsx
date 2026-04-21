import { Suspense } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { CourseCard } from '@/components/courses/CourseCard'
import { CourseCardSkeleton } from '@/components/courses/CourseCardSkeleton'
import { SortSelect } from '@/components/courses/SortSelect'
import { getCourses } from '@/services/courses.service'
import { getCategories } from '@/services/categories.service'
import type { CourseFilters, Category } from '@/types'

interface CoursesPageProps {
  searchParams: Promise<Record<string, string>>
}

const LEVELS = [
  { value: '',             label: 'Todos los niveles' },
  { value: 'beginner',     label: 'Principiante' },
  { value: 'intermediate', label: 'Intermedio' },
  { value: 'advanced',     label: 'Avanzado' },
]


const LIMIT = 12

async function CourseGrid({
  filters,
  params,
}: {
  filters: CourseFilters
  params: Record<string, string>
}) {
  let courses: any[] = []
  let total = 0
  let totalPages = 1
  const currentPage = filters.page ?? 1

  try {
    const result = await getCourses(filters)
    courses    = result.data
    total      = result.total
    totalPages = result.totalPages
  } catch {
    return (
      <div className="col-span-full rounded-xl border border-red-200 bg-red-50 p-8 text-center dark:border-red-800 dark:bg-red-950">
        <p className="font-medium text-red-700 dark:text-red-300">No se pudo conectar con el servidor</p>
        <p className="mt-1 text-sm text-red-500">
          Verifica que el backend esté activo en{' '}
          <code className="rounded bg-red-100 px-1 font-mono dark:bg-red-900">
            {process.env.NEXT_PUBLIC_API_URL}
          </code>
        </p>
      </div>
    )
  }

  if (courses.length === 0) {
    return (
      <div className="col-span-full py-20 text-center">
        <p className="text-5xl">🔍</p>
        <p className="mt-3 font-medium text-gray-700 dark:text-gray-300">No se encontraron cursos</p>
        <p className="mt-1 text-sm text-gray-500">Prueba con otros filtros o busca algo diferente.</p>
        <Link href="/courses" className="mt-4 inline-block text-sm text-primary-600 hover:underline">
          Limpiar filtros
        </Link>
      </div>
    )
  }

  // Construir query string para la paginación manteniendo los filtros activos
  function buildPageUrl(page: number) {
    const sp = new URLSearchParams()
    if (params.search)     sp.set('search',     params.search)
    if (params.categoryId) sp.set('categoryId', params.categoryId)
    if (params.level)      sp.set('level',      params.level)
    if (params.sortBy)     sp.set('sortBy',     params.sortBy)
    sp.set('page', String(page))
    return `/courses?${sp.toString()}`
  }

  return (
    <>
      <p className="col-span-full text-sm text-gray-500">
        {total} {total === 1 ? 'curso encontrado' : 'cursos encontrados'}
      </p>

      {courses.map((course) => (
        <CourseCard key={course.id} course={course} />
      ))}

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="col-span-full mt-6 flex items-center justify-center gap-2">
          {currentPage > 1 ? (
            <Link href={buildPageUrl(currentPage - 1)}
              className="flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800">
              <ChevronLeft className="h-4 w-4" /> Anterior
            </Link>
          ) : (
            <span className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-300 dark:border-gray-800">
              <ChevronLeft className="h-4 w-4" /> Anterior
            </span>
          )}

          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(totalPages, 7) }).map((_, i) => {
              // Mostrar páginas alrededor de la actual
              let page: number
              if (totalPages <= 7) {
                page = i + 1
              } else if (currentPage <= 4) {
                page = i + 1
              } else if (currentPage >= totalPages - 3) {
                page = totalPages - 6 + i
              } else {
                page = currentPage - 3 + i
              }
              const isActive = page === currentPage
              return (
                <Link key={page} href={buildPageUrl(page)}
                  className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary-600 text-white'
                      : 'border border-gray-300 text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800'
                  }`}>
                  {page}
                </Link>
              )
            })}
          </div>

          {currentPage < totalPages ? (
            <Link href={buildPageUrl(currentPage + 1)}
              className="flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800">
              Siguiente <ChevronRight className="h-4 w-4" />
            </Link>
          ) : (
            <span className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-300 dark:border-gray-800">
              Siguiente <ChevronRight className="h-4 w-4" />
            </span>
          )}
        </div>
      )}
    </>
  )
}

export default async function CoursesPage({ searchParams }: CoursesPageProps) {
  const params = await searchParams

  const currentPage = params.page ? Number(params.page) : 1

  const filters: CourseFilters = {
    search:     params.search     || undefined,
    categoryId: params.categoryId || undefined,
    level:      (params.level as CourseFilters['level']) || undefined,
    sortBy:     (params.sortBy as CourseFilters['sortBy']) ?? 'newest',
    page:       currentPage,
    limit:      LIMIT,
  }

  let categories: Category[] = []
  try { categories = await getCategories() } catch {}

  const hasActiveFilters = !!(params.search || params.categoryId || params.level)

  return (
    <div className="container-page section-padding">
      <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-gray-100">Catálogo de cursos</h1>
      <p className="mb-8 text-gray-500 dark:text-gray-400">Encuentra el curso perfecto para alcanzar tus metas</p>

      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Sidebar de filtros */}
        <aside className="w-full shrink-0 rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900 lg:w-60 lg:self-start">
          <form method="GET" className="space-y-5">
            {/* Búsqueda */}
            <div>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Buscar</h3>
              <input type="text" name="search" defaultValue={params.search ?? ''}
                placeholder="Nombre del curso..."
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
              />
            </div>

            {/* Categorías */}
            {categories.length > 0 && (
              <div>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Categoría</h3>
                <div className="space-y-1.5">
                  <label className="flex cursor-pointer items-center gap-2">
                    <input type="radio" name="categoryId" value="" defaultChecked={!params.categoryId} className="accent-primary-600" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Todas</span>
                  </label>
                  {categories.map((cat) => (
                    <label key={cat.id} className="flex cursor-pointer items-center gap-2">
                      <input type="radio" name="categoryId" value={cat.id} defaultChecked={params.categoryId === cat.id} className="accent-primary-600" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{cat.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Nivel */}
            <div>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Nivel</h3>
              <div className="space-y-1.5">
                {LEVELS.map((lvl) => (
                  <label key={lvl.value} className="flex cursor-pointer items-center gap-2">
                    <input type="radio" name="level" value={lvl.value} defaultChecked={(params.level ?? '') === lvl.value} className="accent-primary-600" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{lvl.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <button type="submit" className="w-full rounded-lg bg-primary-600 py-2 text-sm font-medium text-white hover:bg-primary-700 transition-colors">
                Aplicar filtros
              </button>
              {hasActiveFilters && (
                <Link href="/courses" className="block text-center text-xs text-gray-500 hover:text-primary-600 transition-colors">
                  Limpiar filtros
                </Link>
              )}
            </div>
          </form>
        </aside>

        {/* Grid de cursos */}
        <div className="flex-1">
          {/* Ordenamiento */}
          <div className="mb-5 flex items-center justify-end gap-2">
            <span className="hidden text-sm text-gray-500 sm:block">Ordenar por:</span>
            <SortSelect currentValue={params.sortBy ?? 'newest'} />
          </div>

          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            <Suspense fallback={Array.from({ length: 6 }).map((_, i) => <CourseCardSkeleton key={i} />)}>
              <CourseGrid filters={filters} params={params} />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  )
}
