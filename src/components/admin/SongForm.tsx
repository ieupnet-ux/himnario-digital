"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getBrowserSupabase } from "@/lib/supabase";
import { ALL_KEYS } from "@/lib/chords";

interface Option { id: string; name: string }

export interface SongFormValues {
  id?: string;
  number: number | "";
  title: string;
  slug: string;
  author_id: string;
  category_id: string;
  year: number | "";
  key: string;
  lyrics: string;
  notes: string;
  media_url: string;
}

export const EMPTY_SONG: SongFormValues = {
  number: "", title: "", slug: "", author_id: "", category_id: "",
  year: "", key: "C", lyrics: "", notes: "", media_url: "",
};

function slugify(n: number | "", title: string) {
  const t = title.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
    .replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  return n === "" ? t : `${String(n).padStart(2, "0")}-${t}`;
}

/** Formulario compartido para crear y editar canciones (guarda en Supabase con RLS). */
export default function SongForm({ initial, prefillLyrics }: { initial?: SongFormValues; prefillLyrics?: string }) {
  const router = useRouter();
  const [values, setValues] = useState<SongFormValues>(initial ?? { ...EMPTY_SONG, lyrics: prefillLyrics ?? "" });
  const [authors, setAuthors] = useState<Option[]>([]);
  const [categories, setCategories] = useState<Option[]>([]);
  const [newAuthor, setNewAuthor] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    const sb = getBrowserSupabase();
    if (!sb) return;
    sb.from("authors").select("id, name").order("name").then(({ data }) => setAuthors(data ?? []));
    sb.from("categories").select("id, name").order("name").then(({ data }) => setCategories(data ?? []));
  }, []);

  function set<K extends keyof SongFormValues>(k: K, v: SongFormValues[K]) {
    setValues((prev) => {
      const next = { ...prev, [k]: v };
      if (k === "title" || k === "number") next.slug = slugify(next.number, next.title);
      return next;
    });
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMsg("");
    const sb = getBrowserSupabase()!;

    let authorId = values.author_id;
    if (!authorId && newAuthor.trim()) {
      const { data, error } = await sb.from("authors")
        .upsert({ name: newAuthor.trim() }, { onConflict: "name" }).select("id").single();
      if (error) { setMsg(`Error al guardar el autor: ${error.message}`); setSaving(false); return; }
      authorId = data.id;
    }

    const payload = {
      number: Number(values.number),
      title: values.title.trim(),
      slug: values.slug,
      author_id: authorId || null,
      category_id: values.category_id || null,
      year: values.year === "" ? null : Number(values.year),
      key: values.key,
      lyrics: values.lyrics,
      notes: values.notes.trim() || null,
      media_url: values.media_url.trim() || null,
    };

    const { error } = values.id
      ? await sb.from("songs").update(payload).eq("id", values.id)
      : await sb.from("songs").insert(payload);

    setSaving(false);
    if (error) {
      setMsg(error.code === "23505"
        ? "Ya existe una canción con ese número o dirección. Cambiá el número."
        : `No se pudo guardar: ${error.message}`);
      return;
    }
    router.push("/admin/canciones");
    router.refresh();
  }

  const input = "w-full rounded-lg border border-navy-200 dark:border-navy-700 bg-white dark:bg-navy-800 px-3 py-2.5";

  return (
    <form onSubmit={save} className="space-y-5 max-w-3xl">
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-semibold mb-1" htmlFor="numero">Número *</label>
          <input id="numero" type="number" min={1} required value={values.number}
            onChange={(e) => set("number", e.target.value === "" ? "" : Number(e.target.value))} className={input} />
        </div>
        <div className="sm:col-span-3">
          <label className="block text-sm font-semibold mb-1" htmlFor="titulo">Título *</label>
          <input id="titulo" required value={values.title} onChange={(e) => set("title", e.target.value)} className={input} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-semibold mb-1" htmlFor="autor">Autor</label>
          <select id="autor" value={values.author_id} onChange={(e) => set("author_id", e.target.value)} className={input}>
            <option value="">— Nuevo autor —</option>
            {authors.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
          {!values.author_id && (
            <input placeholder="Nombre del nuevo autor" value={newAuthor}
              onChange={(e) => setNewAuthor(e.target.value)} className={`${input} mt-2`} aria-label="Nombre del nuevo autor" />
          )}
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1" htmlFor="anio">Año</label>
          <input id="anio" type="number" min={1500} max={2100} value={values.year}
            onChange={(e) => set("year", e.target.value === "" ? "" : Number(e.target.value))} className={input} />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1" htmlFor="tono">Tonalidad *</label>
          <select id="tono" value={values.key} onChange={(e) => set("key", e.target.value)} className={input}>
            {ALL_KEYS.flatMap((k) => [k, `${k}m`]).map((k) => <option key={k} value={k}>{k}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold mb-1" htmlFor="categoria">Categoría *</label>
        <select id="categoria" required value={values.category_id} onChange={(e) => set("category_id", e.target.value)} className={input}>
          <option value="">Elegí una categoría…</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      <div>
        <label className="block text-sm font-semibold mb-1" htmlFor="letra">
          Letra con acordes * <span className="font-normal text-navy-500 dark:text-navy-300">
            — acordes entre corchetes: <code className="font-mono">[G]Grande es tu [D]amor</code>; secciones: <code className="font-mono">[Coro]</code>, <code className="font-mono">[Estrofa 1]</code>
          </span>
        </label>
        <textarea id="letra" required rows={14} value={values.lyrics}
          onChange={(e) => set("lyrics", e.target.value)} className={`${input} font-mono text-sm`} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold mb-1" htmlFor="notas">Notas musicales (opcional)</label>
          <input id="notas" value={values.notes} onChange={(e) => set("notes", e.target.value)}
            className={input} placeholder="Tempo, compás, indicaciones…" />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1" htmlFor="media">Enlace a audio o video (opcional)</label>
          <input id="media" type="url" value={values.media_url} onChange={(e) => set("media_url", e.target.value)}
            className={input} placeholder="https://…" />
        </div>
      </div>

      {msg && <p className="text-sm text-red-600" role="alert">{msg}</p>}

      <div className="flex gap-3">
        <button disabled={saving} className="rounded-lg bg-navy-900 hover:bg-navy-800 text-marfil font-bold px-6 py-3 disabled:opacity-50">
          {saving ? "Guardando…" : values.id ? "Guardar cambios" : "Crear canción"}
        </button>
        <button type="button" onClick={() => router.back()} className="rounded-lg border border-navy-200 dark:border-navy-700 px-6 py-3 font-semibold">
          Cancelar
        </button>
      </div>
    </form>
  );
}
