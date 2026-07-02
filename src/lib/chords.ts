/**
 * lib/chords.ts
 * Motor de parsing y transposición de acordes musicales.
 *
 * Formato de entrada esperado en `lyrics_with_chords`:
 *   "[G]Sublime gracia [D]del Se[G]ñor"
 * Los acordes van entre corchetes inmediatamente antes de la sílaba/letra
 * sobre la que se tocan.
 */

const NOTES_SHARP = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const NOTES_FLAT = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

// Tonalidades que tradicionalmente se escriben con bemoles
const FLAT_KEYS = new Set(['F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb', 'Cb', 'Dm', 'Gm', 'Cm', 'Fm', 'Bbm', 'Ebm']);

export const ALL_KEYS = [
  'C', 'C#', 'Db', 'D', 'D#', 'Eb', 'E', 'F', 'F#', 'Gb', 'G', 'G#', 'Ab', 'A', 'A#', 'Bb', 'B',
  'Cm', 'C#m', 'Dm', 'D#m', 'Ebm', 'Em', 'Fm', 'F#m', 'Gm', 'G#m', 'Abm', 'Am', 'A#m', 'Bbm', 'Bm'
];

interface ParsedChord {
  root: string;
  rootIndex: number;
  suffix: string; // m, 7, maj7, sus4, dim, aug, etc.
  bass?: string; // para acordes con bajo distinto, ej. C/E
}

/**
 * Parsea un símbolo de acorde como "G", "Am7", "F#dim", "C/E"
 */
export function parseChord(chord: string): ParsedChord | null {
  const match = chord.trim().match(/^([A-G])(#|b)?([^/]*)(?:\/([A-G])(#|b)?)?$/);
  if (!match) return null;

  const [, letter, accidental, suffix, bassLetter, bassAccidental] = match;
  const rootName = letter + (accidental ?? '');
  const rootIndex = noteNameToIndex(rootName);
  if (rootIndex === -1) return null;

  let bass: string | undefined;
  if (bassLetter) {
    bass = bassLetter + (bassAccidental ?? '');
  }

  return { root: rootName, rootIndex, suffix: suffix ?? '', bass };
}

function noteNameToIndex(name: string): number {
  const sharpIdx = NOTES_SHARP.indexOf(name);
  if (sharpIdx !== -1) return sharpIdx;
  return NOTES_FLAT.indexOf(name);
}

function indexToNoteName(index: number, preferFlat: boolean): string {
  const normalized = ((index % 12) + 12) % 12;
  return preferFlat ? NOTES_FLAT[normalized] : NOTES_SHARP[normalized];
}

/**
 * Transpone un único símbolo de acorde N semitonos.
 */
export function transposeChordSymbol(chord: string, semitones: number, targetKey?: string): string {
  const parsed = parseChord(chord);
  if (!parsed) return chord;

  const preferFlat = targetKey ? FLAT_KEYS.has(targetKey) : FLAT_KEYS.has(parsed.root);
  const newRootIndex = parsed.rootIndex + semitones;
  const newRoot = indexToNoteName(newRootIndex, preferFlat);

  let result = newRoot + parsed.suffix;

  if (parsed.bass) {
    const bassIndex = noteNameToIndex(parsed.bass);
    if (bassIndex !== -1) {
      const newBass = indexToNoteName(bassIndex + semitones, preferFlat);
      result += '/' + newBass;
    }
  }

  return result;
}

/**
 * Transpone TODO el texto con acordes embebidos en formato [Acorde].
 */
export function transposeLyricsWithChords(text: string, semitones: number, targetKey?: string): string {
  if (!text || semitones === 0) return text;
  return text.replace(/\[([^\]]+)\]/g, (_match, chordSymbol) => {
    return `[${transposeChordSymbol(chordSymbol, semitones, targetKey)}]`;
  });
}

/**
 * Calcula la diferencia en semitonos (0-11, ascendente) entre dos tonalidades.
 */
export function semitonesBetweenKeys(fromKey: string, toKey: string): number {
  const fromParsed = parseChord(fromKey);
  const toParsed = parseChord(toKey);
  if (!fromParsed || !toParsed) return 0;
  return ((toParsed.rootIndex - fromParsed.rootIndex) % 12 + 12) % 12;
}

export interface RenderedLine {
  type: 'lyrics-with-chords' | 'plain';
  chordPositions?: { chord: string; charIndex: number }[];
  cleanText: string;
}

/**
 * Parsea una línea con acordes embebidos [X] y devuelve la posición de cada
 * acorde respecto al texto limpio (sin corchetes), para poder renderizar
 * los acordes alineados arriba de la letra.
 */
export function parseLineWithChords(line: string): RenderedLine {
  const chordPositions: { chord: string; charIndex: number }[] = [];
  let cleanText = '';
  let i = 0;

  while (i < line.length) {
    if (line[i] === '[') {
      const closeIdx = line.indexOf(']', i);
      if (closeIdx !== -1) {
        const chord = line.slice(i + 1, closeIdx);
        chordPositions.push({ chord, charIndex: cleanText.length });
        i = closeIdx + 1;
        continue;
      }
    }
    cleanText += line[i];
    i += 1;
  }

  return {
    type: chordPositions.length > 0 ? 'lyrics-with-chords' : 'plain',
    chordPositions,
    cleanText
  };
}

/** Extrae solo el texto plano (sin acordes) de un bloque con [Acordes]. */
export function stripChords(text: string): string {
  return text.replace(/\[([^\]]+)\]/g, '');
}

/** Lista única de acordes utilizados en una canción, en orden de aparición. */
export function extractUniqueChords(text: string): string[] {
  const matches = text.match(/\[([^\]]+)\]/g) ?? [];
  const seen = new Set<string>();
  const result: string[] = [];
  for (const m of matches) {
    const chord = m.slice(1, -1);
    if (!seen.has(chord)) {
      seen.add(chord);
      result.push(chord);
    }
  }
  return result;
}
