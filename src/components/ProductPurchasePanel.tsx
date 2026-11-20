'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';
import type { Product } from '@/lib/models';
import WishlistButton from './WishlistButton';

/**
 * Isla de cliente de la página de producto: selector de color, cantidad y
 * agregar al carrito. Todo lo demás en la página se renderiza en el servidor.
 */
export default function ProductPurchasePanel({ product }: { product: Product }) {
  const { addItem } = useCart();
  const { addToast } = useToast();
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const handleAddToCart = () => {
    // Sin elección explícita se usa el primer color, que es el que se muestra marcado.
    addItem(product, quantity, selectedColor || product.colors?.[0]);
    addToast(`${product.name} agregado al carrito`, 'success');
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <>
      {product.colors && product.colors.length > 0 && (
        // Elegir un color es una opción única: grupo de radios nativos con
        // aspecto de botón (antes eran botones sin estado accesible).
        <fieldset className="mt-8">
          <legend className="mb-3 font-body text-xs font-medium uppercase tracking-wider text-on-surface-variant">
            Color: <span className="text-on-surface">{selectedColor || product.colors[0]}</span>
          </legend>
          <div className="flex flex-wrap gap-2">
            {product.colors.map((color) => (
              <label
                key={color}
                className="cursor-pointer rounded-lg border border-outline-variant px-4 py-2 font-body text-sm text-on-surface-variant transition-all hover:border-primary has-[:checked]:border-primary has-[:checked]:bg-primary has-[:checked]:text-on-primary has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-primary"
              >
                <input
                  type="radio"
                  name={`color-${product.id}`}
                  value={color}
                  checked={(selectedColor || product.colors![0]) === color}
                  onChange={() => setSelectedColor(color)}
                  className="sr-only"
                />
                {color}
              </label>
            ))}
          </div>
        </fieldset>
      )}

      {/*
        Móvil: cantidad y favorito en una fila, botón a todo el ancho debajo
        (antes se apretaba entre ambos y el texto se partía en 3 líneas).
        Desde sm: todo en una fila con el botón ocupando el espacio libre.
      */}
      <div className="mt-8 flex flex-wrap items-center gap-3 sm:flex-nowrap sm:gap-4">
        <div className="flex items-center rounded-lg border border-outline-variant">
          <button
            type="button"
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            disabled={quantity <= 1}
            className="flex h-12 w-12 items-center justify-center transition-colors hover:bg-surface-container disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Reducir cantidad"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
          <span className="flex h-12 w-10 items-center justify-center font-body text-base tabular-nums" aria-live="polite" aria-atomic="true">
            {quantity}
          </span>
          <button
            type="button"
            onClick={() => setQuantity(quantity + 1)}
            className="flex h-12 w-12 items-center justify-center transition-colors hover:bg-surface-container"
            aria-label="Aumentar cantidad"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
        </div>
        <WishlistButton
          productId={product.id}
          productName={product.name}
          size={22}
          className="order-2 ml-auto h-12 w-12 flex-shrink-0 border border-outline-variant hover:border-error sm:order-3 sm:ml-0"
        />
        <button
          type="button"
          onClick={handleAddToCart}
          className={`btn-primary order-3 h-12 w-full whitespace-nowrap sm:order-2 sm:w-auto sm:flex-1 ${
            added ? 'bg-green-600 hover:bg-green-600' : ''
          }`}
        >
          {added ? (
            <span className="flex items-center gap-2">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Agregado
            </span>
          ) : (
            'Agregar al carrito'
          )}
        </button>
      </div>

      {/* Información de compra junto al botón. Solo datos que la tienda ya
          publica en /envios y /devoluciones y medios de pago reales. */}
      <ul className="mt-8 flex flex-col gap-3 border-t border-outline-variant/50 pt-6 font-body text-sm text-on-surface-variant">
        <li className="flex items-start gap-3">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 flex-shrink-0 text-primary" aria-hidden="true">
            <rect x="1" y="3" width="15" height="13" />
            <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
            <circle cx="5.5" cy="18.5" r="2.5" />
            <circle cx="18.5" cy="18.5" r="2.5" />
          </svg>
          <span>
            Envíos a toda Colombia.{' '}
            <Link href="/envios" className="text-on-surface underline underline-offset-2 hover:text-primary">
              Ver tiempos de entrega
            </Link>
          </span>
        </li>
        <li className="flex items-start gap-3">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 flex-shrink-0 text-primary" aria-hidden="true">
            <polyline points="1 4 1 10 7 10" />
            <path d="M3.51 15a9 9 0 102.13-9.36L1 10" />
          </svg>
          <span>
            Devoluciones hasta 30 días después de la entrega.{' '}
            <Link href="/devoluciones" className="text-on-surface underline underline-offset-2 hover:text-primary">
              Cómo devolver
            </Link>
          </span>
        </li>
        <li className="flex items-start gap-3">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 flex-shrink-0 text-primary" aria-hidden="true">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0110 0v4" />
          </svg>
          <span>Pago seguro con Mercado Pago: tarjeta o PSE.</span>
        </li>
      </ul>
    </>
  );
}
