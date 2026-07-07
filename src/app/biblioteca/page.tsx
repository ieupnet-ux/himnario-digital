import SearchLibrary from "@/components/SearchLibrary";
import { getAllSongs, getCategories } from "@/lib/data";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Biblioteca de canciones",
  description: "Buscá himnos y alabanzas por título, autor, temática, tonalidad o número.",
};
export const revalidate = 300;

export default async function BibliotecaPage() {
  const [songs, categories] = await Promise.all([getAllSongs(), getCategories()]);
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="filete font-display text-3xl font-semibold">Biblioteca de canciones</h1>
      <p className="mt-2 text-navy-500 dark:text-navy-300">
        Búsqueda instantánea por título, autor, temática, tonalidad o número de himno.
      </p>
      <div className="mt-6">
        <SearchLibrary songs={songs} categories={categories} />
      </div>
    </div>
  );
}
