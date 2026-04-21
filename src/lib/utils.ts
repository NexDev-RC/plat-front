import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/** Combina clases Tailwind sin conflictos */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Formatea segundos a "Xh Ym" o "Ym" */
export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (h > 0) return `${h}h ${m}m`
  return `${m}m`
}

/** Formatea precio: 0 → "Gratis" */
export function formatPrice(price: number, discountPrice?: number): string {
  if (price === 0) return 'Gratis'
  const display = discountPrice ?? price
  return new Intl.NumberFormat('es-BO', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(display)
}

/** Trunca texto con ellipsis */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trimEnd() + '…'
}

/** Formatea fecha a formato legible */
export function formatDate(dateString: string): string {
  if (!dateString) return ''
  try {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(date)
  } catch {
    return dateString
  }
}
