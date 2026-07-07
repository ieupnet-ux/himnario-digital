"use client";

import { useEffect, useState } from "react";
import { getBrowserSupabase } from "@/lib/supabase";

interface Usr { id: string; email: string | null; display_name: string | null; role: string; created_at: string }

const ROLES = [
  ["member", "Miembro"],
  ["editor", "Editor"],
  ["admin", "Administrador"],
] as const;

/** Gestión de usuarios: ver miembros registrados y asignar roles. */
export default function AdminUsuarios() {
  const [users, setUsers] = useState<Usr[]>([]);
  const [msg, setMsg] = useState("");

  async function load() {
    const sb = getBrowserSupabase();
    if (!sb) return;
    const { data, error } = await sb.from("users").select("*").order("created_at");
    if (error) setMsg("Solo el personal con rol de editor o administrador puede ver esta lista.");
    setUsers(data ?? []);
  }
  useEffect(() => { load(); }, []);

  async function setRole(u: Usr, role: string) {
    const sb = getBrowserSupabase()!;
    const { error } = await sb.from("users").update({ role }).eq("id", u.id);
    setMsg(error ? `No se pudo cambiar el rol: ${error.message}` : `Rol de ${u.email} actualizado.`);
    load();
  }

  return (
    <div className="max-w-3xl">
      <p className="text-sm text-navy-500 dark:text-navy-300">
        Los usuarios se crean iniciando sesión por primera vez (o desde Supabase → Authentication).
        Aquí se asignan los permisos: los <strong>editores</strong> y <strong>administradores</strong> pueden
        gestionar el contenido del himnario.
      </p>
      {msg && <p className="mt-3 text-sm text-oro-600 dark:text-oro-400" role="status">{msg}</p>}

      <div className="mt-5 overflow-x-auto rounded-xl border border-navy-100 dark:border-navy-800">
        <table className="w-full text-sm bg-white dark:bg-navy-900">
          <thead className="bg-navy-50 dark:bg-navy-800 text-left">
            <tr>
              <th className="px-4 py-3 font-semibold">Correo</th>
              <th className="px-4 py-3 font-semibold">Nombre</th>
              <th className="px-4 py-3 font-semibold">Rol</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t border-navy-100 dark:border-navy-800">
                <td className="px-4 py-3">{u.email}</td>
                <td className="px-4 py-3">{u.display_name ?? "—"}</td>
                <td className="px-4 py-3">
                  <select
                    value={u.role} onChange={(e) => setRole(u, e.target.value)}
                    aria-label={`Rol de ${u.email}`}
                    className="rounded-lg border border-navy-200 dark:border-navy-700 bg-white dark:bg-navy-800 px-2 py-1.5"
                  >
                    {ROLES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr><td colSpan={3} className="px-4 py-8 text-center text-navy-500 dark:text-navy-300">
                Sin usuarios visibles.
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
