import Link from 'next/link';
import { Music } from 'lucide-react';
import type { Song } from '@/types';
import { FavoriteButton } from './FavoriteButton';

export function SongCard({ song }: { song: Song }) {
  return (
    <Link
      href={`/cancion/${song.id}`}
      className="group flex items-center gap-4 rounded-2xl border border-navy-100 bg-white p-4 shadow-card transition-all hover:-translate-y-0.5 hover:shadow-card-hover dark:bg-navy-800 dark:border-navy-700"
    >
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-navy-gradient text-gold-300">
        {song.number ? (
          <span className="font-serif text-sm font-semibold">{song.number}</span>
        ) : (
          <Music className="h-5 w-5" />
        )}
      </span>

      <div className="min-w-0 flex-1">
        <h3 className="truncate font-serif text-base font-semibold text-navy-900 group-hover:text-navy-700 dark:text-cream">
          {song.title}
        </h3>
        <p className="truncate text-xs text-navy-400">
          {song.author?.name ?? 'Autor desconocido'}
          {song.category?.name ? ` · ${song.category.name}` : ''} · Tono {song.original_key}
        </p>
      </div>

      <FavoriteButton songId={song.id} size="sm" />
    </Link>
  );
}
