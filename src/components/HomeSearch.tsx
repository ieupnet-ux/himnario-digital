"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

/** Buscador principal de la portada: envía a la biblioteca con la consulta. */
export default function HomeSearch() {
  const router = useRouter();
  const [q, setQ] = useState("");
  return (
    <form
      className="mt-8 flex w-full max-w-xl mx-auto rounded-2xl bg-white dark:bg-navy-900 border border-navy-100 dark:border-navy-700 shadow-card overflow-hidden"
      onSubmit={(e) => {
        e.preventDefault();
        router.push(q.trim() ? `/biblioteca?q=${encodeURIComponent(q.trim())}` : "/biblioteca");
      }}
      role="search"
    >
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Buscá un himno por título, número o autor…"
        aria-label="Buscar himno"
        className="flex-1 bg-transparent px-5 py-4 text-lg outline-none min-w-0"
      />
      <button className="bg-oro-500 hover:bg-oro-600 text-navy-950 font-bold px-6 text-base transition-colors">
        Buscar
      </button>
    </form>
  );
}
