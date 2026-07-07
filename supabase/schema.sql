-- ============================================================
-- HIMNARIO DIGITAL — Esquema de base de datos (Supabase / PostgreSQL)
-- Ejecutar completo en: Supabase → SQL Editor → New query → Run
-- ============================================================

-- ---------- Tablas ----------

create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  description text,
  created_at timestamptz not null default now()
);

create table if not exists authors (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists songs (
  id uuid primary key default gen_random_uuid(),
  number int not null unique,
  title text not null,
  slug text not null unique,
  author_id uuid references authors(id) on delete set null,
  category_id uuid references categories(id) on delete set null,
  year int,
  key text not null default 'C',          -- tonalidad original (cifrado americano)
  lyrics text not null,                    -- letra con acordes [C] en línea
  notes text,                              -- notas musicales opcionales
  media_url text,                          -- enlace a audio o video
  views int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Perfiles de usuarios (extiende auth.users de Supabase)
create table if not exists users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  role text not null default 'member' check (role in ('member','editor','admin')),
  created_at timestamptz not null default now()
);

create table if not exists favorites (
  user_id uuid not null references users(id) on delete cascade,
  song_id uuid not null references songs(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, song_id)
);

create table if not exists playlists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  name text not null,
  description text,
  created_at timestamptz not null default now()
);

create table if not exists playlist_songs (
  playlist_id uuid not null references playlists(id) on delete cascade,
  song_id uuid not null references songs(id) on delete cascade,
  position int not null default 0,
  primary key (playlist_id, song_id)
);

-- Índices de búsqueda
create index if not exists songs_title_idx on songs using gin (to_tsvector('spanish', title));
create index if not exists songs_number_idx on songs (number);
create index if not exists songs_key_idx on songs (key);
create index if not exists songs_category_idx on songs (category_id);

-- ---------- Trigger: perfil automático al registrarse ----------
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.users (id, email, display_name)
  values (new.id, new.email, split_part(new.email, '@', 1))
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- Función: contador de vistas ----------
create or replace function public.increment_views(song_slug text)
returns void language sql security definer set search_path = public as $$
  update songs set views = views + 1 where slug = song_slug;
$$;

-- ---------- Seguridad (RLS) ----------
alter table categories enable row level security;
alter table authors enable row level security;
alter table songs enable row level security;
alter table users enable row level security;
alter table favorites enable row level security;
alter table playlists enable row level security;
alter table playlist_songs enable row level security;

create or replace function public.is_staff()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from users where id = auth.uid() and role in ('editor','admin')
  );
$$;

-- Lectura pública del contenido del himnario
create policy "lectura publica canciones"  on songs      for select using (true);
create policy "lectura publica categorias" on categories for select using (true);
create policy "lectura publica autores"    on authors    for select using (true);

-- Escritura solo para personal autorizado (editor/admin)
create policy "staff escribe canciones"  on songs      for all using (public.is_staff()) with check (public.is_staff());
create policy "staff escribe categorias" on categories for all using (public.is_staff()) with check (public.is_staff());
create policy "staff escribe autores"    on authors    for all using (public.is_staff()) with check (public.is_staff());

-- Cada usuario ve/edita su propio perfil; el admin ve todos
create policy "perfil propio" on users for select using (auth.uid() = id or public.is_staff());
create policy "editar perfil propio" on users for update using (auth.uid() = id);

-- Favoritos y listas: privados de cada usuario
create policy "favoritos propios" on favorites for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "listas propias" on playlists for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "canciones de listas propias" on playlist_songs for all
  using (exists (select 1 from playlists p where p.id = playlist_id and p.user_id = auth.uid()))
  with check (exists (select 1 from playlists p where p.id = playlist_id and p.user_id = auth.uid()));

-- ============================================================
-- DATOS SEMILLA
-- ============================================================

insert into categories (name, slug) values
  ('Adoración','adoracion'), ('Alabanza','alabanza'), ('Evangelización','evangelizacion'),
  ('Consagración','consagracion'), ('Santa Cena','santa-cena'), ('Bautismo','bautismo'),
  ('Coro General','coro-general'), ('Coro de Niños','coro-de-ninos'), ('Jóvenes','jovenes'),
  ('Segunda Venida','segunda-venida'), ('Navidad','navidad'), ('Himnos Tradicionales','himnos-tradicionales')
on conflict (slug) do nothing;

