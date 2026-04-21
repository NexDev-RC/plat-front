'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { User, Save, Camera, Mail, Calendar, Shield, Award, BookOpen, CheckCircle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useAuthStore } from '@/store/auth.store'
import { getMyProfile, updateMyProfile } from '@/services/users.service'
import { formatDate } from '@/lib/utils'

export default function ProfilePage() {
  const router   = useRouter()
  const { isAuthenticated, _hasHydrated, updateUser, user } = useAuthStore()

  const [name, setName]         = useState('')
  const [bio, setBio]           = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [loading, setLoading]   = useState(false)
  const [fetching, setFetching] = useState(true)
  const [success, setSuccess]   = useState(false)
  const [error, setError]       = useState('')
  const [nameError, setNameError] = useState('')
  const [avatarError, setAvatarError] = useState('')
  const [showAvatarPreview, setShowAvatarPreview] = useState(false)

  useEffect(() => {
    if (!_hasHydrated) return
    if (!isAuthenticated) { router.push('/login?redirect=/profile'); return }

    getMyProfile()
      .then((profile) => {
        setName(profile.name)
        setBio(profile.bio ?? '')
        setAvatarUrl(profile.avatarUrl ?? '')
      })
      .catch(() => {})
      .finally(() => setFetching(false))
  }, [_hasHydrated, isAuthenticated, router])

  function validateName(name: string): boolean {
    return name.trim().length >= 2 && name.trim().length <= 50
  }

  function validateUrl(url: string): boolean {
    if (!url) return true // Es opcional
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess(false)
    setNameError('')
    setAvatarError('')

    // Validación del nombre
    if (!name.trim()) {
      setNameError('El nombre es requerido')
      return
    }
    if (!validateName(name)) {
      setNameError('El nombre debe tener entre 2 y 50 caracteres')
      return
    }

    // Validación del avatar
    if (!validateUrl(avatarUrl)) {
      setAvatarError('Ingresa una URL válida para el avatar')
      return
    }

    setLoading(true)
    try {
      const updated = await updateMyProfile({
        name: name.trim(),
        bio: bio.trim() || undefined,
        avatarUrl: avatarUrl.trim() || undefined,
      })
      updateUser({ name: updated.name, avatarUrl: updated.avatarUrl })
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err: any) {
      setError(err?.message ?? 'Error al actualizar el perfil')
    } finally {
      setLoading(false)
    }
  }

  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    setName(e.target.value)
    if (nameError) setNameError('')
    if (error) setError('')
  }

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value
    setAvatarUrl(value)
    if (avatarError) setAvatarError('')
    if (error) setError('')
    
    // Mostrar vista previa si es una URL válida
    if (value && validateUrl(value)) {
      setShowAvatarPreview(true)
    } else {
      setShowAvatarPreview(false)
    }
  }

  function handleBioChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setBio(e.target.value)
    if (error) setError('')
  }

  const inputClass = 'w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100'
  const errorInputClass = 'border-red-300 focus:border-red-400 focus:ring-red-100'
  const successInputClass = 'border-green-300 focus:border-green-400 focus:ring-green-100'

  if (!_hasHydrated || fetching) {
    return (
      <div className="container-page section-padding max-w-xl">
        <div className="space-y-4">
          {[1, 2, 3].map((i) => <div key={i} className="skeleton h-12 w-full rounded-lg" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="container-page section-padding max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Mi perfil</h1>
        <p className="mt-1 text-gray-500">Gestiona tu información y preferencias</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Información del usuario */}
        <div className="lg:col-span-1">
          <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
            <div className="text-center">
              <div className="relative mx-auto mb-4 h-24 w-24">
                <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-primary-100 text-primary-600 dark:bg-primary-900">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt={name} className="h-full w-full object-cover" />
                  ) : (
                    <User className="h-12 w-12" />
                  )}
                </div>
                <button
                  type="button"
                  className="absolute bottom-0 right-0 rounded-full bg-primary-600 p-2 text-white hover:bg-primary-700"
                  onClick={() => document.getElementById('avatar-input')?.focus()}
                >
                  <Camera className="h-4 w-4" />
                </button>
              </div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{user?.name || 'Usuario'}</h2>
              <p className="text-sm text-gray-500">{user?.email}</p>
              <div className="mt-3 flex justify-center">
                <span className="inline-flex items-center gap-1 rounded-full bg-primary-100 px-3 py-1 text-xs font-medium text-primary-700 dark:bg-primary-900 dark:text-primary-300">
                  <Shield className="h-3 w-3" />
                  {user?.role === 'admin' ? 'Administrador' : user?.role === 'instructor' ? 'Instructor' : 'Estudiante'}
                </span>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                <Calendar className="h-4 w-4" />
                <span>Miembro desde {formatDate(user?.createdAt || '')}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                <Mail className="h-4 w-4" />
                <span>{user?.email}</span>
              </div>
            </div>
          </div>

          {/* Estadísticas rápidas */}
          <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">Mi progreso</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-primary-600" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Cursos</span>
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">--</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Certificados</span>
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">--</span>
              </div>
            </div>
          </div>
        </div>

        {/* Formulario de edición */}
        <div className="lg:col-span-2">

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Avatar */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                URL del avatar
              </label>
              <div className="relative">
                <input
                  id="avatar-input"
                  type="url"
                  value={avatarUrl}
                  onChange={handleAvatarChange}
                  placeholder="https://ejemplo.com/avatar.jpg"
                  className={`${inputClass} ${
                    avatarError ? errorInputClass : avatarUrl && validateUrl(avatarUrl) ? successInputClass : ''
                  }`}
                />
                {avatarUrl && validateUrl(avatarUrl) && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </div>
                )}
              </div>
              {avatarError && (
                <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {avatarError}
                </p>
              )}
              
              {/* Vista previa del avatar */}
              {showAvatarPreview && avatarUrl && validateUrl(avatarUrl) && (
                <div className="mt-3 flex items-center gap-3">
                  <span className="text-sm text-gray-600">Vista previa:</span>
                  <div className="h-12 w-12 rounded-full overflow-hidden border-2 border-gray-200">
                    <img src={avatarUrl} alt="Avatar preview" className="h-full w-full object-cover" />
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Nombre completo *
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={handleNameChange}
                  placeholder="Tu nombre completo"
                  className={`${inputClass} ${
                    nameError ? errorInputClass : name && validateName(name) ? successInputClass : ''
                  }`}
                />
                {name && validateName(name) && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </div>
                )}
              </div>
              {nameError && (
                <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {nameError}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500">Entre 2 y 50 caracteres</p>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Biografía
              </label>
              <textarea
                rows={4}
                value={bio}
                onChange={handleBioChange}
                placeholder="Cuéntanos sobre ti, tus intereses, experiencia..."
                maxLength={500}
                className={`${inputClass} resize-none`}
              />
              <div className="mt-1 text-xs text-gray-500 text-right">
                {bio.length}/500 caracteres
              </div>
            </div>

            {/* Mensajes de estado */}
            {error && (
              <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950 dark:text-red-400 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}
            {success && (
              <div className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-600 dark:bg-green-950 dark:text-green-400 flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                ✓ Perfil actualizado correctamente
              </div>
            )}

            <div className="flex gap-3">
              <Button
                type="submit"
                loading={loading}
                disabled={!!nameError || !!avatarError}
                className="gap-2"
              >
                <Save className="h-4 w-4" /> {loading ? 'Guardando...' : 'Guardar cambios'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setName(user?.name || '')
                  setBio(user?.bio || '')
                  setAvatarUrl(user?.avatarUrl || '')
                  setNameError('')
                  setAvatarError('')
                  setError('')
                  setSuccess(false)
                }}
                disabled={loading}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
