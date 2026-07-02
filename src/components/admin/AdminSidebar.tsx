'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Music,
  FolderTree,
  Users,
  Upload,
  LogOut,
  BookOpen,
  ArrowLeft
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import type { Profile } from '@/types';

const LINKS = [
  { href: '/admin', label: 'Resumen', icon: LayoutDashboard, exact: true },
  { href: '/admin/canciones', label: 'Canciones', icon: Music },
  { href: '/admin/categorias', label: 'Categorías', icon: FolderTree },
  { href: '/admin/importar', label: 'Importar masivo', icon: Upload },
  { href: '/admin/usuarios', label: 'Usuarios', icon: Users, adminOnly: true }
];

export function AdminSidebar({ profile }: { profile: Profile }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  }

  return (
    <aside className="flex w-full shrink-0 flex-col border-b border-navy-800 bg-navy-900 text-cream md:h-screen md:w-64 md:border-b-0 md:border-r">
      <div className="flex items-center gap-2.5 p-5">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10">
          <BookOpen className="h-4.5 w-4.5 text-gold-400" />
        </span>
        <div className="leading-tight">
          <p className="font-serif text-sm font-semibold">Himnario Digital</p>
          <p className="text-[11px] text-navy-300">Panel administrativo</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {LINKS.filter((l) => !l.adminOnly || profile.role === 'admin').map((link) => {
          const active = link.exact ? pathname === link.href : pathname.startsWith(link.href);
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                active ? 'bg-gold-500/20 text-gold-300' : 'text-navy-200 hover:bg-white/5 hover:text-white'
              )}
            >
              <Icon className="h-4 w-4" />
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-1 border-t border-navy-800 p-3">
        <Link
          href="/"
          className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-navy-200 hover:bg-white/5 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" /> Volver al sitio
        </Link>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-navy-200 hover:bg-white/5 hover:text-white"
        >
          <LogOut className="h-4 w-4" /> Cerrar sesión
        </button>
        <div className="mt-2 truncate px-3 text-xs text-navy-400">{profile.email}</div>
      </div>
    </aside>
  );
}
