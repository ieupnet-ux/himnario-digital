'use client';

import Link from 'next/link';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { BookOpen, Menu, X, Heart, Clock, Search, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_LINKS = [
  { href: '/biblioteca', label: 'Biblioteca' },
  { href: '/categorias', label: 'Categorías' },
  { href: '/favoritos', label: 'Favoritos', icon: Heart },
  { href: '/historial', label: 'Historial', icon: Clock }
];

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-navy-100 bg-white/90 backdrop-blur-md dark:bg-navy-900/90 dark:border-navy-700">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy-gradient shadow-card">
            <BookOpen className="h-5 w-5 text-gold-400" />
          </span>
          <div className="flex flex-col leading-tight">
            <span className="font-serif text-lg font-semibold text-navy-900 dark:text-cream">
              Himnario Digital
            </span>
            <span className="text-[11px] text-navy-400 dark:text-navy-300">Iglesia Cristiana</span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((link) => {
            const Icon = link.icon;
            const active = pathname === link.href || pathname.startsWith(link.href + '/');
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  active
                    ? 'bg-navy-50 text-navy-900 dark:bg-white/10 dark:text-cream'
                    : 'text-navy-600 hover:bg-navy-50 hover:text-navy-900 dark:text-navy-300 dark:hover:bg-white/10 dark:hover:text-cream'
                )}
              >
                {Icon && <Icon className="h-4 w-4" />}
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/biblioteca"
            className="hidden sm:flex items-center gap-2 rounded-full border border-navy-200 px-4 py-2 text-sm text-navy-500 hover:border-gold-400 hover:text-navy-800 transition-colors dark:border-navy-600 dark:text-navy-300"
          >
            <Search className="h-4 w-4" />
            Buscar himno…
          </Link>
          <Link
            href="/admin"
            className="hidden md:flex items-center justify-center h-10 w-10 rounded-full text-navy-500 hover:bg-navy-50 dark:text-navy-300 dark:hover:bg-white/10"
            title="Panel administrativo"
          >
            <Shield className="h-5 w-5" />
          </Link>
          <button
            className="md:hidden flex items-center justify-center h-10 w-10 rounded-full text-navy-700 hover:bg-navy-50 dark:text-cream dark:hover:bg-white/10"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Abrir menú"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav className="md:hidden border-t border-navy-100 bg-white px-4 py-3 animate-slide-up dark:bg-navy-900 dark:border-navy-700">
          <div className="flex flex-col gap-1">
            <Link
              href="/biblioteca"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-navy-700 hover:bg-navy-50 dark:text-cream dark:hover:bg-white/10"
            >
              <Search className="h-4 w-4" /> Buscar himno
            </Link>
            {NAV_LINKS.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-navy-700 hover:bg-navy-50 dark:text-cream dark:hover:bg-white/10"
                >
                  {Icon && <Icon className="h-4 w-4" />}
                  {link.label}
                </Link>
              );
            })}
            <Link
              href="/admin"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-navy-700 hover:bg-navy-50 dark:text-cream dark:hover:bg-white/10"
            >
              <Shield className="h-4 w-4" /> Panel administrativo
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
