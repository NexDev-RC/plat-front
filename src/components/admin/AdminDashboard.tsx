'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Users, BookOpen, GraduationCap, UserCog, LayoutDashboard, Plus, Eye } from 'lucide-react'
import { AdminUsersPanel } from './AdminUsersPanel'
import { AdminCoursesPanel } from './AdminCoursesPanel'
import { AdminUsersDetailPanel } from './AdminUsersDetailPanel'  // ← NUEVO componente
import type { User, Course } from '@/types'

type Tab = 'courses' | 'users' 
type ViewType = 'simple' | 'detail'  // ← NUEVO: para cambiar vista dentro de usuarios

interface Props {
  initialUsers:   User[]
  initialCourses: Course[]
  usersTotal:     number
  coursesTotal:   number
}

export function AdminDashboard({ initialUsers, initialCourses, usersTotal, coursesTotal }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('courses')
  const [usersView, setUsersView] = useState<ViewType>('simple')  // ← NUEVO estado
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
        <div className="flex gap-1">
          {TABS.map((tab) => (
            <button 
              key={tab.id} 
              onClick={() => {
                setActiveTab(tab.id)
                if (tab.id === 'users') setUsersView('simple') // Resetear a vista simple al cambiar a usuarios
              }}
              className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
              <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                activeTab === tab.id
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                  : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}

          {/* BOTÓN "DETALLES" - solo visible cuando el tab activo es USUARIOS */}
          {activeTab === 'users' && (
            <button
              onClick={() => setUsersView(usersView === 'simple' ? 'detail' : 'simple')}
              className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-medium transition-colors ${
                usersView === 'detail'
                  ? 'border-green-600 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              <Eye className="h-4 w-4" />
              Detalles
              <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                usersView === 'detail'
                  ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                  : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
              }`}>
                {usersView === 'detail' ? 'ON' : 'OFF'}
              </span>
            </button>
          )}
        </div>

        {/* Botón acción del tab activo */}
        <div className="pb-1">
          {activeTab === 'courses' && (
            <Link href="/admin/courses/new"
              className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors">
              <Plus className="h-4 w-4" /> Nuevo curso
            </Link>
          )}
          {activeTab === 'users' && usersView === 'simple' && (
            <button
              onClick={() => setCreateUserOpen(true)}
              className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors">
              <Plus className="h-4 w-4" /> Nuevo usuario
            </button>
          )}
        </div>
      </div>

      {/* Paneles */}
      <div className={activeTab === 'courses' ? 'block' : 'hidden'}>
        <AdminCoursesPanel initialCourses={initialCourses} />
      </div>
      
      {/* Panel de Usuarios - vista simple */}
      <div className={activeTab === 'users' && usersView === 'simple' ? 'block' : 'hidden'}>
        <AdminUsersPanel
          initialUsers={initialUsers}
          createOpen={createUserOpen}
          onCreateOpenChange={setCreateUserOpen}
        />
      </div>

      {/* Panel de Usuarios - vista DETALLES (nueva) */}
      <div className={activeTab === 'users' && usersView === 'detail' ? 'block' : 'hidden'}>
        <AdminUsersDetailPanel initialUsers={initialUsers} />
      </div>
    </div>
  )
}