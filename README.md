# 📖 Himnario Digital

Plataforma web moderna de himnario y cancionero cristiano evangélico. Biblioteca digital de himnos, coritos y alabanzas con acordes, transposición automática, búsqueda instantánea y panel administrativo completo.

**Stack:** Next.js 14 (App Router) + TypeScript + Tailwind CSS + Supabase (PostgreSQL + Auth) · PWA instalable · Listo para Vercel.

---

## ✨ Funcionalidades

- 🔍 **Búsqueda instantánea** por título, número, autor, tonalidad o temática
- 🎸 **Acordes integrados** sobre la letra, con **transposición automática** (-6 a +6 semitonos)
- 🌙 **Modo nocturno**, tamaño de fuente ajustable, modo ensayo, pantalla completa
- ❤️ **Favoritos** (sincronizados en la nube si hay sesión, o locales si no)
- 🕓 **Historial reciente** de himnos visitados
- 🗂️ **12 categorías** predefinidas (Adoración, Alabanza, Evangelización, Santa Cena, Navidad, etc.)
- 🔐 **Panel administrativo** con roles (admin / editor / miembro): CRUD de canciones, categorías y usuarios
- 📥 **Importación masiva** desde Excel (.xlsx/.csv) y PDF
- 📱 **PWA instalable** en Android/iOS, con caché offline de los himnos ya visitados
- 🔎 **SEO**: metadatos dinámicos, sitemap.xml y robots.txt generados automáticamente
- 🎨 Diseño elegante en **azul oscuro + blanco + dorado**, 100% responsive

---

## 📁 Estructura del proyecto

```
himnario-digital/
├── src/
│   ├── app/                      # Rutas (App Router de Next.js)
│   │   ├── page.tsx               # Inicio
│   │   ├── biblioteca/            # Biblioteca con filtros
│   │   ├── categorias/[slug]/     # Categoría individual
│   │   ├── cancion/[id]/          # Vista de canción
│   │   ├── favoritos/             # Favoritos del usuario
│   │   ├── historial/             # Historial reciente
│   │   ├── login/                 # Login del panel admin
│   │   ├── admin/                 # Panel administrativo (protegido)
│   │   │   ├── canciones/         # CRUD de canciones
│   │   │   ├── categorias/        # CRUD de categorías
│   │   │   ├── usuarios/          # Gestión de roles
│   │   │   └── importar/          # Importación masiva
│   │   ├── api/                   # Rutas API REST
│   │   │   ├── songs/             # CRUD de canciones vía API
│   │   │   └── import/            # Endpoints de importación Excel/PDF
│   │   ├── sitemap.ts / robots.ts # SEO
│   │   └── offline/               # Fallback PWA sin conexión
│   ├── components/
│   │   ├── ui/                    # Button, Input, Card, Badge
│   │   ├── layout/                # Header, Footer
│   │   ├── songs/                 # SearchBox, LyricsViewer, SongCard, etc.
│   │   └── admin/                 # Formularios y tablas del panel
│   ├── lib/
│   │   ├── chords.ts              # Motor de transposición de acordes
│   │   ├── data/songs.ts          # Capa de acceso a datos (servidor)
│   │   ├── store.ts               # Estado global (Zustand): preferencias, favoritos locales
│   │   ├── auth.ts                # Helpers de autenticación/roles
│   │   └── supabase/              # Clientes Supabase (browser, server, middleware)
│   └── types/                     # Tipos TypeScript del dominio
├── supabase/
│   └── migrations/                 # Esquema SQL versionado
│       ├── 0001_init_schema.sql    # Tablas, RLS, triggers, búsqueda full-text
│       └── 0002_seed_categories.sql
├── scripts/
│   └── seed.ts                     # 20 himnos de demostración
└── public/
    ├── manifest.json                # Manifest PWA
    └── icons/                       # Iconos PWA (192, 512, apple-touch)
```

---

## 🚀 Instalación local

### 1. Requisitos previos

