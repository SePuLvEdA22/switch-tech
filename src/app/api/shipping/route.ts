import { NextResponse } from 'next/server';
import { getSettingsRepo } from '@/lib/repositories';

/**
 * Tarifas de envío públicas para la UI (carrito, checkout).
 * Solo expone estos dos campos; el resto de la configuración es de admin.
 * El servidor recalcula el envío al crear la preferencia (fuente de verdad).
 */
export async function GET() {
  const { shippingCost, freeShippingThreshold } = await getSettingsRepo().get();
  return NextResponse.json(
    { shippingCost, freeShippingThreshold },
    { headers: { 'Cache-Control': 'no-store' } }
  );
}
