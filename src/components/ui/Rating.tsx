import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface RatingProps {
  value: number        // 0-5
  count?: number
  showCount?: boolean
  size?: 'sm' | 'md'
  className?: string
}

export function Rating({ value, count, showCount = true, size = 'sm', className }: RatingProps) {
  const starSize = size === 'sm' ? 14 : 18

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <span className={cn('font-semibold text-amber-500', size === 'sm' ? 'text-sm' : 'text-base')}>
        {value.toFixed(1)}
      </span>
      <div className="flex items-center">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            width={starSize}
            height={starSize}
            className={cn(
              i < Math.round(value) ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-200'
            )}
          />
        ))}
      </div>
      {showCount && count !== undefined && (
        <span className="text-xs text-gray-500 dark:text-gray-400">
          ({count.toLocaleString()})
        </span>
      )}
    </div>
  )
}
