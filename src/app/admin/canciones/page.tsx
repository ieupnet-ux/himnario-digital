"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getBrowserSupabase } from "@/lib/supabase";

interface Row { id: string; number: number; title: string; slug: string; key: string; categories: { name: string } | null }

/** Listado administrativo: editar y eliminar canciones. */
export default function AdminCanciones() {
  const [rows, setRows] = useState<Row[]>([]);
  const [q, setQ] = useState("");
  const [msg, setMsg] = useState("");

  async function load() {
    const sb = getBrowserSupabase();
    if (!sb) return;
    const { data } = await sb.from("songs")
      .select("id, number, title, slug, key, categories(name)").order("number");
    setRows((data as unknown as Row[]) ?? []);
  }
  useEffect(() => { load(); }, []);

  async function remove(row: Row) {
    if (!confirm(`¿Eliminar definitivamente el himno ${row.number} — "${row.title}"?`)) return;
    const sb = getBrowserSupabase()!;
    const { error } = await sb.from("songs").delete().eq("id", row.id);
    if (error) setMsg(`No se pudo eliminar: ${error.message}`);
    else { setMsg(`Se eliminó "${row.title}".`); load(); }
  }

  const filtered = rows.filter(
    (r) => !q || r.title.toLowerCase().includes(q.toLowerCase()) || String(r.number) === q
  );

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="search" value={q} onChange={(e) => setQ(e.target.value)}
          placeholder="Filtrar por título o número…" aria-label="Filtrar canciones"
          className="flex-1 min-w-[220px] rounded-lg border border-navy-200 dark:border-navy-700 bg-white dark:bg-navy-800 px-3 py-2.5"
        />
        <Link href="/admin/canciones/nueva" className="rounded-lg bg-navy-900 hover:bg-navy-800 text-marfil font-bold px-5 py-2.5">
          + Nueva canción
        </Link>
      </div>
      {msg && <p className="mt-3 text-sm text-oro-600 dark:text-oro-400" role="status">{msg}</p>}

      <div className="mt-5 overflow-x-auto rounded-xl border border-navy-100 dark:border-navy-800">
        <table className="w-full text-sm bg-white dark:bg-navy-900">
          <thead className="bg-navy-50 dark:bg-navy-800 text-left">
            <tr>
              <th className="px-4 py-3 font-semibold">N.º</th>
              <th className="px-4 py-3 font-semibold">Título</th>
              <th className="px-4 py-3 font-semibold">Categoría</th>
              <th className="px-4 py-3 font-semibold">Tono</th>
              <th className="px-4 py-3 font-semibold text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id} className="border-t border-navy-100 dark:border-navy-800">
                <td className="px-4 py-3 font-bold text-oro-600 dark:text-oro-400">{r.number}</td>
                <td className="px-4 py-3">{r.title}</td>
                <td className="px-4 py-3">{r.categories?.name ?? "—"}</td>
                <td className="px-4 py-3">{r.key}</td>
                <td className="px-4 py-3 text-right space-x-3 whitespace-nowrap">
                  <Link href={`/cancion/${r.slug}`} className="font-semibold hover:text-oro-600">Ver</Link>
                  <Link href={`/admin/canciones/${r.id}`} className="font-semibold hover:text-oro-600">Editar</Link>
                  <button onClick={() => remove(r)} className="font-semibold text-red-600 hover:underline">Eliminar</button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-10 text-center text-navy-500 dark:text-navy-300">
                No hay canciones cargadas todavía.
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
