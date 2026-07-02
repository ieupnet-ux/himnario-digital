import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';

/**
 * Extrae texto de un PDF y crea una canción por cada bloque separado por
 * una línea que empiece con "###" (delimitador recomendado), o trata todo
 * el PDF como una sola canción si no se encuentra el delimitador.
 *
 * Ejemplo de formato recomendado dentro del PDF:
 * ### Sublime Gracia
 * Sublime gracia del Señor
 * que a un infeliz salvó...
 * ### Cuán Grande Es Él
 * Señor mi Dios, al contemplar los cielos...
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

  // pdf-parse se importa dinámicamente para evitar problemas de bundling en build
  const pdfParse = (await import('pdf-parse')).default;
  const result = await pdfParse(buffer);
  const fullText = result.text;

  const blocks = fullText
    .split(/^###\s*/m)
    .map((b) => b.trim())
    .filter(Boolean);

  let inserted = 0;
  const errors: string[] = [];

  if (blocks.length === 0) {
    return NextResponse.json({ error: 'No se pudo extraer texto del PDF' }, { status: 400 });
  }

  for (const block of blocks) {
    const lines = block.split('\n').map((l) => l.trim());
    const title = lines[0]?.trim();
    const lyrics = lines.slice(1).join('\n').trim();

    if (!title || !lyrics) {
      errors.push(`Bloque omitido (sin título o letra): "${title ?? 'desconocido'}"`);
      continue;
    }

    const { error: insertError } = await supabase.from('songs').insert({
      title,
      lyrics,
      original_key: 'C',
      created_by: user.id
    });

    if (insertError) {
      errors.push(`"${title}": ${insertError.message}`);
    } else {
      inserted++;
    }
  }

  return NextResponse.json({
    inserted,
    total: blocks.length,
    errors: errors.slice(0, 20)
  });
}
