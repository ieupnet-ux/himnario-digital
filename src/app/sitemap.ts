import type { MetadataRoute } from "next";
import { getAllSongs, getCategories } from "@/lib/data";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const [songs, categories] = await Promise.all([getAllSongs(), getCategories()]);
  return [
    { url: base, priority: 1 },
    { url: `${base}/biblioteca`, priority: 0.9 },
    { url: `${base}/categorias`, priority: 0.7 },
    ...categories.map((c) => ({ url: `${base}/categorias/${c.slug}`, priority: 0.6 })),
    ...songs.map((s) => ({ url: `${base}/cancion/${s.slug}`, priority: 0.8 })),
  ];
}
