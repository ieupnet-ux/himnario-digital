import { ImportPanel } from '@/components/admin/ImportPanel';

export const metadata = { title: 'Importar — Administración' };

export default function AdminImportPage() {
  return (
    <div>
      <h1 className="mb-1 font-serif text-2xl font-bold text-navy-900">Importación masiva</h1>
      <p className="mb-6 text-sm text-navy-500">
        Carga muchas canciones a la vez desde un archivo Excel o PDF.
      </p>
      <ImportPanel />
    </div>
  );
}
