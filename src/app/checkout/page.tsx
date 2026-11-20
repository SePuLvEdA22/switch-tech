'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { getPrice } from '@/lib/format-price';
import CheckoutStepper from './_components/CheckoutStepper';
import CartSkeleton from '@/components/CartSkeleton';
import ShippingStep, { EMPTY_SHIPPING, type ShippingForm } from './_components/ShippingStep';
import PaymentStep from './_components/PaymentStep';
import OrderSummary, { type AppliedCoupon } from './_components/OrderSummary';
import type { PaymentMethodType, ColIdentificationType } from '@/lib/mercadopago';
import { computeShipping } from '@/lib/shipping';
import { useShippingRates } from '@/lib/use-shipping-rates';
import {
  SHIPPING_DRAFT_KEY,
  MP_ORDER_KEY,
  MP_METHOD_KEY,
  clearShippingDraft,
} from '@/lib/checkout-session';

type Step = 'shipping' | 'payment' | 'confirm';

function readShippingDraft(): ShippingForm {
  if (typeof window === 'undefined') return EMPTY_SHIPPING;
  try {
    const raw = window.sessionStorage.getItem(SHIPPING_DRAFT_KEY);
    if (!raw) return EMPTY_SHIPPING;
    const parsed = JSON.parse(raw) as Partial<ShippingForm>;
    // Solo campos conocidos y de texto (el storage es entrada no confiable).
    const draft = { ...EMPTY_SHIPPING };
    for (const key of Object.keys(EMPTY_SHIPPING) as (keyof ShippingForm)[]) {
      if (typeof parsed[key] === 'string') draft[key] = parsed[key];
    }
    return draft;
  } catch {
    return EMPTY_SHIPPING;
  }
}


