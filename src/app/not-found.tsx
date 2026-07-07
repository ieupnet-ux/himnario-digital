import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <p className="font-display text-6xl font-semibold text-oro-500">404</p>
      <h1 className="mt-3 font-display text-2xl font-semibold">Página no encontrada</h1>
      <p className="mt-2 text-navy-500 dark:text-navy-300">
        La página que buscás no existe o fue movida.
      </p>
      <Link href="/" className="inline-block mt-6 rounded-lg bg-navy-900 text-marfil font-bold px-6 py-3">
        Volver al inicio
      </Link>
    </div>
  );
}
