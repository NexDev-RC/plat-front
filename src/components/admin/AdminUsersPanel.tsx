'use client'

import { useState } from 'react'
import { Trash2, Pencil, Search } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { createUserAsAdmin, updateUserRole, deleteUser } from '@/services/users.service'
import { formatDate } from '@/lib/utils'
import type { User } from '@/types'

const ROLE_LABELS: Record<string, string> = {
  student:    'Estudiante',
  instructor: 'Instructor',
  admin:      'Administrador',
}

const ROLE_COLORS: Record<string, string> = {
  student:    'bg-blue-100   text-blue-700   dark:bg-blue-900   dark:text-blue-300',
  instructor: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
  admin:      'bg-red-100    text-red-700    dark:bg-red-900    dark:text-red-300',
}

interface CreateForm {
  name:     string
  email:    string
  password: string
  role:     'student' | 'instructor' | 'admin'
}

const EMPTY: CreateForm = { name: '', email: '', password: '', role: 'student' }

const inputCls = 'w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100'
const labelCls = 'mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300'

interface Props {
  initialUsers:       User[]
  createOpen:         boolean
  onCreateOpenChange: (open: boolean) => void
}

export function AdminUsersPanel({ initialUsers, createOpen, onCreateOpenChange }: Props) {
  const [users,       setUsers]       = useState<User[]>(initialUsers)
  const [search,      setSearch]      = useState('')
  const [filterRole,  setFilterRole]  = useState<string>('all')
  const [actionId,    setActionId]    = useState<string | null>(null)
  const [globalError, setGlobalError] = useState('')

  // Modal crear
  const [createForm,    setCreateForm]    = useState<CreateForm>(EMPTY)
  const [createError,   setCreateError]   = useState('')
  const [createLoading, setCreateLoading] = useState(false)

  // Modal editar
  const [editUser,    setEditUser]    = useState<User | null>(null)
  const [editRole,    setEditRole]    = useState<string>('student')
  const [editError,   setEditError]   = useState('')
  const [editLoading, setEditLoading] = useState(false)

  // ── Filtrado ────────────────────────────────────────────────────────────────
  const filtered = users.filter((u) => {
    const q = search.toLowerCase()
    const matchSearch = !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
    const matchRole   = filterRole === 'all' || u.role === filterRole
    return matchSearch && matchRole
  })

  // ── Crear ───────────────────────────────────────────────────────────────────
  function openCreate() {
    setCreateForm(EMPTY)
    setCreateError('')
    onCreateOpenChange(true)
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (createForm.password.length < 8) {
      setCreateError('La contraseña debe tener al menos 8 caracteres')
      return
    }
    setCreateLoading(true)
    setCreateError('')
    try {
      const newUser = await createUserAsAdmin(createForm)
      setUsers((prev) => [newUser, ...prev])
      onCreateOpenChange(false)
    } catch (err: any) {
      setCreateError(err?.message ?? 'Error al crear el usuario')
    } finally {
      setCreateLoading(false)
    }
  }

  // ── Editar rol ──────────────────────────────────────────────────────────────
  function openEdit(user: User) {
    setEditUser(user)
    setEditRole(user.role)
    setEditError('')
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault()
    if (!editUser) return
    setEditLoading(true)
    setEditError('')
    try {
      await updateUserRole(editUser.id, editRole as any)
      setUsers((prev) => prev.map((u) => u.id === editUser.id ? { ...u, role: editRole as any } : u))
      setEditUser(null)
    } catch (err: any) {
      setEditError(err?.message ?? 'Error al actualizar')
    } finally {
      setEditLoading(false)
    }
  }

  // ── Eliminar ────────────────────────────────────────────────────────────────
  async function handleDelete(user: User) {
    if (!confirm(`¿Eliminar a "${user.name}"?\nEsta acción no se puede deshacer.`)) return
    setActionId(user.id)
    setGlobalError('')
    try {
      await deleteUser(user.id)
      setUsers((prev) => prev.filter((u) => u.id !== user.id))
    } catch (err: any) {
      setGlobalError(err?.message ?? 'Error al eliminar')
    } finally {
      setActionId(null)
    }
  }

  return (
    <div>
      {globalError && (
        <p className="mb-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600 dark:bg-red-950 dark:text-red-400">
          {globalError}
        </p>
      )}

      {/* Barra de búsqueda y filtro */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Buscar por nombre o email..."
            value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-primary-400 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100" />
        </div>
        <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)}
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100">
          <option value="all">Todos los roles</option>
          <option value="student">Estudiantes</option>
          <option value="instructor">Instructores</option>
          <option value="admin">Administradores</option>
        </select>
      </div>

      {/* Tabla */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 py-16 text-center dark:border-gray-700">
          <p className="text-gray-500">No se encontraron usuarios.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-900/60">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-400">Usuario</th>
                <th className="hidden px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-400 sm:table-cell">Email</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-400">Rol</th>
                <th className="hidden px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-400 md:table-cell">Registro</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600 dark:text-gray-400">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white dark:divide-gray-800 dark:bg-gray-950">
              {filtered.map((user) => (
                <tr key={user.id}
                  className={`${actionId === user.id ? 'opacity-40 pointer-events-none' : 'hover:bg-gray-50 dark:hover:bg-gray-900/40'}`}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary-100 text-sm font-bold text-primary-600 dark:bg-primary-900 dark:text-primary-300">
                        {user.avatarUrl
                          ? <img src={user.avatarUrl} alt={user.name} className="h-full w-full rounded-full object-cover" />
                          : user.name.charAt(0).toUpperCase()
                        }
                      </div>
                      <span className="font-medium text-gray-900 dark:text-gray-100 truncate max-w-[120px]">
                        {user.name}
                      </span>
                    </div>
                  </td>
                  <td className="hidden px-4 py-3 text-gray-500 dark:text-gray-400 sm:table-cell">
                    {user.email}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${ROLE_COLORS[user.role]}`}>
                      {ROLE_LABELS[user.role] ?? user.role}
                    </span>
                  </td>
                  <td className="hidden px-4 py-3 text-gray-500 dark:text-gray-400 md:table-cell">
                    {formatDate(user.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(user)}
                        className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-primary-600 dark:hover:bg-gray-800 dark:hover:text-primary-400"
                        title="Editar rol">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDelete(user)} disabled={!!actionId}
                        className="rounded-md p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950 dark:hover:text-red-400 disabled:opacity-40"
                        title="Eliminar">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="border-t border-gray-100 bg-gray-50 px-4 py-2 text-right text-xs text-gray-400 dark:border-gray-800 dark:bg-gray-900">
            {filtered.length} de {users.length} usuarios
          </div>
        </div>
      )}

      {/* ── Modal: Crear usuario ──────────────────────────────────────────────── */}
      <Modal open={createOpen} onClose={() => onCreateOpenChange(false)} title="Crear nuevo usuario">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className={labelCls}>Nombre completo *</label>
            <input type="text" required placeholder="Juan Pérez"
              value={createForm.name}
              onChange={(e) => setCreateForm((f) => ({ ...f, name: e.target.value }))}
              className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Correo electrónico *</label>
            <input type="email" required placeholder="juan@ejemplo.com"
              value={createForm.email}
              onChange={(e) => setCreateForm((f) => ({ ...f, email: e.target.value }))}
              className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Contraseña * (mín. 8 caracteres)</label>
            <input type="password" required minLength={8} placeholder="••••••••"
              value={createForm.password}
              onChange={(e) => setCreateForm((f) => ({ ...f, password: e.target.value }))}
              className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Rol *</label>
            <select value={createForm.role}
              onChange={(e) => setCreateForm((f) => ({ ...f, role: e.target.value as any }))}
              className={inputCls}>
              <option value="student">Estudiante</option>
              <option value="instructor">Instructor</option>
              <option value="admin">Administrador</option>
            </select>
          </div>
          {createError && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950 dark:text-red-400">
              {createError}
            </p>
          )}
          <div className="flex gap-3 pt-1">
            <Button type="button" variant="outline" fullWidth onClick={() => onCreateOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" fullWidth loading={createLoading}>
              Crear usuario
            </Button>
          </div>
        </form>
      </Modal>

      {/* ── Modal: Editar rol ─────────────────────────────────────────────────── */}
      <Modal open={!!editUser} onClose={() => setEditUser(null)} title="Editar usuario" size="sm">
        {editUser && (
          <form onSubmit={handleEdit} className="space-y-4">
            {/* Info usuario */}
            <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-100 text-sm font-bold text-primary-600 dark:bg-primary-900 dark:text-primary-300">
                {editUser.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="truncate font-medium text-gray-900 dark:text-gray-100">{editUser.name}</p>
                <p className="truncate text-xs text-gray-500">{editUser.email}</p>
              </div>
            </div>

            <div>
              <label className={labelCls}>Nuevo rol</label>
              <select value={editRole} onChange={(e) => setEditRole(e.target.value)} className={inputCls}>
                <option value="student">Estudiante</option>
                <option value="instructor">Instructor</option>
                <option value="admin">Administrador</option>
              </select>
            </div>

            {editError && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950 dark:text-red-400">
                {editError}
              </p>
            )}
            <div className="flex gap-3 pt-1">
              <Button type="button" variant="outline" fullWidth onClick={() => setEditUser(null)}>
                Cancelar
              </Button>
              <Button type="submit" fullWidth loading={editLoading}>
                Guardar cambios
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  )
}
