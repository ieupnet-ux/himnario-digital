'use client';

import { useMemo, useState } from 'react';
import { parseLineWithChords, transposeLyricsWithChords, transposeChordSymbol } from '@/lib/chords';
import { usePreferencesStore } from '@/lib/store';
import { cn } from '@/lib/utils';

interface LyricsViewerProps {
  lyricsWithChords: string | null;
  plainLyrics: string;
  originalKey: string;
}

export function LyricsViewer({ lyricsWithChords, plainLyrics, originalKey }: LyricsViewerProps) {
  const [semitones, setSemitones] = useState(0);
  const { fontSize, showChords, rehearsalMode } = usePreferencesStore();
  const [activeLine, setActiveLine] = useState<number | null>(null);

  const hasChords = Boolean(lyricsWithChords && lyricsWithChords.trim());

  const currentKey = useMemo(() => {
    if (semitones === 0) return originalKey;
    // Reutiliza el mismo motor de transposición de acordes (soporta sostenidos y bemoles)
    return transposeChordSymbol(originalKey, semitones);
  }, [semitones, originalKey]);

  const transposedText = useMemo(() => {
    const source = hasChords ? lyricsWithChords! : plainLyrics;
    return semitones !== 0 && hasChords ? transposeLyricsWithChords(source, semitones, currentKey) : source;
  }, [hasChords, lyricsWithChords, plainLyrics, semitones, currentKey]);

  const lines = transposedText.split('\n');

  return (
    <div>
      {hasChords && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-navy-50 p-3 dark:bg-white/5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-navy-500 dark:text-navy-300">Transponer:</span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setSemitones((s) => Math.max(-6, s - 1))}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-navy-700 shadow-sm hover:bg-navy-100 dark:bg-navy-700 dark:text-cream"
              >
                −
              </button>
              <span className="w-16 text-center text-sm font-semibold text-navy-800 dark:text-cream">
                {semitones > 0 ? `+${semitones}` : semitones}
              </span>
              <button
                onClick={() => setSemitones((s) => Math.min(6, s + 1))}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-navy-700 shadow-sm hover:bg-navy-100 dark:bg-navy-700 dark:text-cream"
              >
                +
              </button>
            </div>
            {semitones !== 0 && (
              <button
                onClick={() => setSemitones(0)}
                className="text-xs text-gold-600 underline hover:text-gold-700"
              >
                Restablecer
              </button>
            )}
          </div>
          <div className="text-xs text-navy-500 dark:text-navy-300">
            Tonalidad actual: <span className="font-semibold text-navy-800 dark:text-cream">{currentKey}</span>
          </div>
        </div>
      )}

      <div
        className={cn('font-mono leading-relaxed', rehearsalMode && 'space-y-1')}
        style={{ fontSize: `${fontSize}px` }}
      >
        {lines.map((line, idx) => {
          if (!hasChords || !showChords) {
            const clean = hasChords ? parseLineWithChords(line).cleanText : line;
            return (
              <p
                key={idx}
                onClick={() => rehearsalMode && setActiveLine(idx)}
                className={cn(
                  'font-sans whitespace-pre-wrap py-0.5 transition-colors',
                  clean.trim() === '' && 'h-3',
                  rehearsalMode && 'cursor-pointer rounded px-2',
                  rehearsalMode && activeLine === idx && 'bg-gold-100 dark:bg-gold-900/30'
                )}
              >
                {clean || '\u00A0'}
              </p>
            );
          }

          const { chordPositions, cleanText } = parseLineWithChords(line);

          if (!chordPositions || chordPositions.length === 0) {            return (
              <p
                key={idx}
                onClick={() => rehearsalMode && setActiveLine(idx)}
                className={cn(
                  'font-sans whitespace-pre-wrap py-0.5',
                  cleanText.trim() === '' && 'h-3',
                  rehearsalMode && 'cursor-pointer rounded px-2',
                  rehearsalMode && activeLine === idx && 'bg-gold-100 dark:bg-gold-900/30'
                )}
              >
                {cleanText || '\u00A0'}
              </p>
            );
          }

          // Construir línea de acordes alineada por índice de carácter
          let chordLine = '';
          chordPositions?.forEach((cp) => {
            const padding = Math.max(0, cp.charIndex - chordLine.length);
            chordLine += ' '.repeat(padding) + cp.chord;
          });

          return (
            <div
              key={idx}
              onClick={() => rehearsalMode && setActiveLine(idx)}
              className={cn(
                'py-0.5',
                rehearsalMode && 'cursor-pointer rounded px-2',
                rehearsalMode && activeLine === idx && 'bg-gold-100 dark:bg-gold-900/30'
              )}
            >
              <div className="whitespace-pre text-gold-600 font-semibold dark:text-gold-400">
                {chordLine || '\u00A0'}
              </div>
              <div className="font-sans whitespace-pre-wrap text-navy-900 dark:text-cream">
                {cleanText || '\u00A0'}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
