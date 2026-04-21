'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, Suspense } from 'react'
import { BookOpen, Eye, EyeOff, Mail, Lock, AlertCircle, CheckCircle } from 'lucide-react'
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
  const [success, setSuccess]   = useState('')
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')

  function validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  function validatePassword(password: string): boolean {
    return password.length >= 8
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess('')
    setEmailError('')
    setPasswordError('')

    // Validación del email
    if (!email) {
      setEmailError('El correo electrónico es requerido')
      return
    }
    if (!validateEmail(email)) {
      setEmailError('Ingresa un correo electrónico válido')
      return
    }

    // Validación de la contraseña
    if (!password) {
      setPasswordError('La contraseña es requerida')
      return
    }
    if (!validatePassword(password)) {
      setPasswordError('La contraseña debe tener al menos 8 caracteres')
      return
    }

    setLoading(true)
    try {
      const { user, access_token } = await login({ email, password })
      storeLogin(user, access_token)
      setSuccess('¡Inicio de sesión exitoso! Redirigiendo...')
      setTimeout(() => {
        router.push(redirect)
      }, 1000)
    } catch (err: any) {
      const errorMessage = err?.message ?? 'Credenciales inválidas'
      setError(errorMessage)
      if (errorMessage.includes('credenciales') || errorMessage.includes('inválidas')) {
        setPasswordError('Correo o contraseña incorrectos')
      }
    } finally {
      setLoading(false)
    }
  }

  function handleEmailChange(e: React.ChangeEvent<HTMLInputElement>) {
    setEmail(e.target.value)
    if (emailError) setEmailError('')
    if (error) setError('')
  }

  function handlePasswordChange(e: React.ChangeEvent<HTMLInputElement>) {
    setPassword(e.target.value)
    if (passwordError) setPasswordError('')
    if (error) setError('')
  }

  function handleQuickLogin(email: string, password: string) {
    setEmail(email)
    setPassword(password)
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
          <p className="font-semibold mb-2">Credenciales de prueba:</p>
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <span>Admin:</span>
              <button
                type="button"
                onClick={() => handleQuickLogin('admin@eduflow.com', 'Admin1234!')}
                className="text-blue-600 hover:underline"
              >
                admin@eduflow.com / Admin1234! ✨
              </button>
            </div>
            <div className="flex justify-between items-center">
              <span>Estudiante:</span>
              <button
                type="button"
                onClick={() => handleQuickLogin('student@eduflow.com', 'Student123!')}
                className="text-blue-600 hover:underline"
              >
                student@eduflow.com / Student123! ✨
              </button>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Correo electrónico</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="email" required autoComplete="email"
                value={email} onChange={handleEmailChange}
                placeholder="tu@correo.com"
                className={`w-full rounded-lg border pl-10 pr-3 py-2.5 text-sm outline-none transition focus:ring-2 dark:bg-gray-900 dark:text-gray-100 ${
                  emailError
                    ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
                    : 'border-gray-300 focus:border-primary-400 focus:ring-primary-100 dark:border-gray-700'
                }`}
              />
              {email && !emailError && validateEmail(email) && (
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </div>
              )}
            </div>
            {emailError && (
              <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {emailError}
              </p>
            )}
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Contraseña</label>
              <Link href="/forgot-password" className="text-xs text-primary-600 hover:underline">¿Olvidaste tu contraseña?</Link>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type={showPass ? 'text' : 'password'} required
                value={password} onChange={handlePasswordChange}
                placeholder="••••••••"
                className={`w-full rounded-lg border pl-10 pr-10 py-2.5 text-sm outline-none transition focus:ring-2 dark:bg-gray-900 dark:text-gray-100 ${
                  passwordError
                    ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
                    : 'border-gray-300 focus:border-primary-400 focus:ring-primary-100 dark:border-gray-700'
                }`}
              />
              <button type="button" onClick={() => setShowPass((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {passwordError && (
              <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {passwordError}
              </p>
            )}
            {password && !passwordError && validatePassword(password) && (
              <p className="mt-1 text-xs text-green-600 flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                Contraseña válida
              </p>
            )}
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950 dark:text-red-400 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}

          {success && (
            <div className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-600 dark:bg-green-950 dark:text-green-400 flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              {success}
            </div>
          )}

          <Button type="submit" fullWidth size="lg" loading={loading} disabled={!!emailError || !!passwordError}>
            {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
          </Button>
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              ¿No tienes cuenta?{' '}
              <Link href="/register" className="font-medium text-primary-600 hover:underline">
                Regístrate gratis
              </Link>
            </p>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 text-center mb-3">O continúa con</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
                disabled={loading}
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google
              </button>
              <button
                type="button"
                className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
                disabled={loading}
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                GitHub
              </button>
            </div>
          </div>
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
