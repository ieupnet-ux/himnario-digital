import { notFound } from 'next/navigation';
import { getSongById, getCategories } from '@/lib/data/songs';
import { SongForm } from '@/components/admin/SongForm';

export const metadata = { title: 'Editar canción — Administración' };

export default async function EditSongPage({ params }: { params: { id: string } }) {
  const [song, categories] = await Promise.all([getSongById(params.id), getCategories()]);
  if (!song) notFound();

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-1 font-serif text-2xl font-bold text-navy-900">Editar canción</h1>
      <p className="mb-6 text-sm text-navy-500">{song.title}</p>
      <SongForm categories={categories} initialSong={song} />
    </div>
  );
}
