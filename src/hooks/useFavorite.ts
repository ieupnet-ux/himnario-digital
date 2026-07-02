'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useLocalFavoritesStore } from '@/lib/store';

export function useFavorite(songId: string) {
  const [userId, setUserId] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(true);
  const localStore = useLocalFavoritesStore();

  useEffect(() => {
    const supabase = createClient();
    let active = true;

    async function init() {
      const { data } = await supabase.auth.getUser();
      if (!active) return;

      if (data.user) {
        setUserId(data.user.id);
        const { data: fav } = await supabase
          .from('favorites')
          .select('id')
          .eq('user_id', data.user.id)
          .eq('song_id', songId)
          .maybeSingle();
        setIsFavorite(!!fav);
      } else {
        setIsFavorite(localStore.isFavorite(songId));
      }
      setLoading(false);
    }

    init();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [songId]);

  const toggle = useCallback(async () => {
    if (userId) {
      const supabase = createClient();
      if (isFavorite) {
        await supabase.from('favorites').delete().eq('user_id', userId).eq('song_id', songId);
      } else {
        await supabase.from('favorites').insert({ user_id: userId, song_id: songId });
      }
      setIsFavorite((v) => !v);
    } else {
      localStore.toggleFavorite(songId);
      setIsFavorite((v) => !v);
    }
  }, [userId, isFavorite, songId, localStore]);

  return { isFavorite, toggle, loading };
}
