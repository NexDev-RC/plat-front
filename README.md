# EduFlow — Frontend (Next.js 15)

Plataforma de cursos online. Frontend conectado al backend NestJS + Supabase.

---

## Inicio rápido

```bash
npm install
# Editar .env.local con la URL del backend
npm run dev   # → http://localhost:3000
```

### Variables de entorno (`.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

El backend debe estar corriendo en ese puerto.

---

## Rutas disponibles

### Públicas (sin autenticación)
| Ruta | Descripción |
|---|---|
| `/` | Landing — cursos destacados y categorías |
| `/courses` | Catálogo con filtros y paginación |
| `/courses/[slug]` | Detalle del curso |
| `/login` | Iniciar sesión |
| `/register` | Crear cuenta |

### Estudiante (`role: student`)
| Ruta | Descripción |
|---|---|
| `/dashboard` | Mis cursos inscritos con progreso |
| `/learn/[courseId]` | Reproductor de clases con progreso |
| `/profile` | Editar perfil |

### Instructor (`role: instructor`)
| Ruta | Descripción |
|---|---|
| `/instructor/courses` | Panel de mis cursos |
| `/instructor/courses/new` | Crear curso |
| `/instructor/courses/[id]/edit` | Editar curso |

### Admin (`role: admin`)
| Ruta | Descripción |
|---|---|
| `/admin` | Panel completo: usuarios + cursos |
| `/admin/courses/new` | Crear curso |
| `/admin/courses/[id]/edit` | Editar cualquier curso |

---

## Credenciales de prueba

El backend crea un admin inicial al ejecutar `schema.sql`:
- **Email:** `admin@eduflow.com`
- **Contraseña:** `Admin1234!`

---

## Gestión por roles

**Sin sesión:**
- Ver catálogo, ver detalle de curso
- Botón "Iniciar sesión para inscribirse"

**Student:**
- Todo lo anterior + inscribirse, ver dashboard, reproducir clases

**Instructor:**
- Crear y gestionar sus propios cursos

**Admin:**
- CRUD completo de todos los cursos
- Gestión de usuarios (cambiar rol, eliminar)
- Estadísticas del panel

---

## Stack

| Capa | Tecnología |
|---|---|
| Framework | Next.js 15 — App Router |
| Estilos | Tailwind CSS 3 |
| Estado | Zustand (auth + carrito) |
| Fetching | React Query + Axios |
| Iconos | Lucide React |
| Tipos | TypeScript |
