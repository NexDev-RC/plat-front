'use client'

import Link from 'next/link'
import { Shield, ArrowRight } from 'lucide-react'
import { useAuthStore } from '@/store/auth.store'

export function AdminBannerClient() {
  const { user, _hasHydrated } = useAuthStore()

  if (!_hasHydrated || user?.role !== 'admin') return null

  return (
    <div className="mb-6 flex items-center justify-between rounded-xl border border-primary-200 bg-primary-50 px-5 py-4 dark:border-primary-800 dark:bg-primary-950">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-100 text-primary-600 dark:bg-primary-900 dark:text-primary-300">
          <Shield className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-semibold text-primary-800 dark:text-primary-200">Modo Administrador</p>
          <p className="text-xs text-primary-600 dark:text-primary-400">Tienes acceso completo a la plataforma</p>
        </div>
      </div>
      <Link
        href="/admin"
        className="flex items-center gap-1.5 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 transition-colors"
      >
        Panel admin <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  )
}
