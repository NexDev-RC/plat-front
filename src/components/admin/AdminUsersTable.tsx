'use client'

import { useState } from 'react'
import { Trash2, ChevronDown } from 'lucide-react'
import { updateUserRole, deleteUser } from '@/services/users.service'
import type { User } from '@/types'

const ROLE_LABELS: Record<string, string> = {
  student:    'Estudiante',
  instructor: 'Instructor',
  admin:      'Admin',
}

const ROLE_COLORS: Record<string, string> = {
  student:    'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  instructor: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
  admin:      'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
}

export function AdminUsersTable({ initialUsers }: { initialUsers: User[] }) {
  const [users, setUsers]   = useState<User[]>(initialUsers)
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError]   = useState('')

  async function handleRoleChange(userId: string, role: 'student' | 'instructor' | 'admin') {
    setLoading(userId)
    setError('')
    try {
      const updated = await updateUserRole(userId, role)
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: updated.role } : u)))
    } catch (err: any) {
      setError(err?.message ?? 'Error al cambiar el rol')
    } finally {
      setLoading(null)
    }
  }

  async function handleDelete(userId: string, name: string) {
    if (!confirm(`¿Eliminar al usuario "${name}"? Esta acción no se puede deshacer.`)) return
    setLoading(userId)
    setError('')
    try {
      await deleteUser(userId)
      setUsers((prev) => prev.filter((u) => u.id !== userId))
    } catch (err: any) {
      setError(err?.message ?? 'Error al eliminar el usuario')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div>
      {error && (
        <p className="mb-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600 dark:bg-red-950 dark:text-red-400">
          {error}
        </p>
      )}

      <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-400">Usuario</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-400">Email</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-400">Rol</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-400">Registro</th>
              <th className="px-4 py-3 text-right font-medium text-gray-600 dark:text-gray-400">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-800 dark:bg-gray-950">
            {users.map((user) => (
              <tr key={user.id} className={loading === user.id ? 'opacity-50' : ''}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-600 text-xs font-bold dark:bg-primary-900 dark:text-primary-300">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-medium text-gray-900 dark:text-gray-100">{user.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{user.email}</td>
                <td className="px-4 py-3">
                  <div className="relative inline-block">
                    <select
                      value={user.role}
                      disabled={loading === user.id}
                      onChange={(e) => handleRoleChange(user.id, e.target.value as any)}
                      className={`appearance-none rounded-full py-1 pl-3 pr-7 text-xs font-medium cursor-pointer ${ROLE_COLORS[user.role]}`}
                    >
                      <option value="student">Estudiante</option>
                      <option value="instructor">Instructor</option>
                      <option value="admin">Admin</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2" />
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                  {new Date(user.createdAt).toLocaleDateString('es', { day: '2-digit', month: 'short', year: 'numeric' })}
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => handleDelete(user.id, user.name)}
                    disabled={!!loading}
                    className="rounded-md p-1.5 text-gray-400 transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950 disabled:opacity-40"
                    title="Eliminar usuario"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-right text-xs text-gray-400">{users.length} usuarios</p>
    </div>
  )
}
