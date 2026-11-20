'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Product } from '@/types';
import ProductCard from '@/components/ProductCard';

export interface SwitchCategory {
  id: string;
  label: string;
  href: string;
  /** Texto del mosaico final, p. ej. "Ver todos los termos". */
  allLabel: string;
  total: number;
  products: Product[];
}

/**
 * «El switch»: selector de categoría con forma de interruptor. La perilla
 * ámbar marca la categoría elegida y la vitrina muestra sus productos.
 * Es un grupo de botones toggle (aria-pressed): cambia el contenido de esta
 * misma página, no navega. Cada categoría completa sigue en su enlace.
 */
export default function HomeSwitch({ categories }: { categories: SwitchCategory[] }) {
  const [activeId, setActiveId] = useState(categories[0]?.id);
  const active = categories.find((c) => c.id === activeId) ?? categories[0];

  if (!active) return null;

  return (
    <div className="flex flex-col gap-6 md:gap-8">
      {/* Scroll horizontal en móvil si las 4 opciones no caben. */}
      <div className="-mx-5 overflow-x-auto px-5 md:mx-0 md:px-0">
        <div
          role="group"
          aria-label="Elige una categoría"
          className="inline-flex gap-1 whitespace-nowrap rounded-full bg-primary p-1.5"
        >
          {categories.map((cat) => {
            const on = cat.id === active.id;
            return (
              <button
                key={cat.id}
                type="button"
                aria-pressed={on}
                aria-controls="switch-shelf"
                onClick={() => setActiveId(cat.id)}
                className={`h-11 rounded-full px-4 font-body text-[15px] font-semibold transition-colors duration-200 md:h-[52px] md:px-6 md:text-base ${
                  on ? 'bg-accent text-on-accent' : 'text-on-primary hover:bg-on-primary/10'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      <div id="switch-shelf" className="product-grid">
        {active.products.slice(0, 3).map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
        <Link
          href={active.href}
          className="flex min-h-48 flex-col justify-between gap-6 rounded-xl bg-primary-container p-5 text-on-primary-container transition-colors hover:bg-primary-fixed md:p-6"
        >
          <span className="font-heading text-2xl font-bold leading-tight md:text-3xl">{active.allLabel}</span>
          <span className="flex items-center justify-between font-body text-[15px] font-semibold">
            {active.total} {active.total === 1 ? 'producto' : 'productos'}
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </span>
        </Link>
      </div>
    </div>
  );
}
