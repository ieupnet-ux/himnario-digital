/**
 * Motor de acordes.
 * La letra se guarda en formato ChordPro simplificado: los acordes van
 * entre corchetes dentro del texto → "[G]Grande es tu [D]fidelidad".
 *
 * Al ESCRIBIR se aceptan ambos sistemas: americano ([G], [Em], [Bb]) y
 * latino ([Sol], [Mim], [Sib]). Internamente todo se trata como americano;
 * la notación latina en pantalla es solo de visualización.
 */

const SHARPS = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const FLATS = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];
const FLAT_KEYS = new Set(["F", "Bb", "Eb", "Ab", "Db", "Gb", "Dm", "Gm", "Cm", "Fm", "Bbm"]);

export const ALL_KEYS = ["C", "C#", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B"];

function noteIndex(note: string): number {
  const i = SHARPS.indexOf(note);
  return i >= 0 ? i : FLATS.indexOf(note);
}

/** Transpone una nota raíz n semitonos. */
function transposeNote(note: string, semitones: number, preferFlats: boolean): string {
  const i = noteIndex(note);
  if (i < 0) return note;
  const j = (((i + semitones) % 12) + 12) % 12;
  return preferFlats ? FLATS[j] : SHARPS[j];
}

/** Transpone un acorde completo (ej: "F#m7/C#") n semitonos. */
export function transposeChord(chord: string, semitones: number, preferFlats = false): string {
  if (semitones === 0) return chord;
  return chord.replace(/([A-G][b#]?)/g, (m) => transposeNote(m, semitones, preferFlats));
}

/** Transpone la tonalidad de la canción (puede ser menor, ej. "Em"). */
export function transposeKey(key: string, semitones: number): string {
  const m = key.match(/^([A-G][b#]?)(m?)/);
  if (!m) return key;
  const preferFlats = FLAT_KEYS.has(key);
  return transposeNote(m[1], semitones, preferFlats) + (m[2] || "");
}

/* ============================================================
 * Notación: americano (C D E…) ↔ latino (Do Re Mi…)
 * ============================================================ */

export type Notation = "american" | "latin";

const LATIN_NAMES: Record<string, string> = {
  C: "Do",
  D: "Re",
  E: "Mi",
  F: "Fa",
  G: "Sol",
  A: "La",
  B: "Si",
};

const LATIN_TO_AMERICAN: Record<string, string> = {
  do: "C",
  re: "D",
  mi: "E",
  fa: "F",
  sol: "G",
  la: "A",
  si: "B",
};

/**
 * Convierte un acorde o tonalidad escrito en cifrado americano al sistema
 * elegido. Mantiene sostenidos, bemoles, sufijos y bajos:
 *   "Em7/B" → "Mim7/Si"   ·   "Bb" → "Sib"   ·   "F#m" → "Fa#m"
 */
export function toNotation(chord: string, notation: Notation): string {
  if (notation === "american") return chord;
  return chord.replace(/([A-G])([#b]?)/g, (_m, note: string, acc: string) => LATIN_NAMES[note] + acc);
}

/**
 * Convierte un acorde escrito en notación latina a americano.
 * Si ya está en americano, lo deja igual:
 *   "Mim/Si" → "Em/B"   ·   "Sib" → "Bb"   ·   "Sol7" → "G7"   ·   "Fadd9" → "Fadd9"
 */
export function toAmericanNotation(chord: string): string {
  return chord.replace(
    /(^|\/)(sol|do|re|mi|fa(?!dd)|la|si)/gi,
    (_m, sep: string, name: string) => sep + LATIN_TO_AMERICAN[name.toLowerCase()]
  );
}

/* ============================================================
 * Análisis de letras
 * ============================================================ */

export interface LyricSegment {
  chord: string | null;
  text: string;
}
export interface LyricLine {
  /** true si la línea es una etiqueta de sección: [Coro], [Estrofa 1]… */
  isSection: boolean;
  segments: LyricSegment[];
  raw: string;
}

const SECTION_RE = /^\s*\[(coro|estrofa|verso|puente|final|intro|pre-?coro)[^\]]*\]\s*$/i;

/** Acorde entre corchetes: americano ([G], [Em7]) o latino ([Sol], [Mim7], [Sib]). */
const CHORD_TOKEN = /\[((?:[A-G]|[Dd]o|[Rr]e|[Mm]i|[Ff]a|[Ss]ol|[Ll]a|[Ss]i)[b#]?[^\]\s]*)\]/g;

/** Convierte la letra cruda en líneas con segmentos {acorde, texto}. */
export function parseLyrics(lyrics: string, semitones = 0): LyricLine[] {
  const preferFlats = false;
  return lyrics.split(/\r?\n/).map((raw) => {
    if (SECTION_RE.test(raw)) {
      return { isSection: true, raw, segments: [{ chord: null, text: raw.replace(/[\[\]]/g, "") }] };
    }
    const segments: LyricSegment[] = [];
    let last = 0;
    let pendingChord: string | null = null;
    for (const m of raw.matchAll(CHORD_TOKEN)) {
      const text = raw.slice(last, m.index);
      if (text || pendingChord !== null) segments.push({ chord: pendingChord, text });
      pendingChord = transposeChord(toAmericanNotation(m[1]), semitones, preferFlats);
      last = (m.index ?? 0) + m[0].length;
    }
    const tail = raw.slice(last);
    if (tail || pendingChord !== null) segments.push({ chord: pendingChord, text: tail });
    if (segments.length === 0) segments.push({ chord: null, text: "" });
    return { isSection: false, segments, raw };
  });
}

/** Quita todos los acordes de la letra (vista congregación). */
export function stripChords(lyrics: string): string {
  return lyrics
    .split(/\r?\n/)
    .map((l) => (SECTION_RE.test(l) ? l : l.replace(CHORD_TOKEN, "")))
    .join("\n");
}

/**
 * Normaliza una letra: todos los acordes escritos en latino pasan a americano.
 * Útil para guardar siempre un formato único en la base de datos.
 */
export function normalizeLyricsToAmerican(lyrics: string): string {
  return lyrics
    .split(/\r?\n/)
    .map((l) =>
      SECTION_RE.test(l)
        ? l
        : l.replace(CHORD_TOKEN, (_full, chord: string) => `[${toAmericanNotation(chord)}]`)
    )
    .join("\n");
}

/* ============================================================
 * Compatibilidad con LyricsViewer (versión anterior del visor)
 * ============================================================ */

/** Transpone un símbolo de acorde o tonalidad individual. */
export function transposeChordSymbol(chord: string, semitones: number): string {
  const american = toAmericanNotation(chord);
  const preferFlats = FLAT_KEYS.has(american);
  return transposeChord(american, semitones, preferFlats);
}

export interface ChordPosition {
  chord: string;
  /** Posición del acorde medida en caracteres del texto limpio. */
  charIndex: number;
}

export interface ParsedChordLine {
  cleanText: string;
  chordPositions: ChordPosition[];
}

/**
 * Analiza UNA línea con acordes entre corchetes y devuelve el texto limpio
 * más la posición de cada acorde, para dibujarlos alineados encima.
 */
export function parseLineWithChords(line: string): ParsedChordLine {
  // Las etiquetas de sección ([Coro], [Estrofa 1]…) no son acordes
  if (SECTION_RE.test(line)) {
    return { cleanText: line, chordPositions: [] };
  }
  const chordPositions: ChordPosition[] = [];
  let cleanText = "";
  let last = 0;
  for (const m of line.matchAll(CHORD_TOKEN)) {
    cleanText += line.slice(last, m.index);
    chordPositions.push({ chord: toAmericanNotation(m[1]), charIndex: cleanText.length });
    last = (m.index ?? 0) + m[0].length;
  }
  cleanText += line.slice(last);
  return { cleanText, chordPositions };
}

/**
 * Transpone la letra completa manteniendo el formato [Acorde] en línea.
 * El tercer parámetro puede ser la tonalidad destino (string) para decidir
 * si usar bemoles, o un booleano preferFlats directo.
 */
export function transposeLyricsWithChords(
  lyrics: string,
  semitones: number,
  keyOrPreferFlats?: string | boolean
): string {
  if (semitones === 0) return lyrics;
  const preferFlats =
    typeof keyOrPreferFlats === "boolean"
      ? keyOrPreferFlats
      : keyOrPreferFlats
        ? FLAT_KEYS.has(keyOrPreferFlats)
        : false;
  return lyrics
    .split(/\r?\n/)
    .map((l) =>
      SECTION_RE.test(l)
        ? l
        : l.replace(
            CHORD_TOKEN,
            (_full, chord: string) => `[${transposeChord(toAmericanNotation(chord), semitones, preferFlats)}]`
          )
    )
    .join("\n");
}
