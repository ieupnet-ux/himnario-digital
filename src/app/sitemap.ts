import type { MetadataRoute } from 'next';
import { getSongs, getCategories } from '@/lib/data/songs';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${siteUrl}/`, changeFrequency: 'daily', priority: 1 },
    { url: `${siteUrl}/biblioteca`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${siteUrl}/categorias`, changeFrequency: 'weekly', priority: 0.7 }
  ];

  try {
    const [songs, categories] = await Promise.all([getSongs({ limit: 500 }), getCategories()]);

    const songRoutes: MetadataRoute.Sitemap = songs.map((song) => ({
      url: `${siteUrl}/cancion/${song.id}`,
      lastModified: song.updated_at,
      changeFrequency: 'monthly',
      priority: 0.6
    }));

    const categoryRoutes: MetadataRoute.Sitemap = categories.map((category) => ({
      url: `${siteUrl}/categorias/${category.slug}`,
      changeFrequency: 'weekly',
      priority: 0.5
    }));

    return [...staticRoutes, ...categoryRoutes, ...songRoutes];
  } catch {
    // Si Supabase no está configurado aún, devuelve solo las rutas estáticas
    return staticRoutes;
  }
}
