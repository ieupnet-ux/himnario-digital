import { NextResponse } from "next/server";
import { getCategories } from "@/lib/data";

export const dynamic = "force-dynamic";

/** GET /api/categories — lista de categorías. */
export async function GET() {
  return NextResponse.json({ categories: await getCategories() });
}
