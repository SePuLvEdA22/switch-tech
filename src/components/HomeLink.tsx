'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { MouseEvent, ReactNode } from 'react';

/**
 * Enlace al inicio (logo del header y del footer).
 *
 * En el App Router, un <Link> a la misma URL no cambia de ruta y Next no
 * sube el scroll: en el home el logo "no hacía nada". Si ya estamos en "/",
 * subimos al comienzo nosotros. El scroll es suave solo si el usuario no pidió
 * reducir el movimiento (lo decide `scroll-behavior` en globals.css).
 */
export default function HomeLink({ className, children }: { className?: string; children: ReactNode }) {
  const pathname = usePathname();

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    // Respetar Ctrl/Cmd/Shift/clic medio: abrir en otra pestaña o ventana.
    if (pathname !== '/' || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    window.scrollTo({ top: 0 });
    // El foco sube con la vista: quien navega con teclado sigue desde arriba
    // y no queda en un enlace del footer que ya no se ve.
    document.querySelector<HTMLElement>('header a[href="/"]')?.focus({ preventScroll: true });
  };

  return (
    <Link href="/" onClick={handleClick} className={className}>
      {children}
    </Link>
  );
}
