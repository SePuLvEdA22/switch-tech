'use client';

import { useCart } from '@/context/CartContext';

/** Botón del carrito en píldora (acción principal del header) con la cantidad visible. */
export default function CartIcon() {
  const { totalItems, toggleCart } = useCart();

  return (
    <button
      type="button"
      onClick={toggleCart}
      className="flex h-11 items-center gap-2 rounded-full bg-primary px-4 font-body text-[15px] font-semibold text-on-primary transition-colors hover:bg-primary-hover"
      // El número es visible pero va también en la etiqueta para lectores de pantalla.
      aria-label={
        totalItems > 0
          ? `Abrir carrito, ${totalItems} ${totalItems === 1 ? 'artículo' : 'artículos'}`
          : 'Abrir carrito, vacío'
      }
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <path d="M16 10a4 4 0 01-8 0" />
      </svg>
      <span aria-hidden="true" className="tabular-nums">
        {totalItems > 99 ? '99+' : totalItems}
      </span>
    </button>
  );
}
