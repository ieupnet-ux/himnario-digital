import { getCategories } from '@/lib/data/songs';
import { CategoriesManager } from '@/components/admin/CategoriesManager';

export const metadata = { title: 'Categorías — Administración' };
export const revalidate = 0;

export default async function AdminCategoriesPage() {
  const categories = await getCategories();

  return (
    <div>
      <h1 className="mb-1 font-serif text-2xl font-bold text-navy-900">Categorías</h1>
      <p className="mb-6 text-sm text-navy-500">Gestiona las temáticas del himnario.</p>
      <CategoriesManager categories={categories} />
    </div>
  );
}
