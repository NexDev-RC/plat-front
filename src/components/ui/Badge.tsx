import { cn } from '@/lib/utils'

type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'outline'

interface BadgeProps {
  children: React.ReactNode
  variant?: BadgeVariant
  className?: string
}

const variantClasses: Record<BadgeVariant, string> = {
  default:   'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  primary:   'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300',
  success:   'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  warning:   'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
  danger:    'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
  outline:   'border border-gray-300 text-gray-600 dark:border-gray-600 dark:text-gray-400',
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        variantClasses[variant],
        className
      )}
    >
      {children}
    </span>
  )
}

/** Convierte el nivel del curso al label/variante correcto */
export function LevelBadge({ level }: { level: 'beginner' | 'intermediate' | 'advanced' }) {
  const map = {
    beginner:     { label: 'Principiante', variant: 'success' as const },
    intermediate: { label: 'Intermedio',   variant: 'warning' as const },
    advanced:     { label: 'Avanzado',     variant: 'danger'  as const },
  }
  const { label, variant } = map[level]
  return <Badge variant={variant}>{label}</Badge>
}
