'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Pencil, Trash2, Music } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { Song } from '@/types';
import toast from 'react-hot-toast';

export function SongsTable({ songs }: { songs: Song[] }) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const router = useRouter();

  async function handleDelete(id: string) {
    setDeletingId(id);
    const supabase = createClient();
    const { error } = await supabase.from('songs').delete().eq('id', id);
    setDeletingId(null);
    setConfirmId(null);

    if (error) {
      toast.error('No se pudo eliminar la canción');
      return;
    }
    toast.success('Canción eliminada');
    router.refresh();
  }

  if (songs.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-navy-200 bg-white p-10 text-center">
        <Music className="mx-auto mb-3 h-8 w-8 text-navy-300" />
        <p className="text-sm text-navy-500">No hay canciones todavía. Crea la primera.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-navy-100 bg-white shadow-card">
      <table className="w-full text-sm">
        <thead className="border-b border-navy-100 bg-navy-50 text-left text-xs font-semibold uppercase tracking-wide text-navy-500">
          <tr>
            <th className="px-4 py-3">#</th>
            <th className="px-4 py-3">Título</th>
            <th className="hidden px-4 py-3 sm:table-cell">Categoría</th>
            <th className="hidden px-4 py-3 md:table-cell">Tono</th>
            <th className="px-4 py-3 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-navy-50">
          {songs.map((song) => (
            <tr key={song.id} className="hover:bg-navy-50/50">
              <td className="px-4 py-3 text-navy-400">{song.number ?? '—'}</td>
              <td className="px-4 py-3 font-medium text-navy-900">{song.title}</td>
              <td className="hidden px-4 py-3 text-navy-500 sm:table-cell">
                {song.category?.name ?? '—'}
              </td>
              <td className="hidden px-4 py-3 text-navy-500 md:table-cell">{song.original_key}</td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-1.5">
                  <Link
                    href={`/admin/canciones/${song.id}/editar`}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-navy-500 hover:bg-navy-100"
                    title="Editar"
                  >
                    <Pencil className="h-4 w-4" />
                  </Link>
                  {confirmId === song.id ? (
                    <button
                      onClick={() => handleDelete(song.id)}
                      disabled={deletingId === song.id}
                      className="rounded-lg bg-red-50 px-2 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100"
                    >
                      {deletingId === song.id ? 'Eliminando…' : 'Confirmar'}
                    </button>
                  ) : (
                    <button
                      onClick={() => setConfirmId(song.id)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-navy-500 hover:bg-red-50 hover:text-red-600"
                      title="Eliminar"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
