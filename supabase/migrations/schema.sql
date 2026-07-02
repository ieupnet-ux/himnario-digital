-- =====================================================================
-- HIMNARIO DIGITAL — Esquema completo de base de datos (Supabase)
-- Ejecutar completo en el SQL Editor de Supabase.
-- Idempotente: usa "if not exists" y "on conflict" donde es posible.
-- =====================================================================

-- Extensión para generar UUIDs
create extension if not exists "uuid-ossp";

-- =====================================================================
-- 1. TABLA: profiles (perfiles de usuario, vinculados a auth.users)
-- =====================================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text not null default 'member' check (role in ('admin', 'editor', 'member')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Crear perfil automáticamente cuando se registra un usuario
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =====================================================================
-- 2. TABLA: categories (categorías de canciones)
-- =====================================================================
create table if not exists public.categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  slug text not null unique,
  description text,
  icon text default 'Music',
  color text default '#162548',
  created_at timestamptz not null default now()
);

-- =====================================================================
-- 3. TABLA: authors (autores y compositores)
-- =====================================================================
create table if not exists public.authors (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  birth_year integer,
  death_year integer,
  bio text,
  created_at timestamptz not null default now()
);

-- =====================================================================
-- 4. TABLA: songs (himnos, coritos y alabanzas)
-- =====================================================================
create table if not exists public.songs (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  number integer unique,
  author_id uuid references public.authors(id) on delete set null,
  category_id uuid references public.categories(id) on delete set null,
  year integer,
  original_key text default 'C',
  lyrics text not null,
  lyrics_with_chords text,
  sheet_music_notes text,
  audio_url text,
  video_url text,
  tags text[] default '{}',
  usage_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists songs_title_idx on public.songs using gin (to_tsvector('spanish', title));
create index if not exists songs_number_idx on public.songs (number);
create index if not exists songs_category_idx on public.songs (category_id);
create index if not exists songs_author_idx on public.songs (author_id);
create index if not exists songs_key_idx on public.songs (original_key);

-- =====================================================================
-- 5. TABLA: favorites (favoritos por usuario)
-- =====================================================================
create table if not exists public.favorites (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  song_id uuid not null references public.songs(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, song_id)
);

-- =====================================================================
-- 6. TABLAS: playlists y playlist_songs (listas de canciones)
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
-- 8. FUNCIÓN: increment_song_usage (contador de uso de canciones)
-- =====================================================================
create or replace function public.increment_song_usage(song_id_input uuid)
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  update public.songs
  set usage_count = usage_count + 1
  where id = song_id_input;
end;
$$;

-- =====================================================================
-- 9. SEGURIDAD (Row Level Security)
-- =====================================================================
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.authors enable row level security;
alter table public.songs enable row level security;
alter table public.favorites enable row level security;
alter table public.playlists enable row level security;
alter table public.playlist_songs enable row level security;
alter table public.recent_history enable row level security;

-- Función auxiliar: ¿el usuario actual es admin o editor?
create or replace function public.is_admin_or_editor()
returns boolean
language sql
security definer set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('admin', 'editor')
  );
$$;

-- profiles: cada usuario ve y edita su propio perfil; admins ven todos
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id or public.is_admin_or_editor());

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id or public.is_admin_or_editor());

-- categories, authors, songs: lectura pública; escritura solo admin/editor
drop policy if exists "categories_select_all" on public.categories;
create policy "categories_select_all" on public.categories
  for select using (true);

drop policy if exists "categories_write_admin" on public.categories;
create policy "categories_write_admin" on public.categories
  for all using (public.is_admin_or_editor());

drop policy if exists "authors_select_all" on public.authors;
create policy "authors_select_all" on public.authors
  for select using (true);

drop policy if exists "authors_write_admin" on public.authors;
create policy "authors_write_admin" on public.authors
  for all using (public.is_admin_or_editor());

drop policy if exists "songs_select_all" on public.songs;
create policy "songs_select_all" on public.songs
  for select using (true);

