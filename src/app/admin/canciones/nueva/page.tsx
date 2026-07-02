import { getCategories } from '@/lib/data/songs';
import { SongForm } from '@/components/admin/SongForm';

export const metadata = { title: 'Nueva canción — Administración' };

export default async function NewSongPage() {
  const categories = await getCategories();

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-1 font-serif text-2xl font-bold text-navy-900">Nueva canción</h1>
      <p className="mb-6 text-sm text-navy-500">Completa los datos del himno o corito.</p>
      <SongForm categories={categories} />
    </div>
  );
}