insert into authors (name) values
  ('Elías Montaño'), ('Rosa María Quintero'), ('Tomás Alvarado'), ('Delia Fuentes'),
  ('Joaquín Peralta'), ('Aurora Benítez'), ('Anónimo'), ('Marta Salinas'),
  ('Iván Carrizo'), ('Samuel Ortega'), ('Cecilia Andrade'), ('Ernesto Villalba')
on conflict (name) do nothing;

-- Función auxiliar para insertar himnos por nombre de autor/categoría
create or replace function seed_song(
  p_number int, p_title text, p_slug text, p_author text, p_year int,
  p_category text, p_key text, p_lyrics text, p_notes text, p_media text, p_views int
) returns void language plpgsql as $$
begin
  insert into songs (number, title, slug, author_id, category_id, year, key, lyrics, notes, media_url, views)
  values (
    p_number, p_title, p_slug,
    (select id from authors where name = p_author),
    (select id from categories where slug = p_category),
    p_year, p_key, p_lyrics, p_notes, p_media, p_views
  ) on conflict (number) do nothing;
end $$;

select seed_song(1,'Grande es tu amor por mí','01-grande-es-tu-amor-por-mi','Elías Montaño',1932,'adoracion','G',
$lyr$[Estrofa 1]
[G]Grande es tu amor por [C]mí, Señor,
[G]más alto que el [D]cielo azul;
[G]me sostiene tu [C]fiel bondad,
[D]nueva cada [G]amanecer.

[Coro]
[C]Grande, [D]grande es tu [G]amor,
[C]fiel en la [D]tempes[Em]tad;
[C]a tus pies me [G]rindo [Em]hoy,
[D]tuyo siempre [G]soy.

[Estrofa 2]
[G]Cuando el valle os[C]curo esté,
[G]tu presencia es mi [D]luz;
[G]nada me sepa[C]rará
[D]de tu amor, Je[G]sús.$lyr$,
'Tempo lento, 3/4. Ideal para apertura del culto.', null, 214);

select seed_song(2,'Cantad con júbilo','02-cantad-con-jubilo','Rosa María Quintero',1948,'alabanza','D',
$lyr$[Estrofa 1]
[D]Cantad con júbilo al Se[G]ñor,
[D]pueblos de toda la [A]tierra;
[D]servidle siempre con a[G]mor,
[A]entrad con gozo a su [D]casa.

[Coro]
[G]¡Aleluya, ale[D]luya!,
[A]su misericordia es e[D]terna;
[G]¡aleluya, ale[D]luya!,
[A]de generación en genera[D]ción.

[Estrofa 2]
[D]Sabed que Él es nuestro [G]Dios,
[D]Él nos hizo, suyos [A]somos;
[D]ovejas de su tierno a[G]mor,
[A]pueblo de su santo [D]prado.$lyr$,
'Basado en el Salmo 100. Tempo alegre.', 'https://ejemplo.iglesia.org/audio/cantad-con-jubilo.mp3', 187);

select seed_song(3,'Ven a la fuente','03-ven-a-la-fuente','Tomás Alvarado',1955,'evangelizacion','E',
$lyr$[Estrofa 1]
[E]Ven a la fuente de [A]vida,
[E]ven con tu carga y do[B]lor;
[E]Cristo te espera, que[A]rido,
[B]te ofrece perdón y a[E]mor.

[Coro]
[A]Ven, ven [E]hoy,
no de[B]jes pasar su [E]voz;
[A]ven, ven [E]hoy,
[B]la puerta abierta es[E]tá.

[Estrofa 2]
[E]Deja las sendas o[A]scuras,
[E]hay un camino me[B]jor;
[E]agua de vida más [A]pura
[B]brota del gran Salva[E]dor.$lyr$,
null, null, 156);

select seed_song(4,'A tus pies me rindo','04-a-tus-pies-me-rindo','Delia Fuentes',1961,'consagracion','C',
$lyr$[Estrofa 1]
[C]A tus pies me [F]rindo, oh [C]Dios,
todo entrego [G]hoy;
[C]toma mi [F]vida en[C]tera,
[G]tuyo ya [C]soy.

[Coro]
[F]Consagrado [C]quiero estar,
[F]santo para [G]ti;
[C]moldéame, al[F]farero [Am]fiel,
[G]hazme como [C]tú.

[Estrofa 2]
[C]Mis manos y mis [F]la[C]bios,
mi mente y cora[G]zón;
[C]mis sueños y mis [F]a[C]ños
[G]pongo en tu al[C]tar.$lyr$,
'Sugerido para llamado y ministración.', null, 142);

