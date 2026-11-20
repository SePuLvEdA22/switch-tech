/**
 * Regla única del costo de envío. La usan el servidor (create-preference,
 * autoritativo) y la UI (resumen del checkout, carrito, /envios), así lo que
 * se muestra coincide con lo que Mercado Pago cobra.
 *
 * - Se evalúa sobre el subtotal de productos ANTES del cupón ("pedidos desde
 *   X"): un cupón no hace perder el envío gratis.
 * - Envío gratis si el subtotal alcanza el umbral (>=). Umbral 0 = nunca gratis.
 * - Los valores se configuran en Admin → Configuración.
 */
export interface ShippingRates {
  shippingCost: number;
  freeShippingThreshold: number;
}

export function computeShipping(subtotal: number, rates: ShippingRates): number {
  if (subtotal <= 0) return 0;
  if (rates.freeShippingThreshold > 0 && subtotal >= rates.freeShippingThreshold) return 0;
  return rates.shippingCost;
}
