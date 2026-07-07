"use client";

import { useEffect, useState } from "react";
import SongCard from "./SongCard";
import { getFavorites, getHistory, type HistoryEntry } from "@/lib/storage";
import type { Song } from "@/lib/types";
import Link from "next/link";

/** Muestra los favoritos y el historial guardados en este dispositivo. */
export default function FavoritesStrip({ songs, mode }: { songs: Song[]; mode: "favoritos" | "historial" }) {
  const [slugs, setSlugs] = useState<string[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    const load = () => {
      setSlugs(getFavorites());
      setHistory(getHistory());
    };
    load();
    window.addEventListener("himnario:storage", load);
    return () => window.removeEventListener("himnario:storage", load);
  }, []);

  const list =
    mode === "favoritos"
      ? slugs.map((slug) => songs.find((s) => s.slug === slug)).filter((s): s is Song => Boolean(s))
      : history.map((h) => songs.find((s) => s.slug === h.slug)).filter((s): s is Song => Boolean(s));

  if (list.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-navy-200 dark:border-navy-700 p-8 text-center text-navy-500 dark:text-navy-300">
        {mode === "favoritos" ? (
          <>Todavía no marcaste favoritos. Abrí una canción y tocá <strong>☆ Favorito</strong>.</>
        ) : (
          <>Las canciones que vayas abriendo aparecerán aquí para volver a ellas rápido.</>
        )}
        <div className="mt-3">
          <Link href="/biblioteca" className="font-semibold text-oro-600 dark:text-oro-400 hover:underline">
            Explorar la biblioteca →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
      {list.map((s) => (
        <SongCard key={s.id} song={s} />
      ))}
    </div>
  );
}