select seed_song(5,'En memoria de tu cruz','05-en-memoria-de-tu-cruz','Joaquín Peralta',1929,'santa-cena','F',
$lyr$[Estrofa 1]
[F]En memoria de tu [Bb]cruz
[F]parto el pan, oh buen Je[C]sús;
[F]tu cuerpo dado por a[Bb]mor
[C]me recuerda tu do[F]lor.

[Coro]
[Bb]Hasta que [F]vengas otra [Dm]vez
[Gm]anunciamos [C]tu mo[F]rir;
[Bb]copa y pan pro[F]clama[Dm]rán
[C]tu victoria y tu ve[F]nir.

[Estrofa 2]
[F]En la copa veo, Se[Bb]ñor,
[F]sangre pura del per[C]dón;
[F]nuevo pacto selló tu a[Bb]mor,
[C]vivo por tu reden[F]ción.$lyr$,
'Cantar en actitud reverente, sin instrumentos fuertes.', null, 98);

select seed_song(6,'Sepultado con Cristo','06-sepultado-con-cristo','Aurora Benítez',1970,'bautismo','G',
$lyr$[Estrofa 1]
[G]Sepultado con [C]Cristo en las [G]aguas,
mi vieja vida a[D]trás quedó;
[G]resucitado a [C]nueva [G]vida,
[D]camino en su resurrec[G]ción.

[Coro]
[C]Soy testimonio [G]vivo
[D]de su gracia y po[G]der;
[C]el que era ya no [G]vive,
[D]Cristo vive en [G]mí.

[Estrofa 2]
[G]Público es mi [C]testi[G]monio,
delante de todos lo di[D]ré:
[G]Jesucristo es [C]mi Se[G]ñor,
[D]y por siempre le segui[G]ré.$lyr$,
null, null, 61);

select seed_song(7,'Cristo me ama y me guarda','07-cristo-me-ama-y-me-guarda','Anónimo',1980,'coro-general','D',
$lyr$[Coro]
[D]Cristo me ama y me [G]guarda,
[A]me guarda con gran po[D]der;
[D]Cristo me ama y me [G]guarda,
[A]de día y al anoche[D]cer.
[G]No temeré, [D]no temeré,
[A]su mano me sostend[D]rá;
[G]no temeré, [D]no temeré,
[A]conmigo Él siempre esta[D]rá.$lyr$,
'Coro corto para repetir. Se puede subir medio tono en la última repetición.', null, 233);

select seed_song(8,'Soy pequeñito pero grande es mi Dios','08-soy-pequenito-pero-grande-es-mi-dios','Marta Salinas',1992,'coro-de-ninos','C',
$lyr$[Coro]
[C]Soy pequeñito, pe[F]queñito,
pero [G]grande es mi [C]Dios;
me cuida de no[F]checita
y me des[G]pierta con el [C]sol.
[F]Con mis manitos a[C]plaudo,
[G]con mis piecitos también,
[F]con mi boquita le [C]canto:
[G]¡Cristo me ama, a[C]mén!$lyr$,
'Con palmas y mímica. Ideal para escuela dominical.', null, 175);

select seed_song(9,'Fuego de juventud','09-fuego-de-juventud','Iván Carrizo',2005,'jovenes','Em',
$lyr$[Estrofa 1]
[Em]Enciende el fuego en mi cora[C]zón,
[G]quiero vivir para [D]ti;
[Em]toda mi fuerza, toda mi [C]voz
[G]hoy la le[D]vanto a [Em]ti.

[Coro]
[C]Somos genera[G]ción
[D]que no se rendi[Em]rá;
[C]llevamos tu ver[G]dad,
[D]tu luz brilla[Em]rá.

[Estrofa 2]
[Em]No me avergüenzo de tu evan[C]gelio,
[G]es poder de salva[D]ción;
[Em]donde me mandes iré co[C]rriendo,
[G]esta es [D]mi pa[Em]sión.$lyr$,
null, 'https://ejemplo.iglesia.org/video/fuego-de-juventud', 201);

select seed_song(10,'Viene otra vez el Rey','10-viene-otra-vez-el-rey','Samuel Ortega',1938,'segunda-venida','A',
$lyr$[Estrofa 1]
[A]Viene otra vez el [D]Rey de [A]reyes,
en las nubes con po[E]der;
[A]toda lengua y [D]toda ro[A]dilla
[E]su gloria confesa[A]rá.

[Coro]
[D]¡Velad, o[A]rad!,
[E]la trompeta sona[A]rá;
[D]¡velad, o[A]rad!,
[E]el Señor no tarda[A]rá.

[Estrofa 2]
[A]Lámparas siempre encen[D]di[A]das,
aceite en el vaso ten[E]ed;
[A]como las vírgenes pru[D]den[A]tes,
[E]listos para su veni[A]da.$lyr$,
null, null, 88);

