import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

async function requireEditor(supabase: ReturnType<typeof createClient>) {
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return { error: NextResponse.json({ error: 'No autorizado' }, { status: 401 }) };

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single<{ role: string }>();
  if (!profile || (profile.role !== 'admin' && profile.role !== 'editor')) {
    return { error: NextResponse.json({ error: 'No autorizado' }, { status: 403 }) };
  }
  return { user };
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('songs')
    .select('*, author:authors(id, name), category:categories(id, name, slug, color)')
    .eq('id', params.id)
    .single();

  if (error) {
    return NextResponse.json({ error: 'Canción no encontrada' }, { status: 404 });
  }
  return NextResponse.json({ song: data });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const auth = await requireEditor(supabase);
  if (auth.error) return auth.error;

  const body = await req.json();
  const { data, error } = await supabase.from('songs').update(body).eq('id', params.id).select().single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ song: data });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const auth = await requireEditor(supabase);
  if (auth.error) return auth.error;

  const { error } = await supabase.from('songs').delete().eq('id', params.id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
