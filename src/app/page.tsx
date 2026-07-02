import Link from 'next/link';
import { Heart, Clock, Music, ArrowRight } from 'lucide-react';
import { SearchBox } from '@/components/songs/SearchBox';
import { SongCard } from '@/components/songs/SongCard';
import { getSongs, getCategories } from '@/lib/data/songs';
import * as Icons from 'lucide-react';

export const revalidate = 60;

export default async function HomePage() {
  const [recentSongs, popularSongs, categories] = await Promise.all([
    getSongs({ limit: 6, orderBy: 'recent' }),
    getSongs({ limit: 6, orderBy: 'popular' }),
    getCategories()
  ]);

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden bg-navy-gradient">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-gold-400 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-gold-300 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-4xl px-4 py-20 text-center sm:px-6 sm:py-28 lg:px-8">
          <span className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-4 py-1.5 text-xs font-medium text-gold-300">
            <Music className="h-3.5 w-3.5" /> Biblioteca de alabanza
          </span>
          <h1 className="font-serif text-3xl font-bold text-white sm:text-5xl">
            Himnos, coritos y alabanzas
            <span className="block text-gold-400">al alcance de tu mano</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm text-navy-200 sm:text-base">
            Consulta letras completas, acordes y tonalidades de todo nuestro himnario, desde tu
            celular, tablet o computadora.
          </p>

          <div className="mx-auto mt-8 max-w-xl">
            <SearchBox variant="hero" />
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/biblioteca"
              className="inline-flex items-center gap-1.5 rounded-full bg-gold-gradient px-5 py-2.5 text-sm font-semibold text-navy-900 shadow-gold transition-transform hover:scale-105"
            >
              Ver toda la biblioteca <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/favoritos"
              className="inline-flex items-center gap-1.5 rounded-full border border-white/20 px-5 py-2.5 text-sm font-medium text-white hover:bg-white/10"
            >
              <Heart className="h-4 w-4" /> Mis favoritos
            </Link>
          </div>
        </div>
      </section>

      {/* CATEGORÍAS */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-serif text-xl font-semibold text-navy-900 sm:text-2xl">
            Explora por categoría
          </h2>
          <Link href="/categorias" className="text-sm font-medium text-gold-600 hover:text-gold-700">
            Ver todas
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {categories.slice(0, 8).map((category) => {
            const IconComponent = (Icons as any)[category.icon ?? 'Music'] ?? Music;
            return (
              <Link
                key={category.id}
                href={`/categorias/${category.slug}`}
                className="group flex flex-col items-start gap-3 rounded-2xl border border-navy-100 bg-white p-4 shadow-card transition-all hover:-translate-y-0.5 hover:shadow-card-hover"
              >
                <span
                  className="flex h-10 w-10 items-center justify-center rounded-xl text-white"
                  style={{ backgroundColor: category.color ?? '#162548' }}
                >
                  <IconComponent className="h-5 w-5" />
                </span>
                <span className="font-serif text-sm font-semibold text-navy-900 group-hover:text-navy-700">
                  {category.name}
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* HIMNOS RECIENTES */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-serif text-xl font-semibold text-navy-900 sm:text-2xl">
            <Clock className="h-5 w-5 text-gold-500" /> Agregados recientemente
          </h2>
          <Link href="/biblioteca" className="text-sm font-medium text-gold-600 hover:text-gold-700">
            Ver todos
          </Link>
        </div>
        {recentSongs.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {recentSongs.map((song) => (
              <SongCard key={song.id} song={song} />
            ))}
          </div>
        ) : (
          <EmptyState />
        )}
      </section>

      {/* MÁS UTILIZADOS */}
      {popularSongs.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-serif text-xl font-semibold text-navy-900 sm:text-2xl">
              <Music className="h-5 w-5 text-gold-500" /> Más utilizados
            </h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {popularSongs.map((song) => (
              <SongCard key={song.id} song={song} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-navy-200 bg-navy-50/50 p-10 text-center">
      <Music className="mx-auto mb-3 h-8 w-8 text-navy-300" />
      <p className="text-sm text-navy-500">
        Aún no hay himnos cargados. Ingresa al panel administrativo para agregar el primero.
      </p>
    </div>
  );
}
