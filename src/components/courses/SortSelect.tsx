// components/SortSelect.tsx
'use client'

interface Props {
  defaultValue: string
}

export function SortSelect({ defaultValue }: Props) {
  return (
    <select
      name="sortBy"
      defaultValue={defaultValue}
      onChange={(e) => (e.target.form as HTMLFormElement).submit()}
      className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm"
    >
      <option value="newest">Más recientes</option>
      <option value="popular">Más populares</option>
      <option value="rating">Mejor valorados</option>
      <option value="price-asc">Precio: menor a mayor</option>
      <option value="price-desc">Precio: mayor a menor</option>
    </select>
  )
}