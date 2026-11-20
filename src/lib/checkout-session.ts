/**
 * Datos del checkout en sessionStorage (solo esta pestaña; se borran al
 * cerrarla). Claves y limpieza compartidas entre /checkout y /orden.
 */
export const SHIPPING_DRAFT_KEY = 'checkout-shipping';
export const MP_ORDER_KEY = 'mp-order-id';
export const MP_METHOD_KEY = 'mp-payment-method';

function remove(...keys: string[]) {
  try {
    for (const key of keys) window.sessionStorage.removeItem(key);
  } catch {
    /* almacenamiento no disponible */
  }
}

export function clearShippingDraft() {
  remove(SHIPPING_DRAFT_KEY);
}

/**
 * ¿Es `orderId` la orden que esta pestaña acaba de enviar a Mercado Pago?
 * Si lo es, limpia la sesión del checkout y devuelve true (el llamador vacía
 * el carrito). Abrir el enlace de otra orden no toca nada.
 */
export function consumePaidOrder(orderId: string): boolean {
  try {
    if (window.sessionStorage.getItem(MP_ORDER_KEY) !== orderId) return false;
  } catch {
    return false;
  }
  remove(MP_ORDER_KEY, MP_METHOD_KEY, SHIPPING_DRAFT_KEY);
  return true;
}
