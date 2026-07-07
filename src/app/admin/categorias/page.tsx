"use client";

import { useEffect, useState } from "react";
import { getBrowserSupabase } from "@/lib/supabase";

interface Cat { id: string; name: string; slug: string }

/** Gestión de categorías: crear, renombrar y eliminar. */
export default function AdminCategorias() {
  const [cats, setCats] = useState<Cat[]>([]);
  const [name, setName] = useState("");
  const [msg, setMsg] = useState("");

  async function load() {
    const sb = getBrowserSupabase();
    if (!sb) return;
    const { data } = await sb.from("categories").select("id, name, slug").order("name");
    setCats(data ?? []);
  }
  useEffect(() => { load(); }, []);

  const slugify = (s: string) =>
    s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  async function create(e: React.FormEvent) {
    e.preventDefault();
    const sb = getBrowserSupabase()!;
    const { error } = await sb.from("categories").insert({ name: name.trim(), slug: slugify(name) });
    setMsg(error ? `No se pudo crear: ${error.message}` : `Categoría "${name}" creada.`);
    if (!error) setName("");
    load();
  }

  async function rename(cat: Cat) {
    const nuevo = prompt("Nuevo nombre de la categoría:", cat.name);
    if (!nuevo || nuevo.trim() === cat.name) return;
    const sb = getBrowserSupabase()!;
    const { error } = await sb.from("categories").update({ name: nuevo.trim(), slug: slugify(nuevo) }).eq("id", cat.id);
    setMsg(error ? `No se pudo renombrar: ${error.message}` : "Categoría renombrada.");
    load();
  }

  async function remove(cat: Cat) {
    if (!confirm(`¿Eliminar la categoría "${cat.name}"? Las canciones quedarán sin categoría.`)) return;
    const sb = getBrowserSupabase()!;
    const { error } = await sb.from("categories").delete().eq("id", cat.id);
    setMsg(error ? `No se pudo eliminar: ${error.message}` : "Categoría eliminada.");
    load();
  }

  return (
    <div className="max-w-2xl">
      <form onSubmit={create} className="flex gap-3">
        <input
          required value={name} onChange={(e) => setName(e.target.value)}
          placeholder="Nombre de la nueva categoría" aria-label="Nombre de la nueva categoría"
          className="flex-1 rounded-lg border border-navy-200 dark:border-navy-700 bg-white dark:bg-navy-800 px-3 py-2.5"
        />
        <button className="rounded-lg bg-navy-900 hover:bg-navy-800 text-marfil font-bold px-5">Crear</button>
      </form>
      {msg && <p className="mt-3 text-sm text-oro-600 dark:text-oro-400" role="status">{msg}</p>}

      <ul className="mt-5 divide-y divide-navy-100 dark:divide-navy-800 rounded-xl border border-navy-100 dark:border-navy-800 bg-white dark:bg-navy-900">
        {cats.map((c) => (
          <li key={c.id} className="flex items-center justify-between px-4 py-3">
            <span className="font-semibold">{c.name}</span>
            <span className="space-x-3 text-sm">
              <button onClick={() => rename(c)} className="font-semibold hover:text-oro-600">Renombrar</button>
              <button onClick={() => remove(c)} className="font-semibold text-red-600 hover:underline">Eliminar</button>
            </span>
          </li>
        ))}
        {cats.length === 0 && <li className="px-4 py-8 text-center text-navy-500 dark:text-navy-300">Sin categorías todavía.</li>}
      </ul>
    </div>
  );
}
