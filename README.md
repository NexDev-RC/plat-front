# EduFlow — Frontend

Plataforma de cursos online tipo Udemy, construida con **Next.js 15** (App Router) + **Tailwind CSS**.
El backend está en un proyecto separado con **NestJS**.

---

## Stack

| Capa | Tecnología |
|---|---|
| Framework | Next.js 15 (App Router) |
| Estilos | Tailwind CSS 3 |
| Estado global | Zustand (auth + carrito) |
| Fetching | React Query (@tanstack) |
| HTTP client | Axios |
| Íconos | Lucide React |
| Tipos | TypeScript |

---

## Estructura del proyecto

```
src/
├── app/
│   ├── (main)/              # Layout con Navbar + Footer
│   │   ├── page.tsx         # Home / Landing
│   │   ├── courses/
│   │   │   ├── page.tsx     # Catálogo con filtros
│   │   │   └── [courseId]/
│   │   │       └── page.tsx # Detalle del curso
│   │   └── dashboard/
│   │       └── page.tsx     # Mi aprendizaje
│   ├── login/page.tsx       # Sin Navbar/Footer
│   ├── register/page.tsx
│   ├── layout.tsx           # Root layout
│   ├── globals.css
│   └── providers.tsx        # React Query provider
│
├── components/
│   ├── ui/                  # Primitivos reutilizables
│   │   ├── Button.tsx
│   │   ├── Badge.tsx
│   │   └── Rating.tsx
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   └── Footer.tsx
│   ├── courses/
│   │   ├── CourseCard.tsx
│   │   └── CourseCardSkeleton.tsx
│   └── player/
│       └── LearnPageClient.tsx
│
├── lib/
│   ├── api-client.ts        # Axios con interceptores JWT
│   ├── utils.ts             # cn(), formatDuration(), formatPrice()
│   └── hooks/
│       └── use-auth.ts
│
├── services/                # Todas las llamadas al backend NestJS
│   ├── auth.service.ts
│   ├── courses.service.ts
│   └── enrollments.service.ts
│
├── store/                   # Zustand stores
│   ├── auth.store.ts
│   └── cart.store.ts
│
├── types/
│   └── index.ts             # Course, User, Lesson, Enrollment...
│
└── middleware.ts             # Protección de rutas
```

---

## Inicio rápido

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar variables de entorno
cp .env.local.example .env.local
# → Editar NEXT_PUBLIC_API_URL con la URL de tu backend NestJS

# 3. Iniciar en desarrollo
npm run dev
# → http://localhost:3000
```

---

## Variables de entorno

```env
NEXT_PUBLIC_API_URL=http://localhost:3001   # URL de NestJS
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=cambia-esto-en-produccion
JWT_SECRET=cambia-esto-en-produccion
```

---

## Integración con NestJS

El cliente Axios en `src/lib/api-client.ts`:
- Adjunta automáticamente el JWT desde `localStorage` en cada request
- Redirige a `/login` si el backend devuelve `401`
- La URL base se configura en `NEXT_PUBLIC_API_URL`

Los servicios en `src/services/` mapean exactamente los endpoints del backend:

| Servicio | Endpoint NestJS |
|---|---|
| `login()` | `POST /auth/login` |
| `register()` | `POST /auth/register` |
| `getCourses()` | `GET /courses` |
| `getCourseBySlug()` | `GET /courses/:slug` |
| `getMyEnrollments()` | `GET /enrollments/me` |
| `completeLesson()` | `POST /enrollments/:id/complete-lesson` |

---

## Próximas páginas a implementar

- `/learn/[courseId]` — Reproductor de clases (estructura lista en `LearnPageClient.tsx`)
- `/cart` — Carrito de compras
- `/profile` — Perfil del usuario
- `/certificate/[id]` — Certificado de finalización

---

## Convenciones

- Los componentes Server usan `async/await` directamente.
- Los componentes Client llevan `'use client'` al inicio.
- Los path aliases `@/` apuntan a `src/`.
- Todas las fechas vienen del backend como ISO strings.
