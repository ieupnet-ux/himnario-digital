import { NextRequest, NextResponse } from "next/server";
import { getSongBySlug } from "@/lib/data";
import { getServerSupabase, supabaseEnabled } from "@/lib/supabase";

export const dynamic = "force-dynamic";

/** GET /api/songs/[slug] — detalle de una canción. */
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const song = await getSongBySlug(params.id);
  if (!song) return NextResponse.json({ error: "Canción no encontrada" }, { status: 404 });
  return NextResponse.json(song);
}

/** PATCH /api/songs/[slug] — suma una vista (contador de "más cantados"). */
export async function PATCH(_req: NextRequest, { params }: { params: { id: string } }) {
  if (supabaseEnabled) {
    const sb = getServerSupabase()!;
    await sb.rpc("increment_views", { song_slug: params.id });
  }
  return NextResponse.json({ ok: true });
}
