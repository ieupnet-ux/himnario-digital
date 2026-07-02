/**
 * scripts/seed.ts
 * Genera 20 himnos de demostración con datos ficticios para probar el sistema.
 *
 * Uso:
 *   1. Configura .env.local con NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY
 *   2. Ejecuta: npm run seed
 */
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('❌ Faltan variables de entorno NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });
interface AuthorSeed {
  name: string;
  birth_year: number | null;
  death_year: number | null;
}

const AUTHORS: AuthorSeed[] = [
  { name: 'John Newton', birth_year: 1725, death_year: 1807 },
  { name: 'Fanny Crosby', birth_year: 1820, death_year: 1915 },
  { name: 'Isaac Watts', birth_year: 1674, death_year: 1748 },
  { name: 'Charles Wesley', birth_year: 1707, death_year: 1788 },
  { name: 'Stuart K. Hine', birth_year: 1899, death_year: 1989 },
  { name: 'Horatio Spafford', birth_year: 1828, death_year: 1888 },
  { name: 'María Luisa Ortega', birth_year: 1958, death_year: null },
  { name: 'Carlos Reyes', birth_year: 1972, death_year: null },
  { name: 'Equipo de Adoración Vida Nueva', birth_year: null, death_year: null }
];

interface SeedSong {
  number: number;
  title: string;
  author: string;
  category: string;
  year: number;
  key: string;
  lyrics_with_chords: string;
  tags: string[];
}

const SONGS: SeedSong[] = [
  {
    number: 1,
    title: 'Sublime Gracia',
    author: 'John Newton',
    category: 'Himnos Tradicionales',
    year: 1779,
    key: 'G',
    tags: ['gracia', 'salvación', 'testimonio'],
    lyrics_with_chords:
      '[G]Sublime gracia del [D]Señor\n' +
      'que a un infeliz [G]salvó\n' +
      'fui [C]ciego mas hoy [G]miro yo\n' +
      'per[D]dido y Él me [G]halló\n\n' +
      'Su [G]gracia me en[D]señó a temer\n' +
      'mis dudas [G]ahuyentó\n' +
      'oh [C]cuán precioso [G]fue a mi ser\n' +
      'cuando Él me [D]transfor[G]mó'
  },
  {
    number: 2,
    title: 'Cuán Grande Es Él',
    author: 'Stuart K. Hine',
    category: 'Adoración',
    year: 1949,
    key: 'C',
    tags: ['creación', 'majestad', 'adoración'],
    lyrics_with_chords:
      '[C]Señor mi Dios, al [F]contemplar los [C]cielos\n' +
      'el firma[F]mento y las es[C]trellas mil\n' +
      '[C]al ver tu inmen[F]so amor y tu po[C]der\n' +
      'mos[G]trado en toda tu [C]creación\n\n' +
      'Mi co[F]razón en[C]tona la can[G]ción\n' +
      'cuán [C]grande es Él, [F]cuán grande es [C]Él\n' +
      'Mi co[F]razón en[C]tona la can[G]ción\n' +
      'cuán [C]grande es [G]Él, cuán grande es [C]Él'
  },
  {
    number: 3,
    title: 'Estad Por Cristo Firmes',
    author: 'Isaac Watts',
    category: 'Consagración',
    year: 1724,
    key: 'D',
    tags: ['firmeza', 'fe', 'batalla espiritual'],
    lyrics_with_chords:
      '[D]Estad por Cristo [G]firmes\n' +
      'so[A]ldados de la [D]cruz\n' +
      'al[G]zad en alto el [D]lema\n' +
      'que sal[A]vación es [D]luz'
  },
  {
    number: 4,
    title: 'Jesucristo Es Mi Salvador',
    author: 'Carlos Reyes',
    category: 'Evangelización',
    year: 1998,
    key: 'E',
    tags: ['salvación', 'evangelio', 'testimonio'],
    lyrics_with_chords:
      '[E]Jesucristo es mi sal[A]vador\n' +
      'Él [B]murió por mí en la [E]cruz\n' +
      'hoy le [A]sirvo con todo mi a[B]mor\n' +
      'y le sigo en su [E]luz'
  },
  {
    number: 5,
    title: 'Renuévame',
    author: 'María Luisa Ortega',
    category: 'Consagración',
    year: 1995,
    key: 'Am',
    tags: ['consagración', 'santidad', 'transformación'],
    lyrics_with_chords:
      '[Am]Renuévame Se[F]ñor Jesús\n' +
      'ya no quiero ser i[C]gual\n' +
      'pon en mí tu mismo [G]corazón\n' +
      'y has[Am]me semejante a [E]ti'
  },
  {
    number: 6,
    title: 'Alma Bendice al Señor',
    author: 'Charles Wesley',
    category: 'Alabanza',
    year: 1740,
    key: 'F',
    tags: ['bendición', 'gratitud', 'alabanza'],
    lyrics_with_chords:
      '[F]Alma bendice al [Bb]Señor\n' +
      'rey de glo[C]ria y de a[F]mor\n' +
      'ento[Bb]nemos hoy su [F]gloria\n' +
      'su mi[C]sericor[F]dia es eternal'
  },
  {
    number: 7,
    title: 'Cuando la Paz del Señor',
    author: 'Horatio Spafford',
    category: 'Consagración',
    year: 1873,
    key: 'D',
    tags: ['paz', 'consuelo', 'confianza'],
    lyrics_with_chords:
      '[D]Cuando la paz del Se[G]ñor inunda mi [D]ser\n' +
      'cual las o[A]ndas del ancho [D]mar\n' +
      'cualquiera que sea mi [G]suerte diré\n' +
      'estoy [A]bien, mi alma está [D]bien'
  },
  {
    number: 8,
    title: 'Niños, Venid a Cristo',
    author: 'Equipo de Adoración Vida Nueva',
    category: 'Coro de Niños',
    year: 2005,
    key: 'C',
    tags: ['niños', 'invitación', 'amor de Dios'],
    lyrics_with_chords:
      '[C]Niños, venid a [F]Cristo\n' +
      'Él los quiere mucho [G]más\n' +
      '[C]vengan todos a sus [F]brazos\n' +
      'Él los va a abra[G]zar[C]'
  },
  {
    number: 9,
    title: 'Mi Pastor Es Cristo',
    author: 'Fanny Crosby',
    category: 'Adoración',
    year: 1880,
    key: 'Bb',
    tags: ['pastor', 'cuidado', 'confianza'],
    lyrics_with_chords:
      '[Bb]Mi pastor es Cristo y [Eb]nada me fal[Bb]tará\n' +
      'en lugares de delica[F]dos pastos me hará re[Bb]posar\n' +
      'junto a las aguas de re[Eb]poso me condu[Bb]cirá\n' +
      'y mi al[F]ma confor[Bb]tará'
  },
  {
    number: 10,
    title: 'Venid Fieles Todos',
    author: 'Equipo de Adoración Vida Nueva',
    category: 'Navidad',
    year: 1751,
    key: 'G',
    tags: ['navidad', 'nacimiento', 'celebración'],
    lyrics_with_chords:
      '[G]Venid fieles to[C]dos a Be[G]lén\n' +
      'con [D]gozo triunfa[G]ntes\n' +
      'venid, venid ado[C]rar al [G]rey de los [D]cielos\n' +
      'que ha [G]nacido por nos[D]otros [G]hoy'
  },
  {
    number: 11,
    title: 'Águilas',
    author: 'Carlos Reyes',
    category: 'Jóvenes',
    year: 2010,
    key: 'A',
    tags: ['fortaleza', 'juventud', 'esperanza'],
    lyrics_with_chords:
      '[A]Los que esperan en Je[D]hová\n' +
      'tendrán nuevas [A]fuerzas\n' +
      'lev[E]antarán alas como las á[A]guilas\n' +
      'correrán y no se can[D]sarán'
  },
  {
    number: 12,
    title: 'Este Pan, Este Vino',
    author: 'Equipo de Adoración Vida Nueva',
    category: 'Santa Cena',
    year: 2001,
    key: 'Em',
    tags: ['comunión', 'cena del señor', 'sacrificio'],
    lyrics_with_chords:
      '[Em]Este pan que partimos hoy\n' +
      'es me[C]moria de tu a[G]mor\n' +
      'esta [D]copa que bebe[Em]mos\n' +
      'nos re[C]cuerda tu pa[D]sión'
  },
  {
    number: 13,
    title: 'Sumérgeme, Señor',
    author: 'María Luisa Ortega',
    category: 'Bautismo',
    year: 1999,
    key: 'D',
    tags: ['bautismo', 'nueva vida', 'obediencia'],
    lyrics_with_chords:
      '[D]Sumérgeme Señor en las [G]aguas\n' +
      'sepúl[A]tame con Cristo en su [D]muerte\n' +
      'para [G]andar en vida nu[A]eva\n' +
      'como Él resucitó por el [D]Padre'
  },
  {
    number: 14,
    title: 'Coro de Victoria',
    author: 'Equipo de Adoración Vida Nueva',
    category: 'Coro General',
    year: 2008,
    key: 'C',
    tags: ['victoria', 'fe', 'júbilo'],
    lyrics_with_chords:
      '[C]Cantemos todos con [F]gran [G]voz\n' +
      'la victoria nos dio el Se[C]ñor\n' +
      '[Am]venció el pecado y la [F]muerte\n' +
      'hoy can[G]temos con [C]ardor'
  },
  {
    number: 15,
    title: 'Él Viene Pronto',
    author: 'Carlos Reyes',
    category: 'Segunda Venida',
    year: 2003,
    key: 'Em',
    tags: ['esperanza', 'regreso de cristo', 'vigilancia'],
    lyrics_with_chords:
      '[Em]Él viene pronto, prepara[D]os\n' +
      'velad y o[C]rad sin ce[G]sar\n' +
      '[Em]las trompetas sona[D]rán\n' +
      'y con Él nos lleva[Am]rá [B7]'
  },
  {
    number: 16,
    title: 'Noche de Paz',
    author: 'Equipo de Adoración Vida Nueva',
    category: 'Navidad',
    year: 1818,
    key: 'Bb',
    tags: ['navidad', 'paz', 'nacimiento'],
    lyrics_with_chords:
      '[Bb]Noche de paz, [Eb]noche de a[Bb]mor\n' +
      'todo duerme en [F]rededor\n' +
      '[Bb]entre los astros que es[Eb]parcen su [Bb]luz\n' +
      'bella anun[F]ciando al niñi[Bb]to Jesús\n' +
      '[Eb]brilla la es[Bb]trella de [F]paz\n' +
      '[Bb]brilla la es[F]trella de [Bb]paz'
  },
  {
    number: 17,
    title: 'Te Alabaré',
    author: 'María Luisa Ortega',
    category: 'Alabanza',
    year: 2000,
    key: 'G',
    tags: ['alabanza', 'gratitud', 'gozo'],
    lyrics_with_chords:
      '[G]Te alabaré, te alaba[C]ré\n' +
      'te alabaré [D]mi buen Se[G]ñor\n' +
      'con todo mi [C]ser, con todo mi [G]ser\n' +
      'te alabaré [D]mi buen Se[G]ñor'
  },
  {
    number: 18,
    title: 'Manantial de Amor',
    author: 'Carlos Reyes',
    category: 'Adoración',
    year: 2012,
    key: 'C',
    tags: ['amor de dios', 'intimidad', 'adoración'],
    lyrics_with_chords:
      '[C]Eres manantial de a[Am]mor\n' +
      'que sa[F]cia mi sed Se[G]ñor\n' +
      '[C]en tu presencia es[Am]toy\n' +
      'y nada [F]más quiero [G]hoy[C]'
  },
  {
    number: 19,
    title: 'Sembrando la Semilla',
    author: 'Equipo de Adoración Vida Nueva',
    category: 'Evangelización',
    year: 2006,
    key: 'D',
    tags: ['misiones', 'evangelismo', 'fruto'],
    lyrics_with_chords:
      '[D]Sembrando la semi[G]lla\n' +
      'del e[A]vangelio de [D]amor\n' +
      'el cam[G]po está ma[D]duro\n' +
      'y listo para la co[A]secha hoy[D]'
  },
  {
    number: 20,
    title: 'Niños Felices en Cristo',
    author: 'Equipo de Adoración Vida Nueva',
    category: 'Coro de Niños',
    year: 2015,
    key: 'C',
    tags: ['niños', 'alegría', 'gozo'],
    lyrics_with_chords:
      '[C]Somos niños felices en [F]Cristo\n' +
      'cantamos con [G]gozo su a[C]mor\n' +
      'aplaudi[F]mos con manos al[G]egres\n' +
      'alaban[C]do a nuestro Salva[G]dor[C]'
  }
];

function stripChords(text: string): string {
  return text.replace(/\[([^\]]+)\]/g, '');
}