drop policy if exists "songs_write_admin" on public.songs;
create policy "songs_write_admin" on public.songs
  for all using (public.is_admin_or_editor());

-- favorites: cada usuario gestiona solo los suyos
drop policy if exists "favorites_own" on public.favorites;
create policy "favorites_own" on public.favorites
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- playlists: el dueño gestiona; las públicas se pueden ver
drop policy if exists "playlists_select" on public.playlists;
create policy "playlists_select" on public.playlists
  for select using (is_public or auth.uid() = owner_id);

drop policy if exists "playlists_write_own" on public.playlists;
create policy "playlists_write_own" on public.playlists
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

-- playlist_songs: según la playlist a la que pertenecen
drop policy if exists "playlist_songs_select" on public.playlist_songs;
create policy "playlist_songs_select" on public.playlist_songs
  for select using (
    exists (
      select 1 from public.playlists p
      where p.id = playlist_id and (p.is_public or p.owner_id = auth.uid())
    )
  );

drop policy if exists "playlist_songs_write" on public.playlist_songs;
create policy "playlist_songs_write" on public.playlist_songs
  for all using (
    exists (
      select 1 from public.playlists p
      where p.id = playlist_id and p.owner_id = auth.uid()
    )
  );

-- recent_history: cada usuario gestiona solo el suyo
drop policy if exists "recent_history_own" on public.recent_history;
create policy "recent_history_own" on public.recent_history
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- =====================================================================
-- 10. DATOS: categorías
-- =====================================================================
insert into public.categories (name, slug, description, icon, color) values
  ('Adoración', 'adoracion', 'Cantos de adoración al Señor', 'Heart', '#162548'),
  ('Alabanza', 'alabanza', 'Cantos de alabanza y júbilo', 'Music', '#1d3461'),
  ('Evangelización', 'evangelizacion', 'Cantos para compartir el evangelio', 'Megaphone', '#24427a'),
  ('Consagración', 'consagracion', 'Cantos de entrega y consagración', 'Flame', '#2b4f93'),
  ('Santa Cena', 'santa-cena', 'Cantos para la Cena del Señor', 'Wine', '#325dac'),
  ('Bautismo', 'bautismo', 'Cantos para el bautismo', 'Droplets', '#396ac5'),
  ('Coro General', 'coro-general', 'Coritos para toda la congregación', 'Users', '#4078de'),
  ('Coro de Niños', 'coro-de-ninos', 'Cantos para los más pequeños', 'Baby', '#b8860b'),
  ('Jóvenes', 'jovenes', 'Cantos para la juventud', 'Sparkles', '#c9971c'),
  ('Segunda Venida', 'segunda-venida', 'Cantos sobre el regreso de Cristo', 'CloudSun', '#daa82d'),
  ('Navidad', 'navidad', 'Cantos navideños', 'Star', '#ebb93e'),
  ('Himnos Tradicionales', 'himnos-tradicionales', 'Himnos clásicos de la fe', 'BookOpen', '#0f1a33')
on conflict (name) do nothing;

-- =====================================================================
-- 11. DATOS: autores ficticios de demostración
-- =====================================================================
insert into public.authors (name, birth_year, death_year, bio) values
  ('Elías Fuentes', 1872, 1941, 'Compositor ficticio de himnos tradicionales.'),
  ('Marta Salinas', 1905, 1988, 'Autora ficticia de cantos de adoración.'),
  ('Rubén Castillo', 1938, null, 'Compositor ficticio de coritos congregacionales.'),
  ('Lucía Andrade', 1950, null, 'Autora ficticia de alabanzas contemporáneas.'),
  ('Tomás Herrera', 1885, 1960, 'Himnólogo ficticio de principios del siglo XX.'),
  ('Ana Beltrán', 1970, null, 'Compositora ficticia de cantos juveniles.'),
  ('Autor desconocido', null, null, 'Cantos de dominio popular congregacional.')
on conflict (name) do nothing;