select seed_song(11,'Nació en Belén la esperanza','11-nacio-en-belen-la-esperanza','Cecilia Andrade',1958,'navidad','F',
$lyr$[Estrofa 1]
[F]Nació en Be[Bb]lén la espe[F]ranza,
en un pesebre humil[C]dad;
[F]los ánge[Bb]les pro[F]claman:
[C]¡gloria en las altu[F]ras, paz!

[Coro]
[Bb]Gloria a [F]Dios, gloria a [Dm]Dios,
[Gm]ha nacido el [C]Salva[F]dor;
[Bb]gloria a [F]Dios, gloria a [Dm]Dios,
[C]Emanuel, Dios con no[F]sotros.

[Estrofa 2]
[F]Pastores [Bb]y sabios [F]vienen
a adorar al niño [C]Rey;
[F]también yo [Bb]traigo mi [F]vida,
[C]mi tesoro y mi [F]fe.$lyr$,
'Para el programa navideño. Puede cantarse a dos voces.', null, 119);

select seed_song(12,'Firmes en la Roca eterna','12-firmes-en-la-roca-eterna','Ernesto Villalba',1912,'himnos-tradicionales','Bb',
$lyr$[Estrofa 1]
[Bb]Firmes en la [Eb]Roca e[Bb]terna,
nada nos podrá mo[F]ver;
[Bb]vientos rugen, [Eb]mares [Bb]braman,
[F]Cristo es nuestro sos[Bb]tén.

[Coro]
[Eb]Firmes, [Bb]firmes,
[F]nuestra fe no cede[Bb]rá;
[Eb]sobre a[Bb]rena nada queda,
[F]sobre Roca firme es[Bb]tá.

[Estrofa 2]
[Bb]Su palabra es [Eb]fundam[Bb]ento,
su promesa nuestro es[F]cudo;
[Bb]generaciones [Eb]pasa[Bb]rán,
[F]su verdad permanece[Bb]rá.$lyr$,
null, null, 167);

