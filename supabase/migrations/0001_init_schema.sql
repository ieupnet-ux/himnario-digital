-- =====================================================================
-- HIMNARIO DIGITAL - ESQUEMA DE BASE DE DATOS SUPABASE
-- =====================================================================
-- Ejecutar este archivo en el SQL Editor de Supabase (proyecto nuevo)
-- O usar: supabase db push (con el CLI de Supabase)
-- =====================================================================

-- Extensiones necesarias
create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm"; -- búsqueda por similitud de texto

-- =====================================================================
-- 1. TABLA: profiles (usuarios extendidos, vinculada a auth.users)
-- =====================================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  role text not null default 'member' check (role in ('admin', 'editor', 'member')),
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

export type Database = any;
comment on column public.songs.lyrics_with_chords is 'Formato: [Am]Cristo es la [F]roca de mi sal[C]vación. Los corchetes marcan acordes sobre la siguiente palabra/sílaba.';

-- =====================================================================
-- 5. TABLA: favorites (favoritos de usuario)
-- =====================================================================
create table if not exists public.favorites (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  song_id uuid not null references public.songs(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, song_id)
);

-- =====================================================================
-- 6. TABLA: playlists (listas / sets de alabanza)
-- =====================================================================
create table if not exists public.playlists (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  owner_id uuid references public.profiles(id) on delete cascade,
  is_public boolean default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.playlist_songs (
  id uuid primary key default uuid_generate_v4(),
  playlist_id uuid not null references public.playlists(id) on delete cascade,
  song_id uuid not null references public.songs(id) on delete cascade,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  unique (playlist_id, song_id)
);

-- =====================================================================
-- 7. TABLA: recent_history (historial reciente por usuario)
-- =====================================================================
create table if not exists public.recent_history (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  song_id uuid not null references public.songs(id) on delete cascade,
  viewed_at timestamptz not null default now()
);

-- =====================================================================
-- ÍNDICES
-- =====================================================================
create index if not exists idx_songs_search_vector on public.songs using gin (search_vector);
create index if not exists idx_songs_title_trgm on public.songs using gin (title gin_trgm_ops);
create index if not exists idx_songs_number on public.songs (number);
create index if not exists idx_songs_category on public.songs (category_id);
create index if not exists idx_songs_author on public.songs (author_id);
create index if not exists idx_songs_original_key on public.songs (original_key);
create index if not exists idx_songs_times_used on public.songs (times_used desc);
create index if not exists idx_favorites_user on public.favorites (user_id);
create index if not exists idx_favorites_song on public.favorites (song_id);
create index if not exists idx_recent_history_user on public.recent_history (user_id, viewed_at desc);
create index if not exists idx_playlist_songs_playlist on public.playlist_songs (playlist_id, position);

-- =====================================================================
-- TRIGGERS: updated_at automático
-- =====================================================================
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_songs_updated_at on public.songs;
create trigger trg_songs_updated_at
  before update on public.songs
  for each row execute function public.set_updated_at();

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists trg_playlists_updated_at on public.playlists;
create trigger trg_playlists_updated_at
  before update on public.playlists
  for each row execute function public.set_updated_at();

-- =====================================================================
-- TRIGGER: crear perfil automáticamente al registrarse un usuario
-- =====================================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    'member'
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists trg_on_auth_user_created on auth.users;
create trigger trg_on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =====================================================================
-- FUNCIÓN: búsqueda de canciones (texto, autor, tonalidad, número)
-- =====================================================================
create or replace function public.search_songs(search_query text)
returns setof public.songs as $$
  select *
  from public.songs
  where
    search_query is null or search_query = '' or
    search_vector @@ plainto_tsquery('spanish', search_query)
    or title ilike '%' || search_query || '%'
    or original_key ilike '%' || search_query || '%'
    or number::text = search_query
  order by
    case when title ilike search_query || '%' then 0 else 1 end,
    ts_rank(search_vector, plainto_tsquery('spanish', search_query)) desc;
$$ language sql stable;

-- =====================================================================
-- FUNCIÓN: incrementar contador de uso de una canción
-- =====================================================================
create or replace function public.increment_song_usage(song_id_input uuid)
returns void as $$
begin
  update public.songs
  set times_used = times_used + 1
  where id = song_id_input;
end;
$$ language plpgsql security definer;

-- =====================================================================
-- RLS (Row Level Security)
-- =====================================================================
alter table public.profiles enable row level security;
alter table public.authors enable row level security;
alter table public.categories enable row level security;
alter table public.songs enable row level security;
alter table public.favorites enable row level security;
alter table public.playlists enable row level security;
alter table public.playlist_songs enable row level security;
alter table public.recent_history enable row level security;

-- Helper: función para saber si el usuario actual es admin/editor
create or replace function public.is_admin_or_editor()
returns boolean as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('admin', 'editor')
  );
