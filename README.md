# Himnario Digital · Iglesia Unión Pentecostal

Plataforma web de himnario y cancionero cristiano evangélico: biblioteca digital donde los miembros de la iglesia consultan himnos, coritos y alabanzas con letra, acordes, transposición de tonalidad, favoritos y modo sin conexión.

**Tecnologías:** Next.js 14 (App Router) · TypeScript · Tailwind CSS · Supabase (PostgreSQL) · PWA · Vercel.

---

## Funciones

| Para la congregación | Para músicos | Para administradores |
|---|---|---|
| Búsqueda por título, autor, temática, tonalidad y número | Acordes sobre la letra | Login seguro (Supabase Auth) |
| Favoritos e historial reciente (por dispositivo) | Transposición ±1 a ±6 semitonos | Crear, editar y eliminar canciones |
| Lectura nocturna | Cambio de tonalidad automático | Importación masiva desde Excel |
| Tamaño de letra configurable | Modo ensayo (desplazamiento automático) | Importación desde PDF |
| Himnos más utilizados y recientes | Pantalla completa | Gestión de categorías y usuarios |
| PWA instalable, funciona sin conexión | | |

---

## 1. Instalación local

Requisitos: Node.js 18 o superior.

```bash
npm install
npm run dev
```

Abrí <http://localhost:3000>. **El sitio funciona de inmediato en modo demostración** con los 20 himnos de ejemplo, sin necesidad de configurar nada más.

## 2. Conectar Supabase (contenido real)

1. Creá un proyecto gratuito en [supabase.com](https://supabase.com).
2. En **SQL Editor → New query**, pegá y ejecutá el contenido completo de [`supabase/schema.sql`](supabase/schema.sql). Esto crea las tablas (`songs`, `categories`, `authors`, `users`, `favorites`, `playlists`, `playlist_songs`), las políticas de seguridad (RLS) y carga los 20 himnos semilla.
3. Copiá `.env.example` a `.env.local` y completá con los datos de **Project Settings → API**:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://TU-PROYECTO.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=TU_CLAVE_ANON
   ```

4. **Crear el primer administrador:**
   - En Supabase: **Authentication → Users → Add user** (correo y contraseña).
   - En SQL Editor: `update users set role = 'admin' where email = 'tu@correo.com';`
5. Reiniciá el servidor. Entrá a `/admin` con ese correo y contraseña.

> Seguridad: la lectura del himnario es pública; escribir (crear/editar/eliminar) solo lo permiten las políticas RLS a usuarios con rol `editor` o `admin`. La clave `anon` es segura de exponer.

## 3. Despliegue en Vercel

1. Subí el proyecto a un repositorio de GitHub.
2. En [vercel.com](https://vercel.com): **Add New → Project → importá el repositorio** (Vercel detecta Next.js automáticamente).
3. En **Environment Variables** agregá:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_SITE_URL` → la URL final del sitio (por ejemplo `https://himnario-up.vercel.app`), usada por el SEO (sitemap, Open Graph).
4. **Deploy.** Cada `git push` publica automáticamente.

## 4. Importación masiva desde Excel

En `/admin/importar`, subí un `.xlsx` o `.csv` con una fila por canción y estas columnas (en minúsculas):

```
numero | titulo | autor | anio | categoria | tonalidad | letra | notas | media_url
```

- `categoria` debe coincidir con el nombre de una categoría existente (ej.: `Adoración`).
- Los acordes van entre corchetes dentro de la letra: `[G]Grande es tu [D]amor`.
- Las secciones se marcan como `[Coro]`, `[Estrofa 1]`, `[Puente]`, etc.
- Si el `numero` ya existe, la canción se **actualiza** (no se duplica).

La importación desde **PDF** extrae el texto del archivo y lo pre-carga en el formulario de nueva canción para revisarlo y completar los datos.

## 5. Formato de letra con acordes

```
[Estrofa 1]
[G]Grande es tu amor por [C]mí, Señor,
[G]más alto que el [D]cielo azul;

[Coro]
[C]Grande, [D]grande es tu [G]amor…
```

El visor muestra los acordes **encima** de la sílaba correspondiente y los transpone automáticamente al cambiar de tono. Con los acordes ocultos, la congregación ve la letra limpia.

## 6. Estructura del proyecto

```
├── public/                  Logos de la iglesia, íconos PWA, manifest.json, sw.js
├── supabase/schema.sql      Esquema completo + RLS + 20 himnos semilla
└── src/
    ├── app/
    │   ├── page.tsx              Inicio (logo, buscador, categorías, recientes, favoritos)
    │   ├── biblioteca/           Búsqueda instantánea con filtros
    │   ├── cancion/[slug]/       Vista de canción (SSG + SEO + JSON-LD)
    │   ├── categorias/[slug]/    Navegación por temática
    │   ├── favoritos/            Favoritos e historial del dispositivo
    │   ├── admin/                Panel: resumen, canciones, importar, categorías, usuarios
    │   ├── api/                  REST: /api/songs, /api/songs/[slug], /api/categories, /api/import/pdf
    │   ├── sitemap.ts, robots.ts SEO
    │   └── layout.tsx            Metadatos, PWA, fuentes, tema
    ├── components/          Header, SongCard, SearchLibrary, SongViewer, admin/…
    └── lib/
        ├── config.ts        Nombre de la iglesia (editable en un solo lugar)
        ├── chords.ts        Motor de acordes y transposición
        ├── data.ts          Capa de datos (Supabase o modo demo)
        ├── storage.ts       Favoritos, historial y preferencias locales
        └── demo-songs.ts    20 himnos de demostración
```

## 7. Personalización

- **Nombre de la iglesia:** editá `src/lib/config.ts`.
- **Logos:** reemplazá `public/logo-white.png`, `logo-navy.png`, `logo-gold.png` y los íconos de `public/icons/`.
- **Colores:** paleta en `tailwind.config.ts` (`navy`, `oro`, `marfil`).
- **Versículo del pie de página:** en `src/lib/config.ts`.

## 8. API REST

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/songs` | Lista de canciones. Filtros: `?q=`, `?category=`, `?key=` |
| GET | `/api/songs/[slug]` | Detalle de una canción |
| PATCH | `/api/songs/[slug]` | Suma una vista (ranking "más cantados") |
| GET | `/api/categories` | Lista de categorías |
| POST | `/api/import/pdf` | Extrae texto de un PDF (multipart, campo `file`) |

## 9. PWA y modo sin conexión

En Android/Chrome aparece la opción **"Instalar aplicación"**. El service worker (`public/sw.js`) guarda en caché las páginas visitadas: los himnos que ya abriste quedan disponibles sin conexión. Los favoritos, el historial y las preferencias se guardan en el dispositivo y también funcionan offline.

---

*«Cantad alegres a Dios, habitantes de toda la tierra» — Salmo 100:1*

