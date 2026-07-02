'use client';

import { useRouter } from 'next/navigation';
import { Shield, User as UserIcon, PenLine } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { Profile, UserRole } from '@/types';
import toast from 'react-hot-toast';

const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Administrador',
  editor: 'Editor',
  member: 'Miembro'
};

const ROLE_ICONS: Record<UserRole, typeof Shield> = {
  admin: Shield,
  editor: PenLine,
  member: UserIcon
};

export function UsersManager({ profiles, currentUserId }: { profiles: Profile[]; currentUserId: string }) {
  const router = useRouter();

  async function handleRoleChange(userId: string, role: UserRole) {
    const supabase = createClient();
    const { error } = await supabase.from('profiles').update({ role }).eq('id', userId);

    if (error) {
      toast.error('No se pudo cambiar el rol');
      return;
    }
    toast.success('Rol actualizado');
    router.refresh();
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-navy-100 bg-white shadow-card">
      <table className="w-full text-sm">
        <thead className="border-b border-navy-100 bg-navy-50 text-left text-xs font-semibold uppercase tracking-wide text-navy-500">
          <tr>
            <th className="px-4 py-3">Usuario</th>
            <th className="px-4 py-3">Correo</th>
            <th className="px-4 py-3">Rol</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-navy-50">
          {profiles.map((profile) => {
            const RoleIcon = ROLE_ICONS[profile.role];
            return (
              <tr key={profile.id} className="hover:bg-navy-50/50">
                <td className="px-4 py-3">
                  <span className="flex items-center gap-2 font-medium text-navy-900">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-navy-100 text-navy-600">
                      <RoleIcon className="h-4 w-4" />
                    </span>
                    {profile.full_name ?? 'Sin nombre'}
                    {profile.id === currentUserId && (
                      <span className="rounded-full bg-gold-100 px-2 py-0.5 text-[10px] font-medium text-gold-700">
                        Tú
                      </span>
                    )}
                  </span>
                </td>
                <td className="px-4 py-3 text-navy-500">{profile.email}</td>
                <td className="px-4 py-3">
                  <select
                    value={profile.role}
                    onChange={(e) => handleRoleChange(profile.id, e.target.value as UserRole)}
                    disabled={profile.id === currentUserId}
                    className="rounded-lg border border-navy-200 bg-white px-3 py-1.5 text-xs font-medium text-navy-700 outline-none focus:border-gold-400 disabled:opacity-50"
                  >
                    <option value="member">Miembro</option>
                    <option value="editor">Editor</option>
                    <option value="admin">Administrador</option>
                  </select>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
