'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, Pencil, Check, X } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { slugify } from '@/lib/utils';
import type { Category } from '@/types';
import toast from 'react-hot-toast';

export function CategoriesManager({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState('#162548');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;

    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.from('categories').insert({
      name: newName.trim(),
      slug: slugify(newName.trim()),
      color: newColor,
      display_order: categories.length + 1
    });
    setLoading(false);

    if (error) {
      toast.error('No se pudo crear la categoría');
      return;
    }
    toast.success('Categoría creada');
    setNewName('');
    router.refresh();
  }

  async function handleUpdate(id: string) {
    if (!editName.trim()) return;
    const supabase = createClient();
    const { error } = await supabase
      .from('categories')
      .update({ name: editName.trim(), slug: slugify(editName.trim()) })
      .eq('id', id);

    if (error) {
      toast.error('No se pudo actualizar');
      return;
    }
    toast.success('Categoría actualizada');
    setEditingId(null);
    router.refresh();
  }

  async function handleDelete(id: string) {
    const supabase = createClient();
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) {
      toast.error('No se pudo eliminar (puede tener canciones asociadas)');
      return;
    }
    toast.success('Categoría eliminada');
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleCreate} className="flex flex-wrap items-end gap-3 rounded-2xl border border-navy-100 bg-white p-5 shadow-card">
        <div className="flex-1 min-w-[200px]">
          <label className="mb-1 block text-xs font-medium text-navy-600">Nueva categoría</label>
          <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Ej: Restauración" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-navy-600">Color</label>
          <input
            type="color"
            value={newColor}
            onChange={(e) => setNewColor(e.target.value)}
            className="h-11 w-14 rounded-lg border border-navy-200"
          />
        </div>
        <Button type="submit" variant="gold" disabled={loading}>
          <Plus className="h-4 w-4" /> Agregar
        </Button>
      </form>

      <div className="overflow-hidden rounded-2xl border border-navy-100 bg-white shadow-card">
        <table className="w-full text-sm">
          <thead className="border-b border-navy-100 bg-navy-50 text-left text-xs font-semibold uppercase tracking-wide text-navy-500">
            <tr>
              <th className="px-4 py-3">Categoría</th>
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-navy-50">
            {categories.map((cat) => (
              <tr key={cat.id} className="hover:bg-navy-50/50">
                <td className="px-4 py-3">
                  {editingId === cat.id ? (
                    <Input value={editName} onChange={(e) => setEditName(e.target.value)} className="h-8" />
                  ) : (
                    <span className="flex items-center gap-2 font-medium text-navy-900">
                      <span
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: cat.color ?? '#162548' }}
                      />
                      {cat.name}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-navy-400">{cat.slug}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1.5">
                    {editingId === cat.id ? (
                      <>
                        <button
                          onClick={() => handleUpdate(cat.id)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-green-600 hover:bg-green-50"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-navy-400 hover:bg-navy-100"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => {
                            setEditingId(cat.id);
                            setEditName(cat.name);
                          }}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-navy-500 hover:bg-navy-100"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(cat.id)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-navy-500 hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
