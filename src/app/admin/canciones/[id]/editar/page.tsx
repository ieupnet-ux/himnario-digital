"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import SongForm, { type SongFormValues } from "@/components/admin/SongForm";
import { getBrowserSupabase } from "@/lib/supabase";

/** Edición de una canción existente. */
export default function EditarCancionPage() {
  const { id } = useParams<{ id: string }>();
  const [initial, setInitial] = useState<SongFormValues | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const sb = getBrowserSupabase();
    if (!sb) return;
    sb.from("songs").select("*").eq("id", id).maybeSingle().then(({ data }) => {
      if (!data) { setNotFound(true); return; }
      setInitial({
        id: data.id,
        number: data.number,
        title: data.title,
        slug: data.slug,
        author_id: data.author_id ?? "",
        category_id: data.category_id ?? "",
        year: data.year ?? "",
        key: data.key,
        lyrics: data.lyrics,
        notes: data.notes ?? "",
        media_url: data.media_url ?? "",
      });
    });
  }, [id]);

  if (notFound) return <p className="p-6 text-navy-500">La canción no existe o fue eliminada.</p>;
  if (!initial) return <p className="p-6 text-navy-500">Cargando canción…</p>;

  return (
    <div>
      <h1 className="mb-1 font-serif text-2xl font-bold text-navy-900 dark:text-cream">
        Editar canción
      </h1>
      <p className="mb-6 text-sm text-navy-500 dark:text-navy-300">{initial.title}</p>
      <SongForm initial={initial} />
    </div>
  );
}