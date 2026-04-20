import { Suspense } from 'react'
import { CourseCard } from '@/components/courses/CourseCard'
import { CourseCardSkeleton } from '@/components/courses/CourseCardSkeleton'
import { getCourses } from '@/services/courses.service'
import { getCategories } from '@/services/categories.service'
import type { CourseFilters, Category } from '@/types'
import { SortSelect } from '@/components/courses/SortSelect'

interface CoursesPageProps {
  searchParams: Promise<Record<string, string>>
}

const LEVELS = [
  { value: '',             label: 'Todos los niveles' },
  { value: 'beginner',     label: 'Principiante' },
  { value: 'intermediate', label: 'Intermedio' },
  { value: 'advanced',     label: 'Avanzado' },
]

const SORT_OPTIONS = [
  { value: 'newest',     label: 'Más recientes' },
  { value: 'popular',    label: 'Más populares' },
  { value: 'rating',     label: 'Mejor valorados' },
  { value: 'price-asc',  label: 'Precio: menor a mayor' },
  { value: 'price-desc', label: 'Precio: mayor a menor' },
]

async function CourseGrid({ filters }: { filters: CourseFilters }) {
  let courses: any[] = []
  let total = 0

  try {
    const result = await getCourses(filters)
    courses = result.data
    total   = result.total
  } catch (err) {
    return (
      <div className="col-span-full rounded-xl border border-red-200 bg-red-50 p-8 text-center dark:border-red-800 dark:bg-red-950">
        <p className="text-sm text-red-600 dark:text-red-400">
          No se pudo conectar con el servidor. Verifica que el backend esté activo en{' '}
          <code className="font-mono">{process.env.NEXT_PUBLIC_API_URL}</code>.
        </p>
      </div>
    )
  }

  if (courses.length === 0) {
    return (
      <div className="col-span-full py-20 text-center">
        <p className="text-4xl">🔍</p>
        <p className="mt-3 font-medium text-gray-700 dark:text-gray-300">No se encontraron cursos</p>
        <p className="mt-1 text-sm text-gray-500">Prueba cambiando los filtros o la búsqueda.</p>
      </div>
    )
  }

  return (
    <>
      <p className="col-span-full mb-1 text-sm text-gray-500">{total} cursos encontrados</p>
      {courses.map((course) => <CourseCard key={course.id} course={course} />)}
    </>
  )
}

export default async function CoursesPage({ searchParams }: CoursesPageProps) {
  const params = await searchParams

  const filters: CourseFilters = {
    search:     params.search     || undefined,
    categoryId: params.categoryId || undefined,
    level:      (params.level as CourseFilters['level']) || undefined,
    sortBy:     (params.sortBy as CourseFilters['sortBy']) ?? 'newest',
    page:       params.page ? Number(params.page) : 1,
    limit:      12,
  }

  let categories: Category[] = []
  try { categories = await getCategories() } catch {}

  return (
    <div className="container-page section-padding">
      <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-gray-100">Catálogo de cursos</h1>
      <p className="mb-8 text-gray-500 dark:text-gray-400">Encuentra el curso perfecto para alcanzar tus metas</p>

      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Sidebar de filtros */}
        <aside className="w-full shrink-0 rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900 lg:w-60 lg:self-start">
          <form method="GET" className="space-y-5">
            <div>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Buscar</h3>
              <input type="text" name="search" defaultValue={params.search ?? ''} placeholder="Nombre del curso..."
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100" />
            </div>

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

            <button type="submit" className="w-full rounded-lg bg-primary-600 py-2 text-sm font-medium text-white hover:bg-primary-700 transition-colors">
              Aplicar filtros
            </button>
            {(params.search || params.categoryId || params.level) && (
              <a href="/courses" className="block text-center text-xs text-gray-500 hover:text-primary-600">
                Limpiar filtros
              </a>
            )}
          </form>
        </aside>

        {/* Grid de cursos */}
        <div className="flex-1">
          <div className="mb-4 flex items-center justify-end">
            <form method="GET">
              {params.search     && <input type="hidden" name="search"     value={params.search} />}
              {params.categoryId && <input type="hidden" name="categoryId" value={params.categoryId} />}
              {params.level      && <input type="hidden" name="level"      value={params.level} />}
              <SortSelect defaultValue={params.sortBy ?? 'newest'} />
            </form>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            <Suspense fallback={Array.from({ length: 6 }).map((_, i) => <CourseCardSkeleton key={i} />)}>
              <CourseGrid filters={filters} />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  )
}
