import Link from 'next/link'
import { BookOpen } from 'lucide-react'

const FOOTER_LINKS = {
  Plataforma: [
    { label: 'Explorar cursos', href: '/courses' },
    { label: 'Instructores', href: '/instructors' },
    { label: 'Empresas', href: '/business' },
  ],
  Soporte: [
    { label: 'Centro de ayuda', href: '/help' },
    { label: 'Contáctanos', href: '/contact' },
    { label: 'Accesibilidad', href: '/accessibility' },
  ],
  Legal: [
    { label: 'Términos de uso', href: '/terms' },
    { label: 'Privacidad', href: '/privacy' },
    { label: 'Cookies', href: '/cookies' },
  ],
}

export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900">
      <div className="container-page py-12">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 font-bold text-primary-600">
              <BookOpen className="h-5 w-5" />
              <span>EduFlow</span>
            </Link>
            <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
              Aprende sin límites. Cursos de calidad para tu crecimiento profesional.
            </p>
          </div>

          {/* Links */}
          {Object.entries(FOOTER_LINKS).map(([title, links]) => (
            <div key={title}>
              <h3 className="mb-3 text-sm font-semibold text-gray-900 dark:text-gray-100">
                {title}
              </h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-500 transition-colors hover:text-primary-600 dark:text-gray-400"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 border-t border-gray-200 pt-6 text-center text-xs text-gray-400 dark:border-gray-800">
          © {new Date().getFullYear()} EduFlow. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  )
}
