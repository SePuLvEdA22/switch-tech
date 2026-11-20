'use client';

import { useCart } from '@/context/CartContext';

export default function CartIcon() {
  const { totalItems, toggleCart } = useCart();

  return (
    <button
      type="button"
      onClick={toggleCart}
      className="relative p-2 transition-colors hover:text-primary"
      // El número del badge es decorativo; la cantidad va en la etiqueta.
      aria-label={
        totalItems > 0
          ? `Abrir carrito, ${totalItems} ${totalItems === 1 ? 'artículo' : 'artículos'}`
          : 'Abrir carrito, vacío'
      }
    >
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <path d="M16 10a4 4 0 01-8 0" />
      </svg>
      {totalItems > 0 && (
        <span aria-hidden="true" className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-on-primary">
          {totalItems > 9 ? '9+' : totalItems}
        </span>
      )}
    </button>
  );
}
