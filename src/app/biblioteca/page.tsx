import type { Metadata } from 'next';
import { Suspense } from 'react';
import { getSongs, getCategories, getAuthors } from '@/lib/data/songs';
import { LibraryClient } from '@/components/songs/LibraryClient';

export const metadata: Metadata = {
  title: 'Biblioteca de himnos',
  description: 'Busca y consulta todos los himnos, coritos y alabanzas por título, autor, temática, tonalidad o número.'
};

export const revalidate = 60;

export default async function BibliotecaPage() {
  const [songs, categories, authors] = await Promise.all([
    getSongs({ orderBy: 'title', limit: 200 }),
    getCategories(),
    getAuthors()
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="font-serif text-2xl font-bold text-navy-900 sm:text-3xl">Biblioteca de Himnos</h1>
        <p className="mt-1 text-sm text-navy-500">
          Encuentra cualquier himno por título, número, autor, temática o tonalidad.
        </p>
      </div>

      <Suspense fallback={<div className="text-sm text-navy-400">Cargando…</div>}>
        <LibraryClient initialSongs={songs} categories={categories} authors={authors} />
      </Suspense>
    </div>
  );
}
