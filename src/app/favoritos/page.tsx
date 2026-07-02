'use client';

import { useEffect, useState } from 'react';
import { Heart } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useLocalFavoritesStore } from '@/lib/store';
import { SongCard } from '@/components/songs/SongCard';
import type { Song } from '@/types';

export default function FavoritosPage() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const localFavoriteIds = useLocalFavoritesStore((s) => s.favoriteIds);

  useEffect(() => {
    let active = true;
    const supabase = createClient();

    async function load() {
      setLoading(true);
      const { data: userData } = await supabase.auth.getUser();

      if (userData.user) {
        const { data } = await supabase
          .from('favorites')
          .select('song:songs(*, author:authors(id, name), category:categories(id, name, slug, color))')
          .eq('user_id', userData.user.id)
          .order('created_at', { ascending: false });

        if (active) {
          const list = (data ?? []).map((f: any) => f.song).filter(Boolean) as Song[];
          setSongs(list);
          setLoading(false);
        }
      } else {
        if (localFavoriteIds.length === 0) {
          if (active) {
            setSongs([]);
            setLoading(false);
          }
          return;
        }
        const { data } = await supabase
          .from('songs')
          .select('*, author:authors(id, name), category:categories(id, name, slug, color)')
          .in('id', localFavoriteIds);

        if (active) {
          setSongs((data as unknown as Song[]) ?? []);
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      active = false;
    };
  }, [localFavoriteIds]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gold-100 text-gold-600">
          <Heart className="h-6 w-6 fill-gold-500 text-gold-500" />
        </span>
        <div>
          <h1 className="font-serif text-2xl font-bold text-navy-900 sm:text-3xl">Mis Favoritos</h1>
          <p className="mt-0.5 text-sm text-navy-500">Himnos que has marcado para acceder rápido.</p>
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-navy-400">Cargando…</p>
      ) : songs.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {songs.map((song) => (
            <SongCard key={song.id} song={song} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-navy-200 bg-navy-50/50 p-10 text-center">
          <Heart className="mx-auto mb-3 h-8 w-8 text-navy-300" />
          <p className="text-sm text-navy-500">
            Todavía no tienes himnos favoritos. Pulsa el corazón en cualquier himno para guardarlo aquí.
          </p>
        </div>
      )}
    </div>
  );
}
