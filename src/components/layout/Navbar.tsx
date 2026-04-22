'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { ShoppingCart, Search, Menu, X, BookOpen, User, ChevronDown,
         LayoutDashboard, BookMarked, Shield, LogOut } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { Button, buttonBase, variantClasses, sizeClasses } from '@/components/ui/Button'
import { useAuthStore } from '@/store/auth.store'
import { useCartStore } from '@/store/cart.store'
import { logoutApi } from '@/services/auth.service'

export function Navbar() {
  const router    = useRouter()
  const pathname  = usePathname()
  const [mobileOpen,   setMobileOpen]   = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const { user, isAuthenticated, logout, _hasHydrated } = useAuthStore()
  const { items, _hasHydrated: cartHydrated }           = useCartStore()
  const cartCount = cartHydrated ? items.length : 0

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  async function handleLogout() {
    try { await logoutApi() } catch {}
    logout()
    router.push('/')
    setDropdownOpen(false)
    setMobileOpen(false)
  }

  // Menú de usuario filtrado por rol
  const userMenuItems = [
    {
      href:  '/dashboard',
      label: user?.role === 'admin' ? 'Mi aprendizaje' : 'Mi aprendizaje',
      icon:  LayoutDashboard,
      roles: ['student', 'instructor', 'admin'],
    },
    {
      href:  '/admin',
      label: 'Panel admin',
      icon:  Shield,
      roles: ['admin'],
    },
    {
      href:  '/instructor/courses',
      label: 'Mis cursos',
      icon:  BookMarked,
      roles: ['instructor'],
    },
    {
      href:  '/profile',
      label: 'Mi perfil',
      icon:  User,
      roles: ['student', 'instructor', 'admin'],
    },
  ]

  const visibleMenuItems = userMenuItems.filter((item) =>
    item.roles.includes(user?.role ?? '')
  )

  const ROLE_LABEL: Record<string, string> = {
    student:    'Estudiante',
    instructor: 'Instructor',
    admin:      'Administrador',
  }

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/90 backdrop-blur dark:border-gray-800 dark:bg-gray-950/90">
      <nav className="container-page flex h-16 items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-primary-600 shrink-0">
          <BookOpen className="h-6 w-6" />
          <span className="text-lg">EduFlow</span>
        </Link>

        {/* Búsqueda desktop */}
        <form method="GET" action="/courses" className="hidden flex-1 max-w-md md:flex">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input type="search" name="search" placeholder="Buscar cursos..."
              className="w-full rounded-full border border-gray-300 bg-gray-50 py-2 pl-9 pr-4 text-sm outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100 dark:border-gray-700 dark:bg-gray-900" />
          </div>
        </form>

        {/* Links desktop */}
        <div className="hidden items-center gap-1 md:flex">
          <Link href="/courses"
            className={cn('rounded-md px-3 py-2 text-sm font-medium transition-colors hover:text-primary-600',
              pathname.startsWith('/courses') ? 'text-primary-600' : 'text-gray-600 dark:text-gray-300')}>
            Explorar
          </Link>
        </div>

        {/* Acciones */}
        <div className="flex items-center gap-1.5">
          {/* Carrito */}
          <Link href="/cart"
            className="relative rounded-md p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800">
            <ShoppingCart className="h-5 w-5" />
            {cartCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary-600 text-[10px] font-bold text-white">
                {cartCount}
              </span>
            )}
          </Link>

          {/* Auth — placeholder igual antes de hidratación */}
          {!_hasHydrated ? (
            <div className="hidden items-center gap-2 md:flex">
              <div className="h-8 w-24 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700" />
              <div className="h-8 w-24 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700" />
            </div>
          ) : isAuthenticated ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen((v) => !v)}
                className="flex items-center gap-2 rounded-full py-1 pl-1 pr-2 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary-100 text-primary-600 text-xs font-bold dark:bg-primary-900 dark:text-primary-300">
                  {user?.avatarUrl
                    ? <img src={user.avatarUrl} alt={user.name} className="h-full w-full object-cover rounded-full" />
                    : user?.name?.charAt(0).toUpperCase()
                  }
                </div>
                <span className="hidden max-w-[100px] truncate text-sm font-medium text-gray-700 dark:text-gray-300 md:block">
                  {user?.name}
                </span>
                <ChevronDown className={cn('hidden h-3.5 w-3.5 text-gray-400 transition-transform md:block', dropdownOpen && 'rotate-180')} />
              </button>

              {/* Dropdown */}
              {dropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-900">
                  {/* Info usuario */}
                  <div className="border-b border-gray-100 px-4 py-3 dark:border-gray-800">
                    <p className="truncate text-sm font-semibold text-gray-900 dark:text-gray-100">{user?.name}</p>
                    <p className="truncate text-xs text-gray-500">{user?.email}</p>
                    <span className="mt-1.5 inline-block rounded-full bg-primary-100 px-2.5 py-0.5 text-[10px] font-semibold text-primary-700 dark:bg-primary-900 dark:text-primary-300">
                      {ROLE_LABEL[user?.role ?? ''] ?? user?.role}
                    </span>
                  </div>

                  {/* Links */}
                  <div className="py-1">
                    {visibleMenuItems.map((item) => (
                      <Link key={item.href} href={item.href}
                        onClick={() => setDropdownOpen(false)}
                        className={cn(
                          'flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors',
                          pathname.startsWith(item.href)
                            ? 'bg-primary-50 text-primary-700 dark:bg-primary-950 dark:text-primary-300'
                            : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800'
                        )}>
                        <item.icon className="h-4 w-4 text-gray-400" />
                        {item.label}
                      </Link>
                    ))}
                  </div>

                  {/* Logout */}
                  <div className="border-t border-gray-100 py-1 dark:border-gray-800">
                    <button onClick={handleLogout}
                      className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950">
                      <LogOut className="h-4 w-4" /> Cerrar sesión
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="hidden items-center gap-2 md:flex">
              <Link href="/login"    className={cn(buttonBase, sizeClasses['sm'], variantClasses['ghost'])}>Iniciar sesión</Link>
              <Link href="/register" className={cn(buttonBase, sizeClasses['sm'], variantClasses['primary'])}>Registrarse</Link>
            </div>
          )}

          {/* Hamburguesa */}
          <button
            className="rounded-md p-2 hover:bg-gray-100 dark:hover:bg-gray-800 md:hidden"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Menú">
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {/* ── Menú móvil ─────────────────────────────────────────────────────── */}
      {mobileOpen && (
        <div className="border-t border-gray-200 bg-white px-4 py-4 dark:border-gray-800 dark:bg-gray-950 md:hidden">
          {/* Búsqueda */}
          <form method="GET" action="/courses" className="mb-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input type="search" name="search" placeholder="Buscar cursos..."
                className="w-full rounded-full border border-gray-300 bg-gray-50 py-2 pl-9 pr-4 text-sm outline-none dark:border-gray-700 dark:bg-gray-900" />
            </div>
          </form>

          <Link href="/courses" onClick={() => setMobileOpen(false)}
            className="block rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800">
            Explorar cursos
          </Link>

          {_hasHydrated && isAuthenticated ? (
            <div className="mt-2 border-t border-gray-100 pt-2 dark:border-gray-800">
              {/* Info */}
              <div className="mb-2 flex items-center gap-2 px-3 py-1">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-600 text-xs font-bold dark:bg-primary-900 dark:text-primary-300">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">{user?.name}</p>
                  <p className="text-xs text-gray-500">{ROLE_LABEL[user?.role ?? '']}</p>
                </div>
              </div>

              {visibleMenuItems.map((item) => (
                <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800">
                  <item.icon className="h-4 w-4 text-gray-400" />
                  {item.label}
                </Link>
              ))}

              <button onClick={handleLogout}
                className="mt-1 flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950">
                <LogOut className="h-4 w-4" /> Cerrar sesión
              </button>
            </div>
          ) : (
            <div className="mt-3 flex flex-col gap-2">
              <Link href="/login"    onClick={() => setMobileOpen(false)} className={cn(buttonBase, sizeClasses['md'], variantClasses['outline'], 'w-full')}>Iniciar sesión</Link>
              <Link href="/register" onClick={() => setMobileOpen(false)} className={cn(buttonBase, sizeClasses['md'], variantClasses['primary'], 'w-full')}>Registrarse</Link>
            </div>
          )}
        </div>
      )}
    </header>
  )
}
