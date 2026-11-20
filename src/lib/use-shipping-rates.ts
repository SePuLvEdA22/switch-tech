'use client';

import { useEffect, useState } from 'react';
import type { ShippingRates } from './shipping';

type State =
  | { status: 'loading'; rates: null }
  | { status: 'ready'; rates: ShippingRates }
  | { status: 'error'; rates: null };

/** Una sola petición por carga de página, compartida entre componentes. */
let request: Promise<ShippingRates> | null = null;

function loadRates(): Promise<ShippingRates> {
  request ??= fetch('/api/shipping')
    .then((res) => (res.ok ? res.json() : Promise.reject(new Error(String(res.status)))))
    .then((data: ShippingRates) => data)
    .catch((err) => {
      request = null; // permitir reintento en el próximo montaje
      throw err;
    });
  return request;
}

/** Tarifas de envío configuradas en el admin (ver lib/shipping.ts). */
export function useShippingRates(): State {
  const [state, setState] = useState<State>({ status: 'loading', rates: null });

  useEffect(() => {
    let cancelled = false;
    loadRates().then(
      (rates) => !cancelled && setState({ status: 'ready', rates }),
      () => !cancelled && setState({ status: 'error', rates: null })
    );
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
