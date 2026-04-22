'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, Suspense } from 'react'
import { BookOpen, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useAuthStore } from '@/store/auth.store'
import { login } from '@/services/auth.service'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') ?? '/dashboard'
  const storeLogin = useAuthStore((s) => s.login)

  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { user, access_token } = await login({ email, password })
      storeLogin(user, access_token)
      router.push(redirect)
    } catch (err: any) {
      setError(err?.message ?? 'Credenciales inválidas')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 dark:bg-gray-950">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center">
          <Link href="/" className="flex items-center gap-2 font-bold text-primary-600">
            <BookOpen className="h-7 w-7" /><span className="text-xl">EduFlow</span>
          </Link>
          <h1 className="mt-4 text-2xl font-bold text-gray-900 dark:text-gray-100">Iniciar sesión</h1>
          <p className="mt-1 text-sm text-gray-500">
            ¿No tienes cuenta?{' '}
            <Link href="/register" className="font-medium text-primary-600 hover:underline">Regístrate</Link>
          </p>
        </div>

        {/* Acceso rápido para pruebas */}
        <div className="mb-4 rounded-lg bg-blue-50 p-3 text-xs text-blue-700 dark:bg-blue-950 dark:text-blue-300">
          <p className="font-semibold mb-1">Credenciales de prueba:</p>
          <p>Admin: admin@eduflow.com / Admin1234!</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Correo electrónico</label>
            <input
              type="email" required autoComplete="email"
              value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@correo.com"
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
            />
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Contraseña</label>
              <Link href="/forgot-password" className="text-xs text-primary-600 hover:underline">¿Olvidaste tu contraseña?</Link>
            </div>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'} required
                value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 pr-10 text-sm outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
              />
              <button type="button" onClick={() => setShowPass((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950 dark:text-red-400">{error}</p>}

          <Button type="submit" fullWidth size="lg" loading={loading}>Iniciar sesión</Button>
        </form>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
