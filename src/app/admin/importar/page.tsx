"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getBrowserSupabase } from "@/lib/supabase";

/**
 * Importación masiva.
 * — Excel (.xlsx / .csv): una fila por canción con las columnas
 *   numero, titulo, autor, anio, categoria, tonalidad, letra, notas, media_url
 * — PDF: extrae el texto y lo pre-carga en el formulario de nueva canción.
 */
export default function ImportarPage() {
  const router = useRouter();
  const [log, setLog] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  function pushLog(line: string) {
    setLog((l) => [...l, line]);
  }

  async function importExcel(file: File) {
    setBusy(true);
    setLog([`Leyendo "${file.name}"…`]);
    try {
      const XLSX = await import("xlsx");
      const wb = XLSX.read(await file.arrayBuffer());
      const rows = XLSX.utils.sheet_to_json<Record<string, string | number>>(wb.Sheets[wb.SheetNames[0]], { defval: "" });
      if (rows.length === 0) { pushLog("El archivo no tiene filas de datos."); setBusy(false); return; }

      const sb = getBrowserSupabase()!;
      const { data: cats } = await sb.from("categories").select("id, name, slug");
      const { data: auths } = await sb.from("authors").select("id, name");
      const catByName = new Map((cats ?? []).map((c) => [c.name.toLowerCase(), c.id]));
      const authByName = new Map((auths ?? []).map((a) => [a.name.toLowerCase(), a.id]));

      let ok = 0, fail = 0;
      for (const row of rows) {
        const numero = Number(row.numero ?? row.número ?? row.number);
        const titulo = String(row.titulo ?? row.título ?? row.title ?? "").trim();
        if (!numero || !titulo) { fail++; pushLog(`✗ Fila sin número o título — omitida.`); continue; }

        // Autor: crear si no existe
        const autorName = String(row.autor ?? row.author ?? "").trim();
        let author_id: string | null = authByName.get(autorName.toLowerCase()) ?? null;
        if (!author_id && autorName) {
          const { data } = await sb.from("authors").upsert({ name: autorName }, { onConflict: "name" }).select("id").single();
          if (data) { author_id = data.id; authByName.set(autorName.toLowerCase(), data.id); }
        }

        const catName = String(row.categoria ?? row.categoría ?? row.category ?? "").trim();
        const category_id = catByName.get(catName.toLowerCase()) ?? null;

        const slug = `${String(numero).padStart(2, "0")}-` + titulo
          .normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
          .replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

        const { error } = await sb.from("songs").upsert({
          number: numero,
          title: titulo,
          slug,
          author_id,
          category_id,
          year: Number(row.anio ?? row.año ?? row.year) || null,
          key: String(row.tonalidad ?? row.key ?? "C").trim() || "C",
          lyrics: String(row.letra ?? row.lyrics ?? ""),
          notes: String(row.notas ?? row.notes ?? "").trim() || null,
          media_url: String(row.media_url ?? row.media ?? "").trim() || null,
        }, { onConflict: "number" });

        if (error) { fail++; pushLog(`✗ Himno ${numero} "${titulo}": ${error.message}`); }
        else { ok++; pushLog(`✓ Himno ${numero} — ${titulo}`); }
      }
      pushLog(`Terminado: ${ok} importadas, ${fail} con error.`);
    } catch {
      pushLog("No se pudo leer el archivo. Verificá que sea un Excel (.xlsx) o CSV válido.");
    }
    setBusy(false);
  }

  async function importPdf(file: File) {
    setBusy(true);
    setLog([`Extrayendo texto de "${file.name}"…`]);
    const form = new FormData();
    form.append("file", file);
    const res = await fetch("/api/import/pdf", { method: "POST", body: form });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) { pushLog(data.error ?? "Error al leer el PDF."); return; }
    window.sessionStorage.setItem("himnario:pdf-import", data.text);
    pushLog("Texto extraído. Abriendo el formulario de nueva canción…");
    router.push("/admin/canciones/nueva?import=pdf");
  }

  const zone = "rounded-xl bg-white dark:bg-navy-900 border border-navy-100 dark:border-navy-800 p-6 shadow-card";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl">
      <section className={zone}>
        <h2 className="font-display text-2xl font-semibold">Importar desde Excel</h2>
        <p className="mt-2 text-sm text-navy-500 dark:text-navy-300">
          Una fila por canción, con columnas: <code className="font-mono text-xs">numero, titulo, autor, anio,
          categoria, tonalidad, letra, notas, media_url</code>. Los acordes van entre corchetes dentro de la letra.
          Si el número ya existe, la canción se actualiza.
        </p>
        <label className="mt-4 inline-block rounded-lg bg-navy-900 hover:bg-navy-800 text-marfil font-bold px-5 py-3 cursor-pointer">
          Elegir archivo .xlsx / .csv
          <input type="file" accept=".xlsx,.xls,.csv" className="sr-only" disabled={busy}
            onChange={(e) => e.target.files?.[0] && importExcel(e.target.files[0])} />
        </label>
      </section>

      <section className={zone}>
        <h2 className="font-display text-2xl font-semibold">Importar desde PDF</h2>
        <p className="mt-2 text-sm text-navy-500 dark:text-navy-300">
          Extrae el texto del PDF y lo pre-carga en el formulario de nueva canción para que lo revises,
          agregues los acordes y completes los datos.
        </p>
        <label className="mt-4 inline-block rounded-lg bg-navy-900 hover:bg-navy-800 text-marfil font-bold px-5 py-3 cursor-pointer">
          Elegir archivo .pdf
          <input type="file" accept=".pdf" className="sr-only" disabled={busy}
            onChange={(e) => e.target.files?.[0] && importPdf(e.target.files[0])} />
        </label>
      </section>

      {log.length > 0 && (
        <div className="lg:col-span-2 rounded-xl bg-navy-950 text-navy-50 p-4 font-mono text-xs space-y-1 max-h-64 overflow-y-auto" role="log">
          {log.map((l, i) => <p key={i}>{l}</p>)}
        </div>
      )}
    </div>
  );
}
