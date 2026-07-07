"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Logo from "./Logo";
import { CHURCH } from "@/lib/config";
import { getPrefs, savePrefs } from "@/lib/storage";

const NAV = [
  { href: "/", label: "Inicio" },
  { href: "/biblioteca", label: "Biblioteca" },
  { href: "/categorias", label: "Categorías" },
  { href: "/favoritos", label: "Favoritos" },
];

export default function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [night, setNight] = useState(false);

  useEffect(() => {
    setNight(getPrefs().night);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  function toggleNight() {
    const next = !night;
    setNight(next);
    document.documentElement.classList.toggle("dark", next);
    savePrefs({ ...getPrefs(), night: next });
  }

  return (
    <header className="sticky top-0 z-40 bg-navy-900 text-marfil shadow-md">
      <div className="mx-auto max-w-6xl px-4 h-16 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-3 shrink-0">
          <Logo variant="white" className="h-10 w-10" />
          <div className="leading-tight">
            <span className="font-display text-xl font-semibold tracking-wide">Unión Pentecostal</span>
            <span className="hidden sm:block text-[11px] uppercase tracking-[0.2em] text-oro-300">
              Himnario y cancionero
            </span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-1" aria-label="Principal">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`px-3 py-2 rounded-md text-sm font-semibold transition-colors ${
                pathname === item.href
                  ? "text-oro-300 bg-white/5"
                  : "text-navy-100 hover:text-oro-300 hover:bg-white/5"
              }`}
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/admin"
            className="ml-2 px-3 py-2 rounded-md text-sm font-semibold border border-oro-500/50 text-oro-300 hover:bg-oro-500/10"
          >
            Administración
          </Link>
        </nav>

        <div className="flex items-center gap-1">
          <button
            onClick={toggleNight}
            aria-label={night ? "Desactivar lectura nocturna" : "Activar lectura nocturna"}
            className="p-2 rounded-md hover:bg-white/10"
            title="Lectura nocturna"
          >
            {night ? "☀️" : "🌙"}
          </button>
          <button
            className="md:hidden p-2 rounded-md hover:bg-white/10"
            onClick={() => setOpen(!open)}
            aria-expanded={open}
            aria-label="Abrir menú"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <nav className="md:hidden border-t border-white/10 bg-navy-900 px-4 pb-4" aria-label="Menú móvil">
          {[...NAV, { href: "/admin", label: "Administración" }].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block px-3 py-3 rounded-md text-base font-semibold text-navy-100 hover:text-oro-300 hover:bg-white/5"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
