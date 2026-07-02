'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { SongCard } from '@/components/songs/SongCard';
import { Input } from '@/components/ui/Input';
import type { Song, Category, Author } from '@/types';
import { ALL_KEYS } from '@/lib/chords';
import { cn } from '@/lib/utils';

type SortOption = 'title' | 'number' | 'recent' | 'popular';

export function LibraryClient({
  initialSongs,
  categories,
  authors
}: {
  initialSongs: Song[];
  categories: Category[];
  authors: Author[];
}) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [songs, setSongs] = useState<Song[]>(initialSongs);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState(searchParams.get('q') ?? '');
  const [categoryId, setCategoryId] = useState('');
  const [authorId, setAuthorId] = useState('');
  const [key, setKey] = useState('');
  const [sort, setSort] = useState<SortOption>('title');
  const [filtersOpen, setFiltersOpen] = useState(false);

  const hasActiveFilters = categoryId || authorId || key;

  useEffect(() => {
    const supabase = createClient();
    let active = true;
    setLoading(true);

    async function fetchData() {
      let q = supabase
        .from('songs')
        .select('*, author:authors(id, name), category:categories(id, name, slug, color)');

      const trimmed = query.trim();
      if (trimmed) {
        const isNumeric = /^\d+$/.test(trimmed);
        if (isNumeric) {
          q = q.eq('number', Number(trimmed));
        } else {
          q = q.or(`title.ilike.%${trimmed}%,original_key.ilike.%${trimmed}%`);
        }
      }

      if (categoryId) q = q.eq('category_id', categoryId);
      if (authorId) q = q.eq('author_id', authorId);
      if (key) q = q.eq('original_key', key);

      switch (sort) {
        case 'number':
          q = q.order('number', { ascending: true, nullsFirst: false });
          break;
        case 'recent':
          q = q.order('created_at', { ascending: false });
          break;
        case 'popular':
          q = q.order('times_used', { ascending: false });
          break;
        default:
          q = q.order('title', { ascending: true });
      }

      const { data } = await q.limit(200);
      if (active) {
        setSongs((data as unknown as Song[]) ?? []);
        setLoading(false);
      }
    }

    const timeout = setTimeout(fetchData, 200);
    return () => {
      active = false;
      clearTimeout(timeout);
    };
  }, [query, categoryId, authorId, key, sort]);

  function clearFilters() {
    setCategoryId('');
    setAuthorId('');
    setKey('');
  }

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-400" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por título o número…"
            className="pl-10"
          />
        </div>
        <button
          onClick={() => setFiltersOpen((v) => !v)}
          className={cn(
            'flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors',
            hasActiveFilters
              ? 'border-gold-400 bg-gold-50 text-gold-700'
              : 'border-navy-200 text-navy-600 hover:bg-navy-50'
          )}
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filtros
          {hasActiveFilters && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gold-500 text-[10px] font-bold text-white">
              {[categoryId, authorId, key].filter(Boolean).length}
            </span>
          )}
        </button>
      </div>

      {filtersOpen && (
        <div className="mb-4 grid gap-3 rounded-2xl border border-navy-100 bg-white p-4 shadow-card animate-slide-up sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-navy-500">Categoría / Temática</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full rounded-lg border border-navy-200 bg-white px-3 py-2 text-sm text-navy-800 outline-none focus:border-gold-400"
            >
              <option value="">Todas</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-navy-500">Autor</label>
            <select
              value={authorId}
              onChange={(e) => setAuthorId(e.target.value)}
              className="w-full rounded-lg border border-navy-200 bg-white px-3 py-2 text-sm text-navy-800 outline-none focus:border-gold-400"
            >
              <option value="">Todos</option>
              {authors.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-navy-500">Tonalidad</label>
            <select
              value={key}
              onChange={(e) => setKey(e.target.value)}
              className="w-full rounded-lg border border-navy-200 bg-white px-3 py-2 text-sm text-navy-800 outline-none focus:border-gold-400"
            >
              <option value="">Todas</option>
              {ALL_KEYS.map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-navy-500">Ordenar por</label>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortOption)}
              className="w-full rounded-lg border border-navy-200 bg-white px-3 py-2 text-sm text-navy-800 outline-none focus:border-gold-400"
            >
              <option value="title">Título (A-Z)</option>
              <option value="number">Número de himno</option>
              <option value="recent">Más recientes</option>
              <option value="popular">Más utilizados</option>
            </select>
          </div>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 text-xs font-medium text-gold-600 hover:text-gold-700 sm:col-span-2 lg:col-span-4"
            >
              <X className="h-3.5 w-3.5" /> Limpiar filtros
            </button>
          )}
        </div>
      )}

      <p className="mb-3 text-xs text-navy-400">
        {loading ? 'Buscando…' : `${songs.length} himno${songs.length === 1 ? '' : 's'} encontrado${songs.length === 1 ? '' : 's'}`}
      </p>

      {songs.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {songs.map((song) => (
            <SongCard key={song.id} song={song} />
          ))}
        </div>
      ) : (
        !loading && (
          <div className="rounded-2xl border border-dashed border-navy-200 bg-navy-50/50 p-10 text-center">
            <p className="text-sm text-navy-500">No se encontraron himnos con estos criterios.</p>
          </div>
        )
      )}
    </div>
  );
}
