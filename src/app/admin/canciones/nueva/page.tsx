"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import SongForm from "@/components/admin/SongForm";

function NuevaCancionInner() {
  // La importación desde PDF puede pre-cargar la letra por parámetro de sesión
  const params = useSearchParams();
  const fromImport = params.get("import") === "pdf";
  const prefill = fromImport && typeof window !== "undefined"
    ? window.sessionStorage.getItem("himnario:pdf-import") ?? ""
    : "";

  return (
    <div>
      <h2 className="filete font-display text-2xl font-semibold mb-6">Nueva canción</h2>
      <SongForm prefillLyrics={prefill} />
    </div>
  );
}

export default function NuevaCancionPage() {
  return (
    <Suspense fallback={null}>
      <NuevaCancionInner />
    </Suspense>
  );
}
