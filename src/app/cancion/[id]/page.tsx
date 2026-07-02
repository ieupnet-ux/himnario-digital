import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Calendar, User, Tag, Hash, Music2 } from 'lucide-react';
import { getSongById, incrementSongUsage } from '@/lib/data/songs';
import { FavoriteButton } from '@/components/songs/FavoriteButton';
import { LyricsViewer } from '@/components/songs/LyricsViewer';
import { SongToolbar } from '@/components/songs/SongToolbar';
import { MediaPlayer } from '@/components/songs/MediaPlayer';
import { RegisterRecentView } from '@/components/songs/RegisterRecentView';
import { Badge } from '@/components/ui/Badge';

interface Props {
  params: { id: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const song = await getSongById(params.id);
  if (!song) return { title: 'Himno no encontrado' };
  return {
    title: song.title,
    description: `${song.title}${song.author?.name ? ` — ${song.author.name}` : ''}. Letra completa, acordes y tonalidad ${song.original_key}.`
  };
}

export const revalidate = 30;

export default async function CancionPage({ params }: Props) {
  const song = await getSongById(params.id);
  if (!song) notFound();

  // Incrementa el contador de uso de forma no bloqueante
  incrementSongUsage(song.id).catch(() => {});

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
      <RegisterRecentView songId={song.id} title={song.title} number={song.number} />

      <Link
        href="/biblioteca"
        className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-navy-500 hover:text-navy-800"
      >
        <ChevronLeft className="h-4 w-4" /> Volver a la biblioteca
      </Link>

      {/* Encabezado de la canción */}
      <div className="mb-6 rounded-2xl border border-navy-100 bg-white p-5 shadow-card sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            {song.category && (
              <Badge variant="gold" className="mb-2">
                {song.category.name}
              </Badge>
            )}
            <h1 className="font-serif text-2xl font-bold leading-tight text-navy-900 sm:text-3xl">
              {song.title}
            </h1>
          </div>
          <FavoriteButton songId={song.id} size="lg" />
        </div>

        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-navy-500">
          {song.number && (
            <span className="flex items-center gap-1.5">
              <Hash className="h-4 w-4 text-gold-500" /> Himno #{song.number}
            </span>
          )}
          {song.author?.name && (
            <span className="flex items-center gap-1.5">
              <User className="h-4 w-4 text-gold-500" /> {song.author.name}
            </span>
          )}
          {song.year && (
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-gold-500" /> {song.year}
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <Music2 className="h-4 w-4 text-gold-500" /> Tono {song.original_key}
          </span>
          {song.tags && song.tags.length > 0 && (
            <span className="flex items-center gap-1.5">
              <Tag className="h-4 w-4 text-gold-500" /> {song.tags.join(', ')}
            </span>
          )}
        </div>
      </div>

      <MediaPlayer audioUrl={song.audio_url} videoUrl={song.video_url} />

      <div className="mb-4">
        <SongToolbar songTitle={song.title} hasChords={Boolean(song.lyrics_with_chords)} />
      </div>

      {/* Letra y acordes */}
      <div className="rounded-2xl border border-navy-100 bg-white p-5 shadow-card sm:p-8">
        <LyricsViewer
          lyricsWithChords={song.lyrics_with_chords}
          plainLyrics={song.lyrics}
          originalKey={song.original_key}
        />
      </div>

      {song.sheet_music_notes && (
        <div className="mt-6 rounded-2xl border border-navy-100 bg-white p-5 shadow-card sm:p-6">
          <h2 className="mb-2 font-serif text-lg font-semibold text-navy-900">Notas musicales</h2>
          <pre className="whitespace-pre-wrap font-mono text-sm text-navy-600">{song.sheet_music_notes}</pre>
        </div>
      )}
    </div>
  );
}
