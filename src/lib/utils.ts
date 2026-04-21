import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/** Combina clases Tailwind sin conflictos */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Formatea segundos → "Xh Ym" o "Ym Xs" */
export function formatDuration(seconds: number): string {
  if (!seconds || seconds <= 0) return '0m'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) return `${h}h ${m}m`
  if (m > 0) return `${m}m`
  return `${s}s`
}

/** Formatea precio: 0 → "Gratis", con descuento → precio reducido */
export function formatPrice(price: number, discountPrice?: number | null): string {
  const display = discountPrice != null && discountPrice < price ? discountPrice : price
  if (display === 0) return 'Gratis'
  return new Intl.NumberFormat('es-BO', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(display)
}

/** Formatea una fecha ISO a formato legible en español */
export function formatDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString('es', {
    day:   '2-digit',
    month: 'short',
    year:  'numeric',
  })
}

/** Trunca texto con ellipsis */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trimEnd() + '…'
}

<<<<<<< HEAD
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
=======
/** Calcula el porcentaje de descuento */
export function discountPercent(price: number, discountPrice: number): number {
  if (!price || !discountPrice || discountPrice >= price) return 0
  return Math.round(((price - discountPrice) / price) * 100)
>>>>>>> 711a514b841dea312764ba0d9a446970983d7655
}
