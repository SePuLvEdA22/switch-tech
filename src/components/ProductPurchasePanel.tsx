'use client';

import { useState } from 'react';
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

      <div className="mt-8 flex items-center gap-4">
        <div className="flex items-center rounded-lg border border-outline-variant">
          <button
            type="button"
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="flex h-12 w-12 items-center justify-center text-lg transition-colors hover:bg-surface-container"
            aria-label="Reducir cantidad"
          >
            -
          </button>
          <span className="flex h-12 w-12 items-center justify-center font-body text-base" aria-live="polite" aria-atomic="true">
            {quantity}
          </span>
          <button
            type="button"
            onClick={() => setQuantity(quantity + 1)}
            className="flex h-12 w-12 items-center justify-center text-lg transition-all duration-150 active:scale-90 hover:bg-surface-container"
            aria-label="Aumentar cantidad"
          >
            +
          </button>
        </div>
        <button
          onClick={handleAddToCart}
          className={`btn-primary flex-1 transition-all ${
            added ? 'bg-green-600 hover:bg-green-600' : ''
          }`}
        >
          {added ? (
            <span className="flex items-center gap-2">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Agregado
            </span>
          ) : (
            'Agregar al carrito'
          )}
        </button>
        <WishlistButton
          productId={product.id}
          productName={product.name}
          size={22}
          className="h-12 w-12 flex-shrink-0 border border-outline-variant hover:border-error"
        />
      </div>
    </>
  );
}
