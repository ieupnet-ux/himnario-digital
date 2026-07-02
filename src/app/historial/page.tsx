'use client';

import { Clock, Trash2, Music } from 'lucide-react';
import Link from 'next/link';
import { useRecentStore } from '@/lib/store';

export default function HistorialPage() {
  const recentSongs = useRecentStore((s) => s.recentSongs);
  const clearRecent = useRecentStore((s) => s.clearRecent);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-navy-50 text-navy-700">
            <Clock className="h-6 w-6" />
          </span>
          <div>
            <h1 className="font-serif text-2xl font-bold text-navy-900 sm:text-3xl">Historial Reciente</h1>
            <p className="mt-0.5 text-sm text-navy-500">Los últimos himnos que has visitado.</p>
          </div>
        </div>
        {recentSongs.length > 0 && (
          <button
            onClick={clearRecent}
            className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-navy-400 hover:bg-navy-50 hover:text-navy-700"
          >
            <Trash2 className="h-3.5 w-3.5" /> Limpiar
          </button>
        )}
      </div>

      {recentSongs.length > 0 ? (
        <div className="space-y-2">
          {recentSongs.map((song) => (
            <Link
              key={song.id}
              href={`/cancion/${song.id}`}
              className="flex items-center gap-4 rounded-xl border border-navy-100 bg-white p-3.5 shadow-card transition-colors hover:bg-navy-50"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-navy-gradient text-gold-300">
                {song.number ? (
                  <span className="font-serif text-xs font-semibold">{song.number}</span>
                ) : (
                  <Music className="h-4 w-4" />
                )}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-navy-900">{song.title}</p>
                <p className="text-xs text-navy-400">{new Date(song.viewedAt).toLocaleString('es-ES')}</p>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-navy-200 bg-navy-50/50 p-10 text-center">
          <Clock className="mx-auto mb-3 h-8 w-8 text-navy-300" />
          <p className="text-sm text-navy-500">Aún no has visitado ningún himno.</p>
        </div>
      )}
    </div>
  );
}
