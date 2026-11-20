/**
 * Placeholder mientras el carrito se restaura desde localStorage.
 * Ocupa aproximadamente lo mismo que el contenido real para evitar saltos (CLS).
 */
export default function CartSkeleton({ rows = 2 }: { rows?: number }) {
  return (
    <div className="grid gap-8 lg:grid-cols-3" aria-busy="true">
      <span className="sr-only" role="status">Cargando carrito…</span>
      <ul className="flex flex-col gap-4 lg:col-span-2" aria-hidden="true">
        {Array.from({ length: rows }).map((_, i) => (
          <li key={i} className="flex gap-6 rounded-2xl bg-surface-container-low p-4">
            <div className="h-24 w-24 flex-shrink-0 rounded-xl bg-surface-container-high animate-pulse" />
            <div className="flex flex-1 flex-col gap-2 py-1">
              <div className="h-5 w-2/3 rounded bg-surface-container-high animate-pulse" />
              <div className="h-4 w-1/4 rounded bg-surface-container-high animate-pulse" />
            </div>
          </li>
        ))}
      </ul>
      <div className="h-64 rounded-2xl bg-surface-container animate-pulse" aria-hidden="true" />
    </div>
  );
}
