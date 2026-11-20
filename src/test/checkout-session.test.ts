// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import {
  consumePaidOrder,
  MP_ORDER_KEY,
  MP_METHOD_KEY,
  SHIPPING_DRAFT_KEY,
} from '@/lib/checkout-session';

describe('consumePaidOrder — vaciar el carrito al volver de Mercado Pago', () => {
  beforeEach(() => {
    sessionStorage.clear();
    sessionStorage.setItem(MP_ORDER_KEY, 'ORD-123');
    sessionStorage.setItem(MP_METHOD_KEY, 'pse');
    sessionStorage.setItem(SHIPPING_DRAFT_KEY, '{"name":"Ana"}');
  });

  it('reconoce_la_orden_enviada_y_limpia_la_sesión_del_checkout', () => {
    expect(consumePaidOrder('ORD-123')).toBe(true);
    expect(sessionStorage.getItem(MP_ORDER_KEY)).toBeNull();
    expect(sessionStorage.getItem(MP_METHOD_KEY)).toBeNull();
    expect(sessionStorage.getItem(SHIPPING_DRAFT_KEY)).toBeNull();
  });

  it('otra_orden_no_vacía_nada', () => {
    expect(consumePaidOrder('ORD-999')).toBe(false);
    expect(sessionStorage.getItem(MP_ORDER_KEY)).toBe('ORD-123');
    expect(sessionStorage.getItem(SHIPPING_DRAFT_KEY)).toBe('{"name":"Ana"}');
  });

  it('solo_se_consume_una_vez', () => {
    expect(consumePaidOrder('ORD-123')).toBe(true);
    expect(consumePaidOrder('ORD-123')).toBe(false);
  });

  it('sin_orden_guardada_no_hace_nada', () => {
    sessionStorage.clear();
    expect(consumePaidOrder('ORD-123')).toBe(false);
  });
});