-- =====================================================================
-- 12. DATOS: 20 himnos de demostración (letras ficticias de prueba)
-- =====================================================================
insert into public.songs (title, number, author_id, category_id, year, original_key, lyrics, lyrics_with_chords, tags)
values
(
  'Grande es tu fidelidad hacia mí', 1,
  (select id from public.authors where name = 'Elías Fuentes'),
  (select id from public.categories where slug = 'himnos-tradicionales'),
  1923, 'G',
  E'Verso 1:\nGrande es tu fidelidad hacia mí,\ncada mañana la puedo sentir;\ntodo lo bueno proviene de ti,\nfiel es tu mano que me hace vivir.\n\nCoro:\nFiel es el Señor, fiel es el Señor,\nnueva es su gracia al amanecer;\ntodo lo que soy descansa en su amor,\ngrande es su fidelidad y su poder.',
  E'Verso 1:\n[G]Grande es tu fide[C]lidad hacia [G]mí,\ncada ma[Em]ñana la [Am]puedo sen[D]tir;\n[G]todo lo bueno pro[C]viene de [G]ti,\nfiel es tu [D]mano que me hace vi[G]vir.\n\nCoro:\n[C]Fiel es el Se[G]ñor, [C]fiel es el Se[G]ñor,\nnueva es su [Em]gracia al amane[D]cer;\n[G]todo lo que soy des[C]cansa en su a[G]mor,\ngrande es su fideli[D]dad y su po[G]der.',
  array['fidelidad', 'clásico']
),
(
  'A tus pies vengo a adorar', 2,
  (select id from public.authors where name = 'Marta Salinas'),
  (select id from public.categories where slug = 'adoracion'),
  1956, 'D',
  E'Verso 1:\nA tus pies vengo a adorar,\nmi corazón te quiero dar;\nno hay nadie como tú, Señor,\ndigno de toda mi canción.\n\nCoro:\nTe adoro, te adoro,\nsanto es tu nombre, mi Rey;\nte adoro, te adoro,\npor siempre te alabaré.',
  E'Verso 1:\n[D]A tus pies vengo a ado[A]rar,\nmi cora[Bm]zón te quiero [G]dar;\n[D]no hay nadie como [A]tú, Señor,\n[G]digno de toda mi can[D]ción.\n\nCoro:\n[G]Te adoro, [D]te adoro,\n[A]santo es tu nombre, mi [Bm]Rey;\n[G]te adoro, [D]te adoro,\n[A]por siempre te alaba[D]ré.',
  array['adoración', 'entrega']
),
(
  'Cantad con gozo al Señor', 3,
  (select id from public.authors where name = 'Rubén Castillo'),
  (select id from public.categories where slug = 'alabanza'),
  1974, 'C',
  E'Verso 1:\nCantad con gozo al Señor,\ntoda la tierra cante hoy;\nél ha hecho maravillas,\nsuya es toda la creación.\n\nCoro:\nAleluya, aleluya,\ncante todo corazón;\naleluya, aleluya,\ngloria al Rey y Salvador.',
  E'Verso 1:\n[C]Cantad con gozo al Se[F]ñor,\n[C]toda la tierra cante [G]hoy;\n[C]él ha hecho mara[F]villas,\n[G]suya es toda la crea[C]ción.\n\nCoro:\n[F]Aleluya, ale[C]luya,\n[G]cante todo cora[Am]zón;\n[F]aleluya, ale[C]luya,\n[G]gloria al Rey y Salva[C]dor.',
  array['gozo', 'alabanza']
),
(
  'Ven a las aguas de vida', 4,
  (select id from public.authors where name = 'Tomás Herrera'),
  (select id from public.categories where slug = 'evangelizacion'),
  1912, 'F',
  E'Verso 1:\nVen a las aguas de vida,\nven, que la mesa está ya;\nCristo te ofrece salida,\nven, que él te recibirá.\n\nCoro:\nVen hoy, ven hoy,\nno dejes pasar su amor;\nven hoy, ven hoy,\nabre tu ser al Señor.',
  E'Verso 1:\n[F]Ven a las aguas de [Bb]vida,\n[F]ven, que la mesa está [C]ya;\n[F]Cristo te ofrece sa[Bb]lida,\n[C]ven, que él te recibi[F]rá.\n\nCoro:\n[Bb]Ven hoy, [F]ven hoy,\n[C]no dejes pasar su a[Dm]mor;\n[Bb]ven hoy, [F]ven hoy,\n[C]abre tu ser al Se[F]ñor.',
  array['invitación', 'evangelio']
),
(
  'Mi vida entera te doy', 5,
  (select id from public.authors where name = 'Marta Salinas'),
  (select id from public.categories where slug = 'consagracion'),
  1961, 'E',
  E'Verso 1:\nMi vida entera te doy,\ntodo mi ser es de ti;\ntoma mis manos, Señor,\núsalas siempre por mí.\n\nCoro:\nConsagrado quiero estar,\nseparado para ti;\nen tu altar quiero quedar,\nvive tu vida en mí.',
  E'Verso 1:\n[E]Mi vida entera te [A]doy,\n[E]todo mi ser es de [B]ti;\n[E]toma mis manos, Se[A]ñor,\n[B]úsalas siempre por [E]mí.\n\nCoro:\n[A]Consagrado quiero es[E]tar,\n[B]separado para [C#m]ti;\n[A]en tu altar quiero que[E]dar,\n[B]vive tu vida en [E]mí.',
  array['consagración', 'entrega']
),
(
  'En memoria de tu amor', 6,
  (select id from public.authors where name = 'Tomás Herrera'),
  (select id from public.categories where slug = 'santa-cena'),
  1920, 'A',
  E'Verso 1:\nEn memoria de tu amor\npartimos hoy el pan;\ntu cuerpo dado por nosotros,\ntu sangre nos limpió.\n\nCoro:\nHasta que vuelvas otra vez\nlo haremos, oh Señor;\nanunciamos con la mesa\ntu muerte y tu amor.',
  null,
  array['santa cena', 'comunión']
),
(
  'Sepultado con Cristo', 7,
  (select id from public.authors where name = 'Elías Fuentes'),
  (select id from public.categories where slug = 'bautismo'),
  1930, 'D',
  E'Verso 1:\nSepultado con Cristo en las aguas,\nresucito a una vida nueva;\nlo viejo ya pasó para siempre,\nhoy camino en su senda eterna.\n\nCoro:\nNueva vida, nueva vida,\nen las aguas la declaré;\nnueva vida, nueva vida,\ncon mi Cristo caminaré.',
  null,
  array['bautismo', 'testimonio']
),
(
  'Alza tus manos y canta', 8,
  (select id from public.authors where name = 'Rubén Castillo'),
  (select id from public.categories where slug = 'coro-general'),
  1980, 'G',
  E'Coro:\nAlza tus manos y canta,\ncanta con el corazón;\nalza tus manos y canta,\ncanta al Señor tu canción.\n(Se repite)',
  E'Coro:\n[G]Alza tus manos y [C]canta,\n[D]canta con el cora[G]zón;\n[G]alza tus manos y [C]canta,\n[D]canta al Señor tu can[G]ción.',
  array['corito', 'congregacional']
),
(
  'Soy pequeñito pero él me ama', 9,
  (select id from public.authors where name = 'Ana Beltrán'),
  (select id from public.categories where slug = 'coro-de-ninos'),
  1995, 'C',
  E'Coro:\nSoy pequeñito pero él me ama,\nsoy pequeñito y él me cuidó;\ncomo un pastor con su ovejita,\nasí me cuida mi buen Señor.\n(Se repite con palmas)',
  null,
  array['niños', 'corito']
),
(
  'Juventud que sigue al Rey', 10,
  (select id from public.authors where name = 'Ana Beltrán'),
  (select id from public.categories where slug = 'jovenes'),
  2001, 'E',
  E'Verso 1:\nSomos juventud que sigue al Rey,\nfuego que no se apagará;\ncon su palabra y con su fe\nesta generación brillará.\n\nCoro:\nBrilla, brilla, luz de Dios,\nen mi vida brilla hoy;\nbrilla, brilla, luz de Dios,\ndonde vaya, tuyo soy.',
  E'Verso 1:\n[E]Somos juventud que [B]sigue al Rey,\n[C#m]fuego que no se apaga[A]rá;\n[E]con su palabra y [B]con su fe\n[A]esta generación brilla[E]rá.\n\nCoro:\n[A]Brilla, [B]brilla, [E]luz de Dios,\n[A]en mi [B]vida brilla [C#m]hoy;\n[A]brilla, [B]brilla, [E]luz de Dios,\n[A]donde [B]vaya, tuyo [E]soy.',
  array['jóvenes', 'compromiso']
),
(
  'Cristo viene, velad y orad', 11,
  (select id from public.authors where name = 'Elías Fuentes'),
  (select id from public.categories where slug = 'segunda-venida'),
  1935, 'F',
  E'Verso 1:\nCristo viene, velad y orad,\nprontamente regresará;\ncon las nubes le veréis llegar,\nsu promesa se cumplirá.\n\nCoro:\n¡Viene ya, viene ya!\nPreparados hay que estar;\n¡viene ya, viene ya!\nCristo pronto volverá.',
  null,
  array['segunda venida', 'esperanza']
),
(
  'Una noche en Belén', 12,
  (select id from public.authors where name = 'Marta Salinas'),
  (select id from public.categories where slug = 'navidad'),
  1958, 'G',
  E'Verso 1:\nUna noche en Belén\nuna estrella brilló;\nen un humilde pesebre\nel Salvador nació.\n\nCoro:\nGloria en las alturas,\npaz en la tierra hoy;\nha nacido el Mesías,\nCristo el Salvador.',
  null,
  array['navidad', 'nacimiento']
),
(
  'Roca eterna eres tú', 13,
  (select id from public.authors where name = 'Tomás Herrera'),
  (select id from public.categories where slug = 'himnos-tradicionales'),
  1908, 'Bb',
  E'Verso 1:\nRoca eterna eres tú,\nmi refugio y mi solaz;\nen la tormenta y en la calma\ntu presencia es mi paz.\n\nCoro:\nEn ti confío, oh Señor,\nfirme roca de salvación;\nnada me puede separar\nde tu eterno y fiel amor.',
  null,
  array['confianza', 'clásico']
),
(
  'Santo, santo es el Señor de la gloria', 14,
  (select id from public.authors where name = 'Lucía Andrade'),
  (select id from public.categories where slug = 'adoracion'),
  1992, 'D',
  E'Verso 1:\nSanto, santo es el Señor de la gloria,\nlos cielos proclaman su gran majestad;\nángeles cantan, se postran ancianos,\ndigno es el Cordero de toda honra dar.\n\nCoro:\nSanto, santo, santo,\nel cielo y la tierra llenos están;\nsanto, santo, santo,\nde tu gloria, oh Dios, y tu santidad.',
  E'Verso 1:\n[D]Santo, santo es el Se[G]ñor de la gloria,\nlos [D]cielos proclaman su [A]gran majestad;\n[D]ángeles cantan, se [G]postran ancianos,\n[D]digno es el Cordero de [A]toda honra [D]dar.\n\nCoro:\n[G]Santo, [A]santo, [D]santo,\nel [Bm]cielo y la tierra [G]llenos es[A]tán;\n[G]santo, [A]santo, [D]santo,\nde tu [Bm]gloria, oh Dios, y tu [A]santi[D]dad.',
  array['santidad', 'adoración']
),
(
  'Con júbilo te alabaré', 15,
  (select id from public.authors where name = 'Lucía Andrade'),
  (select id from public.categories where slug = 'alabanza'),
  1998, 'A',
  E'Verso 1:\nCon júbilo te alabaré,\ncon danza y con tambor;\ntu nombre celebrará mi ser,\neres digno de loor.\n\nCoro:\nDigno, digno es el Señor,\nreciba la honra y el poder;\ndigno, digno es el Señor,\nsu nombre exaltaré.',
  null,
  array['júbilo', 'celebración']
),
(
  'Ovejita que se perdió', 16,
  (select id from public.authors where name = 'Autor desconocido'),
  (select id from public.categories where slug = 'coro-de-ninos'),
  null, 'C',
  E'Coro:\nOvejita que se perdió,\nel pastor la fue a buscar;\nen sus hombros la cargó\ny la trajo a su redil.\n(Se repite)',
  null,
  array['niños', 'parábola']
),
(
  'Heme aquí, envíame a mí', 17,
  (select id from public.authors where name = 'Lucía Andrade'),
  (select id from public.categories where slug = 'consagracion'),
  2005, 'G',
  E'Verso 1:\nEscuché tu voz llamar,\n¿a quién enviaré?\nCon temor pude contestar:\nheme aquí, Señor, iré.\n\nCoro:\nHeme aquí, envíame a mí,\ndonde tú quieras iré;\nheme aquí, envíame a mí,\ntu mensaje llevaré.',
  E'Verso 1:\n[G]Escuché tu voz lla[C]mar,\n¿a [D]quién envia[G]ré?\nCon te[Em]mor pude contes[C]tar:\nheme a[D]quí, Señor, i[G]ré.\n\nCoro:\n[C]Heme aquí, en[G]víame a mí,\n[D]donde tú quieras i[Em]ré;\n[C]heme aquí, en[G]víame a mí,\n[D]tu mensaje lleva[G]ré.',
  array['misión', 'llamado']
),
(
  'Alegres esperamos tu regreso', 18,
  (select id from public.authors where name = 'Rubén Castillo'),
  (select id from public.categories where slug = 'segunda-venida'),
  1985, 'D',
  E'Verso 1:\nAlegres esperamos tu regreso,\nvestidos de blanca santidad;\nlas lámparas con aceite llenas,\nvelando hasta verte llegar.\n\nCoro:\nMaranata, ven Señor,\nte esperamos con amor;\nmaranata, ven Señor,\nven pronto, Salvador.',
  null,
  array['esperanza', 'maranata']
),
(
  'Buenas nuevas de gran gozo', 19,
  (select id from public.authors where name = 'Autor desconocido'),
  (select id from public.categories where slug = 'navidad'),
  null, 'F',
  E'Verso 1:\nBuenas nuevas de gran gozo\nel ángel anunció;\nhoy os ha nacido un niño,\nel Cristo, el Señor.\n\nCoro:\nVamos todos a Belén,\nvamos hoy a adorar;\nal niñito en el pesebre,\nnuestro Rey y nuestra paz.',
  null,
  array['navidad', 'anuncio']
),
(
  'Firmes marchamos con fe', 20,
  (select id from public.authors where name = 'Ana Beltrán'),
  (select id from public.categories where slug = 'jovenes'),
  2010, 'C',
  E'Verso 1:\nFirmes marchamos con fe,\nnada nos detendrá;\nla meta es Cristo el Rey,\nsu causa triunfará.\n\nCoro:\nAdelante sin temor,\nsu palabra es nuestra luz;\nadelante con valor,\nvictoriosos en Jesús.',
  E'Verso 1:\n[C]Firmes marchamos con [F]fe,\n[G]nada nos deten[C]drá;\n[C]la meta es Cristo el [F]Rey,\n[G]su causa triunfa[C]rá.\n\nCoro:\n[F]Adelante sin te[C]mor,\n[G]su palabra es nuestra [Am]luz;\n[F]adelante con va[C]lor,\n[G]victoriosos en Je[C]sús.',
  array['jóvenes', 'firmeza']
)
on conflict (number) do nothing;

-- =====================================================================
-- FIN DEL ESQUEMA
-- Después de ejecutar este archivo:
-- 1. Crear tu usuario en Authentication > Users (con Auto Confirm).
-- 2. Darle rol de admin con:
--    update public.profiles set role = 'admin'
--    where id = (select id from auth.users where email = 'tu@correo.com');
-- =====================================================================