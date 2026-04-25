'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

const SORT_OPTIONS = [
  { value: 'newest',     label: 'Más recientes' },
  { value: 'popular',    label: 'Más populares' },
  { value: 'rating',     label: 'Mejor valorados' },
  { value: 'price-asc',  label: 'Precio: menor a mayor' },
  { value: 'price-desc', label: 'Precio: mayor a menor' },
]

function SortSelectInner({ currentValue }: { currentValue: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()

  function handleChange(value: string) {
    const params = new URLSearchParams(searchParams.toString())
    params.set('sortBy', value)
    params.delete('page') // resetear a página 1 al cambiar orden
    router.push(`/courses?${params.toString()}`)
  }

  return (
    <select
      value={currentValue}
      onChange={(e) => handleChange(e.target.value)}
      className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm outline-none focus:border-primary-400 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
    >
      {SORT_OPTIONS.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  )
}

// Envolvemos en Suspense porque useSearchParams requiere un boundary
export function SortSelect({ currentValue }: { currentValue: string }) {
  return (
    <Suspense fallback={
      <select className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm dark:border-gray-700 dark:bg-gray-900">
        {SORT_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    }>
      <SortSelectInner currentValue={currentValue} />
    </Suspense>
  )
}
