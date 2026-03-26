# Far Away Explorers — Frontend (Astro + WordPress Headless)

Sitio web estático de la agencia de turismo **FAR AWAY EXPLORERS SAC** (Cusco, Perú). Arquitectura headless: WordPress como CMS/API y Astro como frontend SSG.

---

## Arquitectura general

```
farawayexplorers.com          → Frontend Astro (este repositorio)
travel.farawayexplorers.com   → WordPress (CMS + REST API + Yoast SEO)
```

- Todo el contenido (tours, blog, categorías) viene del WordPress REST API en build time.
- El sitio se genera como HTML estático (`npm run build`). No hay SSR.
- El SEO lo maneja Yoast SEO en WordPress; el `yoast_head` se inyecta directamente en el `<head>` de cada página.

---

## Stack

| Herramienta | Version | Uso |
|---|---|---|
| Astro | 5.17.1 | Framework SSG |
| SASS/SCSS | 1.97.3 | Estilos (con variables y mixins centralizados) |
| Swiper | 12.1.2 | Carruseles de tours y blog |
| GLightbox | 3.3.1 | Galería de imágenes en tours |
| astro-icon | 1.1.5 | Iconos (Ion icons via Iconify) |
| TypeScript | — | Tipado en componentes y páginas |

---

## Variables de entorno

Archivo `.env` en la raíz:

```env
PUBLIC_WP_API_URL=https://travel.farawayexplorers.com/wp-json
```

Esta es la única variable de entorno del proyecto. Se accede con `import.meta.env.PUBLIC_WP_API_URL`.

---

## Estructura de páginas y rutas

### Páginas estáticas
| Ruta | Archivo |
|---|---|
| `/` | `pages/index.astro` |
| `/destinos` | `pages/destinos.astro` |
| `/about-us` | `pages/about-us.astro` |
| `/contacto` | `pages/contacto.astro` |
| `/terminos-y-condiciones` | `pages/terminos-y-condiciones.astro` |
| `/politica-de-datos` | `pages/politica-de-datos.astro` |
| `/libro-de-reclamaciones` | `pages/libro-de-reclamaciones.astro` |

### Páginas dinámicas con paginación
Patrón `pages/[categoria]/[...page].astro`. Cada categoría tiene su ID en WordPress:

| Ruta | Category ID WP |
|---|---|
| `/cusco` | 3 |
| `/arequipa` | 2 |
| `/puno` | 8 |
| `/lima` | 7 |
| `/ica` | 4 |
| `/nazca` | 6 |
| `/bolivia` | 10 |
| `/paquetes` | 11 |
| `/trekking` | 13 |
| `/full-day` | 12 |
| `/blog` | — |

- 12 items por página, generadas con `getStaticPaths` + `paginate()`.

### Páginas de detalle
- `/tour/[slug]` — Tour individual con ACF, galería, tours similares
- `/blog/[slug]` — Post con autor, tiempo de lectura, posts relacionados

### Rutas especiales
- `/sitemap.xml` — Generado dinámicamente en `pages/sitemap.xml.ts`

---

## Endpoints de WordPress consumidos

```
GET /wp/v2/tour?slug={slug}&_embed&_fields=...        → detalle de tour
GET /wp/v2/tour?categories={id}&per_page=12           → listing de categoría
GET /wp/v2/tour?per_page=100&_fields=slug,modified    → sitemap
GET /wp/v2/blog?slug={slug}&_embed                    → detalle de blog
GET /wp/v2/blog?per_page=100&_embed                   → listing de blog
GET /wp/v2/categories?slug={slug}                     → ID de categoría
GET /wp/v2/pages?slug={slug}                          → páginas estáticas (SEO)
GET /wp/v2/media/{id}                                 → imágenes individuales
```

Los campos ACF de tours: `tipo_de_tour`, `price`, `grupo`, `duracion`, `imagen_1` a `imagen_4`.

---

## Yoast SEO

Yoast envía un bloque HTML completo en el campo `yoast_head` de cada endpoint. Se inyecta así en los layouts:

```astro
{yoastHead
  ? <Fragment set:html={yoastHead} />
  : /* fallback manual con og:title, og:description, etc. */
}
```

### Reemplazo de dominios (importante)
WordPress genera URLs apuntando a su propio dominio. Los layouts sanitizan el `yoast_head` antes de renderizarlo:

```js
// En Layout.astro y LayoutHome.astro
const yoastHead = rawYoastHead
  ?.replace(/wp\.farawayexplorers\.com/g, 'farawayexplorers.com')
  ?.replace(/travel\.farawayexplorers\.com/g, 'farawayexplorers.com');
```

Esto aplica a todos los meta tags: `og:url`, canonical, `og:site_name`, JSON-LD, etc.

> Si se migra el WordPress a otro dominio, solo hay que actualizar estos dos reemplazos en los layouts, no tocar cada página.

---

## Layouts

### `Layout.astro`
Usado por todas las páginas excepto el home. Header con `background="white"`.

### `LayoutHome.astro`
Exclusivo para `index.astro`. Header con `background="light"`.

Ambos layouts aceptan las mismas props:

```typescript
{
  title?: string           // default: "Far Away Explorers"
  description?: string
  canonical?: string
  ogTitle?: string
  ogDescription?: string
  ogImage?: string
  twitterTitle?: string
  twitterDescription?: string
  twitterImage?: string
  noindex?: boolean        // default: false
  schema?: object          // JSON-LD structured data
  yoastHead?: string       // HTML raw de Yoast (tiene prioridad sobre el fallback)
}
```

---

## Estilos

```
src/styles/
├── global.scss              → importa todo
├── categories-page.scss     → estilos compartidos entre páginas de categoría
├── abstract/
│   ├── _variables.scss      → colores, fuentes, breakpoints, espaciado
│   └── _mixins.scss         → media queries, flex helpers, btn-primary, eyebrow
└── base/
    ├── _reset.scss
    └── _typography.scss
```

Color principal: `#AA5C00`. Fuente: Montserrat (woff2 preloaded). Breakpoints: `sm` 640px, `md` 768px, `lg` 1024px.

---

## Componentes

```
src/components/
├── Header.astro
├── Footer.astro
├── Hero.astro
├── TourCard.astro
├── BlogCard.astro
└── ... (otros)
```

---

## Comandos

```bash
npm install        # instalar dependencias
npm run dev        # servidor local en localhost:4321
npm run build      # build estático → ./dist/
npm run preview    # preview del build
```

---

## Contexto de negocio

- **Empresa:** FAR AWAY EXPLORERS SAC
- **RUC:** 20615539865
- **Ubicación:** Calle Bolivar 220, Cusco, Perú
- **Contacto:** info@farawayexplorers.com / +51 900 086 730
- **Producto:** Tours y paquetes turísticos en Perú y Bolivia

---

## Historial de migraciones de dominio

1. Dominio original de WP: `wp.farawayexplorers.com`
2. Migrado a: `travel.farawayexplorers.com` (dominio actual del backend)
3. Frontend público: `farawayexplorers.com`

Los reemplazos de dominio en los layouts contemplan ambos dominios anteriores del backend.
