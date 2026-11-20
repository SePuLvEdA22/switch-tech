import { formatPrice } from '@/lib/format-price';
import type { ShippingRates } from '@/lib/shipping';

interface ShippingRowProps {
  /** Costo calculado con computeShipping; null mientras no hay tarifas. */
  cost: number | null;
  rates: ShippingRates | null;
  /** Subtotal de productos (antes del cupón), el mismo que usa la regla. */
  subtotal: number;
  /** true si no se pudieron cargar las tarifas. */
  failed?: boolean;
}

/**
 * Fila "Envío" del resumen + aviso de cuánto falta para el envío gratis.
 * Mismos valores que cobra el servidor (lib/shipping.ts).
 */
export default function ShippingRow({ cost, rates, subtotal, failed = false }: ShippingRowProps) {
  const remaining =
    rates && cost !== null && cost > 0 && rates.freeShippingThreshold > 0
      ? rates.freeShippingThreshold - subtotal
      : 0;

  return (
    <>
      <div className="flex justify-between font-body text-sm">
        <span className="text-on-surface-variant">Envío</span>
        <span className="text-on-surface">
          {cost === null ? (failed ? 'Se calcula al pagar' : 'Calculando…') : cost === 0 ? 'Gratis' : formatPrice(cost)}
        </span>
      </div>
      {remaining > 0 && (
        <p className="font-body text-xs text-on-surface-variant">
          Agrega {formatPrice(remaining)} más y el envío es gratis.
        </p>
      )}
    </>
  );
}
