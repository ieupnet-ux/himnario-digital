import Link from "next/link";
import Logo from "@/components/Logo";
import HomeSearch from "@/components/HomeSearch";
import FavoritesStrip from "@/components/FavoritesStrip";
import SongCard from "@/components/SongCard";
import { getAllSongs, getCategories, getPopularSongs, getRecentSongs } from "@/lib/data";

export const revalidate = 300; // regenerar cada 5 minutos

export default async function HomePage() {
  const [songs, categories, recent, popular] = await Promise.all([
    getAllSongs(),
    getCategories(),
    getRecentSongs(4),
    getPopularSongs(4),
  ]);

  return (
    <div>
      {/* Portada */}
      <section className="bg-navy-900 text-marfil">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:py-20 text-center">
          <Logo variant="white" size={96} className="h-24 w-24 mx-auto object-contain" />
          <h1 className="mt-5 font-display text-4xl sm:text-5xl font-semibold tracking-wide">
            Unión Pentecostal
          </h1>
          <p className="mt-1 text-sm uppercase tracking-[0.3em] text-oro-300 font-semibold">Himnario y cancionero</p>
          <p className="mt-4 text-lg text-navy-100 max-w-2xl mx-auto">
            Himnos, coritos y alabanzas de la iglesia Unión Pentecostal, con letra y acordes,
            en tu celular, tablet o computadora.
          </p>
          <HomeSearch />
          <p className="mt-4 text-sm text-navy-300">
            Consejo: escribí solo el <span className="text-oro-300 font-semibold">número del himno</span> para ir directo.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4">
        {/* Acceso rápido a categorías */}
        <section className="mt-10">
          <h2 className="filete font-display text-2xl font-semibold">Categorías</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {categories.map((c) => (
              <Link
                key={c.slug}
                href={`/categorias/${c.slug}`}
                className="rounded-full border border-navy-200 dark:border-navy-700 bg-white dark:bg-navy-900 px-4 py-2 text-sm font-semibold hover:border-oro-500 hover:text-oro-600 dark:hover:text-oro-400 transition-colors"
              >
                {c.name}
              </Link>
            ))}
          </div>
        </section>

        {/* Recientes y más cantados */}
        <section className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h2 className="filete font-display text-2xl font-semibold">Himnos recientes</h2>
            <div className="mt-4 grid gap-3">
              {recent.map((s) => (
                <SongCard key={s.id} song={s} />
              ))}
            </div>
          </div>
          <div>
            <h2 className="filete font-display text-2xl font-semibold">Los más cantados</h2>
            <div className="mt-4 grid gap-3">
              {popular.map((s) => (
                <SongCard key={s.id} song={s} />
              ))}
            </div>
          </div>
        </section>

        {/* Favoritos del dispositivo */}
        <section className="mt-10">
          <div className="flex items-baseline justify-between">
            <h2 className="filete font-display text-2xl font-semibold">Tus favoritos</h2>
            <Link href="/favoritos" className="text-sm font-semibold text-oro-600 dark:text-oro-400 hover:underline">
              Ver todos →
            </Link>
          </div>
          <div className="mt-4">
            <FavoritesStrip songs={songs} mode="favoritos" />
          </div>
        </section>
      </div>
    </div>
  );
}
