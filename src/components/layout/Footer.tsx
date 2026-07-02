import Link from 'next/link';
import { BookOpen, Heart } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-navy-100 bg-navy-gradient text-navy-200 dark:border-navy-700">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10">
              <BookOpen className="h-4.5 w-4.5 text-gold-400" />
            </span>
            <div className="leading-tight">
              <p className="font-serif text-base font-semibold text-white">Himnario Digital</p>
              <p className="text-xs text-navy-300">Para la gloria de Dios</p>
            </div>
          </div>

          <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm">
            <Link href="/biblioteca" className="hover:text-gold-300 transition-colors">
              Biblioteca
            </Link>
            <Link href="/categorias" className="hover:text-gold-300 transition-colors">
              Categorías
            </Link>
            <Link href="/favoritos" className="hover:text-gold-300 transition-colors">
              Favoritos
            </Link>
            <Link href="/admin" className="hover:text-gold-300 transition-colors">
              Administración
            </Link>
          </nav>
        </div>

        <div className="mt-8 flex flex-col items-center gap-2 border-t border-white/10 pt-6 text-center text-xs text-navy-400 sm:flex-row sm:justify-between">
          <p>© {new Date().getFullYear()} Himnario Digital. Todos los derechos reservados.</p>
          <p className="flex items-center gap-1">
            Hecho con <Heart className="h-3 w-3 text-gold-400 fill-gold-400" /> para la congregación
          </p>
        </div>
      </div>
    </footer>
  );
}
