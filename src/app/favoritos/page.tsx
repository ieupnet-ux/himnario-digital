import FavoritesStrip from "@/components/FavoritesStrip";
import { getAllSongs } from "@/lib/data";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Favoritos e historial" };
export const revalidate = 300;

export default async function FavoritosPage() {
  const songs = await getAllSongs();
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="filete font-display text-3xl font-semibold">Tus favoritos</h1>
      <p className="mt-2 text-navy-500 dark:text-navy-300">
        Se guardan en este dispositivo y funcionan sin conexión.
      </p>
      <div className="mt-6">
        <FavoritesStrip songs={songs} mode="favoritos" />
      </div>

      <h2 className="filete font-display text-2xl font-semibold mt-12">Historial reciente</h2>
      <div className="mt-4">
        <FavoritesStrip songs={songs} mode="historial" />
      </div>
    </div>
  );
}
