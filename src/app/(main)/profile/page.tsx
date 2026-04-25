'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { User, Save, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { useAuthStore } from '@/store/auth.store'
import { getMyProfile, updateMyProfile } from '@/services/users.service'

export default function ProfilePage() {
  const router = useRouter()
  const { isAuthenticated, _hasHydrated, updateUser } = useAuthStore()

  const [name,      setName]      = useState('')
  const [bio,       setBio]       = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [loading,   setLoading]   = useState(false)
  const [fetching,  setFetching]  = useState(true)
  const [success,   setSuccess]   = useState(false)
  const [error,     setError]     = useState('')

  useEffect(() => {
    if (!_hasHydrated) return
    if (!isAuthenticated) { router.push('/login?redirect=/profile'); return }

    getMyProfile()
      .then((profile) => {
        setName(profile.name ?? '')
        setBio(profile.bio ?? '')
        setAvatarUrl(profile.avatarUrl ?? '')
      })
      .catch(() => setError('No se pudo cargar el perfil'))
      .finally(() => setFetching(false))
  }, [_hasHydrated, isAuthenticated, router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess(false)
    setLoading(true)
    try {
      const updated = await updateMyProfile({
        name:      name      || undefined,
        bio:       bio       || undefined,
        avatarUrl: avatarUrl || undefined,
      })
      updateUser({ name: updated.name, avatarUrl: updated.avatarUrl ?? undefined })
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err: any) {
      setError(err?.message ?? 'Error al actualizar el perfil')
    } finally {
      setLoading(false)
    }
  }

  const inputCls = 'w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100'

  if (!_hasHydrated || fetching) {
    return (
      <div className="container-page section-padding max-w-xl">
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton h-12 w-full rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container-page section-padding max-w-xl">
      <div className="mb-8 flex items-center gap-4">
        <Link href="/dashboard"
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-primary-600">
          <ArrowLeft className="h-4 w-4" /> Volver
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Mi perfil</h1>
          <p className="mt-0.5 text-sm text-gray-500">Actualiza tu información personal</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Avatar preview */}
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary-100 text-primary-600 dark:bg-primary-900 dark:text-primary-300">
            {avatarUrl ? (
              <img src={avatarUrl} alt={name} className="h-full w-full rounded-full object-cover" />
            ) : (
              <User className="h-8 w-8" />
            )}
          </div>
          <div className="flex-1">
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              URL del avatar
            </label>
            <input type="url" value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://..." className={inputCls} />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Nombre completo *
          </label>
          <input type="text" required value={name} onChange={(e) => setName(e.target.value)}
            className={inputCls} />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Biografía
          </label>
          <textarea rows={3} value={bio} onChange={(e) => setBio(e.target.value)}
            placeholder="Cuéntanos sobre ti..."
            className={`${inputCls} resize-none`} />
        </div>

        {error   && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950 dark:text-red-400">
            {error}
          </p>
        )}
        {success && (
          <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-600 dark:bg-green-950 dark:text-green-400">
            ✓ Perfil actualizado correctamente
          </p>
        )}

        <Button type="submit" loading={loading} className="gap-2">
          <Save className="h-4 w-4" /> Guardar cambios
        </Button>
      </form>
    </div>
  )
}
