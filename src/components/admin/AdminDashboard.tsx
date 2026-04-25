'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Users, BookOpen, GraduationCap, UserCog, LayoutDashboard, Plus } from 'lucide-react'
import { AdminUsersPanel } from './AdminUsersPanel'
import { AdminCoursesPanel } from './AdminCoursesPanel'
import type { User, Course } from '@/types'

type Tab = 'courses' | 'users'

interface Props {
  initialUsers:   User[]
  initialCourses: Course[]
  usersTotal:     number
  coursesTotal:   number
}

export function AdminDashboard({ initialUsers, initialCourses, usersTotal, coursesTotal }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('courses')
  // Estado del modal de crear usuario elevado aquí para que el botón lo pueda abrir
  const [createUserOpen, setCreateUserOpen] = useState(false)

  const students    = initialUsers.filter((u) => u.role === 'student').length
  const instructors = initialUsers.filter((u) => u.role === 'instructor').length
  const published   = initialCourses.filter((c) => c.isPublished).length

  const STATS = [
    { label: 'Usuarios totales', value: usersTotal,   icon: Users,         color: 'bg-blue-100   text-blue-600   dark:bg-blue-900   dark:text-blue-300' },
    { label: 'Estudiantes',      value: students,     icon: GraduationCap, color: 'bg-green-100  text-green-600  dark:bg-green-900  dark:text-green-300' },
    { label: 'Instructores',     value: instructors,  icon: UserCog,       color: 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300' },
    { label: 'Cursos publicados',value: published,    icon: BookOpen,      color: 'bg-amber-100  text-amber-600  dark:bg-amber-900  dark:text-amber-300' },
  ]

  const TABS: { id: Tab; label: string; icon: React.ElementType; count: number }[] = [
    { id: 'courses', label: 'Cursos',   icon: BookOpen, count: initialCourses.length },
    { id: 'users',   label: 'Usuarios', icon: Users,    count: usersTotal },
  ]

  return (
    <div className="container-page section-padding">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Panel de administración</h1>
          <p className="mt-1 text-gray-500 dark:text-gray-400">Gestión completa de la plataforma</p>
        </div>
        <Link href="/courses"
          className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800">
          <LayoutDashboard className="h-4 w-4" /> Ver catálogo
        </Link>
      </div>

      {/* Stats */}
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {STATS.map((stat) => (
          <div key={stat.label}
            className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${stat.color}`}>
              <stat.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stat.value}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs + acción */}
      <div className="mb-6 flex items-center justify-between border-b border-gray-200 dark:border-gray-800">
        <div className="flex">
          {TABS.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              }`}>
              <tab.icon className="h-4 w-4" />
              {tab.label}
              <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                activeTab === tab.id
                  ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
                  : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Botón acción del tab activo */}
        <div className="pb-1">
          {activeTab === 'courses' && (
            <Link href="/admin/courses/new"
              className="flex items-center gap-1.5 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 transition-colors">
              <Plus className="h-4 w-4" /> Nuevo curso
            </Link>
          )}
          {activeTab === 'users' && (
            <button
              onClick={() => setCreateUserOpen(true)}
              className="flex items-center gap-1.5 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 transition-colors">
              <Plus className="h-4 w-4" /> Nuevo usuario
            </button>
          )}
        </div>
      </div>

      {/* Paneles — siempre montados para no perder estado */}
      <div className={activeTab === 'courses' ? 'block' : 'hidden'}>
        <AdminCoursesPanel initialCourses={initialCourses} />
      </div>
      <div className={activeTab === 'users' ? 'block' : 'hidden'}>
        <AdminUsersPanel
          initialUsers={initialUsers}
          createOpen={createUserOpen}
          onCreateOpenChange={setCreateUserOpen}
        />
      </div>
    </div>
  )
}
