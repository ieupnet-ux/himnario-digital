import { requireAdmin } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { UsersManager } from '@/components/admin/UsersManager';

export const metadata = { title: 'Usuarios — Administración' };
export const revalidate = 0;

export default async function AdminUsersPage() {
  const profile = await requireAdmin();
  const supabase = createClient();
  const { data: profiles } = await supabase.from('profiles').select('*').order('created_at', { ascending: true });

  return (
    <div>
      <h1 className="mb-1 font-serif text-2xl font-bold text-navy-900">Usuarios</h1>
      <p className="mb-6 text-sm text-navy-500">Gestiona los roles de acceso al panel administrativo.</p>
      <UsersManager profiles={profiles ?? []} currentUserId={profile.id} />
    </div>
  );
}
