'use client';

import { useState } from 'react';
import Link from 'next/link';
import { type Product } from '@/types';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';
import ProductImage from './ProductImage';
import PriceTag from './PriceTag';
import WishlistButton from './WishlistButton';

interface ProductCardProps {
  product: Product;
}

/**
 * Estructura: los botones son HERMANOS de los enlaces, no hijos (un <button>
 * dentro de un <a> es HTML inválido y rompe foco/lectores de pantalla).
 * La imagen enlaza al producto pero sale del orden de tabulación: el enlace
 * accesible es el del nombre, así no hay dos paradas de Tab al mismo destino.
 */
export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const { addToast } = useToast();
  const [anim, setAnim] = useState<'idle' | 'adding' | 'done'>('idle');
  const href = `/producto/${product.id}`;

  const handleAdd = () => {
    if (anim !== 'idle') return;
    setAnim('adding');
    addItem(product);
    addToast(`${product.name} agregado al carrito`, 'success');
    setTimeout(() => setAnim('done'), 300);
    setTimeout(() => setAnim('idle'), 1500);
  };

  return (
    <article className="group flex flex-col">
      <div className="relative mb-3 overflow-hidden rounded-xl">
        <Link href={href} tabIndex={-1} aria-hidden="true">
          <ProductImage product={product} className="aspect-square rounded-xl" />
        </Link>

        <WishlistButton
          productId={product.id}
          productName={product.name}
          className="card-action absolute right-3 top-3 h-9 w-9 bg-surface/80 shadow-soft backdrop-blur-sm"
        />

        <button
          type="button"
          onClick={handleAdd}
          disabled={anim !== 'idle'}
          className={`card-action absolute bottom-3 right-3 flex h-10 w-10 items-center justify-center rounded-full text-on-primary shadow-soft transition-all duration-300 ${
            anim === 'idle'
              ? 'bg-primary hover:bg-primary/90'
              : anim === 'adding'
              ? 'bg-primary scale-110 opacity-100'
              : 'bg-green-500 scale-100 opacity-100'
          }`}
          aria-label={`Agregar ${product.name} al carrito`}
        >
          <span
            className={`inline-flex transition-transform duration-300 ${
              anim === 'adding' ? 'rotate-90 scale-0' : anim === 'done' ? 'scale-100' : ''
            }`}
          >
            {anim === 'done' ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            )}
          </span>
        </button>
      </div>

      {/* Nombre en la sans del cuerpo (Playfair a 16px se veía débil) y el
          precio con más peso: es lo que el comprador compara en la grilla. */}
      <h3 className="font-body text-sm font-medium leading-snug text-on-surface transition-colors group-hover:text-primary sm:text-base">
        <Link href={href}>{product.name}</Link>
      </h3>
      <PriceTag
        product={product}
        className="mt-1 font-body text-sm sm:text-base"
        priceClassName="font-semibold text-on-surface"
      />
    </article>
  );
}
