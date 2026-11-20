'use client';

import { useState } from 'react';
import Link from 'next/link';
import { type Product } from '@/types';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';
import { productSpecs } from '@/lib/product-specs';
import ProductImage from './ProductImage';
import PriceTag from './PriceTag';
import WishlistButton from './WishlistButton';

interface ProductCardProps {
  product: Product;
}

/**
 * Tarjeta de producto. Estructura: los botones son HERMANOS de los enlaces,
 * no hijos (un <button> dentro de un <a> es HTML inválido). La imagen enlaza
 * al producto pero sale del orden de tabulación: el enlace accesible es el
 * del nombre. Favorito y agregar están siempre visibles (también en táctil).
 */
export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const { addToast } = useToast();
  const [anim, setAnim] = useState<'idle' | 'adding' | 'done'>('idle');
  const href = `/producto/${product.id}`;
  const specs = productSpecs(product.name);

  const handleAdd = () => {
    if (anim !== 'idle') return;
    setAnim('adding');
    // Mismo color por defecto que la ficha (el primero), para no crear dos
    // líneas distintas en el carrito para el mismo producto.
    addItem(product, 1, product.colors?.[0]);
    addToast(`${product.name} agregado al carrito`, 'success');
    setTimeout(() => setAnim('done'), 300);
    setTimeout(() => setAnim('idle'), 1500);
  };

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest transition-shadow hover:shadow-soft">
      <div className="relative">
        <Link href={href} tabIndex={-1} aria-hidden="true">
          <ProductImage product={product} className="aspect-square bg-surface-container-low" />
        </Link>
        <WishlistButton
          productId={product.id}
          productName={product.name}
          className="absolute right-3 top-3 h-11 w-11 bg-surface-container-lowest/90 backdrop-blur-sm"
        />
      </div>

      <div className="flex flex-1 flex-col gap-2.5 p-3.5 sm:p-4">
        {specs.length > 0 && (
          <ul className="flex flex-wrap gap-1.5" aria-label="Características">
            {specs.map((spec) => (
              <li key={spec} className="chip">
                {spec}
              </li>
            ))}
          </ul>
        )}
        <h3 className="font-body text-[15px] font-medium leading-snug tracking-normal text-on-surface [font-stretch:100%] sm:text-base">
          <Link href={href} className="transition-colors hover:text-primary">
            {product.name}
          </Link>
        </h3>
        <div className="mt-auto flex items-center justify-between gap-2">
          {/* En móvil la tarjeta mide ~165px: precio en 14px sin cortar
              ("349.000 COP" en una línea) y botón de 40px. */}
          <PriceTag
            product={product}
            className="flex min-w-0 flex-col whitespace-nowrap font-body text-sm tabular-nums sm:text-[17px]"
            priceClassName="font-bold text-on-surface"
          />
          <button
            type="button"
            onClick={handleAdd}
            disabled={anim !== 'idle'}
            className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-on-primary transition-all duration-300 sm:h-11 sm:w-11 ${
              anim === 'done' ? 'bg-green-600' : 'bg-primary hover:bg-primary-hover'
            } ${anim === 'adding' ? 'scale-110' : ''}`}
            aria-label={`Agregar ${product.name} al carrito`}
          >
            <span
              className={`inline-flex transition-transform duration-300 ${
                anim === 'adding' ? 'rotate-90 scale-0' : ''
              }`}
            >
              {anim === 'done' ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" aria-hidden="true">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              )}
            </span>
          </button>
        </div>
      </div>
    </article>
  );
}
