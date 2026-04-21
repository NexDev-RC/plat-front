// ─── Usuario ──────────────────────────────────────────────────────────────────

export interface User {
  id: string
  name: string
  email: string
<<<<<<< HEAD
  avatarUrl?: string
  bio?: string
=======
  avatarUrl?: string | null
  bio?: string | null
>>>>>>> 711a514b841dea312764ba0d9a446970983d7655
  role: 'student' | 'instructor' | 'admin'
  createdAt: string
}

// ─── Curso ────────────────────────────────────────────────────────────────────

export interface Category {
  id: string
  name: string
  slug: string
}

export interface Instructor {
  id: string
  name: string
  avatarUrl?: string | null
  bio?: string | null
  rating?: number
  totalStudents?: number
}

export interface Lesson {
  id: string
  title: string
  description?: string | null
  videoUrl?: string | null
  duration: number    // segundos
  order: number
  isFree: boolean
  isCompleted?: boolean
}

export interface Section {
  id: string
  title: string
  order: number
  lessons: Lesson[]
}

export interface Course {
  id: string
  title: string
  slug: string
  description: string
  shortDescription: string
  thumbnailUrl?: string | null
  previewVideoUrl?: string | null
  price: number
  discountPrice?: number | null
  rating: number
  totalReviews: number
  totalStudents: number
  totalDuration: number   // segundos
  totalLessons: number
  level: 'beginner' | 'intermediate' | 'advanced'
  language: string
  category: Category
  instructor: Instructor
  sections: Section[]
  tags: string[]
  isPublished: boolean
  createdAt: string
  updatedAt: string
}

// ─── Enrollment / Progreso ────────────────────────────────────────────────────

export interface Enrollment {
  id: string
  userId: string
  courseId: string
  course: Course
  progress: number
  completedLessons: string[]
  lastWatchedLessonId?: string | null
  enrolledAt: string
  completedAt?: string | null
}

<<<<<<< HEAD
// Certificados

export interface Certificate {
  id: string
  code: string
  userId: string
  courseId: string
  courseTitle: string
  instructorName: string
  instructorId: string
  issuedAt: string
  verificationUrl: string
  downloadUrl?: string
}

// ─── Respuestas de API ─────────────────────────────────────────────────────────
=======
// ─── Respuestas de API ────────────────────────────────────────────────────────
>>>>>>> 711a514b841dea312764ba0d9a446970983d7655

export interface ApiResponse<T> {
  data: T
  message?: string
  statusCode: number
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// ─── Filtros de búsqueda ──────────────────────────────────────────────────────

export interface CourseFilters {
  search?: string
  categoryId?: string
  level?: Course['level']
  minPrice?: number
  maxPrice?: number
  rating?: number
  sortBy?: 'newest' | 'popular' | 'rating' | 'price-asc' | 'price-desc'
  page?: number
  limit?: number
}
