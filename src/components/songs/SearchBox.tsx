'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Music, X, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { Song } from '@/types';
import { cn } from '@/lib/utils';

interface SearchBoxProps {
  variant?: 'hero' | 'compact';
  placeholder?: string;
  autoFocus?: boolean;
}

export function SearchBox({ variant = 'hero', placeholder, autoFocus }: SearchBoxProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Song[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const runSearch = useCallback(async (value: string) => {
    if (!value.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const isNumeric = /^\d+$/.test(value.trim());

    let query = supabase
      .from('songs')
      .select('id, number, title, original_key, year, lyrics, category:categories(name, color)');

    if (isNumeric) {
      query = query.eq('number', Number(value.trim()));
    } else {
      query = query.or(`title.ilike.%${value}%,original_key.ilike.%${value}%`);
    }

    const { data } = await query.limit(8);
    setResults((data as unknown as Song[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => runSearch(query), 250);
    return () => clearTimeout(timeout);
  }, [query, runSearch]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/biblioteca?q=${encodeURIComponent(query.trim())}`);
      setOpen(false);
    }
  }

  return (
    <div ref={containerRef} className="relative w-full">
      <form onSubmit={handleSubmit} className="relative">
        <Search
          className={cn(
            'absolute top-1/2 -translate-y-1/2 text-navy-400',
            variant === 'hero' ? 'left-5 h-5 w-5' : 'left-4 h-4 w-4'
          )}
        />
        <input
          type="text"
          value={query}
          autoFocus={autoFocus}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder ?? 'Buscar por título, número, autor o tonalidad…'}
          className={cn(
            'w-full rounded-2xl border-0 bg-white text-navy-900 placeholder:text-navy-400 shadow-card outline-none ring-1 ring-navy-100 transition-all focus:ring-2 focus:ring-gold-400',
            variant === 'hero' ? 'h-14 pl-14 pr-12 text-base' : 'h-11 pl-11 pr-10 text-sm'
          )}
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setResults([]);
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-navy-400 hover:text-navy-700"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </form>

      {open && query.trim() && (
        <div className="absolute z-50 mt-2 w-full overflow-hidden rounded-2xl border border-navy-100 bg-white shadow-card-hover animate-fade-in">
          {loading && (
            <div className="flex items-center justify-center gap-2 p-6 text-sm text-navy-400">
              <Loader2 className="h-4 w-4 animate-spin" /> Buscando…
            </div>
          )}

          {!loading && results.length === 0 && (
            <div className="p-6 text-center text-sm text-navy-400">
              No se encontraron himnos para &ldquo;{query}&rdquo;
            </div>
          )}

          {!loading &&
            results.map((song) => (
              <button
                key={song.id}
                onClick={() => {
                  router.push(`/cancion/${song.id}`);
                  setOpen(false);
                }}
                className="flex w-full items-center gap-3 border-b border-navy-50 px-4 py-3 text-left transition-colors last:border-0 hover:bg-navy-50"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-navy-50 text-navy-700">
                  <Music className="h-4 w-4" />
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block truncate text-sm font-medium text-navy-900">{song.title}</span>
                  <span className="block text-xs text-navy-400">
                    {song.number ? `#${song.number}` : 'Sin número'} · Tono {song.original_key}
                  </span>
                </span>
              </button>
            ))}

          {!loading && results.length > 0 && (
            <button
              onClick={handleSubmit}
              className="w-full bg-navy-50 px-4 py-2.5 text-center text-xs font-medium text-navy-600 hover:bg-navy-100"
            >
              Ver todos los resultados para &ldquo;{query}&rdquo;
            </button>
          )}
        </div>
      )}
    </div>
  );
}