select seed_song(13,'Santo es tu nombre, oh Dios','13-santo-es-tu-nombre-oh-dios','Elías Montaño',1936,'adoracion','E',
$lyr$[Estrofa 1]
[E]Santo es tu [A]nombre, oh [E]Dios,
los cielos cantan tu ho[B]nor;
[E]ángeles [A]cubren su [E]faz
[B]ante tu resplan[E]dor.

[Coro]
[A]Santo, [B]santo, [E]santo,
[A]digno de [B]adora[C#m]ción;
[A]me postro ante tu [E]trono
[B]con todo el cora[E]zón.

[Estrofa 2]
[E]Tu gloria [A]llena el lu[E]gar,
tu presencia es mi [B]paz;
[E]en tu her[A]mosa santi[E]dad
[B]te quiero contem[E]plar.$lyr$,
null, null, 195);

select seed_song(14,'Digno es el Cordero','14-digno-es-el-cordero','Rosa María Quintero',1951,'alabanza','G',
$lyr$[Estrofa 1]
[G]Digno es el Cor[C]dero que fue in[G]molado
de recibir la [D]gloria y el poder;
[G]toda criatu[C]ra en cielo y [G]tierra
[D]cante su loor, a[G]mén.

[Coro]
[C]¡Digno, [G]digno,
[D]digno es el Se[G]ñor!
[C]Honra y ala[G]banza,
[D]reciba nuestro a[G]mor.

[Estrofa 2]
[G]Con su sangre [C]nos compró pa[G]ra Dios
de todo pueblo [D]y toda nación;
[G]reyes y sacer[C]dotes nos [G]hizo,
[D]suya es la exalta[G]ción.$lyr$,
'Basado en Apocalipsis 5.', null, 149);

select seed_song(15,'Hay lugar en la mesa del Padre','15-hay-lugar-en-la-mesa-del-padre','Tomás Alvarado',1963,'evangelizacion','D',
$lyr$[Estrofa 1]
[D]Hay lugar en la [G]mesa del [D]Padre,
hay un sitio guardado pa[A]ra ti;
[D]no importa cuán [G]lejos an[D]duviste,
[A]sus brazos abiertos [D]vi.

[Coro]
[G]Vuelve a [D]casa,
[A]el Padre te espera [D]ya;
[G]hay fiesta en el [D]cielo
[A]cuando un hijo vuelve al ho[D]gar.

[Estrofa 2]
[D]Deja atrás la [G]tierra le[D]jana,
los algarrobos y el do[A]lor;
[D]hay vestido [G]nuevo y a[D]nillo,
[A]hay un beso de per[D]dón.$lyr$,
'Inspirado en la parábola del hijo pródigo.', null, 134);

select seed_song(16,'Heme aquí, envíame','16-heme-aqui-enviame','Delia Fuentes',1966,'consagracion','A',
$lyr$[Estrofa 1]
[A]Escuché tu voz pre[D]guntando:
"¿a quién enviaré [E]yo?";
[A]con temor pero con[D]fiado
[E]respondió mi cora[A]zón.

[Coro]
[D]Heme a[A]quí, en[E]víame,
[D]donde tú [A]quieras i[E]ré;
[D]heme a[A]quí, en[F#m]víame,
[E]tu mensajero se[A]ré.

[Estrofa 2]
[A]Toca mis labios im[D]puros
con el carbón de tu al[E]tar;
[A]y mi vida consa[D]grada
[E]sea ofrenda en tu san[A]tuario.$lyr$,
'Basado en Isaías 6.', null, 77);

select seed_song(17,'Aleluya, gloria a Dios','17-aleluya-gloria-a-dios','Anónimo',1985,'coro-general','C',
$lyr$[Coro]
[C]Aleluya, [F]gloria a [C]Dios,
aleluya, [G]gloria a Dios,
[C]aleluya, [F]gloria a [C]Dios,
[G]cantará mi [C]voz.
[F]Por su amor tan [C]grande,
[G]por su salva[Am]ción,
[F]por su fiel pre[C]sencia:
[G]¡gloria al Señ[C]or!$lyr$,
'Coro de avivamiento. Repetir subiendo la intensidad.', null, 228);

select seed_song(18,'Marchando con Jesús','18-marchando-con-jesus','Marta Salinas',1995,'coro-de-ninos','G',
$lyr$[Coro]
[G]Marchando, marchando, mar[C]chando con Je[G]sús,
un, dos, tres, ¡qué [D]gozo es!, marchando con Je[G]sús.
Si llueve o hace [C]sol, yo canto esta can[G]ción:
Jesús es mi ami[D]guito y me guarda con a[G]mor.$lyr$,
'Marcha infantil con movimientos.', null, 92);

select seed_song(19,'Tuya es mi canción','19-tuya-es-mi-cancion','Iván Carrizo',2010,'jovenes','Bm',
$lyr$[Estrofa 1]
[Bm]En medio de mil [G]voces
[D]elijo oír tu [A]voz;
[Bm]en un mundo que [G]corre
[D]me detengo ante [A]ti.

[Coro]
[G]Tuya es mi can[D]ción,
[A]tuyo es mi cora[Bm]zón;
[G]mi generación te [D]canta:
[A]no hay nadie como [Bm]tú.

[Estrofa 2]
[Bm]Mis planes y mis [G]redes
[D]los rindo ante tu al[A]tar;
[Bm]mi historia tú la es[G]cribes,
[D]contigo quiero an[A]dar.$lyr$,
null, 'https://ejemplo.iglesia.org/audio/tuya-es-mi-cancion.mp3', 163);

select seed_song(20,'Cristo viene, ¡prepárate!','20-cristo-viene-preparate','Samuel Ortega',1941,'segunda-venida','F',
$lyr$[Estrofa 1]
[F]Cristo viene, ¡pre[Bb]párate!,
la promesa se cumpli[C]rá;
[F]como el rayo en o[Bb]riente brilla,
[C]así su venida se[F]rá.

[Coro]
[Bb]¡Maranata, el Se[F]ñor ven[Dm]drá!,
[Gm]la iglesia le ve[C]rá;
[Bb]con ropas blancas, [F]lámpara en [Dm]mano,
[C]su pueblo le espera[F]rá.

[Estrofa 2]
[F]Los redimidos de [Bb]toda tribu
al encuentro subi[C]rán;
[F]y para siempre con [Bb]Cristo el Rey
[C]en gloria reina[F]rán.$lyr$,
null, null, 105);

drop function if exists seed_song(int, text, text, text, int, text, text, text, text, text, int);

-- ============================================================
-- IMPORTANTE — Crear el primer administrador:
-- 1) Registrar el usuario en Authentication → Users → Add user.
-- 2) Ejecutar:  update users set role = 'admin' where email = 'tu@correo.com';
-- ============================================================
