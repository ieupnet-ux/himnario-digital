import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import * as Icons from 'lucide-react';
import { Music } from 'lucide-react';
import { getCategoryBySlug, getSongs } from '@/lib/data/songs';
import { SongCard } from '@/components/songs/SongCard';

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const category = await getCategoryBySlug(params.slug);
  if (!category) return { title: 'Categoría no encontrada' };
  return {
    title: category.name,
    description: category.description ?? `Himnos de la categoría ${category.name}`
  };
}

export const revalidate = 60;

export default async function CategoriaDetailPage({ params }: Props) {
  const category = await getCategoryBySlug(params.slug);
  if (!category) notFound();

  const songs = await getSongs({ categorySlug: params.slug, orderBy: 'title' });
  const IconComponent = (Icons as any)[category.icon ?? 'Music'] ?? Music;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center gap-4">
        <span
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-white shadow-card"
          style={{ backgroundColor: category.color ?? '#162548' }}
        >
          <IconComponent className="h-7 w-7" />
        </span>
        <div>
          <h1 className="font-serif text-2xl font-bold text-navy-900 sm:text-3xl">{category.name}</h1>
          {category.description && <p className="mt-1 text-sm text-navy-500">{category.description}</p>}
        </div>
      </div>

      {songs.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {songs.map((song) => (
            <SongCard key={song.id} song={song} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-navy-200 bg-navy-50/50 p-10 text-center">
          <p className="text-sm text-navy-500">Aún no hay himnos en esta categoría.</p>
        </div>
      )}
    </div>
  );
}
