import type { Metadata } from 'next';
import Link from 'next/link';
import * as Icons from 'lucide-react';
import { Music } from 'lucide-react';
import { getCategories } from '@/lib/data/songs';

export const metadata: Metadata = {
  title: 'Categorías',
  description: 'Explora los himnos organizados por temática: adoración, alabanza, evangelización, Santa Cena, Navidad y más.'
};

export const revalidate = 300;

export default async function CategoriasPage() {
  const categories = await getCategories();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="font-serif text-2xl font-bold text-navy-900 sm:text-3xl">Categorías</h1>
        <p className="mt-1 text-sm text-navy-500">Explora el himnario organizado por temática.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => {
          const IconComponent = (Icons as any)[category.icon ?? 'Music'] ?? Music;
          return (
            <Link
              key={category.id}
              href={`/categorias/${category.slug}`}
              className="group flex items-start gap-4 rounded-2xl border border-navy-100 bg-white p-5 shadow-card transition-all hover:-translate-y-0.5 hover:shadow-card-hover"
            >
              <span
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-white"
                style={{ backgroundColor: category.color ?? '#162548' }}
              >
                <IconComponent className="h-6 w-6" />
              </span>
              <div>
                <h2 className="font-serif text-lg font-semibold text-navy-900 group-hover:text-navy-700">
                  {category.name}
                </h2>
                {category.description && (
                  <p className="mt-1 text-sm text-navy-500">{category.description}</p>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
