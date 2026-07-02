import Link from 'next/link';
import { WifiOff, Clock, Heart } from 'lucide-react';

export const metadata = { title: 'Sin conexión' };

export default function OfflinePage() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center px-4 text-center">
      <span className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-navy-50">
        <WifiOff className="h-8 w-8 text-navy-400" />
      </span>
      <h1 className="font-serif text-xl font-bold text-navy-900">Sin conexión a internet</h1>
      <p className="mt-2 text-sm text-navy-500">
        No fue posible cargar esta página. Si ya visitaste un himno antes, puedes encontrarlo en tu
        historial o favoritos, disponibles sin conexión.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link
          href="/favoritos"
          className="flex items-center gap-1.5 rounded-full bg-gold-gradient px-4 py-2 text-sm font-semibold text-navy-900 shadow-gold"
        >
          <Heart className="h-4 w-4" /> Mis favoritos
        </Link>
        <Link
          href="/historial"
          className="flex items-center gap-1.5 rounded-full border border-navy-200 px-4 py-2 text-sm font-medium text-navy-700 hover:bg-navy-50"
        >
          <Clock className="h-4 w-4" /> Historial reciente
        </Link>
      </div>
    </div>
  );
}
