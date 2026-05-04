'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { BookOpen, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useAuthStore } from '@/store/auth.store'
import { register } from '@/services/auth.service'

export default function RegisterPage() {
  const router = useRouter()
  const storeLogin = useAuthStore((s) => s.login)

  const [name, setName]         = useState('')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole]         = useState<'student' | 'instructor'>('student')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (password.length < 8) { setError('La contraseña debe tener al menos 8 caracteres.'); return }
    setLoading(true)
    try {
      const { user, access_token } = await register({ name, email, password, role })
      storeLogin(user, access_token)
      router.push('/dashboard')
    } catch (err: any) {
      setError(err?.message ?? 'Error al registrarse. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 dark:bg-gray-950">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center" suppressHydrationWarning>
          <Link href="/" className="flex items-center gap-2 font-bold text-primary-600">
            <BookOpen className="h-7 w-7" /><span className="text-xl">EduFlow</span>
          </Link>
          <h1 className="mt-4 text-2xl font-bold text-gray-900 dark:text-gray-100">Crear cuenta</h1>
          <p className="mt-1 text-sm text-gray-500">
            ¿Ya tienes cuenta?{' '}
            <Link href="/login" className="font-medium text-primary-600 hover:underline">Inicia sesión</Link>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Nombre completo</label>
            <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Juan Pérez"
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Correo electrónico</label>
            <input type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@correo.com"
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
            />
          </div>

          {/* Rol */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Quiero registrarme como</label>
            <div className="grid grid-cols-2 gap-2">
              {(['student', 'instructor'] as const).map((r) => (
                <button
                  key={r} type="button"
                  onClick={() => setRole(r)}
                  className={`rounded-lg border py-2.5 text-sm font-medium transition ${
                    role === r
                      ? 'border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-950 dark:text-primary-300'
                      : 'border-gray-300 text-gray-600 hover:border-gray-400 dark:border-gray-700 dark:text-gray-400'
                  }`}
                >
                  {r === 'student' ? '🎓 Estudiante' : '👨‍🏫 Instructor'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Contraseña</label>
            <div className="relative">
              <input type={showPass ? 'text' : 'password'} required autoComplete="new-password"
                value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mínimo 8 caracteres"
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 pr-10 text-sm outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
              />
              <button type="button" onClick={() => setShowPass((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {password.length > 0 && (
              <div className="mt-1.5 flex gap-1">
                {[1,2,3,4].map((i) => (
                  <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${
                    password.length >= i * 3
                      ? i <= 1 ? 'bg-red-400' : i === 2 ? 'bg-yellow-400' : i === 3 ? 'bg-blue-400' : 'bg-green-400'
                      : 'bg-gray-200 dark:bg-gray-700'
                  }`} />
                ))}
              </div>
            )}
          </div>

          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950 dark:text-red-400">{error}</p>}

          <Button type="submit" fullWidth size="lg" loading={loading}>Crear cuenta</Button>

          <p className="text-center text-xs text-gray-400">
            Al registrarte aceptas nuestros{' '}
            <Link href="/terms" className="underline hover:text-primary-600">Términos de uso</Link> y{' '}
            <Link href="/privacy" className="underline hover:text-primary-600">Política de privacidad</Link>
          </p>
        </form>
      </div>
    </div>
  )
}
