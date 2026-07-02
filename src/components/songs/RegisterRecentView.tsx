'use client';

import { useEffect } from 'react';
import { useRecentStore } from '@/lib/store';

export function RegisterRecentView({
  songId,
  title,
  number
}: {
  songId: string;
  title: string;
  number: number | null;
}) {
  const addRecent = useRecentStore((s) => s.addRecent);

  useEffect(() => {
    addRecent({ id: songId, title, number, viewedAt: new Date().toISOString() });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [songId]);

  return null;
}
