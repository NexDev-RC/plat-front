import Link from 'next/link'
import Image from 'next/image'
import { Users, Clock } from 'lucide-react'
import { cn, formatDuration, formatPrice } from '@/lib/utils'
import { Badge, LevelBadge } from '@/components/ui/Badge'
import { Rating } from '@/components/ui/Rating'
import type { Course } from '@/types'

interface CourseCardProps {
  course: Course
  className?: string
  compact?: boolean
}

export function CourseCard({ course, className, compact = false }: CourseCardProps) {
  const hasDiscount = course.discountPrice != null && course.discountPrice < course.price

  return (
    <Link
      href={`/courses/${course.slug}`}
      className={cn(
        'group flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white transition-shadow hover:shadow-lg dark:border-gray-800 dark:bg-gray-900',
        compact && 'flex-row gap-3 p-2',
        className
      )}
    >
      {/* Thumbnail */}
      <div className={cn(
        'relative overflow-hidden bg-gray-100 dark:bg-gray-800',
        compact ? 'h-20 w-28 shrink-0 rounded-lg' : 'aspect-video w-full'
      )}>
        {course.thumbnailUrl ? (
          <Image
            src={course.thumbnailUrl}
            alt={course.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes={compact ? '112px' : '(max-width: 768px) 100vw, 33vw'}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-4xl text-gray-300">📚</div>
        )}
        {hasDiscount && !compact && (
          <span className="absolute left-2 top-2 rounded-md bg-accent-500 px-2 py-0.5 text-xs font-bold text-white">
            OFERTA
          </span>
        )}
      </div>

      {/* Content */}
      <div className={cn('flex flex-1 flex-col', compact ? 'py-0.5' : 'p-4')}>
        {!compact && (
          <div className="mb-2 flex flex-wrap items-center gap-1.5">
            <LevelBadge level={course.level} />
            {course.category?.name && <Badge variant="outline">{course.category.name}</Badge>}
          </div>
        )}

        <h3 className={cn(
          'font-semibold leading-snug text-gray-900 group-hover:text-primary-600 dark:text-gray-100',
          compact ? 'text-sm line-clamp-2' : 'text-base line-clamp-2'
        )}>
          {course.title}
        </h3>

        {!compact && course.instructor?.name && (
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
            {course.instructor.name}
          </p>
        )}

        <div className={cn('flex items-center gap-3 text-xs text-gray-500', compact ? 'mt-1' : 'mt-2')}>
          <Rating value={course.rating ?? 0} count={course.totalReviews ?? 0} />
        </div>

        {!compact && (
          <div className="mt-1.5 flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              {(course.totalStudents ?? 0).toLocaleString()} estudiantes
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {formatDuration(course.totalDuration ?? 0)}
            </span>
          </div>
        )}

        {/* Precio */}
        <div className={cn('flex items-baseline gap-2', compact ? 'mt-auto' : 'mt-3')}>
          <span className={cn('font-bold text-gray-900 dark:text-gray-100', compact ? 'text-sm' : 'text-lg')}>
            {formatPrice(course.price, course.discountPrice ?? undefined)}
          </span>
          {hasDiscount && (
            <span className="text-xs text-gray-400 line-through">{formatPrice(course.price)}</span>
          )}
        </div>
      </div>
    </Link>
  )
}
