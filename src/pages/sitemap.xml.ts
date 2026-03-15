import type { APIRoute } from 'astro';

const BASE      = 'https://farawayexplorers.com';
const WP        = 'https://wp.farawayexplorers.com/wp-json/wp/v2';
const PAGE_SIZE = 12;

// Categorías con sus IDs de WordPress
const categories = [
  { slug: 'cusco',    id: 3  },
  { slug: 'arequipa', id: 2  },
  { slug: 'puno',     id: 8  },
  { slug: 'lima',     id: 7  },
  { slug: 'ica',      id: 4  },
  { slug: 'nazca',    id: 6  },
  { slug: 'bolivia',  id: 10 },
  { slug: 'paquetes', id: 11 },
  { slug: 'trekking', id: 13 },
  { slug: 'full-day', id: 12 },
];

function entry(loc: string, opts: { lastmod?: string; changefreq?: string; priority?: string } = {}) {
  const lastmod     = opts.lastmod     ? `\n    <lastmod>${opts.lastmod}</lastmod>`         : '';
  const changefreq  = opts.changefreq  ? `\n    <changefreq>${opts.changefreq}</changefreq>` : '';
  const priority    = opts.priority    ? `\n    <priority>${opts.priority}</priority>`       : '';
  return `  <url>\n    <loc>${BASE}${loc}</loc>${lastmod}${changefreq}${priority}\n  </url>`;
}

export const GET: APIRoute = async () => {
  const entries: string[] = [];

  // ── Páginas estáticas ────────────────────────────────────────────────────
  entries.push(entry('/',          { priority: '1.0', changefreq: 'weekly'  }));
  entries.push(entry('/destinos',  { priority: '0.9', changefreq: 'weekly'  }));
  entries.push(entry('/blog',      { priority: '0.8', changefreq: 'daily'   }));
  entries.push(entry('/about-us',  { priority: '0.7', changefreq: 'monthly' }));
  entries.push(entry('/contacto',  { priority: '0.7', changefreq: 'monthly' }));
  // noindex: terminos-y-condiciones, politica-de-datos, libro-de-reclamaciones

  // ── Categorías + paginación ──────────────────────────────────────────────
  await Promise.all(
    categories.map(async ({ slug, id }) => {
      const res   = await fetch(`${WP}/tour?categories=${id}&per_page=1&_fields=id`);
      const total = parseInt(res.headers.get('X-WP-Total') ?? '0', 10);
      const pages = Math.ceil(total / PAGE_SIZE);

      entries.push(entry(`/${slug}`, { priority: '0.9', changefreq: 'weekly' }));
      for (let p = 2; p <= pages; p++) {
        entries.push(entry(`/${slug}/${p}`, { priority: '0.6', changefreq: 'weekly' }));
      }
    })
  );

  // ── Blog: paginación del listado ─────────────────────────────────────────
  const blogCountRes = await fetch(`${WP}/blog?per_page=1&_fields=id`);
  const blogTotal    = parseInt(blogCountRes.headers.get('X-WP-Total') ?? '0', 10);
  const blogPages    = Math.ceil(blogTotal / PAGE_SIZE);
  for (let p = 2; p <= blogPages; p++) {
    entries.push(entry(`/blog/${p}`, { priority: '0.5', changefreq: 'weekly' }));
  }

  // ── Tours individuales ───────────────────────────────────────────────────
  const toursRes = await fetch(`${WP}/tour?per_page=100&_fields=slug,modified`);
  const tours    = await toursRes.json() as { slug: string; modified: string }[];
  for (const tour of tours) {
    entries.push(entry(`/tour/${tour.slug}`, {
      lastmod:    tour.modified?.slice(0, 10),
      priority:   '0.8',
      changefreq: 'weekly',
    }));
  }

  // ── Blog posts individuales ──────────────────────────────────────────────
  const blogsRes = await fetch(`${WP}/blog?per_page=100&_fields=slug,modified`);
  const blogs    = await blogsRes.json() as { slug: string; modified: string }[];
  for (const post of blogs) {
    entries.push(entry(`/blog/${post.slug}`, {
      lastmod:    post.modified?.slice(0, 10),
      priority:   '0.7',
      changefreq: 'monthly',
    }));
  }

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...entries,
    '</urlset>',
  ].join('\n');

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
