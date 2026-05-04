import Link from 'next/link'
import Image from 'next/image'
import { Users, Clock } from 'lucide-react'
import { cn, formatDuration, formatPrice } from '@/lib/utils'
import { Badge, LevelBadge } from '@/components/ui/Badge'
import { Rating } from '@/components/ui/Rating'
import type { Course } from '@/types'

interface EnhancedCourseCardProps {
  course: Course & {
    isNew?: boolean
    isTrending?: boolean
  }
  className?: string
}

export function EnhancedCourseCard({ course, className }: EnhancedCourseCardProps) {
  const hasDiscount = course.discountPrice != null && course.discountPrice < course.price

  return (
    <div className={cn(
      'bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden',
      className
    )}>
      <div className="relative">
        <div className="w-full h-48 bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center">
          {course.thumbnailUrl ? (
            <Image
              src={course.thumbnailUrl}
              alt={course.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
          ) : (
            <div className="text-white text-center p-4">
              <div className="text-6xl mb-2">
                {course.category?.name ? `{${course.category.name[0]}}` : '{📚}'}
              </div>
              <div className="text-sm">{course.category?.name || 'General'}</div>
            </div>
          )}
        </div>
        
        {course.isNew && (
          <span className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
            NUEVO
          </span>
        )}
        
        {course.isTrending && (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
            TRENDING
          </span>
        )}
        
        {hasDiscount && (
          <span className="absolute top-2 left-2 bg-accent-500 text-white text-xs px-2 py-1 rounded-full">
            OFERTA
          </span>
        )}
      </div>
      
      <div className="p-4">
        <div className="mb-2 flex flex-wrap items-center gap-1.5">
          <LevelBadge level={course.level} />
          {course.category?.name && <Badge variant="outline">{course.category.name}</Badge>}
        </div>
        
        <h3 className="font-semibold text-lg text-gray-800 mb-1 line-clamp-2">
          {course.title}
        </h3>
        
        {course.instructor?.name && (
          <p className="text-gray-600 text-sm mb-2">Por {course.instructor.name}</p>
        )}
        
        <div className="flex items-center mb-2">
          <div className="flex items-center">
            <Rating value={course.rating ?? 0} count={course.totalReviews ?? 0} />
          </div>
          <span className="mx-2 text-gray-400">|</span>
          <span className="text-sm text-gray-600 flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            {(course.totalStudents ?? 0).toLocaleString()} estudiantes
          </span>
        </div>
        
        <div className="flex items-center mb-3">
          <span className="text-sm text-gray-600 flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {formatDuration(course.totalDuration ?? 0)}
          </span>
          <span className="mx-2 text-gray-400">|</span>
          <span className="text-sm text-gray-600 capitalize">{course.level}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-gray-900">
              {formatPrice(course.price, course.discountPrice ?? undefined)}
            </span>
            {hasDiscount && (
              <span className="text-sm text-gray-400 line-through">{formatPrice(course.price)}</span>
            )}
          </div>
          <Link 
            href={`/courses/${course.slug}`}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            Ver Curso
          </Link>
        </div>
      </div>
    </div>
  )
}
