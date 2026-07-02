'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface PreferencesState {
  fontSize: number; // px base para la letra
  nightMode: boolean;
  showChords: boolean;
  rehearsalMode: boolean; // modo ensayo: resalta la línea actual
  setFontSize: (size: number) => void;
  increaseFontSize: () => void;
  decreaseFontSize: () => void;
  toggleNightMode: () => void;
  toggleShowChords: () => void;
  toggleRehearsalMode: () => void;
}

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set, get) => ({
      fontSize: 18,
      nightMode: false,
      showChords: true,
      rehearsalMode: false,
      setFontSize: (size) => set({ fontSize: Math.min(36, Math.max(12, size)) }),
      increaseFontSize: () => set({ fontSize: Math.min(36, get().fontSize + 2) }),
      decreaseFontSize: () => set({ fontSize: Math.max(12, get().fontSize - 2) }),
      toggleNightMode: () => set({ nightMode: !get().nightMode }),
      toggleShowChords: () => set({ showChords: !get().showChords }),
      toggleRehearsalMode: () => set({ rehearsalMode: !get().rehearsalMode })
    }),
    { name: 'himnario-preferences' }
  )
);

interface RecentSong {
  id: string;
  title: string;
  number: number | null;
  viewedAt: string;
}

interface RecentState {
  recentSongs: RecentSong[];
  addRecent: (song: RecentSong) => void;
  clearRecent: () => void;
}

export const useRecentStore = create<RecentState>()(
  persist(
    (set, get) => ({
      recentSongs: [],
      addRecent: (song) => {
        const filtered = get().recentSongs.filter((s) => s.id !== song.id);
        set({ recentSongs: [song, ...filtered].slice(0, 20) });
      },
      clearRecent: () => set({ recentSongs: [] })
    }),
    { name: 'himnario-recent' }
  )
);

interface LocalFavoritesState {
  favoriteIds: string[];
  toggleFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
}

/** Favoritos guardados localmente (fallback offline / usuarios sin login). */
export const useLocalFavoritesStore = create<LocalFavoritesState>()(
  persist(
    (set, get) => ({
      favoriteIds: [],
      toggleFavorite: (id) => {
        const current = get().favoriteIds;
        const exists = current.includes(id);
        set({
          favoriteIds: exists ? current.filter((f) => f !== id) : [...current, id]
        });
      },
      isFavorite: (id) => get().favoriteIds.includes(id)
    }),
    { name: 'himnario-local-favorites' }
  )
);
