import type { Category, Song } from "./types";

/**
 * Datos de demostración (20 himnos ficticios).
 * Se usan cuando Supabase no está configurado, y también se incluyen
 * como semilla en supabase/schema.sql.
 */

export const DEMO_CATEGORIES: Category[] = [
  { id: "c01", name: "Adoración", slug: "adoracion" },
  { id: "c02", name: "Alabanza", slug: "alabanza" },
  { id: "c03", name: "Evangelización", slug: "evangelizacion" },
  { id: "c04", name: "Consagración", slug: "consagracion" },
  { id: "c05", name: "Santa Cena", slug: "santa-cena" },
  { id: "c06", name: "Bautismo", slug: "bautismo" },
  { id: "c07", name: "Coro General", slug: "coro-general" },
  { id: "c08", name: "Coro de Niños", slug: "coro-de-ninos" },
  { id: "c09", name: "Jóvenes", slug: "jovenes" },
  { id: "c10", name: "Segunda Venida", slug: "segunda-venida" },
  { id: "c11", name: "Navidad", slug: "navidad" },
  { id: "c12", name: "Himnos Tradicionales", slug: "himnos-tradicionales" },
];

const s = (
  number: number,
  title: string,
  slug: string,
  author: string,
  year: number,
  category: string,
  category_slug: string,
  key: string,
  lyrics: string,
  notes: string | null = null,
  media_url: string | null = null,
  views = 0
): Song => ({
  id: `demo-${number}`,
  number,
  title,
  slug,
  author,
  year,
  category,
  category_slug,
  key,
  lyrics,
  notes,
  media_url,
  views,
});

