import { describe, it, expect } from 'vitest';
import { computeShipping } from '@/lib/shipping';

const RATES = { shippingCost: 25000, freeShippingThreshold: 450000 };

describe('computeShipping', () => {
  it('cobra_el_costo_bajo_el_umbral', () => {
    expect(computeShipping(249000, RATES)).toBe(25000);
  });

  it('es_gratis_al_alcanzar_el_umbral_exacto', () => {
    expect(computeShipping(450000, RATES)).toBe(0);
  });

  it('es_gratis_sobre_el_umbral', () => {
    expect(computeShipping(847000, RATES)).toBe(0);
  });

  it('umbral_0_significa_nunca_gratis', () => {
    expect(computeShipping(5_000_000, { shippingCost: 25000, freeShippingThreshold: 0 })).toBe(25000);
  });

  it('costo_0_significa_siempre_gratis', () => {
    expect(computeShipping(1000, { shippingCost: 0, freeShippingThreshold: 0 })).toBe(0);
  });

  it('carrito_vacío_no_cobra_envío', () => {
    expect(computeShipping(0, RATES)).toBe(0);
  });
});

describe('shippingSchema — dirección en Colombia', async () => {
  const { shippingSchema } = await import('@/lib/validation');
  const base = {
    name: 'Ana Prueba',
    email: 'ana@example.com',
    phone: '3001234567',
    address: 'Calle 1 # 2-3',
    city: 'Bogotá',
    state: 'Cundinamarca',
    notes: '',
  };

  it('acepta_código_postal_colombiano_de_6_dígitos', () => {
    expect(shippingSchema.safeParse({ ...base, zip: '110111' }).success).toBe(true);
  });

  it('rechaza_código_postal_de_5_dígitos', () => {
    expect(shippingSchema.safeParse({ ...base, zip: '11001' }).success).toBe(false);
  });
});
