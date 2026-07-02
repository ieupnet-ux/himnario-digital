import Link from 'next/link';
import { Plus } from 'lucide-react';
import { getSongs } from '@/lib/data/songs';
import { SongsTable } from '@/components/admin/SongsTable';

export const metadata = { title: 'Canciones — Administración' };
export const revalidate = 0;

export default async function AdminSongsPage() {
  const songs = await getSongs({ orderBy: 'title', limit: 500 });

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl font-bold text-navy-900">Canciones</h1>
          <p className="text-sm text-navy-500">{songs.length} himnos en la base de datos.</p>
        </div>
        <Link
          href="/admin/canciones/nueva"
          className="flex items-center gap-1.5 rounded-xl bg-gold-gradient px-4 py-2 text-sm font-semibold text-navy-900 shadow-gold"
        >
          <Plus className="h-4 w-4" /> Nueva canción
        </Link>
      </div>

      <SongsTable songs={songs} />
    </div>
  );
}
