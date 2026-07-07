import Link from "next/link";
import type { Song } from "@/lib/types";

/** Tarjeta reutilizable para listar canciones (inicio, biblioteca, categorías, favoritos). */
export default function SongCard({ song }: { song: Song }) {
  return (
    <Link
      href={`/cancion/${song.slug}`}
      className="group flex items-center gap-4 rounded-xl bg-white dark:bg-navy-900 border border-navy-100 dark:border-navy-800 p-4 shadow-card hover:border-oro-500/60 transition-colors"
    >
      <span className="medallon h-12 w-12 text-lg shrink-0">{song.number}</span>
      <div className="min-w-0 flex-1">
        <h3 className="font-display text-lg font-semibold leading-snug truncate group-hover:text-oro-600 dark:group-hover:text-oro-400">
          {song.title}
        </h3>
        <p className="text-sm text-navy-500 dark:text-navy-300 truncate">
          {song.author}
          {song.year ? ` · ${song.year}` : ""}
        </p>
      </div>
      <div className="text-right shrink-0">
        <span className="block text-xs uppercase tracking-wide text-navy-500 dark:text-navy-300">{song.category}</span>
        <span className="inline-block mt-1 rounded-full bg-navy-50 dark:bg-navy-800 px-2 py-0.5 text-xs font-semibold text-navy-700 dark:text-navy-100">
          Tono {song.key}
        </span>
      </div>
    </Link>
  );
}
