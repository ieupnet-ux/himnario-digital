"use client";

import { useEffect, useState } from "react";
import { getBrowserSupabase } from "@/lib/supabase";

/** Resumen del panel: totales de contenido. */
export default function AdminResumen() {
  const [stats, setStats] = useState({ songs: 0, categories: 0, authors: 0, users: 0 });

  useEffect(() => {
    const sb = getBrowserSupabase();
    if (!sb) return;
    (async () => {
      const [s, c, a, u] = await Promise.all([
        sb.from("songs").select("id", { count: "exact", head: true }),
        sb.from("categories").select("id", { count: "exact", head: true }),
        sb.from("authors").select("id", { count: "exact", head: true }),
        sb.from("users").select("id", { count: "exact", head: true }),
      ]);
      setStats({ songs: s.count ?? 0, categories: c.count ?? 0, authors: a.count ?? 0, users: u.count ?? 0 });
    })();
  }, []);

  const card = "rounded-xl bg-white dark:bg-navy-900 border border-navy-100 dark:border-navy-800 p-6 shadow-card";
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {[
        ["Canciones", stats.songs],
        ["Categorías", stats.categories],
        ["Autores", stats.authors],
        ["Usuarios", stats.users],
      ].map(([label, n]) => (
        <div key={label as string} className={card}>
          <p className="text-4xl font-display font-semibold text-oro-600 dark:text-oro-400">{n as number}</p>
          <p className="mt-1 text-sm font-semibold text-navy-500 dark:text-navy-300">{label}</p>
        </div>
      ))}
    </div>
  );
}
