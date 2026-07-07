/**
 * Motor de acordes.
 * La letra se guarda en formato ChordPro simplificado: los acordes van
 * entre corchetes dentro del texto → "[G]Grande es tu [D]fidelidad".
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
const CHORD_TOKEN = /\[([A-G][b#]?[^\]\s]*)\]/g;

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
      pendingChord = transposeChord(m[1], semitones, preferFlats);
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