$$ language sql stable security definer;

-- ---- profiles ----
drop policy if exists "Perfiles públicos para lectura" on public.profiles;
create policy "Perfiles públicos para lectura"
  on public.profiles for select
  using (true);

drop policy if exists "Usuarios editan su propio perfil" on public.profiles;
create policy "Usuarios editan su propio perfil"
  on public.profiles for update
  using (auth.uid() = id);

drop policy if exists "Admins gestionan todos los perfiles" on public.profiles;
create policy "Admins gestionan todos los perfiles"
  on public.profiles for all
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- ---- authors ----
drop policy if exists "Lectura pública de autores" on public.authors;
create policy "Lectura pública de autores"
  on public.authors for select using (true);

drop policy if exists "Editores gestionan autores" on public.authors;
create policy "Editores gestionan autores"
  on public.authors for all using (public.is_admin_or_editor());

-- ---- categories ----
drop policy if exists "Lectura pública de categorías" on public.categories;
create policy "Lectura pública de categorías"
  on public.categories for select using (true);

drop policy if exists "Editores gestionan categorías" on public.categories;
create policy "Editores gestionan categorías"
  on public.categories for all using (public.is_admin_or_editor());

-- ---- songs ----
drop policy if exists "Lectura pública de canciones" on public.songs;
create policy "Lectura pública de canciones"
  on public.songs for select using (true);

drop policy if exists "Editores gestionan canciones" on public.songs;
create policy "Editores gestionan canciones"
  on public.songs for all using (public.is_admin_or_editor());

-- ---- favorites ----
drop policy if exists "Usuarios ven sus propios favoritos" on public.favorites;
create policy "Usuarios ven sus propios favoritos"
  on public.favorites for select using (auth.uid() = user_id);

drop policy if exists "Usuarios gestionan sus propios favoritos" on public.favorites;
create policy "Usuarios gestionan sus propios favoritos"
  on public.favorites for all using (auth.uid() = user_id);

-- ---- playlists ----
drop policy if exists "Lectura de playlists públicas o propias" on public.playlists;
create policy "Lectura de playlists públicas o propias"
  on public.playlists for select
  using (is_public = true or owner_id = auth.uid());

drop policy if exists "Usuarios gestionan sus propias playlists" on public.playlists;
create policy "Usuarios gestionan sus propias playlists"
  on public.playlists for all using (owner_id = auth.uid());

-- ---- playlist_songs ----
drop policy if exists "Lectura de canciones en playlists visibles" on public.playlist_songs;
create policy "Lectura de canciones en playlists visibles"
  on public.playlist_songs for select
  using (
    exists (
      select 1 from public.playlists pl
      where pl.id = playlist_id and (pl.is_public = true or pl.owner_id = auth.uid())
    )
  );

drop policy if exists "Dueños gestionan canciones de su playlist" on public.playlist_songs;
create policy "Dueños gestionan canciones de su playlist"
  on public.playlist_songs for all
  using (
    exists (
      select 1 from public.playlists pl
      where pl.id = playlist_id and pl.owner_id = auth.uid()
    )
  );

-- ---- recent_history ----
drop policy if exists "Usuarios ven su propio historial" on public.recent_history;
create policy "Usuarios ven su propio historial"
  on public.recent_history for select using (auth.uid() = user_id);

drop policy if exists "Usuarios gestionan su propio historial" on public.recent_history;
create policy "Usuarios gestionan su propio historial"
  on public.recent_history for all using (auth.uid() = user_id);

-- =====================================================================
-- FIN DEL ESQUEMA
-- =====================================================================
