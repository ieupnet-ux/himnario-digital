/** Tipos compartidos de la aplicación. Reflejan las tablas de Supabase. */

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
}

export interface Author {
  id: string;
  name: string;
}

export interface Song {
  id: string;
  number: number;
  title: string;
  slug: string;
  author: string; // nombre del autor (desnormalizado para lectura rápida)
  year: number | null;
  category: string; // nombre de la categoría
  category_slug: string;
  key: string; // tonalidad original, cifrado americano (C, D, Em…)
  /** Letra con acordes en formato ChordPro simplificado: [C]Grande es tu amor */
  lyrics: string;
  notes?: string | null; // notas musicales / indicaciones opcionales
  media_url?: string | null; // enlace a audio o video
  views: number;
  created_at?: string;
}

export type SongInput = Omit<Song, "id" | "views" | "created_at">;
