'use client';

import { useEffect } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="es">
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
          <span className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </span>
          <h1 className="font-serif text-xl font-bold text-navy-900">Algo salió mal</h1>
          <p className="mt-2 max-w-sm text-sm text-navy-500">
            Ocurrió un error inesperado. Por favor intenta de nuevo.
          </p>
          <Button onClick={reset} variant="gold" className="mt-6">
            <RotateCcw className="h-4 w-4" /> Intentar de nuevo
          </Button>
        </div>
      </body>
    </html>
  );
}
