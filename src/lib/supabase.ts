import { createBrowserClient } from "@supabase/ssr";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/** true si las variables de entorno de Supabase están configuradas. */
export const supabaseEnabled = Boolean(url && anon);

let browserClient: SupabaseClient | null = null;

/** Cliente para componentes de cliente ("use client"). */
export function getBrowserSupabase(): SupabaseClient | null {
  if (!supabaseEnabled) return null;
  if (!browserClient) browserClient = createBrowserClient(url!, anon!);
  return browserClient;
}

/** Cliente para rutas API / componentes de servidor (solo lectura pública). */
export function getServerSupabase(): SupabaseClient | null {
  if (!supabaseEnabled) return null;
  return createClient(url!, anon!, { auth: { persistSession: false } });
}
