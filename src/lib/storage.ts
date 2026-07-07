"use client";

/**
 * Persistencia local en el navegador (localStorage):
 * favoritos, historial reciente y preferencias de lectura.
 * Funciona sin conexión y sin necesidad de crear una cuenta.
 */

const FAVORITES_KEY = "himnario:favoritos";
const HISTORY_KEY = "himnario:historial";
const PREFS_KEY = "himnario:preferencias";

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new Event("himnario:storage"));
  } catch {
    /* almacenamiento no disponible */
  }
}

/* ---------- Favoritos ---------- */
export function getFavorites(): string[] {
  return read<string[]>(FAVORITES_KEY, []);
}
export function isFavorite(slug: string): boolean {
  return getFavorites().includes(slug);
}
export function toggleFavorite(slug: string): boolean {
  const favs = getFavorites();
  const i = favs.indexOf(slug);
  if (i >= 0) favs.splice(i, 1);
  else favs.unshift(slug);
  write(FAVORITES_KEY, favs);
  return i < 0;
}

/* ---------- Historial reciente ---------- */
export interface HistoryEntry {
  slug: string;
  title: string;
  number: number;
  at: number;
}
export function getHistory(): HistoryEntry[] {
  return read<HistoryEntry[]>(HISTORY_KEY, []);
}
export function pushHistory(entry: Omit<HistoryEntry, "at">) {
  const list = getHistory().filter((h) => h.slug !== entry.slug);
  list.unshift({ ...entry, at: Date.now() });
  write(HISTORY_KEY, list.slice(0, 30));
}

/* ---------- Preferencias de lectura ---------- */
export interface ReadingPrefs {
  fontSize: number; // px de la letra
  showChords: boolean;
  night: boolean; // lectura nocturna
}
export const DEFAULT_PREFS: ReadingPrefs = { fontSize: 19, showChords: false, night: false };

export function getPrefs(): ReadingPrefs {
  return { ...DEFAULT_PREFS, ...read<Partial<ReadingPrefs>>(PREFS_KEY, {}) };
}
export function savePrefs(prefs: ReadingPrefs) {
  write(PREFS_KEY, prefs);
}