- Node.js 18.17 o superior
- Una cuenta gratuita en [Supabase](https://supabase.com)
- (Opcional) Cuenta en [Vercel](https://vercel.com) para el despliegue

### 2. Clonar e instalar dependencias

```bash
cd himnario-digital
npm install
```

### 3. Crear el proyecto en Supabase

1. Entra a [supabase.com/dashboard](https://supabase.com/dashboard) y crea un nuevo proyecto.
2. Ve a **SQL Editor** y ejecuta, en orden, el contenido de:
   - `supabase/migrations/0001_init_schema.sql`
   - `supabase/migrations/0002_seed_categories.sql`
3. Ve a **Project Settings → API** y copia:
   - `Project URL`
   - `anon public` key
   - `service_role` key (¡secreta, nunca la expongas en el cliente!)

### 4. Configurar variables de entorno

Copia `.env.example` a `.env.local` y completa los valores:

```bash
cp .env.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-publica
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key-secreta
NEXT_PUBLIC_SITE_NAME="Himnario Digital"
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 5. Crear tu primer usuario administrador

1. En Supabase, ve a **Authentication → Users → Add user** y crea un usuario con correo y contraseña.
2. Al crearse, el trigger `handle_new_user` le asignará automáticamente el rol `member` en la tabla `profiles`.
3. Para hacerlo administrador, ve a **Table Editor → profiles**, busca tu usuario y cambia la columna `role` a `admin`.

### 6. Cargar los 20 himnos de demostración (opcional)

```bash
npm run seed
```

Esto usa la `service_role` key para insertar autores, y 20 himnos de ejemplo con acordes, listos para probar la transposición y la búsqueda.

### 7. Levantar el entorno de desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000). Para entrar al panel administrativo, ve a `/login` con el usuario que creaste en el paso 5.

---

## ☁️ Despliegue en Vercel

### Opción A: desde la interfaz web

1. Sube este proyecto a un repositorio de GitHub/GitLab/Bitbucket.
2. Entra a [vercel.com/new](https://vercel.com/new) e importa el repositorio.
3. En **Environment Variables**, agrega las mismas variables de `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_SITE_NAME`
   - `NEXT_PUBLIC_SITE_URL` → usa la URL final de Vercel (ej. `https://himnario-tuiglesia.vercel.app`)
4. Haz clic en **Deploy**. Vercel detecta Next.js automáticamente, no requiere configuración adicional.

### Opción B: desde la CLI de Vercel

```bash
npm install -g vercel
vercel login
vercel
# sigue las instrucciones; luego para producción:
vercel --prod
```

### Después del primer despliegue

- En Supabase, ve a **Authentication → URL Configuration** y agrega la URL de Vercel a **Site URL** y **Redirect URLs** (necesario para que el login funcione correctamente en producción).
- Verifica que `NEXT_PUBLIC_SITE_URL` en Vercel coincida con el dominio real, para que el `sitemap.xml` y los metadatos Open Graph sean correctos.

---

## 🎸 Formato de acordes

Los acordes se integran en la letra usando corchetes inmediatamente antes de la sílaba donde se tocan:

```
[G]Sublime gracia del [D]Señor
que a un infeliz [G]salvó
```

El motor de transposición (`src/lib/chords.ts`) soporta acordes simples (`G`), con séptima (`Am7`), disminuidos (`F#dim`), y acordes con bajo (`C/E`). Detecta automáticamente si la tonalidad de destino debe escribirse con sostenidos o bemoles.

---

## 📥 Importación masiva

### Desde Excel / CSV

Columnas esperadas (el orden no importa, los nombres no distinguen mayúsculas/acentos):

| Columna | Obligatorio | Descripción |
|---|---|---|
| `numero` | No | Número de himno |
| `titulo` | **Sí** | Título de la canción |
| `autor` | No | Nombre del autor (se crea automáticamente si no existe) |
| `categoria` | No | Debe coincidir con el nombre exacto de una categoría existente |
| `anio` | No | Año de composición |
| `tonalidad` | No | Tonalidad original (ej. `C`, `Am`, `Bb`) |
| `letra` | **Sí** | Letra completa en texto plano |
| `letra_acordes` | No | Letra con acordes en formato `[G]texto` |
| `tags` | No | Etiquetas separadas por coma |

### Desde PDF

El sistema extrae el texto del PDF y separa los himnos usando el delimitador `###` antes de cada título:

```
### Sublime Gracia
Sublime gracia del Señor
que a un infeliz salvó...

### Cuán Grande Es Él
Señor mi Dios, al contemplar los cielos...
```

Ambas opciones están disponibles en **Panel administrativo → Importar masivo**.

---

## 🔐 Roles de usuario

| Rol | Permisos |
|---|---|
| `member` | Navegar, buscar, favoritos, historial (sin acceso al panel admin) |
| `editor` | Todo lo anterior + crear/editar/eliminar canciones y categorías |
| `admin` | Todo lo anterior + gestionar usuarios y sus roles |

Los roles se gestionan desde **Panel administrativo → Usuarios** (solo visible para administradores).

---

## 🗄️ Esquema de base de datos

| Tabla | Descripción |
|---|---|
| `profiles` | Usuarios extendidos (vinculados a `auth.users`), con rol |
| `authors` | Autores/compositores de los himnos |
| `categories` | Categorías temáticas |
| `songs` | Canciones: letra, acordes, tonalidad, audio/video, etc. |
| `favorites` | Relación usuario ↔ canción favorita |
| `playlists` / `playlist_songs` | Listas de alabanza personalizables |
| `recent_history` | Historial de canciones visitadas por usuario |

Todas las tablas tienen **Row Level Security (RLS)** habilitado: lectura pública para el contenido del himnario, escritura restringida a `admin`/`editor`, y datos personales (favoritos, historial) visibles solo para su dueño.

---

## 🛠️ Scripts disponibles

```bash
npm run dev      # Entorno de desarrollo (http://localhost:3000)
npm run build    # Build de producción
npm run start    # Servidor de producción (tras build)
npm run lint     # Linter de Next.js/ESLint
npm run seed     # Carga los 20 himnos de demostración
```

---

## 📱 PWA (instalación en celular)

1. Abre el sitio desplegado desde Chrome en Android (o Safari en iOS).
2. Toca el menú **⋮ → Agregar a pantalla de inicio** (Android) o **Compartir → Agregar a inicio** (iOS).
3. La app se instala con su propio ícono y abre en modo standalone, sin barra de navegador.
4. Los himnos visitados quedan disponibles sin conexión gracias al `service worker`.

---

## 🤝 Soporte y personalización

- **Cambiar el logo**: reemplaza el ícono en `src/components/layout/Header.tsx` (actualmente usa el ícono `BookOpen` de `lucide-react`; puedes sustituirlo por una imagen con `next/image`).
- **Cambiar colores**: edita la paleta `navy`/`gold` en `tailwind.config.js`.
- **Agregar campos a las canciones**: agrega la columna en `supabase/migrations/`, actualiza `src/types/index.ts` y `src/types/database.ts`, y el formulario en `src/components/admin/SongForm.tsx`.

---

## 📄 Licencia

Proyecto entregado para uso interno de la congregación. Personaliza libremente según las necesidades de tu iglesia.

---

*Hecho con dedicación para la gloria de Dios. 🙏*
