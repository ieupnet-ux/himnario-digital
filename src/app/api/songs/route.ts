import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  const supabase = createClient();
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q');
  const category = searchParams.get('category');
  const limit = Number(searchParams.get('limit') ?? '50');

  let query = supabase
    .from('songs')
    .select('*, author:authors(id, name), category:categories(id, name, slug, color)')
    .limit(Math.min(limit, 200));

  if (q) {
    const isNumeric = /^\d+$/.test(q);
    query = isNumeric ? query.eq('number', Number(q)) : query.ilike('title', `%${q}%`);
  }
  if (category) {
    query = query.eq('category_id', category);
  }

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ songs: data });
}

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single<{ role: string }>();
  if (!profile || (profile.role !== 'admin' && profile.role !== 'editor')) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  const body = await req.json();
  if (!body.title || !body.lyrics) {
    return NextResponse.json({ error: 'title y lyrics son obligatorios' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('songs')
    .insert({ ...body, created_by: user.id })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ song: data }, { status: 201 });
}
