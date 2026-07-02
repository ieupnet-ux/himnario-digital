'use client';

import { useEffect } from 'react';
import { usePreferencesStore } from '@/lib/store';

export function NightModeSync() {
  const nightMode = usePreferencesStore((s) => s.nightMode);

  useEffect(() => {
    document.documentElement.classList.toggle('night-mode', nightMode);
    document.documentElement.classList.toggle('dark', nightMode);
  }, [nightMode]);

  return null;
}

