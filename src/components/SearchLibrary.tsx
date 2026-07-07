"use client";

import { useMemo, useState } from "react";
import SongCard from "./SongCard";
import { ALL_KEYS } from "@/lib/chords";
import type { Category, Song } from "@/lib/types";

/** Normaliza texto para buscar sin distinguir mayúsculas ni acentos. */
function norm(s: string) {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

interface Props {
  songs: Song[];
  categories: Category[];
  initialCategory?: string;
}

/** Biblioteca con búsqueda instantánea por título, autor, número, temática y tonalidad. */
export default function SearchLibrary({ songs, categories, initialCategory = "" }: Props) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState(initialCategory);
  const [key, setKey] = useState("");
  const [author, setAuthor] = useState("");

  const authors = useMemo(() => Array.from(new Set(songs.map((s) => s.author))).sort(), [songs]);

  const results = useMemo(() => {
    const q = norm(query.trim());
    return songs.filter((s) => {
      if (category && s.category_slug !== category) return false;
      if (key && !s.key.startsWith(key)) return false;
      if (author && s.author !== author) return false;
      if (!q) return true;
      // Si escriben solo dígitos, buscar por número de himno
      if (/^\d+$/.test(q)) return String(s.number) === q || String(s.number).startsWith(q);
      return norm(s.title).includes(q) || norm(s.author).includes(q) || norm(s.lyrics).includes(q);
    });
  }, [songs, query, category, key, author]);

  return (
    <div>
      <div className="rounded-2xl bg-white dark:bg-navy-900 border border-navy-100 dark:border-navy-800 p-4 shadow-card">
        <label htmlFor="buscador" className="sr-only">
          Buscar canción
        </label>
        <input
          id="buscador"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por título, autor, número o frase de la letra…"
          className="w-full rounded-xl border border-navy-200 dark:border-navy-700 bg-marfil dark:bg-navy-800 px-4 py-3 text-lg outline-none focus:border-oro-500"
          autoComplete="off"
        />
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            aria-label="Filtrar por temática"
            className="rounded-lg border border-navy-200 dark:border-navy-700 bg-marfil dark:bg-navy-800 px-3 py-2"
          >
            <option value="">Todas las temáticas</option>
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
          <select
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            aria-label="Filtrar por autor"
            className="rounded-lg border border-navy-200 dark:border-navy-700 bg-marfil dark:bg-navy-800 px-3 py-2"
          >
            <option value="">Todos los autores</option>
            {authors.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
          <select
            value={key}
            onChange={(e) => setKey(e.target.value)}
            aria-label="Filtrar por tonalidad"
            className="rounded-lg border border-navy-200 dark:border-navy-700 bg-marfil dark:bg-navy-800 px-3 py-2"
          >
            <option value="">Todas las tonalidades</option>
            {ALL_KEYS.map((k) => (
              <option key={k} value={k}>
                Tono {k}
              </option>
            ))}
          </select>
        </div>
      </div>

      <p className="mt-4 text-sm text-navy-500 dark:text-navy-300" aria-live="polite">
        {results.length === 1 ? "1 canción encontrada" : `${results.length} canciones encontradas`}
      </p>

      <div className="mt-3 grid grid-cols-1 lg:grid-cols-2 gap-3">
        {results.map((s) => (
          <SongCard key={s.id} song={s} />
        ))}
      </div>

      {results.length === 0 && (
        <div className="mt-8 rounded-xl border border-dashed border-navy-200 dark:border-navy-700 p-10 text-center text-navy-500 dark:text-navy-300">
          No hay canciones que coincidan. Probá con otra palabra o quitá los filtros.
        </div>
      )}
    </div>
  );
}
