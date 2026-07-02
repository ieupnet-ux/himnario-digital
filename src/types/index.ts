export type UserRole = 'admin' | 'editor' | 'member';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Author {
  id: string;
  name: string;
  bio: string | null;
  birth_year: number | null;
  death_year: number | null;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  display_order: number;
  created_at: string;
}

export interface Song {
  id: string;
  number: number | null;
  title: string;
  author_id: string | null;
  category_id: string | null;
  year: number | null;
  original_key: string;
  lyrics: string;
  lyrics_with_chords: string | null;
  sheet_music_notes: string | null;
  audio_url: string | null;
  video_url: string | null;
  tags: string[];
  times_used: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  // relaciones expandidas (opcional, vía join)
  author?: Author | null;
  category?: Category | null;
}

export interface Favorite {
  id: string;
  user_id: string;
  song_id: string;
  created_at: string;
  song?: Song;
}

export interface Playlist {
  id: string;
  name: string;
  description: string | null;
  owner_id: string | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface PlaylistSong {
  id: string;
  playlist_id: string;
  song_id: string;
  position: number;
  created_at: string;
  song?: Song;
}

export interface RecentHistoryEntry {
  id: string;
  user_id: string;
  song_id: string;
  viewed_at: string;
  song?: Song;
}

export interface SongFormInput {
  number?: number | null;
  title: string;
  author_name?: string | null;
  category_id?: string | null;
  year?: number | null;
  original_key: string;
  lyrics: string;
  lyrics_with_chords?: string | null;
  sheet_music_notes?: string | null;
  audio_url?: string | null;
  video_url?: string | null;
  tags?: string[];
}
