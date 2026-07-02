'use client';

import { useState, useRef } from 'react';
import { FileSpreadsheet, FileText, Upload, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';

interface ImportResult {
  inserted: number;
  skipped?: number;
  total: number;
  errors: string[];
}

export function ImportPanel() {
  const [excelLoading, setExcelLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [excelResult, setExcelResult] = useState<ImportResult | null>(null);
  const [pdfResult, setPdfResult] = useState<ImportResult | null>(null);
  const excelInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  async function handleExcelUpload(file: File) {
    setExcelLoading(true);
    setExcelResult(null);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/import/excel', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Error al importar');
      setExcelResult(data);
      toast.success(`${data.inserted} canciones importadas`);
    } catch (err: any) {
      toast.error(err.message ?? 'Error al importar el archivo');
    } finally {
      setExcelLoading(false);
    }
  }

  async function handlePdfUpload(file: File) {
    setPdfLoading(true);
    setPdfResult(null);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/import/pdf', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Error al importar');
      setPdfResult(data);
      toast.success(`${data.inserted} canciones importadas`);
    } catch (err: any) {
      toast.error(err.message ?? 'Error al importar el archivo');
    } finally {
      setPdfLoading(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* IMPORTAR EXCEL */}
      <div className="rounded-2xl border border-navy-100 bg-white p-6 shadow-card">
        <div className="mb-4 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100 text-green-700">
            <FileSpreadsheet className="h-5 w-5" />
          </span>
          <div>
            <h2 className="font-serif text-lg font-semibold text-navy-900">Importar desde Excel</h2>
            <p className="text-xs text-navy-500">Archivos .xlsx, .xls o .csv</p>
          </div>
        </div>

        <div className="mb-4 rounded-xl bg-navy-50 p-3 text-xs text-navy-600">
          <p className="mb-1 font-medium">Columnas esperadas:</p>
          <code className="block text-[11px] leading-relaxed text-navy-500">
            numero, titulo*, autor, categoria, anio, tonalidad, letra*, letra_acordes, tags
          </code>
          <p className="mt-1 text-[11px] text-navy-400">*Obligatorios: titulo y letra</p>
        </div>

        <input
          ref={excelInputRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleExcelUpload(file);
          }}
        />
        <Button
          type="button"
          variant="secondary"
          className="w-full"
          onClick={() => excelInputRef.current?.click()}
          disabled={excelLoading}
        >
          {excelLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          {excelLoading ? 'Importando…' : 'Seleccionar archivo Excel'}
        </Button>

        {excelResult && <ImportResultView result={excelResult} />}
      </div>

      {/* IMPORTAR PDF */}
      <div className="rounded-2xl border border-navy-100 bg-white p-6 shadow-card">
        <div className="mb-4 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 text-red-700">
            <FileText className="h-5 w-5" />
          </span>
          <div>
            <h2 className="font-serif text-lg font-semibold text-navy-900">Importar desde PDF</h2>
            <p className="text-xs text-navy-500">Extrae texto automáticamente</p>
          </div>
        </div>

        <div className="mb-4 rounded-xl bg-navy-50 p-3 text-xs text-navy-600">
          <p className="mb-1 font-medium">Formato recomendado en el PDF:</p>
          <code className="block whitespace-pre-wrap text-[11px] leading-relaxed text-navy-500">
            {'### Título del himno\nLínea 1 de la letra\nLínea 2 de la letra\n### Siguiente himno\n…'}
          </code>
        </div>

        <input
          ref={pdfInputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handlePdfUpload(file);
          }}
        />
        <Button
          type="button"
          variant="secondary"
          className="w-full"
          onClick={() => pdfInputRef.current?.click()}
          disabled={pdfLoading}
        >
          {pdfLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          {pdfLoading ? 'Importando…' : 'Seleccionar archivo PDF'}
        </Button>

        {pdfResult && <ImportResultView result={pdfResult} />}
      </div>
    </div>
  );
}

function ImportResultView({ result }: { result: ImportResult }) {
  return (
    <div className="mt-4 rounded-xl border border-navy-100 p-3">
      <div className="flex items-center gap-2 text-sm font-medium text-green-700">
        <CheckCircle2 className="h-4 w-4" />
        {result.inserted} de {result.total} canciones importadas correctamente
      </div>
      {result.errors.length > 0 && (
        <div className="mt-2 space-y-1">
          {result.errors.map((err, i) => (
            <p key={i} className="flex items-start gap-1.5 text-xs text-amber-600">
              <AlertCircle className="mt-0.5 h-3 w-3 shrink-0" /> {err}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
