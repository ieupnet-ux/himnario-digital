import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';

/**
 * Espera un archivo .xlsx/.csv con columnas (insensible a mayúsculas):
 * numero | titulo | autor | categoria | anio | tonalidad | letra | letra_acordes | tags
 *
 * Solo "titulo" y "letra" son obligatorios.
 */
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

  const formData = await req.formData();
  const file = formData.get('file') as File | null;
  if (!file) {
    return NextResponse.json({ error: 'No se envió ningún archivo' }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows: Record<string, unknown>[] = XLSX.utils.sheet_to_json(sheet, { defval: '' });

  if (rows.length === 0) {
    return NextResponse.json({ error: 'El archivo no contiene filas' }, { status: 400 });
  }

  // Normaliza claves de columnas (minúsculas, sin tildes/espacios)
  function normalizeKey(key: string) {
    return key
      .toString()
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '_');
  }

  const { data: categories } = await supabase.from('categories').select('id, name').returns<{ id: string; name: string }[]>();
  const categoryMap = new Map((categories ?? []).map((c) => [c.name.toLowerCase().trim(), c.id]));

 const { data: authors } = await supabase.from('authors').select('id, name').returns<{ id: string; name: string }[]>();
  const authorMap = new Map((authors ?? []).map((a) => [a.name.toLowerCase().trim(), a.id]));

  let inserted = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const [index, rawRow] of rows.entries()) {
    const row: Record<string, unknown> = {};
    for (const key of Object.keys(rawRow)) {
      row[normalizeKey(key)] = rawRow[key];
    }

    const title = String(row.titulo ?? row.title ?? '').trim();
    const lyrics = String(row.letra ?? row.lyrics ?? '').trim();

    if (!title || !lyrics) {
      skipped++;
      errors.push(`Fila ${index + 2}: falta título o letra, se omitió.`);
      continue;
    }

    let authorId: string | null = null;
    const authorName = String(row.autor ?? row.author ?? '').trim();
    if (authorName) {
      const key = authorName.toLowerCase();
      if (authorMap.has(key)) {
        authorId = authorMap.get(key)!;
      } else {
        const { data: createdAuthor } = await supabase
          .from('authors')
          .insert({ name: authorName })
          .select('id')
          .single();
        if (createdAuthor) {
          authorId = createdAuthor.id;
          authorMap.set(key, createdAuthor.id);
        }
      }
    }

    let categoryId: string | null = null;
    const categoryName = String(row.categoria ?? row.category ?? '').trim();
    if (categoryName && categoryMap.has(categoryName.toLowerCase())) {
      categoryId = categoryMap.get(categoryName.toLowerCase())!;
    }

    const tagsRaw = String(row.tags ?? row.etiquetas ?? '').trim();
    const tags = tagsRaw
      ? tagsRaw
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean)
      : [];

    const { error: insertError } = await supabase.from('songs').insert({
      title,
      number: row.numero || row.number ? Number(row.numero ?? row.number) : null,
      author_id: authorId,
      category_id: categoryId,
      year: row.anio || row.year ? Number(row.anio ?? row.year) : null,
      original_key: String(row.tonalidad ?? row.key ?? 'C').trim() || 'C',
      lyrics,
      lyrics_with_chords: String(row.letra_acordes ?? row.lyrics_with_chords ?? '').trim() || null,
      tags,
      created_by: user.id
    });

    if (insertError) {
      skipped++;
      errors.push(`Fila ${index + 2}: ${insertError.message}`);
    } else {
      inserted++;
    }
  }

  return NextResponse.json({
    inserted,
    skipped,
    total: rows.length,
    errors: errors.slice(0, 20)
  });
}
