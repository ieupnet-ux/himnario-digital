"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getBrowserSupabase } from "@/lib/supabase";
import { parseLineWithChords, toAmericanNotation, toNotation, transposeChord, type Notation } from "@/lib/chords";

/* ============================================================
 * Editor de acordes: el operador elige un acorde de la paleta
 * y toca la letra donde debe sonar. Los acordes se guardan entre
 * corchetes dentro de la letra ([Sol]Somos pente[Do]costales).
 * ============================================================ */

interface SongRow {
  id: string;
  number: number;
  title: string;
  key: string;
  lyrics: string;
}

/** Acorde colocado en una posición (índice de carácter) de la línea. Siempre en cifrado americano. */
interface PlacedChord {
  index: number;
  chord: string;
}

interface EditorLine {
  /** true si es una etiqueta de sección: [Coro], [Estrofa 1]… (no se edita) */
  section: boolean;
  text: string;
  chords: PlacedChord[];
}

const SECTION_RE = /^\s*\[(coro|estrofa|verso|puente|final|intro|pre-?coro)[^\]]*\]\s*$/i;
const NOTATION_KEY = "himnario:notacion";

/** ¿La letra ya tiene al menos un acorde? */
function hasChords(lyrics: string): boolean {
  return lyrics
    .split(/\r?\n/)
    .some((raw) => !SECTION_RE.test(raw) && parseLineWithChords(raw).chordPositions.length > 0);
}

/** Convierte la letra guardada en líneas editables. */
function toEditorLines(lyrics: string): EditorLine[] {
  return lyrics.split(/\r?\n/).map((raw) => {
    if (SECTION_RE.test(raw)) return { section: true, text: raw, chords: [] };
    const { cleanText, chordPositions } = parseLineWithChords(raw);
    return {
      section: false,
      text: cleanText,
      chords: chordPositions.map((c) => ({ index: c.charIndex, chord: c.chord })),
    };
  });
}

/** Reconstruye la letra con los acordes entre corchetes, en la notación elegida. */
function toLyrics(lines: EditorLine[], notation: Notation): string {
  return lines
    .map((l) => {
      if (l.section) return l.text;
      const sorted = [...l.chords].sort((a, b) => a.index - b.index);
      let out = "";
      let last = 0;
      for (const c of sorted) {
        out += l.text.slice(last, c.index) + `[${toNotation(c.chord, notation)}]`;
        last = c.index;
      }
      return out + l.text.slice(last);
    })
    .join("\n");
}

const FLAT_MAJOR = new Set(["F", "Bb", "Eb", "Ab", "Db", "Gb"]);
const FLAT_MINOR = new Set(["D", "G", "C", "F", "Bb", "Eb"]);