export const DEMO_SONGS: Song[] = [
  s(1, "Grande es tu amor por mí", "01-grande-es-tu-amor-por-mi", "Elías Montaño", 1932, "Adoración", "adoracion", "G",
`[Estrofa 1]
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
[D]de tu amor, Je[G]sús.`,
"Tempo lento, 3/4. Ideal para apertura del culto.", null, 214),

  s(2, "Cantad con júbilo", "02-cantad-con-jubilo", "Rosa María Quintero", 1948, "Alabanza", "alabanza", "D",
`[Estrofa 1]
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
[A]pueblo de su santo [D]prado.`,
"Basado en el Salmo 100. Tempo alegre.", "https://ejemplo.iglesia.org/audio/cantad-con-jubilo.mp3", 187),

  s(3, "Ven a la fuente", "03-ven-a-la-fuente", "Tomás Alvarado", 1955, "Evangelización", "evangelizacion", "E",
`[Estrofa 1]
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
[B]brota del gran Salva[E]dor.`,
null, null, 156),

  s(4, "A tus pies me rindo", "04-a-tus-pies-me-rindo", "Delia Fuentes", 1961, "Consagración", "consagracion", "C",
`[Estrofa 1]
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
[G]pongo en tu al[C]tar.`,
"Sugerido para llamado y ministración.", null, 142),

  s(5, "En memoria de tu cruz", "05-en-memoria-de-tu-cruz", "Joaquín Peralta", 1929, "Santa Cena", "santa-cena", "F",
`[Estrofa 1]
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
[C]vivo por tu reden[F]ción.`,
"Cantar en actitud reverente, sin instrumentos fuertes.", null, 98),

  s(6, "Sepultado con Cristo", "06-sepultado-con-cristo", "Aurora Benítez", 1970, "Bautismo", "bautismo", "G",
`[Estrofa 1]
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
[D]y por siempre le segui[G]ré.`,
null, null, 61),

  s(7, "Cristo me ama y me guarda", "07-cristo-me-ama-y-me-guarda", "Anónimo", 1980, "Coro General", "coro-general", "D",
`[Coro]
[D]Cristo me ama y me [G]guarda,
[A]me guarda con gran po[D]der;
[D]Cristo me ama y me [G]guarda,
[A]de día y al anoche[D]cer.
[G]No temeré, [D]no temeré,
[A]su mano me sostend[D]rá;
[G]no temeré, [D]no temeré,
[A]conmigo Él siempre esta[D]rá.`,
"Coro corto para repetir. Se puede subir medio tono en la última repetición.", null, 233),

  s(8, "Soy pequeñito pero grande es mi Dios", "08-soy-pequenito-pero-grande-es-mi-dios", "Marta Salinas", 1992, "Coro de Niños", "coro-de-ninos", "C",
`[Coro]
[C]Soy pequeñito, pe[F]queñito,
pero [G]grande es mi [C]Dios;
me cuida de no[F]checita
y me des[G]pierta con el [C]sol.
[F]Con mis manitos a[C]plaudo,
[G]con mis piecitos también,
[F]con mi boquita le [C]canto:
[G]¡Cristo me ama, a[C]mén!`,
"Con palmas y mímica. Ideal para escuela dominical.", null, 175),

  s(9, "Fuego de juventud", "09-fuego-de-juventud", "Iván Carrizo", 2005, "Jóvenes", "jovenes", "Em",
`[Estrofa 1]
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
[G]esta es [D]mi pa[Em]sión.`,
null, "https://ejemplo.iglesia.org/video/fuego-de-juventud", 201),

  s(10, "Viene otra vez el Rey", "10-viene-otra-vez-el-rey", "Samuel Ortega", 1938, "Segunda Venida", "segunda-venida", "A",
`[Estrofa 1]
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
[E]listos para su veni[A]da.`,
null, null, 88),

  s(11, "Nació en Belén la esperanza", "11-nacio-en-belen-la-esperanza", "Cecilia Andrade", 1958, "Navidad", "navidad", "F",
`[Estrofa 1]
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
[C]mi tesoro y mi [F]fe.`,
"Para el programa navideño. Puede cantarse a dos voces.", null, 119),

  s(12, "Firmes en la Roca eterna", "12-firmes-en-la-roca-eterna", "Ernesto Villalba", 1912, "Himnos Tradicionales", "himnos-tradicionales", "Bb",
`[Estrofa 1]
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
[F]su verdad permanece[Bb]rá.`,
null, null, 167),

  s(13, "Santo es tu nombre, oh Dios", "13-santo-es-tu-nombre-oh-dios", "Elías Montaño", 1936, "Adoración", "adoracion", "E",
`[Estrofa 1]
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
[B]te quiero contem[E]plar.`,
null, null, 195),

  s(14, "Digno es el Cordero", "14-digno-es-el-cordero", "Rosa María Quintero", 1951, "Alabanza", "alabanza", "G",
`[Estrofa 1]
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
[D]suya es la exalta[G]ción.`,
"Basado en Apocalipsis 5.", null, 149),

  s(15, "Hay lugar en la mesa del Padre", "15-hay-lugar-en-la-mesa-del-padre", "Tomás Alvarado", 1963, "Evangelización", "evangelizacion", "D",
`[Estrofa 1]
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
[A]hay un beso de per[D]dón.`,
"Inspirado en la parábola del hijo pródigo.", null, 134),

  s(16, "Heme aquí, envíame", "16-heme-aqui-enviame", "Delia Fuentes", 1966, "Consagración", "consagracion", "A",
`[Estrofa 1]
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
[E]sea ofrenda en tu san[A]tuario.`,
"Basado en Isaías 6.", null, 77),

  s(17, "Aleluya, gloria a Dios", "17-aleluya-gloria-a-dios", "Anónimo", 1985, "Coro General", "coro-general", "C",
`[Coro]
[C]Aleluya, [F]gloria a [C]Dios,
aleluya, [G]gloria a Dios,
[C]aleluya, [F]gloria a [C]Dios,
[G]cantará mi [C]voz.
[F]Por su amor tan [C]grande,
[G]por su salva[Am]ción,
[F]por su fiel pre[C]sencia:
[G]¡gloria al Señ[C]or!`,
"Coro de avivamiento. Repetir subiendo la intensidad.", null, 228),

  s(18, "Marchando con Jesús", "18-marchando-con-jesus", "Marta Salinas", 1995, "Coro de Niños", "coro-de-ninos", "G",
`[Coro]
[G]Marchando, marchando, mar[C]chando con Je[G]sús,
un, dos, tres, ¡qué [D]gozo es!, marchando con Je[G]sús.
Si llueve o hace [C]sol, yo canto esta can[G]ción:
Jesús es mi ami[D]guito y me guarda con a[G]mor.`,
"Marcha infantil con movimientos.", null, 92),

  s(19, "Tuya es mi canción", "19-tuya-es-mi-cancion", "Iván Carrizo", 2010, "Jóvenes", "jovenes", "Bm",
`[Estrofa 1]
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
[D]contigo quiero an[A]dar.`,
null, "https://ejemplo.iglesia.org/audio/tuya-es-mi-cancion.mp3", 163),

  s(20, "Cristo viene, ¡prepárate!", "20-cristo-viene-preparate", "Samuel Ortega", 1941, "Segunda Venida", "segunda-venida", "F",
`[Estrofa 1]
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
[C]en gloria reina[F]rán.`,
null, null, 105),
];

export const DEMO_AUTHORS = Array.from(new Set(DEMO_SONGS.map((s) => s.author))).sort();
