import Link from 'next/link';
import { Music, Search, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center px-4 text-center">
      <span className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-navy-50">
        <Music className="h-8 w-8 text-navy-400" />
      </span>
      <h1 className="font-serif text-3xl font-bold text-navy-900">404</h1>
      <p className="mt-2 text-sm text-navy-500">
        No encontramos el himno o la página que buscas. Puede que haya sido movida o eliminada.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link
          href="/biblioteca"
          className="flex items-center gap-1.5 rounded-full bg-gold-gradient px-4 py-2 text-sm font-semibold text-navy-900 shadow-gold"
        >
          <Search className="h-4 w-4" /> Buscar en la biblioteca
        </Link>
        <Link
          href="/"
          className="flex items-center gap-1.5 rounded-full border border-navy-200 px-4 py-2 text-sm font-medium text-navy-700 hover:bg-navy-50"
        >
          <Home className="h-4 w-4" /> Ir al inicio
        </Link>
      </div>
    </div>
  );
}