/** Acordes habituales del tono de la canción (en cifrado americano). */
function paletteFor(key: string): string[] {
  const m = key.match(/^([A-G][b#]?)(m?)/);
  if (!m) return [];
  const root = m[1];
  const minor = m[2] === "m";
  const preferFlats = minor ? FLAT_MINOR.has(root) : FLAT_MAJOR.has(root);
  const steps: [number, string][] = minor
    ? [[0, "m"], [3, ""], [5, "m"], [7, ""], [7, "m"], [8, ""], [10, ""], [7, "7"]]
    : [[0, ""], [2, "m"], [4, "m"], [5, ""], [7, ""], [7, "7"], [9, "m"]];
  const out = steps.map(([n, suffix]) => transposeChord(root, n, preferFlats) + suffix);
  return Array.from(new Set(out));
}

export default function AcordesPage() {
  const [songs, setSongs] = useState<SongRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [filter, setFilter] = useState<"sin" | "todas">("sin");
  const [q, setQ] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [lines, setLines] = useState<EditorLine[]>([]);
  const [history, setHistory] = useState<EditorLine[][]>([]);
  const [dirty, setDirty] = useState(false);
  const [pen, setPen] = useState<string | null>(null);
  const [custom, setCustom] = useState("");
  const [notation, setNotation] = useState<Notation>("latin");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  // Carga inicial: canciones y notación preferida
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(NOTATION_KEY);
      if (saved === "american" || saved === "latin") setNotation(saved);
    } catch {
      /* almacenamiento no disponible */
    }
    const sb = getBrowserSupabase();
    if (!sb) {
      setLoadError("La base de datos no está configurada (faltan las variables de Supabase).");
      setLoading(false);
      return;
    }
    sb.from("songs")
      .select("id, number, title, key, lyrics")
      .order("number")
      .then(({ data, error }) => {
        if (error) setLoadError(`No se pudieron cargar las canciones: ${error.message}`);
        else setSongs((data ?? []) as SongRow[]);
        setLoading(false);
      });
  }, []);

  const selected = songs.find((s) => s.id === selectedId) ?? null;

  const withChords = useMemo(() => {
    const set = new Set<string>();
    for (const s of songs) if (hasChords(s.lyrics)) set.add(s.id);
    return set;
  }, [songs]);

  const pendingCount = songs.length - withChords.size;

  const visible = useMemo(() => {
    const term = q.trim().toLowerCase();
    return songs.filter((s) => {
      if (filter === "sin" && withChords.has(s.id)) return false;
      if (!term) return true;
      return s.title.toLowerCase().includes(term) || String(s.number) === term;
    });
  }, [songs, filter, q, withChords]);

  const palette = selected ? paletteFor(selected.key) : [];

  /* ---------- Edición ---------- */

  function commit(next: EditorLine[]) {
    setHistory((h) => [...h.slice(-30), lines]);
    setLines(next);
    setDirty(true);
    setMsg("");
  }

  function placeChord(lineIdx: number, charIdx: number) {
    if (!pen) {
      setMsg("Primero elegí un acorde de la paleta y después tocá la letra.");
      return;
    }
    commit(
      lines.map((l, i) =>
        i === lineIdx
          ? { ...l, chords: [...l.chords.filter((c) => c.index !== charIdx), { index: charIdx, chord: pen }] }
          : l
      )
    );
  }

  function removeChord(lineIdx: number, index: number) {
    commit(lines.map((l, i) => (i === lineIdx ? { ...l, chords: l.chords.filter((c) => c.index !== index) } : l)));
  }

  function undo() {
    setHistory((h) => {
      if (h.length === 0) return h;
      setLines(h[h.length - 1]);
      setDirty(true);
      return h.slice(0, -1);
    });
  }

  function clearAll() {
    if (!confirm("¿Quitar todos los acordes de esta canción? Podés deshacerlo antes de guardar.")) return;
    commit(lines.map((l) => ({ ...l, chords: [] })));
  }

  function addCustom() {
    const raw = custom.trim();
    if (!raw) return;
    const american = toAmericanNotation(raw.charAt(0).toUpperCase() + raw.slice(1));
    if (!/^[A-G][#b]?[^\s[\]]*$/.test(american)) {
      setMsg(`«${raw}» no parece un acorde válido. Ejemplos: Sol, Lam, Re7, Sib, F#m.`);
      return;
    }
    setPen(american);
    setCustom("");
    setMsg("");
  }

  function changeNotation(next: Notation) {
    setNotation(next);
    try {
      window.localStorage.setItem(NOTATION_KEY, next);
    } catch {
      /* almacenamiento no disponible */
    }
  }

  /* ---------- Abrir y guardar ---------- */

  function loadSong(s: SongRow) {
    setSelectedId(s.id);
    setLines(toEditorLines(s.lyrics));
    setHistory([]);
    setDirty(false);
    setMsg("");
  }

  function openSong(s: SongRow) {
    if (dirty && !confirm("Tenés cambios sin guardar en esta canción. ¿Descartarlos?")) return;
    loadSong(s);
  }

  async function save(goNext: boolean) {
    if (!selected) return;
    const sb = getBrowserSupabase();
    if (!sb) return;
    setSaving(true);
    setMsg("");
    const lyrics = toLyrics(lines, notation);
    const { data, error } = await sb
      .from("songs")
      .update({ lyrics, updated_at: new Date().toISOString() })
      .eq("id", selected.id)
      .select("id");
    setSaving(false);

    if (error) {
      setMsg(`No se pudo guardar: ${error.message}`);
      return;
    }
    if (!data || data.length === 0) {
      setMsg("No se guardó: tu cuenta necesita rol de editor o administrador.");
      return;
    }

    const updated = songs.map((s) => (s.id === selected.id ? { ...s, lyrics } : s));
    setSongs(updated);
    setDirty(false);
    setHistory([]);
    setMsg(`«${selected.title}» guardada.`);

    if (goNext) {
      const pending = updated.filter((s) => s.id !== selected.id && !hasChords(s.lyrics));
      const next = pending.find((s) => s.number > selected.number) ?? pending[0];
      if (next) loadSong(next);
      else setMsg(`«${selected.title}» guardada. ¡Todas las canciones ya tienen acordes!`);
    }
  }

  /* ---------- Estilos ---------- */

  const btn =
    "rounded-lg border border-navy-200 dark:border-navy-700 px-3 py-2 text-sm font-semibold hover:border-oro-500 hover:text-oro-600 dark:hover:text-oro-400 transition-colors disabled:opacity-40";
  const btnActive = "border-oro-500 text-oro-600 dark:text-oro-400 bg-oro-500/10";
  const input =
    "rounded-lg border border-navy-200 dark:border-navy-700 bg-white dark:bg-navy-800 px-3 py-2 text-sm";

  /* ---------- Render ---------- */

  if (loading) return <p className="text-navy-500 dark:text-navy-300">Cargando canciones…</p>;
  if (loadError) return <p className="text-red-600" role="alert">{loadError}</p>;

  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 className="filete font-display text-2xl font-semibold">Agregar acordes</h2>
        <Link href="/admin/canciones" className="text-sm font-semibold text-oro-600 dark:text-oro-400 hover:underline">
          ← Volver a canciones
        </Link>
      </div>
      <p className="mt-3 text-sm text-navy-500 dark:text-navy-300">
        {pendingCount === 0
          ? "Todas las canciones tienen acordes."
          : `${pendingCount} ${pendingCount === 1 ? "canción está" : "canciones están"} sin acordes.`}{" "}
        Elegí una, escogé un acorde de la paleta y tocá la letra donde debe sonar.
      </p>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
        {/* ---------- Lista de canciones ---------- */}
        <aside>
          <div className="flex gap-2" role="group" aria-label="Filtro de canciones">
            <button onClick={() => setFilter("sin")} className={`${btn} ${filter === "sin" ? btnActive : ""}`} aria-pressed={filter === "sin"}>
              Sin acordes ({pendingCount})
            </button>
            <button onClick={() => setFilter("todas")} className={`${btn} ${filter === "todas" ? btnActive : ""}`} aria-pressed={filter === "todas"}>
              Todas ({songs.length})
            </button>
          </div>
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por título o número…"
            aria-label="Buscar canción"
            className={`${input} mt-3 w-full`}
          />
          <ul className="mt-3 max-h-[28rem] overflow-y-auto rounded-xl border border-navy-100 dark:border-navy-800 bg-white dark:bg-navy-900 divide-y divide-navy-100 dark:divide-navy-800">
            {visible.map((s) => (
              <li key={s.id}>
                <button
                  onClick={() => openSong(s)}
                  className={`w-full text-left px-3 py-2.5 flex items-center gap-3 hover:bg-navy-50 dark:hover:bg-navy-800 ${
                    s.id === selectedId ? "bg-oro-500/10" : ""
                  }`}
                >
                  <span className="medallon h-9 w-9 text-sm shrink-0">{s.number}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold text-sm">{s.title}</span>
                    <span className="block text-xs text-navy-500 dark:text-navy-300">
                      Tono {toNotation(s.key, notation)} · {withChords.has(s.id) ? "con acordes" : "sin acordes"}
                    </span>
                  </span>
                </button>
              </li>
            ))}
            {visible.length === 0 && (
              <li className="px-3 py-8 text-center text-sm text-navy-500 dark:text-navy-300">
                {filter === "sin" ? "No hay canciones pendientes." : "Sin resultados."}
              </li>
            )}
          </ul>
        </aside>

        {/* ---------- Editor ---------- */}
        <section>
          {!selected ? (
            <div className="rounded-xl border border-dashed border-navy-200 dark:border-navy-700 p-10 text-center text-navy-500 dark:text-navy-300">
              Elegí una canción de la lista para empezar.
            </div>
          ) : (
            <>
              <h3 className="font-display text-2xl font-semibold">
                {selected.number}. {selected.title}
              </h3>
              <p className="text-sm text-navy-500 dark:text-navy-300">
                Tono original: {toNotation(selected.key, notation)} ({selected.key})
              </p>

              {/* Paleta */}
              <div className="sticky top-16 z-20 mt-4 rounded-xl bg-white/95 dark:bg-navy-900/95 backdrop-blur border border-navy-100 dark:border-navy-800 p-3 shadow-card space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wide text-navy-500 dark:text-navy-300">Acorde:</span>
                  {palette.map((c) => (
                    <button
                      key={c}
                      onClick={() => setPen(c)}
                      className={`${btn} ${pen === c ? btnActive : ""}`}
                      aria-pressed={pen === c}
                    >
                      {toNotation(c, notation)}
                    </button>
                  ))}
                  {pen && !palette.includes(pen) && (
                    <button className={`${btn} ${btnActive}`} aria-pressed>
                      {toNotation(pen, notation)}
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <input
                    value={custom}
                    onChange={(e) => setCustom(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addCustom()}
                    placeholder="Otro acorde (ej: Sib, Lam7)"
                    aria-label="Otro acorde"
                    className={`${input} w-48`}
                  />
                  <button onClick={addCustom} className={btn}>Usar</button>

                  <span className="mx-1 hidden sm:block h-6 w-px bg-navy-100 dark:bg-navy-800" />

                  <div className="flex items-center gap-1" role="group" aria-label="Notación">
                    <button onClick={() => changeNotation("latin")} className={`${btn} ${notation === "latin" ? btnActive : ""}`} aria-pressed={notation === "latin"}>
                      Do Re Mi
                    </button>
                    <button onClick={() => changeNotation("american")} className={`${btn} ${notation === "american" ? btnActive : ""}`} aria-pressed={notation === "american"}>
                      C D E
                    </button>
                  </div>

                  <span className="mx-1 hidden sm:block h-6 w-px bg-navy-100 dark:bg-navy-800" />

                  <button onClick={undo} disabled={history.length === 0} className={btn}>↶ Deshacer</button>
                  <button onClick={clearAll} className={btn}>Quitar todos</button>
                </div>

                <p className="text-xs text-navy-500 dark:text-navy-300">
                  {pen
                    ? `Acorde elegido: ${toNotation(pen, notation)}. Tocá la letra donde debe sonar; tocá un acorde ya puesto para quitarlo.`
                    : "Elegí un acorde de la paleta y tocá la letra donde debe sonar."}{" "}
                  Se guarda en notación {notation === "latin" ? "Do Re Mi" : "C D E"}.
                </p>
              </div>

              {/* Letra */}
              <div className="mt-5 rounded-xl border border-navy-100 dark:border-navy-800 bg-white dark:bg-navy-900 p-4">
                {lines.map((l, i) => {
                  if (l.section) {
                    return (
                      <p key={i} className="mt-5 mb-1 text-xs font-bold uppercase tracking-[0.18em] text-oro-600 dark:text-oro-400">
                        {l.text.replace(/[[\]]/g, "")}
                      </p>
                    );
                  }
                  if (l.text.trim() === "" && l.chords.length === 0) return <div key={i} className="h-3" />;
                  return (
                    <div key={i} className="relative font-mono text-[17px] whitespace-pre overflow-x-auto pb-1">
                      <div className="relative h-6">
                        {l.chords.map((c) => (
                          <span key={`${c.index}-${c.chord}`} className="absolute top-0" style={{ left: `${c.index}ch` }}>
                            <button
                              type="button"
                              onClick={() => removeChord(i, c.index)}
                              title="Tocá para quitar este acorde"
                              className="rounded bg-navy-900 px-1.5 py-0.5 text-[13px] font-bold leading-none text-oro-300 hover:bg-red-700"
                            >
                              {toNotation(c.chord, notation)}
                            </button>
                          </span>
                        ))}
                      </div>
                      <div>
                        {l.text.split("").map((ch, j) => (
                          <span
                            key={j}
                            onClick={() => placeChord(i, j)}
                            className={pen ? "cursor-pointer hover:bg-oro-500/40" : ""}
                          >
                            {ch}
                          </span>
                        ))}
                        <span onClick={() => placeChord(i, l.text.length)} className={pen ? "cursor-pointer hover:bg-oro-500/40" : ""}>
                          {"\u00A0"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Acciones */}
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <button
                  onClick={() => save(false)}
                  disabled={saving || !dirty}
                  className="rounded-lg bg-navy-900 hover:bg-navy-800 text-marfil font-bold px-6 py-3 disabled:opacity-40"
                >
                  {saving ? "Guardando…" : "Guardar"}
                </button>
                <button
                  onClick={() => save(true)}
                  disabled={saving || !dirty}
                  className="rounded-lg border border-oro-500 text-oro-600 dark:text-oro-400 font-bold px-6 py-3 hover:bg-oro-500/10 disabled:opacity-40"
                >
                  Guardar y siguiente →
                </button>
                {dirty && <span className="text-sm text-oro-600 dark:text-oro-400">Cambios sin guardar</span>}
              </div>
              {msg && (
                <p className="mt-3 text-sm text-oro-600 dark:text-oro-400" role="status">
                  {msg}
                </p>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}