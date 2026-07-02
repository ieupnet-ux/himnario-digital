import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import type { Profile } from '@/types';

export async function requireAdminOrEditor(): Promise<Profile> {
  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();

  if (!profile || (profile.role !== 'admin' && profile.role !== 'editor')) {
    redirect('/login');
  }

  return profile as Profile;
}

export async function requireAdmin(): Promise<Profile> {
  const profile = await requireAdminOrEditor();
  if (profile.role !== 'admin') {
    redirect('/admin');
  }
  return profile;
}
