"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { getBrowserSupabase, supabaseEnabled } from "@/lib/supabase";

/**
 * Protege el panel administrativo.
 * — Sin Supabase configurado: explica cómo activarlo (modo demostración).
 * — Sin sesión: muestra el formulario de acceso.
 * — Con sesión: renderiza el panel.
 */
export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const sb = getBrowserSupabase();
    if (!sb) {
      setLoading(false);
      return;
    }
    sb.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    const { data: sub } = sb.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  if (!supabaseEnabled) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16">
        <h1 className="filete font-display text-3xl font-semibold">Panel administrativo</h1>
        <div className="mt-6 rounded-xl border border-oro-500/40 bg-oro-500/10 p-6 space-y-3">
          <p>
            El sitio está funcionando en <strong>modo demostración</strong> con 20 himnos de ejemplo.
            Para administrar el contenido real, conectá tu base de datos:
          </p>
          <ol className="list-decimal ml-5 space-y-1 text-sm">
            <li>Creá un proyecto gratuito en supabase.com.</li>
            <li>Ejecutá el archivo <code className="font-mono">supabase/schema.sql</code> en el SQL Editor.</li>
            <li>Copiá <code className="font-mono">.env.example</code> a <code className="font-mono">.env.local</code> y completá la URL y la clave.</li>
            <li>Creá tu usuario y asignale el rol <code className="font-mono">admin</code> (instrucciones al final del SQL).</li>
          </ol>
          <p className="text-sm">El README incluye el paso a paso completo.</p>
        </div>
        <Link href="/" className="inline-block mt-6 font-semibold text-oro-600 dark:text-oro-400 hover:underline">
          ← Volver al inicio
        </Link>
      </div>
    );
  }

  if (loading) {
    return <p className="text-center py-20 text-navy-500 dark:text-navy-300">Verificando sesión…</p>;
  }

  if (!session) {
    return (
      <div className="mx-auto max-w-sm px-4 py-16">
        <h1 className="font-display text-3xl font-semibold text-center">Acceso al panel</h1>
        <p className="mt-2 text-center text-sm text-navy-500 dark:text-navy-300">
          Solo para el equipo autorizado de la iglesia.
        </p>
        <form
          className="mt-8 space-y-4"
          onSubmit={async (e) => {
            e.preventDefault();
            setError("");
            const sb = getBrowserSupabase()!;
            const { error } = await sb.auth.signInWithPassword({ email, password });
            if (error) setError("Correo o contraseña incorrectos.");
          }}
        >
          <div>
            <label htmlFor="email" className="block text-sm font-semibold mb-1">Correo electrónico</label>
            <input
              id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-navy-200 dark:border-navy-700 bg-white dark:bg-navy-800 px-3 py-2.5"
              autoComplete="username"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-semibold mb-1">Contraseña</label>
            <input
              id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-navy-200 dark:border-navy-700 bg-white dark:bg-navy-800 px-3 py-2.5"
              autoComplete="current-password"
            />
          </div>
          {error && <p className="text-sm text-red-600" role="alert">{error}</p>}
          <button className="w-full rounded-lg bg-navy-900 hover:bg-navy-800 text-marfil font-bold py-3">
            Iniciar sesión
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl font-semibold">Panel administrativo</h1>
        <button
          onClick={() => getBrowserSupabase()!.auth.signOut()}
          className="rounded-lg border border-navy-200 dark:border-navy-700 px-3 py-2 text-sm font-semibold hover:border-oro-500"
        >
          Cerrar sesión ({session.user.email})
        </button>
      </div>
      <nav className="mt-4 flex flex-wrap gap-2 text-sm font-semibold" aria-label="Secciones del panel">
        {[
          ["/admin", "Resumen"],
          ["/admin/canciones", "Canciones"],
          ["/admin/canciones/nueva", "+ Nueva canción"],
          ["/admin/importar", "Importar (Excel / PDF)"],
          ["/admin/categorias", "Categorías"],
          ["/admin/usuarios", "Usuarios"],
        ].map(([href, label]) => (
          <Link key={href} href={href} className="rounded-full border border-navy-200 dark:border-navy-700 px-4 py-2 hover:border-oro-500 hover:text-oro-600 dark:hover:text-oro-400">
            {label}
          </Link>
        ))}
      </nav>
      <div className="mt-8">{children}</div>
    </div>
  );
}
