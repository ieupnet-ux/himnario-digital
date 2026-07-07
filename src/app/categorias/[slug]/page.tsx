import { notFound } from "next/navigation";
import SearchLibrary from "@/components/SearchLibrary";
import { getAllSongs, getCategories } from "@/lib/data";

export const revalidate = 300;

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const categories = await getCategories();
  const cat = categories.find((c) => c.slug === params.slug);
  return { title: cat ? `Categoría: ${cat.name}` : "Categoría" };
}

export default async function CategoriaPage({ params }: { params: { slug: string } }) {
  const [songs, categories] = await Promise.all([getAllSongs(), getCategories()]);
  const cat = categories.find((c) => c.slug === params.slug);
  if (!cat) notFound();

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <p className="text-xs uppercase tracking-[0.2em] text-oro-600 dark:text-oro-400 font-bold">Categoría</p>
      <h1 className="filete font-display text-3xl font-semibold">{cat.name}</h1>
      <div className="mt-6">
        <SearchLibrary songs={songs} categories={categories} initialCategory={cat.slug} />
      </div>
    </div>
  );
}