export default function CheckoutPage() {
  const router = useRouter();
  const { items, hydrated, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const [step, setStep] = useState<Step>('shipping');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState('');

  // Lazy init desde sessionStorage: el formulario solo se pinta cuando el
  // carrito ya está hidratado, así que no hay diferencias con el HTML del servidor.
  const [shipping, setShipping] = useState<ShippingForm>(readShippingDraft);

  useEffect(() => {
    try {
      window.sessionStorage.setItem(SHIPPING_DRAFT_KEY, JSON.stringify(shipping));
    } catch {
      /* almacenamiento no disponible: el formulario sigue funcionando */
    }
  }, [shipping]);

  // Con sesión iniciada, precargar nombre y email (sin pisar lo ya escrito).
  // La sesión llega async: ajuste de estado durante el render, una sola vez.
  const [prefilledFor, setPrefilledFor] = useState<string | null>(null);
  if (user && prefilledFor !== user.id) {
    setPrefilledFor(user.id);
    setShipping((s) => ({ ...s, name: s.name || user.name, email: s.email || user.email }));
  }

  // Estado del método de pago
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('card');

  // Estado para PSE (identificación Colombia)
  const [docType, setDocType] = useState<ColIdentificationType>('CC');
  const [docNumber, setDocNumber] = useState('');

  // Estado del cupón de descuento
  const [couponCode, setCouponCode] = useState('');
  const [coupon, setCoupon] = useState<AppliedCoupon | null>(null);
  const [couponError, setCouponError] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  // Un cupón se valida contra un subtotal: si el carrito cambia, el descuento
  // mostrado deja de ser correcto. Se quita y se pide aplicarlo de nuevo.
  if (coupon && coupon.subtotal !== totalPrice) {
    setCoupon(null);
    setCouponError('Tu carrito cambió. Vuelve a aplicar el cupón.');
  }

  const discountedTotal = Math.max(0, totalPrice - (coupon?.discount ?? 0));

  // Envío con la misma regla que aplica el servidor (lib/shipping.ts):
  // sobre el subtotal antes del cupón. null mientras cargan las tarifas.
  const shippingRates = useShippingRates();
  const shippingCost = shippingRates.rates ? computeShipping(totalPrice, shippingRates.rates) : null;
  const payableTotal = shippingCost === null ? null : discountedTotal + shippingCost;

  // Mientras se restaura el carrito no se sabe si está vacío: evita el flash
  // de "Carrito vacío" al entrar directo a /checkout o al recargar.
  if (!hydrated) {
    return (
      <div className="container-store py-12">
        <h1 className="mb-6 font-heading text-4xl font-bold text-on-surface md:text-5xl">
          Finalizar compra
        </h1>
        <CheckoutStepper step={step} />
        <CartSkeleton rows={1} />
      </div>
    );
  }

  if (items.length === 0 && step !== 'confirm') {
    return (
      <div className="container-store py-12">
        <div className="mx-auto max-w-lg rounded-2xl bg-surface-container p-8 text-center">
          <h1 className="font-heading text-2xl font-bold text-on-surface">Carrito vacío</h1>
          <p className="mt-2 font-body text-base text-on-surface-variant">
            Agrega productos al carrito antes de continuar.
          </p>
          <Link href="/fundas" className="btn-primary mt-6">
            Ver productos
          </Link>
        </div>
      </div>
    );
  }

  /**
   * Valida los datos de PSE (identificación) antes de enviar.
   */
  const validatePse = (): boolean => {
    if (!docNumber || docNumber.length < 4) {
      setErrors({ docNumber: 'El número de documento debe tener al menos 4 caracteres' });
      return false;
    }
    return true;
  };

  const applyCoupon = async () => {
    const code = couponCode.trim().toUpperCase();
    if (!code) return;
    setCouponLoading(true);
    setCouponError('');
    try {
      const res = await fetch('/api/promos/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, subtotal: totalPrice }),
      });
      const data = await res.json();
      if (!data.valid) {
        setCoupon(null);
        setCouponError(data.error || 'Cupón inválido');
        return;
      }
      setCoupon({ code, discount: data.discount, subtotal: totalPrice });
    } catch {
      setCouponError('No se pudo validar el cupón');
    } finally {
      setCouponLoading(false);
    }
  };

  /**
   * Procesa el pago: crea preferencia en MercadoPago y redirige al Checkout Pro.
   */
  const handlePayment = async () => {
    setLoading(true);
    setErrors({});
    setError('');

    // Validar PSE
    if (paymentMethod === 'pse' && !validatePse()) {
      setLoading(false);
      return;
    }

    try {
      // Construir payload para la preferencia
      const payload: Record<string, unknown> = {
        items: items.map((i) => ({
          id: i.product.id,
          title: i.product.name,
          quantity: i.quantity,
          unit_price: getPrice(i.product),
        })),
        paymentMethod,
        ...(coupon ? { couponCode: coupon.code } : {}),
        shipping,
      };

      // Si es PSE, incluir datos de identificación del pagador
      if (paymentMethod === 'pse') {
        payload.payer = {
          name: shipping.name,
          email: shipping.email,
          identification: {
            type: docType,
            number: docNumber,
          },
        };
      }

      const res = await fetch('/api/mercadopago/create-preference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Error al crear la preferencia de pago');
      }

      // En modo test, redirigir directamente a la orden
      if (data.testMode) {
        clearCart();
        clearShippingDraft();
        setStep('confirm');
        router.push(`/orden?id=${data.orderId}&status=success`);
        return;
      }

      // Redirigir al Checkout Pro de MercadoPago
      const initPoint = data.preference?.init_point || data.preference?.sandbox_init_point;

      if (initPoint) {
        // Guardar referencia para cuando vuelva de MP
        // Se guarda la orden para que /orden, al volver de MP, la reconozca y
        // vacíe el carrito. Los datos de envío se conservan hasta entonces
        // (si el pago falla, el cliente no tiene que escribirlos de nuevo).
        sessionStorage.setItem(MP_ORDER_KEY, data.orderId);
        sessionStorage.setItem(MP_METHOD_KEY, paymentMethod);
        window.location.href = initPoint;
      } else {
        throw new Error('No se recibió la URL de pago');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al procesar el pago. Intenta de nuevo.');
      setLoading(false);
    }
  };

  return (
    <div className="container-store py-12 animate-fade-in">
      <h1 className="mb-6 font-heading text-4xl font-bold text-on-surface md:text-5xl">
        Finalizar compra
      </h1>
      <CheckoutStepper step={step} />

      <div className="grid gap-12 lg:grid-cols-5">
        <div className="lg:col-span-3">
          {step === 'shipping' && (
            <ShippingStep
              shipping={shipping}
              onShippingChange={setShipping}
              errors={errors}
              onErrorsChange={setErrors}
              onSubmit={() => {
                setStep('payment');
                // Sin behavior explícito: usa el scroll-behavior del CSS, que
                // solo es suave si no se pidió reducir el movimiento.
                window.scrollTo({ top: 0 });
              }}
            />
          )}

          {step === 'payment' && (
            <PaymentStep
              paymentMethod={paymentMethod}
              onPaymentMethodChange={setPaymentMethod}
              docType={docType}
              onDocTypeChange={setDocType}
              docNumber={docNumber}
              onDocNumberChange={setDocNumber}
              errors={errors}
              onDocNumberErrorClear={() =>
                setErrors((prev) => {
                  const next = { ...prev };
                  delete next.docNumber;
                  return next;
                })
              }
              error={error}
              loading={loading}
              payableTotal={payableTotal}
              onBack={() => setStep('shipping')}
              onPay={handlePayment}
            />
          )}
        </div>

        <div className="lg:col-span-2">
          <OrderSummary
            items={items}
            totalPrice={totalPrice}
            payableTotal={payableTotal}
            shippingCost={shippingCost}
            shippingRates={shippingRates.rates}
            shippingFailed={shippingRates.status === 'error'}
            paymentMethod={paymentMethod}
            coupon={coupon}
            onCouponRemove={() => {
              setCoupon(null);
              setCouponCode('');
            }}
            couponCode={couponCode}
            onCouponCodeChange={setCouponCode}
            couponError={couponError}
            couponLoading={couponLoading}
            onCouponApply={applyCoupon}
          />
        </div>
      </div>
    </div>
  );
}
