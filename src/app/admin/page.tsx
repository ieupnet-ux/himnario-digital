import Link from 'next/link';
import { Music, FolderTree, Users, Heart, Plus, Upload } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';

export const metadata = { title: 'Panel Administrativo' };

async function getStats() {
  const supabase = createClient();
  const [{ count: songsCount }, { count: categoriesCount }, { count: usersCount }, { count: favoritesCount }] =
    await Promise.all([
      supabase.from('songs').select('*', { count: 'exact', head: true }),
      supabase.from('categories').select('*', { count: 'exact', head: true }),
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('favorites').select('*', { count: 'exact', head: true })
    ]);

  return {
    songs: songsCount ?? 0,
    categories: categoriesCount ?? 0,
    users: usersCount ?? 0,
    favorites: favoritesCount ?? 0
  };
}

export default async function AdminDashboardPage() {
  const stats = await getStats();

  const cards = [
    { label: 'Canciones totales', value: stats.songs, icon: Music, color: 'bg-navy-800' },
    { label: 'Categorías', value: stats.categories, icon: FolderTree, color: 'bg-gold-600' },
    { label: 'Usuarios registrados', value: stats.users, icon: Users, color: 'bg-navy-600' },
    { label: 'Favoritos guardados', value: stats.favorites, icon: Heart, color: 'bg-gold-500' }
  ];

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl font-bold text-navy-900">Resumen</h1>
          <p className="text-sm text-navy-500">Estado general del himnario digital.</p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin/importar"
            className="flex items-center gap-1.5 rounded-xl border border-navy-200 bg-white px-4 py-2 text-sm font-medium text-navy-700 hover:bg-navy-50"
          >
            <Upload className="h-4 w-4" /> Importar
          </Link>
          <Link
            href="/admin/canciones/nueva"
            className="flex items-center gap-1.5 rounded-xl bg-gold-gradient px-4 py-2 text-sm font-semibold text-navy-900 shadow-gold"
          >
            <Plus className="h-4 w-4" /> Nueva canción
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="rounded-2xl border border-navy-100 bg-white p-5 shadow-card">
              <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${card.color} text-white`}>
                <Icon className="h-5 w-5" />
              </span>
              <p className="mt-3 text-2xl font-bold text-navy-900">{card.value}</p>
              <p className="text-xs text-navy-500">{card.label}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-8 rounded-2xl border border-navy-100 bg-white p-6 shadow-card">
        <h2 className="mb-3 font-serif text-lg font-semibold text-navy-900">Accesos rápidos</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <Link
            href="/admin/canciones"
            className="rounded-xl border border-navy-100 p-4 text-sm font-medium text-navy-700 hover:bg-navy-50"
          >
            Gestionar canciones →
          </Link>
          <Link
            href="/admin/categorias"
            className="rounded-xl border border-navy-100 p-4 text-sm font-medium text-navy-700 hover:bg-navy-50"
          >
            Gestionar categorías →
          </Link>
          <Link
            href="/admin/usuarios"
            className="rounded-xl border border-navy-100 p-4 text-sm font-medium text-navy-700 hover:bg-navy-50"
          >
            Gestionar usuarios →
          </Link>
        </div>
      </div>
    </div>
  );
}
