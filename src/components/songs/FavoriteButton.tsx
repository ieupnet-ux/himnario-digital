'use client';

import { Heart } from 'lucide-react';
import { useFavorite } from '@/hooks/useFavorite';
import { cn } from '@/lib/utils';

export function FavoriteButton({ songId, size = 'md' }: { songId: string; size?: 'sm' | 'md' | 'lg' }) {
  const { isFavorite, toggle, loading } = useFavorite(songId);

  const sizes = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12'
  };
  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle();
      }}
      disabled={loading}
      aria-label={isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
      className={cn(
        sizes[size],
        'flex items-center justify-center rounded-full transition-all active:scale-90',
        isFavorite
          ? 'bg-gold-100 text-gold-600'
          : 'bg-navy-50 text-navy-400 hover:text-gold-500 dark:bg-white/10'
      )}
    >
      <Heart className={cn(iconSizes[size], isFavorite && 'fill-gold-500 text-gold-500')} />
    </button>
  );
}
