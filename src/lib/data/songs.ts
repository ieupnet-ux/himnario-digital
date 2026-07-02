import { createClient } from '@/lib/supabase/server';
import type { Song } from '@/types';

const SONG_SELECT = `
  *,
  author:authors(id, name, bio, birth_year, death_year, created_at),
  category:categories(id, name, slug, description, icon, color, display_order, created_at)
`;

export async function getSongs(options?: {
  categorySlug?: string;
  limit?: number;
  orderBy?: 'recent' | 'popular' | 'title' | 'number';
}): Promise<Song[]> {
  const supabase = createClient();
  let query = supabase.from('songs').select(SONG_SELECT);

  if (options?.categorySlug) {
    const { data: category } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', options.categorySlug)
      .single();
    if (category) {
      query = query.eq('category_id', category.id);
    }
  }

  switch (options?.orderBy) {
    case 'popular':
      query = query.order('times_used', { ascending: false });
      break;
    case 'title':
      query = query.order('title', { ascending: true });
      break;
    case 'number':
      query = query.order('number', { ascending: true, nullsFirst: false });
      break;
    case 'recent':
    default:
      query = query.order('created_at', { ascending: false });
      break;
  }

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;
  if (error) {
    console.error('Error al obtener canciones:', error.message);
    return [];
  }
  return (data as unknown as Song[]) ?? [];
}

export async function getSongById(id: string): Promise<Song | null> {
  const supabase = createClient();
  const { data, error } = await supabase.from('songs').select(SONG_SELECT).eq('id', id).single();

  if (error) {
    console.error('Error al obtener canción:', error.message);
    return null;
  }
  return data as unknown as Song;
}

export async function searchSongs(query: string): Promise<Song[]> {
  const supabase = createClient();

  if (!query.trim()) {
    return getSongs({ limit: 50, orderBy: 'title' });
  }

  // Búsqueda por número exacto
  const isNumeric = /^\d+$/.test(query.trim());

  let supaQuery = supabase.from('songs').select(SONG_SELECT);

  if (isNumeric) {
    supaQuery = supaQuery.eq('number', Number(query.trim()));
  } else {
    supaQuery = supaQuery.or(
      `title.ilike.%${query}%,original_key.ilike.%${query}%,lyrics.ilike.%${query}%`
    );
  }

  const { data, error } = await supaQuery.limit(100);

  if (error) {
    console.error('Error en búsqueda:', error.message);
    return [];
  }

  return (data as unknown as Song[]) ?? [];
}

export async function getCategories() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('display_order', { ascending: true });

  if (error) {
    console.error('Error al obtener categorías:', error.message);
    return [];
  }
  return data ?? [];
}

export async function getCategoryBySlug(slug: string) {
  const supabase = createClient();
  const { data } = await supabase.from('categories').select('*').eq('slug', slug).single();
  return data;
}

export async function getAuthors() {
  const supabase = createClient();
  const { data, error } = await supabase.from('authors').select('*').order('name', { ascending: true });

  if (error) {
    console.error('Error al obtener autores:', error.message);
    return [];
  }
  return data ?? [];
}

export async function incrementSongUsage(songId: string) {
  const supabase = createClient();
  await supabase.rpc('increment_song_usage', { song_id_input: songId });
}
