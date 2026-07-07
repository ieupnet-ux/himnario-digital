import { DEMO_CATEGORIES, DEMO_SONGS } from "./demo-songs";
import { getServerSupabase, supabaseEnabled } from "./supabase";
import type { Category, Song } from "./types";

/**
 * Capa de datos.
 * Si Supabase está configurado (.env.local) lee de la base de datos;
 * si no, usa los 20 himnos de demostración para que el proyecto
 * funcione de inmediato tras `npm install && npm run dev`.
 */

const SONG_SELECT =
  "id, number, title, slug, year, key, lyrics, notes, media_url, views, created_at, authors(name), categories(name, slug)";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapSong(row: any): Song {
  return {
    id: row.id,
    number: row.number,
    title: row.title,
    slug: row.slug,
    author: row.authors?.name ?? "Anónimo",
    year: row.year,
    category: row.categories?.name ?? "Sin categoría",
    category_slug: row.categories?.slug ?? "",
    key: row.key,
    lyrics: row.lyrics,
    notes: row.notes,
    media_url: row.media_url,
    views: row.views ?? 0,
    created_at: row.created_at,
  };
}

export async function getAllSongs(): Promise<Song[]> {
  if (supabaseEnabled) {
    const sb = getServerSupabase()!;
    const { data, error } = await sb.from("songs").select(SONG_SELECT).order("number");
    if (!error && data) return data.map(mapSong);
  }
  return [...DEMO_SONGS].sort((a, b) => a.number - b.number);
}

export async function getSongBySlug(slug: string): Promise<Song | null> {
  if (supabaseEnabled) {
    const sb = getServerSupabase()!;
    const { data } = await sb.from("songs").select(SONG_SELECT).eq("slug", slug).maybeSingle();
    if (data) return mapSong(data);
    return null;
  }
  return DEMO_SONGS.find((s) => s.slug === slug) ?? null;
}

export async function getCategories(): Promise<Category[]> {
  if (supabaseEnabled) {
    const sb = getServerSupabase()!;
    const { data, error } = await sb.from("categories").select("id, name, slug, description").order("name");
    if (!error && data) return data as Category[];
  }
  return DEMO_CATEGORIES;
}

export async function getRecentSongs(limit = 6): Promise<Song[]> {
  const songs = await getAllSongs();
  return [...songs]
    .sort((a, b) => (b.created_at ?? "").localeCompare(a.created_at ?? "") || b.number - a.number)
    .slice(0, limit);
}

export async function getPopularSongs(limit = 6): Promise<Song[]> {
  const songs = await getAllSongs();
  return [...songs].sort((a, b) => b.views - a.views).slice(0, limit);
}
