import type { Metadata } from "next";
import { notFound } from "next/navigation";
import SongViewer from "@/components/SongViewer";
import { getAllSongs, getSongBySlug } from "@/lib/data";
import { stripChords } from "@/lib/chords";

export const revalidate = 300;

/** Busca la canción por dirección amigable, número de himno o id. */
async function findSong(param: string) {
  const bySlug = await getSongBySlug(param);
  if (bySlug) return bySlug;
  const songs = await getAllSongs();
  if (/^\d+$/.test(param)) {
    const byNumber = songs.find((s) => s.number === Number(param));
    if (byNumber) return byNumber;
  }
  return songs.find((s) => s.id === param) ?? null;
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const song = await findSong(params.id);
  if (!song) return { title: "Canción no encontrada" };
  const description = stripChords(song.lyrics).split("\n").filter(Boolean).slice(1, 4).join(" · ");
  return {
    title: `${song.number}. ${song.title}`,
    description: `Himno ${song.number} — ${song.title} (${song.author}). ${description}`,
  };
}

export default async function CancionPage({ params }: { params: { id: string } }) {
  const song = await findSong(params.id);
  if (!song) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <header className="flex items-start gap-5">
        <span className="medallon h-16 w-16 sm:h-20 sm:w-20 text-2xl sm:text-3xl shrink-0">{song.number}</span>
        <div className="min-w-0">
          <h1 className="font-display text-3xl sm:text-4xl font-semibold leading-tight">{song.title}</h1>
          <p className="mt-1 text-navy-500 dark:text-navy-300">
            {song.author}{song.year ? ` · ${song.year}` : ""}
          </p>
          <div className="mt-2 flex flex-wrap gap-2 text-xs font-semibold">
            <span className="rounded-full bg-navy-900 text-oro-300 px-3 py-1">Tono original: {song.key}</span>
            <span className="rounded-full bg-navy-50 dark:bg-navy-800 px-3 py-1">{song.category}</span>
          </div>
        </div>
      </header>

      {song.notes && (
        <p className="mt-5 rounded-xl bg-oro-500/10 border border-oro-500/30 px-4 py-3 text-sm">
          <strong className="text-oro-600 dark:text-oro-400">Notas musicales: </strong>{song.notes}
        </p>
      )}

      {song.media_url && (
        <p className="mt-3 text-sm">
          <a href={song.media_url} target="_blank" rel="noopener noreferrer"
             className="font-semibold text-oro-600 dark:text-oro-400 hover:underline">
            ▶ Escuchar audio / ver video de referencia
          </a>
        </p>
      )}

      <div className="mt-6">
        <SongViewer song={song} />
      </div>
    </div>
  );
}