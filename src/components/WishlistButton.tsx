'use client';

import { useWishlist } from '@/lib/use-wishlist';
import { useToast } from '@/context/ToastContext';

interface WishlistButtonProps {
  productId: string;
  productName: string;
  className?: string;
  /** Tamaño del ícono en px. */
  size?: number;
}

/**
 * Botón de alternancia para favoritos. Usa aria-pressed (botón toggle):
 * la etiqueta se mantiene fija y el estado lo anuncia el lector de pantalla.
 */
export default function WishlistButton({
  productId,
  productName,
  className = '',
  size = 18,
}: WishlistButtonProps) {
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { addToast } = useToast();
  const saved = isInWishlist(productId);

  const toggle = () => {
    if (saved) {
      removeFromWishlist(productId);
      addToast(`${productName} eliminado de favoritos`, 'info');
    } else {
      addToWishlist(productId);
      addToast(`${productName} agregado a favoritos`, 'success');
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={saved}
      aria-label={`Guardar ${productName} en favoritos`}
      className={`flex items-center justify-center rounded-full transition-[transform,color,opacity] duration-200 hover:scale-110 active:scale-95 ${
        saved ? 'text-error' : 'text-on-surface-variant hover:text-error'
      } ${className}`}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill={saved ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
      </svg>
    </button>
  );
}
