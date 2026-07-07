import Logo from "./Logo";
import { CHURCH } from "@/lib/config";

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-navy-100 dark:border-navy-800 bg-white dark:bg-navy-900">
      <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-navy-500 dark:text-navy-300 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="font-display text-base italic">{CHURCH.verse}</p>
        <p>Iglesia Unión Pentecostal · Himnario Digital · {new Date().getFullYear()}</p>
      </div>
    </footer>
  );
}
