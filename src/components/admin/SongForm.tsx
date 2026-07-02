'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save, Loader2, Wand2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { ALL_KEYS, extractUniqueChords } from '@/lib/chords';
import type { Category, Song } from '@/types';
import toast from 'react-hot-toast';

interface SongFormProps {
  categories: Category[];
  initialSong?: Song;
}

export function SongForm({ categories, initialSong }: SongFormProps) {
  const router = useRouter();
  const isEditing = Boolean(initialSong);

  const [title, setTitle] = useState(initialSong?.title ?? '');
  const [number, setNumber] = useState(initialSong?.number?.toString() ?? '');
  const [authorName, setAuthorName] = useState(initialSong?.author?.name ?? '');
  const [categoryId, setCategoryId] = useState(initialSong?.category_id ?? '');
  const [year, setYear] = useState(initialSong?.year?.toString() ?? '');
  const [originalKey, setOriginalKey] = useState(initialSong?.original_key ?? 'C');
  const [lyrics, setLyrics] = useState(initialSong?.lyrics ?? '');
  const [lyricsWithChords, setLyricsWithChords] = useState(initialSong?.lyrics_with_chords ?? '');
  const [sheetNotes, setSheetNotes] = useState(initialSong?.sheet_music_notes ?? '');
  const [audioUrl, setAudioUrl] = useState(initialSong?.audio_url ?? '');
  const [videoUrl, setVideoUrl] = useState(initialSong?.video_url ?? '');
  const [tags, setTags] = useState(initialSong?.tags?.join(', ') ?? '');
  const [loading, setLoading] = useState(false);

  const detectedChords = extractUniqueChords(lyricsWithChords);

  function generatePlainLyricsFromChords() {
    const clean = lyricsWithChords.replace(/\[([^\]]+)\]/g, '');
    setLyrics(clean);
    toast.success('Letra sin acordes generada automáticamente');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !lyrics.trim()) {
      toast.error('El título y la letra son obligatorios');
      return;
    }

    setLoading(true);
    const supabase = createClient();

    // Resolver / crear autor por nombre
    let authorId: string | null = null;
    if (authorName.trim()) {
      const { data: existing } = await supabase
        .from('authors')
        .select('id')
        .eq('name', authorName.trim())
        .maybeSingle();

      if (existing) {
        authorId = existing.id;
      } else {
        const { data: created, error: createError } = await supabase
          .from('authors')
          .insert({ name: authorName.trim() })
          .select('id')
          .single();
        if (createError) {
          toast.error('No se pudo crear el autor');
          setLoading(false);
          return;
        }
        authorId = created.id;
      }
    }

    const payload = {
      title: title.trim(),
      number: number ? Number(number) : null,
      author_id: authorId,
      category_id: categoryId || null,
      year: year ? Number(year) : null,
      original_key: originalKey,
      lyrics: lyrics.trim(),
      lyrics_with_chords: lyricsWithChords.trim() || null,
      sheet_music_notes: sheetNotes.trim() || null,
      audio_url: audioUrl.trim() || null,
      video_url: videoUrl.trim() || null,
      tags: tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean)
    };

    const result = isEditing
      ? await supabase.from('songs').update(payload).eq('id', initialSong!.id)
      : await supabase.from('songs').insert(payload);

    setLoading(false);

    if (result.error) {
      toast.error('Error al guardar: ' + result.error.message);
      return;
    }

    toast.success(isEditing ? 'Canción actualizada' : 'Canción creada');
    router.push('/admin/canciones');
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4 rounded-2xl border border-navy-100 bg-white p-5 shadow-card sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="mb-1 block text-xs font-medium text-navy-600">Título *</label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="Sublime Gracia" />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-navy-600">Número de himno</label>
          <Input
            type="number"
            value={number}
            onChange={(e) => setNumber(e.target.value)}
            placeholder="1"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-navy-600">Autor</label>
          <Input
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            placeholder="John Newton"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-navy-600">Categoría</label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full rounded-xl border border-navy-200 bg-white px-4 py-2.5 text-sm text-navy-800 outline-none focus:border-gold-400"
          >
            <option value="">Sin categoría</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-navy-600">Año</label>
          <Input type="number" value={year} onChange={(e) => setYear(e.target.value)} placeholder="1772" />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-navy-600">Tonalidad original *</label>
          <select
            value={originalKey}
            onChange={(e) => setOriginalKey(e.target.value)}
            className="w-full rounded-xl border border-navy-200 bg-white px-4 py-2.5 text-sm text-navy-800 outline-none focus:border-gold-400"
          >
            {ALL_KEYS.map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2">
          <label className="mb-1 block text-xs font-medium text-navy-600">Etiquetas (separadas por coma)</label>
          <Input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="gracia, salvación, perdón" />
        </div>
      </div>

      <div className="rounded-2xl border border-navy-100 bg-white p-5 shadow-card">
        <div className="mb-2 flex items-center justify-between">
          <label className="block text-xs font-medium text-navy-600">
            Letra con acordes (formato: <code className="rounded bg-navy-50 px-1">[Am]Cristo es la roca</code>)
          </label>
          {lyricsWithChords && (
            <button
              type="button"
              onClick={generatePlainLyricsFromChords}
              className="flex items-center gap-1 text-xs font-medium text-gold-600 hover:text-gold-700"
            >
              <Wand2 className="h-3.5 w-3.5" /> Generar letra simple desde esto
            </button>
          )}
        </div>
        <textarea
          value={lyricsWithChords}
          onChange={(e) => setLyricsWithChords(e.target.value)}
          rows={8}
          placeholder={'[G]Sublime gracia del [D]Señor\n[Em]Que a un infeliz [C]salvó'}
          className="w-full rounded-xl border border-navy-200 bg-white px-4 py-3 font-mono text-sm text-navy-800 outline-none focus:border-gold-400"
        />
        {detectedChords.length > 0 && (
          <p className="mt-2 text-xs text-navy-400">
            Acordes detectados: <span className="font-medium text-navy-600">{detectedChords.join(', ')}</span>
          </p>
        )}
      </div>

      <div className="rounded-2xl border border-navy-100 bg-white p-5 shadow-card">
        <label className="mb-2 block text-xs font-medium text-navy-600">Letra completa (texto plano) *</label>
        <textarea
          value={lyrics}
          onChange={(e) => setLyrics(e.target.value)}
          rows={8}
          required
          placeholder={'Sublime gracia del Señor\nQue a un infeliz salvó'}
          className="w-full rounded-xl border border-navy-200 bg-white px-4 py-3 text-sm text-navy-800 outline-none focus:border-gold-400"
        />
      </div>

      <div className="grid gap-4 rounded-2xl border border-navy-100 bg-white p-5 shadow-card sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-navy-600">Enlace de audio</label>
          <Input
            value={audioUrl}
            onChange={(e) => setAudioUrl(e.target.value)}
            placeholder="https://…/audio.mp3"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-navy-600">Enlace de video (YouTube)</label>
          <Input
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="https://youtube.com/watch?v=…"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1 block text-xs font-medium text-navy-600">Notas musicales (opcional)</label>
          <textarea
            value={sheetNotes}
            onChange={(e) => setSheetNotes(e.target.value)}
            rows={3}
            placeholder="Indicaciones de tempo, dinámica, arreglos…"
            className="w-full rounded-xl border border-navy-200 bg-white px-4 py-3 text-sm text-navy-800 outline-none focus:border-gold-400"
          />
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="ghost" onClick={() => router.back()}>
          Cancelar
        </Button>
        <Button type="submit" variant="gold" disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {isEditing ? 'Guardar cambios' : 'Crear canción'}
        </Button>
      </div>
    </form>
  );
}
