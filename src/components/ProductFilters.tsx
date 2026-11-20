'use client';

import { useState, useMemo } from 'react';
import { type Product } from '@/types';
import ProductCard from './ProductCard';

type SortKey = 'default' | 'price-asc' | 'price-desc' | 'name';

interface ProductFiltersProps {
  products: Product[];
  title?: string;
}

export default function ProductFilters({ products, title }: ProductFiltersProps) {
  const [sortBy, setSortBy] = useState<SortKey>('default');

  const sorted = useMemo(() => {
    const list = [...products];
    switch (sortBy) {
      case 'price-asc':
        return list.sort((a, b) => a.price - b.price);
      case 'price-desc':
        return list.sort((a, b) => b.price - a.price);
      case 'name':
        return list.sort((a, b) => a.name.localeCompare(b.name));
      default:
        return list;
    }
  }, [products, sortBy]);

  if (products.length === 0) {
    return (
      <section className="section-gap">
        {title && (
          <h2 className="mb-8 font-heading text-3xl font-bold text-on-surface md:text-4xl">
            {title}
          </h2>
        )}
        <div className="rounded-2xl bg-surface-container py-16 text-center">
          <p className="font-body text-lg text-on-surface-variant">
            No hay productos en esta categoría
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="section-gap">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        {title && (
          <h2 className="font-heading text-3xl font-bold text-on-surface md:text-4xl">
            {title}
          </h2>
        )}
        <div className="flex items-center gap-3">
          {/* <select> nativo: teclado, lectores de pantalla y picker móvil gratis. */}
          <label htmlFor="sort-products" className="sr-only">
            Ordenar por
          </label>
          <select
            id="sort-products"
            name="sort"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortKey)}
            className="input-field w-auto py-2 pl-3"
          >
            <option value="default">Relevancia</option>
            <option value="price-asc">Precio: menor a mayor</option>
            <option value="price-desc">Precio: mayor a menor</option>
            <option value="name">Nombre: A-Z</option>
          </select>
          <span className="font-body text-sm text-on-surface-variant">
            {products.length} producto{products.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>
      <div className="product-grid animate-stagger">
        {sorted.map((product) => (
          <div key={product.id}>
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </section>
  );
}
