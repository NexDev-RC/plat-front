  'use client'

    {/* agregado por keke prueba uno para mostrar el panel de detalles de usuario estatico */}

import { useState } from 'react'
import { Eye, Trash2, Pencil } from 'lucide-react'
import type { User } from '@/types'

interface Props {
  initialUsers: User[]
}

export function AdminUsersDetailPanel({ initialUsers }: Props) {
  const [users, setUsers] = useState<User[]>(initialUsers)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const filteredUsers = users.filter(user => {
    const fullName = user.name.toLowerCase()
    const email = user.email.toLowerCase()
    return fullName.includes(searchTerm.toLowerCase()) || 
           email.includes(searchTerm.toLowerCase())
  })

  const handleDelete = (userId: string, userName: string) => {
    if (confirm(`¿Eliminar a ${userName}?`)) {
      setUsers(prev => prev.filter(u => u.id !== userId))
    }
  }

  const handleEdit = (user: User) => {
    alert(`✏️ Editar usuario: ${user.name}\n\n🔧 Funcionalidad en desarrollo.\nPronto podrás editar: nombre, email, rol, apellidos, teléfono, país, etc.`)
  }

  const getRoleColor = (role: string) => {
    switch(role) {
      case 'admin': return 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
      case 'instructor': return 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300'
      default: return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
    }
  }

  const getRoleLabel = (role: string) => {
    switch(role) {
      case 'admin': return 'Administrador'
      case 'instructor': return 'Instructor'
      default: return 'Estudiante'
    }
  }

  return (
    <div>
      {/* Buscador */}
      <div className="mb-4">
        <div className="relative max-w-md">
          <input
            type="text"
            placeholder="Buscar por nombre o email..."
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-400 dark:border-gray-700 dark:bg-gray-900"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Tabla-solo columnas esenciales */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-800">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuario</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registro</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-800 bg-white dark:bg-gray-900">
            {filteredUsers.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-100">
                  {user.name}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                  {user.email}
                </td>
                <td className="px-6 py-4 text-sm">
                  <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${getRoleColor(user.role)}`}>
                    {getRoleLabel(user.role)}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-sm">
                  <div className="flex gap-3">
                    {/* Ver detalles - abre modal con TODA la info */}
                    <button 
                      onClick={() => {
                        setSelectedUser(user)
                        setIsModalOpen(true)
                      }}
                      className="text-blue-600 hover:text-blue-800"
                      title="Ver detalles completos"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    
                    {/* ✏️ Editar */}
                    <button 
                      onClick={() => handleEdit(user)}
                      className="text-yellow-600 hover:text-yellow-800"
                      title="Editar usuario"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    
                    {/* 🗑️ Eliminar */}
                    <button 
                      onClick={() => handleDelete(user.id, user.name)}
                      className="text-red-600 hover:text-red-800"
                      title="Eliminar usuario"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal con TODOS los detalles (apellidos, teléfono, país, foto, etc.) */}
      {isModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setIsModalOpen(false)}>
          <div className="bg-white dark:bg-gray-900 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 p-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Detalles completos del usuario</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">✖️</button>
            </div>
            <div className="p-6">
              {/* Foto y nombre */}
              <div className="flex items-center gap-4 mb-6">
                <div className="w-20 h-20 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                  {selectedUser.avatarUrl ? (
                    <img src={selectedUser.avatarUrl} alt="Foto" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-3xl">👤</span>
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">{selectedUser.name}</h3>
                  <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${getRoleColor(selectedUser.role)}`}>
                    {getRoleLabel(selectedUser.role)}
                  </span>
                </div>
              </div>
              
              {/* TODA la información adicional */}
              <div className="grid grid-cols-2 gap-4">
                <DetailField label=" Nombres" value={selectedUser.nombres || selectedUser.name} />
                <DetailField label=" Apellido Paterno" value={selectedUser.apellidoPaterno} />
                <DetailField label=" Apellido Materno" value={selectedUser.apellidoMaterno} />
                <DetailField label=" Fecha Nacimiento" value={selectedUser.fechaNacimiento} />
                <DetailField label=" Teléfono Celular" value={selectedUser.telefonoCelular} />
                <DetailField label=" Correo Electrónico" value={selectedUser.email} />
                <DetailField label=" País" value={selectedUser.pais} />
                <DetailField label=" Departamento" value={selectedUser.departamento} />
              </div>

              {/* URL de la foto */}
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
                <p className="text-xs text-gray-500 dark:text-gray-400">🖼️ URL Foto</p>
                <p className="text-sm break-all">{selectedUser.avatarUrl || 'Sin foto'}</p>
              </div>

              {/* Botón de editar dentro del modal */}
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => {
                    setIsModalOpen(false)
                    handleEdit(selectedUser)
                  }}
                  className="flex items-center gap-2 rounded-lg bg-yellow-500 px-4 py-2 text-sm font-medium text-white hover:bg-yellow-600 transition-colors"
                >
                  <Pencil className="h-4 w-4" />
                  Editar usuario
                </button>
              </div>
            </div>
            <div className="border-t border-gray-200 dark:border-gray-800 p-4 flex justify-end">
              <button onClick={() => setIsModalOpen(false)} className="rounded-lg bg-gray-200 dark:bg-gray-800 px-4 py-2 text-sm font-medium hover:bg-gray-300">
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function DetailField({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{value || '—'}</p>
    </div>
  )
}