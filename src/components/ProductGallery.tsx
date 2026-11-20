'use client';

import { useState } from 'react';
import Image from 'next/image';
import type { Product } from '@/types';
import ProductImage from './ProductImage';

/**
 * Galería de la ficha de producto: imagen principal + miniaturas.
 * La imagen principal es el LCP de la página, así que se carga con
 * prioridad. Con una sola imagen (o ninguna) se usa ProductImage tal cual.
 */
export default function ProductGallery({ product }: { product: Product }) {
  const images = (product.images ?? []).filter((src) => src && !src.endsWith('placeholder.svg'));
  const [active, setActive] = useState(0);

  if (images.length <= 1) {
    return <ProductImage product={product} className="aspect-square rounded-2xl" />;
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-surface-container">
        <Image
          src={images[active]}
          alt={product.name}
          fill
          sizes="(min-width: 1024px) 50vw, 100vw"
          loading="eager"
          fetchPriority="high"
          className="object-cover"
        />
      </div>
      <div className="flex gap-3" role="group" aria-label="Imágenes del producto">
        {images.map((src, i) => (
          <button
            key={src}
            type="button"
            onClick={() => setActive(i)}
            aria-pressed={i === active}
            aria-label={`Ver imagen ${i + 1} de ${images.length}`}
            className={`relative h-20 w-20 overflow-hidden rounded-lg border-2 transition-colors ${
              i === active ? 'border-primary' : 'border-transparent hover:border-outline-variant'
            }`}
          >
            <Image src={src} alt="" fill sizes="80px" className="object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}
