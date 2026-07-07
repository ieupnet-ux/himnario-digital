import Link from "next/link";
import { getAllSongs, getCategories } from "@/lib/data";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Categorías" };
export const revalidate = 300;

export default async function CategoriasPage() {
  const [categories, songs] = await Promise.all([getCategories(), getAllSongs()]);
  const counts = new Map<string, number>();
  for (const s of songs) counts.set(s.category_slug, (counts.get(s.category_slug) ?? 0) + 1);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="filete font-display text-3xl font-semibold">Categorías</h1>
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((c) => (
          <Link
            key={c.slug}
            href={`/categorias/${c.slug}`}
            className="rounded-xl bg-white dark:bg-navy-900 border border-navy-100 dark:border-navy-800 p-5 shadow-card hover:border-oro-500/60 transition-colors"
          >
            <h2 className="font-display text-xl font-semibold">{c.name}</h2>
            <p className="mt-1 text-sm text-navy-500 dark:text-navy-300">
              {counts.get(c.slug) ?? 0} canciones
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
