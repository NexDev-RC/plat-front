'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { ShoppingCart, Search, Menu, X, BookOpen, User, ChevronDown, LayoutDashboard, BookMarked, Shield, LogOut } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { Button, buttonBase, variantClasses, sizeClasses } from '@/components/ui/Button'
import { useAuthStore } from '@/store/auth.store'
import { useCartStore } from '@/store/cart.store'
import { logoutApi } from '@/services/auth.service'

const NAV_LINKS = [
  { href: '/courses', label: 'Explorar' },
]

export function Navbar() {
  const router               = useRouter()
  const pathname             = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef          = useRef<HTMLDivElement>(null)

  const { user, isAuthenticated, logout, _hasHydrated } = useAuthStore()
  const { items, _hasHydrated: cartHydrated }           = useCartStore()
  const cartCount = cartHydrated ? items.length : 0

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  async function handleLogout() {
    try { await logoutApi() } catch {}
    logout()
    router.push('/')
    setDropdownOpen(false)
  }

  // Menú de usuario según rol
  const userMenuItems = [
    { href: '/dashboard', label: 'Mi aprendizaje', icon: LayoutDashboard, roles: ['student', 'admin', 'instructor'] },
    { href: '/instructor/courses', label: 'Mis cursos', icon: BookMarked, roles: ['instructor', 'admin'] },
    { href: '/admin', label: 'Panel admin', icon: Shield, roles: ['admin'] },
    { href: '/profile', label: 'Mi perfil', icon: User, roles: ['student', 'instructor', 'admin'] },
  ]

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/90 backdrop-blur dark:border-gray-800 dark:bg-gray-950/90">
      <nav className="container-page flex h-16 items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-primary-600">
          <BookOpen className="h-6 w-6" />
          <span className="text-lg">EduFlow</span>
        </Link>

        {/* Búsqueda desktop */}
        <form method="GET" action="/courses" className="hidden flex-1 max-w-md md:flex">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input type="search" name="search" placeholder="Buscar cursos..."
              className="w-full rounded-full border border-gray-300 bg-gray-50 py-2 pl-9 pr-4 text-sm outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100 dark:border-gray-700 dark:bg-gray-900"
            />
          </div>
        </form>

        {/* Nav links desktop */}
        <div className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href}
              className={cn('rounded-md px-3 py-2 text-sm font-medium transition-colors hover:text-primary-600',
                pathname === link.href ? 'text-primary-600' : 'text-gray-600 dark:text-gray-300'
              )}
            >{link.label}</Link>
          ))}
        </div>

        {/* Acciones */}
        <div className="flex items-center gap-2">
          {/* Carrito */}
          <Link href="/cart" className="relative rounded-md p-2 hover:bg-gray-100 dark:hover:bg-gray-800">
            <ShoppingCart className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            {cartCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary-600 text-[10px] font-bold text-white">
                {cartCount}
              </span>
            )}
          </Link>

          {/* Auth */}
          {!_hasHydrated ? (
            <div className="hidden items-center gap-2 md:flex">
              <Link href="/login"    className={cn(buttonBase, sizeClasses['sm'], variantClasses['ghost'])}>Iniciar sesión</Link>
              <Link href="/register" className={cn(buttonBase, sizeClasses['sm'], variantClasses['primary'])}>Registrarse</Link>
            </div>
          ) : isAuthenticated ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen((v) => !v)}
                className="flex items-center gap-2 rounded-full p-1 pr-2 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-primary-100 text-primary-600 dark:bg-primary-900 dark:text-primary-300">
                  {user?.avatarUrl
                    ? <img src={user.avatarUrl} alt={user.name} className="h-full w-full object-cover" />
                    : <User className="h-4 w-4" />
                  }
                </div>
                <span className="hidden max-w-[100px] truncate text-sm font-medium text-gray-700 dark:text-gray-300 md:inline">{user?.name}</span>
                <ChevronDown className={cn('hidden h-3.5 w-3.5 text-gray-400 transition-transform md:block', dropdownOpen && 'rotate-180')} />
              </button>

              {/* Dropdown */}
              {dropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-52 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-900">
                  <div className="border-b border-gray-100 px-4 py-3 dark:border-gray-800">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{user?.name}</p>
                    <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                    <span className="mt-1 inline-block rounded-full bg-primary-100 px-2 py-0.5 text-[10px] font-medium text-primary-700 dark:bg-primary-900 dark:text-primary-300">
                      {user?.role === 'admin' ? 'Administrador' : user?.role === 'instructor' ? 'Instructor' : 'Estudiante'}
                    </span>
                  </div>
                  <div className="py-1">
                    {userMenuItems
                      .filter((item) => item.roles.includes(user?.role ?? ''))
                      .map((item) => (
                        <Link key={item.href} href={item.href}
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
                        >
                          <item.icon className="h-4 w-4 text-gray-400" />
                          {item.label}
                        </Link>
                      ))}
                  </div>
                  <div className="border-t border-gray-100 py-1 dark:border-gray-800">
                    <button onClick={handleLogout}
                      className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950"
                    >
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

          {/* Menú móvil */}
          <button className="rounded-md p-2 hover:bg-gray-100 dark:hover:bg-gray-800 md:hidden"
            onClick={() => setMobileOpen((v) => !v)} aria-label="Abrir menú">
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {/* Menú móvil desplegable */}
      {mobileOpen && (
        <div className="border-t border-gray-200 bg-white px-4 py-4 dark:border-gray-800 dark:bg-gray-950 md:hidden">
          <form method="GET" action="/courses" className="mb-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input type="search" name="search" placeholder="Buscar cursos..."
                className="w-full rounded-full border border-gray-300 bg-gray-50 py-2 pl-9 pr-4 text-sm outline-none dark:border-gray-700 dark:bg-gray-900" />
            </div>
          </form>

          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)}
              className="block rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800">
              {link.label}
            </Link>
          ))}

          {_hasHydrated && isAuthenticated ? (
            <>
              {userMenuItems
                .filter((item) => item.roles.includes(user?.role ?? ''))
                .map((item) => (
                  <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800">
                    <item.icon className="h-4 w-4 text-gray-400" />{item.label}
                  </Link>
                ))}
              <button onClick={handleLogout}
                className="mt-2 flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400">
                <LogOut className="h-4 w-4" /> Cerrar sesión
              </button>
            </>
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
