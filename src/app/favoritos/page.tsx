'use client';

import { useState, useEffect, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { useWishlist } from '@/lib/use-wishlist';
import type { Product } from '@/types';
import ProductCard from '@/components/ProductCard';

const noopSubscribe = () => () => {};

/** false en SSR y en la hidratación; true después. Evita mostrar "vacío" antes de leer localStorage. */
function useHydrated() {
  return useSyncExternalStore(noopSubscribe, () => true, () => false);
}

function GridSkeleton({ count }: { count: number }) {
  return (
    <div className="product-grid" aria-busy="true">
      <span className="sr-only" role="status">Cargando favoritos…</span>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} aria-hidden="true">
          <div className="mb-3 aspect-square rounded-xl bg-surface-container-high animate-pulse" />
          <div className="h-5 w-3/4 rounded bg-surface-container-high animate-pulse" />
          <div className="mt-2 h-4 w-1/4 rounded bg-surface-container-high animate-pulse" />
        </div>
      ))}
    </div>
  );
}

/**
 * Los favoritos viven en localStorage (por navegador), así que no requieren
 * sesión. Se piden a la API solo los productos guardados (?ids=), no el catálogo.
 */
export default function FavoritosPage() {
  const hydrated = useHydrated();
  const { wishlist } = useWishlist();
  // Productos cargados por id. Al quitar un favorito se filtra en memoria,
  // sin volver a pedir nada.
  const [loaded, setLoaded] = useState<{ key: string; products: Product[] } | null>(null);

  // Se pide al hidratar y cuando aparece un id nunca pedido (p. ej. agregado
  // en otra pestaña). Quitar favoritos no dispara pedidos.
  const requested = new Set(loaded?.key.split(','));
  const needsFetch = hydrated && wishlist.some((w) => !requested.has(w.productId));
  const requestKey = needsFetch ? wishlist.map((w) => w.productId).join(',') : '';

  useEffect(() => {
    if (!requestKey) return;
    let cancelled = false;
    fetch(`/api/products?ids=${encodeURIComponent(requestKey)}`)
      .then((res) => (res.ok ? res.json() : Promise.reject(res)))
      .then((data) => {
        if (!cancelled) setLoaded({ key: requestKey, products: data.products ?? [] });
      })
      .catch(() => {
        if (!cancelled) setLoaded({ key: requestKey, products: [] });
      });
    return () => {
      cancelled = true;
    };
  }, [requestKey]);

  const savedIds = new Set(wishlist.map((w) => w.productId));
  const favorites = (loaded?.products ?? []).filter((p) => savedIds.has(p.id));
  const loading = !hydrated || requestKey !== '';

  return (
    <div className="container-store py-12 animate-fade-in">
      <h1 className="mb-2 font-heading text-4xl font-medium text-on-surface md:text-5xl">Favoritos</h1>
      <p className="mb-10 font-body text-base text-on-surface-variant">
        Tus productos favoritos, guardados en este navegador.
      </p>

      {loading && <GridSkeleton count={Math.min(Math.max(wishlist.length, 2), 4)} />}

      {!loading && favorites.length === 0 && (
        <div className="rounded-2xl bg-surface-container py-16 text-center">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mx-auto text-outline" aria-hidden="true">
            <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
          </svg>
          <p className="mt-4 font-body text-lg text-on-surface-variant">No tienes favoritos aún</p>
          <p className="mt-1 font-body text-sm text-on-surface-variant">
            Toca el corazón de cualquier producto para guardarlo aquí.
          </p>
          <Link href="/fundas" className="btn-primary mt-6 inline-block">
            Explorar productos
          </Link>
        </div>
      )}

      {!loading && favorites.length > 0 && (
        <div className="product-grid animate-stagger">
          {favorites.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
