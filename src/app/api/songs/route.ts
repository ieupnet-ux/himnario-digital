import { NextRequest, NextResponse } from "next/server";
import { getAllSongs } from "@/lib/data";

export const dynamic = "force-dynamic";

/**
 * GET /api/songs — lista de canciones.
 * Filtros opcionales: ?q= (texto o número) &category= (slug) &key= (tonalidad)
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") ?? "").toLowerCase();
  const category = searchParams.get("category") ?? "";
  const key = searchParams.get("key") ?? "";

  let songs = await getAllSongs();
  if (category) songs = songs.filter((s) => s.category_slug === category);
  if (key) songs = songs.filter((s) => s.key === key);
  if (q) {
    songs = /^\d+$/.test(q)
      ? songs.filter((s) => String(s.number) === q)
      : songs.filter(
          (s) => s.title.toLowerCase().includes(q) || s.author.toLowerCase().includes(q)
        );
  }
  return NextResponse.json({ count: songs.length, songs });
}
