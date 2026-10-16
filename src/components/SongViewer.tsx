"use client";

import { useEffect, useRef, useState } from "react";
import { parseLyrics, toNotation, transposeKey, type Notation } from "@/lib/chords";
import { getPrefs, isFavorite, pushHistory, savePrefs, toggleFavorite } from "@/lib/storage";
import type { Song } from "@/lib/types";

const NOTATION_KEY = "himnario:notacion";

/**
 * Visor de canción.
 * — Congregación: letra limpia, tamaño de fuente configurable, favoritos.
 * — Músicos: acordes sobre la letra, notación americana o latina,
 *   transposición ±semitonos, modo ensayo y pantalla completa.
 */
export default function SongViewer({ song }: { song: Song }) {
  const [showChords, setShowChords] = useState(false);
  const [semitones, setSemitones] = useState(0);
  const [fontSize, setFontSize] = useState(19);
  const [fav, setFav] = useState(false);
  const [rehearsal, setRehearsal] = useState(false);
  const [shared, setShared] = useState(false);
  const [notation, setNotation] = useState<Notation>("american");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollTimer = useRef<number | null>(null);

  // Preferencias guardadas + historial + contador de vistas
  useEffect(() => {
    const prefs = getPrefs();
    setShowChords(prefs.showChords);
    setFontSize(prefs.fontSize);
    setFav(isFavorite(song.slug));
    try {
      const saved = window.localStorage.getItem(NOTATION_KEY);
      if (saved === "latin" || saved === "american") setNotation(saved);
    } catch {
      /* almacenamiento no disponible */
    }
    pushHistory({ slug: song.slug, title: song.title, number: song.number });
    fetch(`/api/songs/${song.slug}`, { method: "PATCH" }).catch(() => {});
  }, [song.slug, song.title, song.number]);

  // Detecta cuándo el visor entra o sale de pantalla completa
  useEffect(() => {
    const onChange = () => setIsFullscreen(document.fullscreenElement === containerRef.current);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  function persist(next: Partial<{ showChords: boolean; fontSize: number }>) {
    const prefs = getPrefs();
    savePrefs({ ...prefs, ...next });
  }

  function changeNotation(next: Notation) {
    setNotation(next);
    try {
      window.localStorage.setItem(NOTATION_KEY, next);
    } catch {
      /* almacenamiento no disponible */
    }
  }

  // Modo ensayo: desplazamiento automático suave.
  // En pantalla completa se desplaza el contenedor; fuera de ella, la ventana.
  useEffect(() => {
    if (!rehearsal) return;
    scrollTimer.current = window.setInterval(() => {
      const el = containerRef.current;
      if (isFullscreen && el) {
        el.scrollBy({ top: 1, behavior: "auto" });
        if (el.scrollTop + el.clientHeight >= el.scrollHeight - 4) setRehearsal(false);
      } else {
        window.scrollBy({ top: 1, behavior: "auto" });
        if (window.innerHeight + window.scrollY >= document.body.scrollHeight - 4) setRehearsal(false);
      }
    }, 60);
    return () => {
      if (scrollTimer.current) window.clearInterval(scrollTimer.current);
    };
  }, [rehearsal, isFullscreen]);

  async function share() {
    const url = window.location.href;
    const data = { title: `Himno ${song.number} · ${song.title}`, text: song.title, url };
    try {
      if (navigator.share) await navigator.share(data);
      else {
        await navigator.clipboard.writeText(url);
        setShared(true);
        setTimeout(() => setShared(false), 2000);
      }
    } catch {
      /* cancelado por el usuario */
    }
  }

  function fullscreen() {
    const el = containerRef.current;
    if (!el) return;
    if (document.fullscreenElement) document.exitFullscreen();
    else el.requestFullscreen?.();
  }

  const lines = parseLyrics(song.lyrics, showChords ? semitones : 0);
  const currentKey = toNotation(transposeKey(song.key, semitones), notation);

  const btn =
    "rounded-lg border border-navy-200 dark:border-navy-700 px-3 py-2 text-sm font-semibold hover:border-oro-500 hover:text-oro-600 dark:hover:text-oro-400 transition-colors";
  const btnActive = "border-oro-500 text-oro-600 dark:text-oro-400 bg-oro-500/10";

  return (
    <div
      ref={containerRef}
      className={
        isFullscreen
          ? "bg-marfil dark:bg-navy-950 h-screen overflow-y-auto px-4 sm:px-10 py-4"
          : "bg-marfil dark:bg-navy-950 rounded-2xl"
      }
    >
      {/* Barra de herramientas */}
      <div
        className={`no-print sticky ${
          isFullscreen ? "top-0" : "top-16"
        } z-30 -mx-1 rounded-xl bg-white/95 dark:bg-navy-900/95 backdrop-blur border border-navy-100 dark:border-navy-800 p-3 shadow-card flex flex-wrap items-center gap-2`}
      >
        <button onClick={() => setFav(toggleFavorite(song.slug))} className={`${btn} ${fav ? btnActive : ""}`} aria-pressed={fav}>
          {fav ? "★ En favoritos" : "☆ Favorito"}
        </button>
        <button onClick={share} className={btn}>
          {shared ? "Enlace copiado ✓" : "Compartir"}
        </button>
        <button onClick={fullscreen} className={btn}>
          {isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
        </button>
        <button onClick={() => setRehearsal(!rehearsal)} className={`${btn} ${rehearsal ? btnActive : ""}`} aria-pressed={rehearsal}>
          {rehearsal ? "■ Detener ensayo" : "▶ Modo ensayo"}
        </button>

        <span className="mx-1 hidden sm:block h-6 w-px bg-navy-100 dark:bg-navy-800" />

        {/* Tamaño de letra */}
        <div className="flex items-center gap-1" role="group" aria-label="Tamaño de letra">
          <button
            onClick={() => { const v = Math.max(14, fontSize - 2); setFontSize(v); persist({ fontSize: v }); }}
            className={btn} aria-label="Reducir letra"
          >A−</button>
          <button
            onClick={() => { const v = Math.min(34, fontSize + 2); setFontSize(v); persist({ fontSize: v }); }}
            className={btn} aria-label="Aumentar letra"
          >A+</button>
        </div>

        <span className="mx-1 hidden sm:block h-6 w-px bg-navy-100 dark:bg-navy-800" />

        {/* Herramientas de músicos */}
        <button
          onClick={() => { setShowChords(!showChords); persist({ showChords: !showChords }); }}
          className={`${btn} ${showChords ? btnActive : ""}`}
          aria-pressed={showChords}
        >
          🎸 Acordes
        </button>

        {showChords && (
          <>
            {/* Notación: americano (C D E) o latino (Do Re Mi) */}
            <div className="flex items-center gap-1" role="group" aria-label="Notación de acordes">
              <button
                onClick={() => changeNotation("american")}
                className={`${btn} ${notation === "american" ? btnActive : ""}`}
                aria-pressed={notation === "american"}
              >
                C D E
              </button>
              <button
                onClick={() => changeNotation("latin")}
                className={`${btn} ${notation === "latin" ? btnActive : ""}`}
                aria-pressed={notation === "latin"}
              >
                Do Re Mi
              </button>
            </div>

            {/* Transposición */}
            <div className="flex items-center gap-1" role="group" aria-label="Transponer tonalidad">
              <button onClick={() => setSemitones((s) => Math.max(-6, s - 1))} className={btn} aria-label="Bajar un semitono">−1</button>
              <span className="rounded-lg bg-navy-900 text-oro-300 px-3 py-2 text-sm font-bold min-w-[4.5rem] text-center">
                Tono {currentKey}
                {semitones !== 0 && <span className="ml-1 text-navy-100 font-normal">({semitones > 0 ? "+" : ""}{semitones})</span>}
              </span>
              <button onClick={() => setSemitones((s) => Math.min(6, s + 1))} className={btn} aria-label="Subir un semitono">+1</button>
              {semitones !== 0 && (
                <button onClick={() => setSemitones(0)} className={btn} aria-label="Volver al tono original">Original</button>
              )}
            </div>
          </>
        )}
      </div>

      {/* Letra */}
      <article className="mt-6 px-1 sm:px-2 pb-10" style={{ fontSize }}>
        {lines.map((line, i) => {
          if (line.isSection) {
            return (
              <p key={i} className="mt-7 mb-2 text-[0.72em] font-bold uppercase tracking-[0.18em] text-oro-600 dark:text-oro-400">
                {line.segments[0].text}
              </p>
            );
          }
          if (line.raw.trim() === "") return <div key={i} className="h-[0.9em]" />;
          return (
            <p key={i} className="leading-relaxed whitespace-pre-wrap break-words">
              {line.segments.map((seg, j) =>
                showChords && seg.chord ? (
                  <span key={j} className="inline-block align-bottom whitespace-pre">
                    <span className="block text-[0.78em] font-bold leading-none mb-0.5 text-navy-500 dark:text-oro-300">
                      {toNotation(seg.chord, notation)}
                    </span>
                    <span>{seg.text || "\u00A0"}</span>
                  </span>
                ) : (
                  <span key={j}>{seg.text}</span>
                )
              )}
            </p>
          );
        })}
      </article>
    </div>
  );
}