async function main() {
  console.log('🌱 Iniciando siembra de datos de demostración...\n');

  // 1. Crear autores
  console.log('👤 Creando autores...');
  const authorIds = new Map<string, string>();
  for (const author of AUTHORS) {
    const { data: existing } = await supabase.from('authors').select('id').eq('name', author.name).maybeSingle();
    if (existing) {
      authorIds.set(author.name, existing.id);
      continue;
    }
    const { data, error } = await supabase.from('authors').insert(author).select('id').single();
    if (error) {
      console.error(`  ❌ Error creando autor ${author.name}:`, error.message);
      continue;
    }
    authorIds.set(author.name, data.id);
    console.log(`  ✓ ${author.name}`);
  }

  // 2. Obtener categorías existentes (deben haberse creado con la migración 0002)
  console.log('\n📂 Verificando categorías...');
  const { data: categories } = await supabase.from('categories').select('id, name');
  const categoryIds = new Map((categories ?? []).map((c) => [c.name, c.id]));
  console.log(`  ✓ ${categoryIds.size} categorías encontradas`);

  if (categoryIds.size === 0) {
    console.error('\n❌ No hay categorías. Ejecuta primero la migración 0002_seed_categories.sql en Supabase.');
    process.exit(1);
  }

  // 3. Crear canciones
  console.log('\n🎵 Creando himnos de demostración...');
  let created = 0;
  for (const song of SONGS) {
    const authorId = authorIds.get(song.author) ?? null;
    const categoryId = categoryIds.get(song.category) ?? null;

    const { data: existing } = await supabase.from('songs').select('id').eq('title', song.title).maybeSingle();
    if (existing) {
      console.log(`  ⏭  "${song.title}" ya existe, omitiendo`);
      continue;
    }

    const { error } = await supabase.from('songs').insert({
      number: song.number,
      title: song.title,
      author_id: authorId,
      category_id: categoryId,
      year: song.year,
      original_key: song.key,
      lyrics: stripChords(song.lyrics_with_chords),
      lyrics_with_chords: song.lyrics_with_chords,
      tags: song.tags,
      times_used: Math.floor(Math.random() * 50)
    });

    if (error) {
      console.error(`  ❌ Error creando "${song.title}":`, error.message);
      continue;
    }
    created++;
    console.log(`  ✓ #${song.number} ${song.title}`);
  }

  console.log(`\n✅ Listo. ${created} himnos nuevos creados de ${SONGS.length} totales.`);
}

main().catch((err) => {
  console.error('❌ Error fatal:', err);
  process.exit(1);
});
