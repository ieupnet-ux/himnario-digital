'use client';

import { useState } from 'react';
import { Minus, Plus, Maximize, Minimize, Mic2, Share2, Moon, Sun, Eye, EyeOff } from 'lucide-react';
import { usePreferencesStore } from '@/lib/store';
import toast from 'react-hot-toast';

export function SongToolbar({ songTitle, hasChords }: { songTitle: string; hasChords: boolean }) {
  const {
    fontSize,
    increaseFontSize,
    decreaseFontSize,
    nightMode,
    toggleNightMode,
    showChords,
    toggleShowChords,
    rehearsalMode,
    toggleRehearsalMode
  } = usePreferencesStore();
  const [fullscreen, setFullscreen] = useState(false);

  function toggleFullscreen() {
    const el = document.documentElement;
    if (!fullscreen) {
      el.requestFullscreen?.().catch(() => {});
      setFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setFullscreen(false);
    }
  }

  async function handleShare() {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: songTitle, url });
      } catch {
        /* usuario canceló */
      }
    } else {
      await navigator.clipboard.writeText(url);
      toast.success('Enlace copiado al portapapeles');
    }
  }

  const buttonClass =
    'flex h-9 w-9 items-center justify-center rounded-lg text-navy-600 hover:bg-navy-100 transition-colors dark:text-navy-200 dark:hover:bg-white/10';
  const activeClass = 'bg-gold-100 text-gold-700 dark:bg-gold-900/40 dark:text-gold-300';

  return (
    <div className="flex flex-wrap items-center gap-1 rounded-2xl border border-navy-100 bg-white p-2 shadow-card dark:bg-navy-800 dark:border-navy-700">
      <button onClick={decreaseFontSize} className={buttonClass} title="Reducir tamaño de letra">
        <Minus className="h-4 w-4" />
      </button>
      <span className="w-8 text-center text-xs font-medium text-navy-500 dark:text-navy-300">{fontSize}</span>
      <button onClick={increaseFontSize} className={buttonClass} title="Aumentar tamaño de letra">
        <Plus className="h-4 w-4" />
      </button>

      <div className="mx-1 h-5 w-px bg-navy-100 dark:bg-navy-600" />

      {hasChords && (
        <button
          onClick={toggleShowChords}
          className={`${buttonClass} ${showChords ? activeClass : ''}`}
          title={showChords ? 'Ocultar acordes' : 'Mostrar acordes'}
        >
          {showChords ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
        </button>
      )}

      <button
        onClick={toggleRehearsalMode}
        className={`${buttonClass} ${rehearsalMode ? activeClass : ''}`}
        title="Modo ensayo"
      >
        <Mic2 className="h-4 w-4" />
      </button>

      <button
        onClick={toggleNightMode}
        className={`${buttonClass} ${nightMode ? activeClass : ''}`}
        title="Lectura nocturna"
      >
        {nightMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </button>

      <button onClick={toggleFullscreen} className={buttonClass} title="Pantalla completa">
        {fullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
      </button>

      <div className="mx-1 h-5 w-px bg-navy-100 dark:bg-navy-600" />

      <button onClick={handleShare} className={buttonClass} title="Compartir">
        <Share2 className="h-4 w-4" />
      </button>
    </div>
  );
}
