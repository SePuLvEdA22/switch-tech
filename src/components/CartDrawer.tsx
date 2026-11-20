'use client';

import { useEffect, useRef, type MouseEvent } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/format-price';
import ProductImage from './ProductImage';
import PriceTag from './PriceTag';

/** `closedby` aún no está en los tipos de React; se pasa como atributo. */
const LIGHT_DISMISS = { closedby: 'any' } as Record<string, string>;

/**
 * Drawer del carrito como <dialog> modal nativo (showModal):
 * el navegador hace página inerte, foco contenido, Esc, gesto "atrás" y
 * devuelve el foco al botón que lo abrió. Sin focus trap ni overflow:hidden
 * en <body> hechos a mano. Estilos y animación en `.cart-drawer` (globals.css).
 */
export default function CartDrawer() {
  const { items, isOpen, toggleCart, removeItem, updateQuantity, totalPrice } = useCart();
  const dialogRef = useRef<HTMLDialogElement>(null);

  // El estado del contexto manda; el <dialog> se sincroniza con él.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (isOpen && !dialog.open) dialog.showModal();
    else if (!isOpen && dialog.open) dialog.close();
  }, [isOpen]);

  // Si el navegador lo cerró (Esc, clic fuera), reflejarlo en el contexto.
  const handleClose = () => {
    if (isOpen) toggleCart();
  };

  // Fallback de light dismiss para navegadores sin `closedby` (Safari):
  // se compara la posición del puntero, no el target (el padding del
  // <dialog> también tiene como target al propio dialog).
  const handleBackdropClick = (e: MouseEvent<HTMLDialogElement>) => {
    if ('closedBy' in HTMLDialogElement.prototype) return;
    if (e.target !== e.currentTarget) return;
    const r = e.currentTarget.getBoundingClientRect();
    const inside = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
    if (!inside) e.currentTarget.close();
  };

  return (
    <dialog
      ref={dialogRef}
      {...LIGHT_DISMISS}
      aria-labelledby="cart-drawer-title"
      className="cart-drawer"
      onClose={handleClose}
      onClick={handleBackdropClick}
    >
        <div className="flex items-center justify-between border-b border-outline-variant px-6 py-4">
          <h2 id="cart-drawer-title" className="font-heading text-xl font-medium">Carrito</h2>
          <button
            onClick={toggleCart}
            className="p-2 transition-colors hover:text-primary"
            aria-label="Cerrar carrito"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-outline" aria-hidden="true">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 01-8 0" />
            </svg>
            <p className="text-on-surface-variant">Tu carrito está vacío</p>
            <button onClick={toggleCart} className="btn-primary">
              Seguir comprando
            </button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <ul className="flex flex-col gap-4">
                {items.map((item) => (
                  <li key={`${item.product.id}-${item.selectedColor}`}>
                    <div className="flex gap-4 rounded-xl bg-surface-container-low p-3">
                      <ProductImage product={item.product} className="h-20 w-20 flex-shrink-0 rounded-lg" />
                      <div className="flex flex-1 flex-col justify-between">
                        <div>
                          <h3 className="font-body text-sm font-medium text-on-surface">
                            {item.product.name}
                          </h3>
                          {item.selectedColor && (
                            <p className="font-body text-xs text-on-surface-variant">
                              Color: {item.selectedColor}
                            </p>
                          )}
                          <PriceTag product={item.product} className="mt-1 font-body text-sm" />
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() =>
                                updateQuantity(item.product.id, item.quantity - 1, item.selectedColor)
                              }
                              className="flex h-7 w-7 items-center justify-center rounded-md border border-outline-variant text-sm transition-all duration-150 active:scale-90 hover:bg-surface-container"
                              aria-label="Disminuir cantidad"
                            >
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                                <line x1="5" y1="12" x2="19" y2="12" />
                              </svg>
                            </button>
                            <span className="w-6 text-center font-body text-sm" aria-live="polite" aria-label={`Cantidad: ${item.quantity}`}>
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                updateQuantity(item.product.id, item.quantity + 1, item.selectedColor)
                              }
                              className="flex h-7 w-7 items-center justify-center rounded-md border border-outline-variant text-sm transition-all duration-150 active:scale-90 hover:bg-surface-container"
                              aria-label="Aumentar cantidad"
                            >
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                                <line x1="12" y1="5" x2="12" y2="19" />
                                <line x1="5" y1="12" x2="19" y2="12" />
                              </svg>
                            </button>
                          </div>
                          <button
                            onClick={() => removeItem(item.product.id, item.selectedColor)}
                            className="text-sm text-outline transition-colors hover:text-error"
                            aria-label={`Eliminar ${item.product.name}`}
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="border-t border-outline-variant px-6 py-4">
              <div className="mb-4 flex items-center justify-between">
                <span className="font-body text-base text-on-surface">Total</span>
                <span className="font-heading text-xl font-medium text-primary">
                  {formatPrice(totalPrice)}
                </span>
              </div>
              <div className="flex flex-col gap-2">
                <Link href="/checkout" onClick={toggleCart} className="btn-primary w-full">
                  Pagar
                </Link>
                <Link href="/carrito" onClick={toggleCart} className="btn-secondary w-full">
                  Ver carrito
                </Link>
              </div>
            </div>
          </>
        )}
    </dialog>
  );
}
