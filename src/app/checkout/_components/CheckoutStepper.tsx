'use client';

type Step = 'shipping' | 'payment' | 'confirm';

const STEPS = ['shipping', 'payment', 'confirm'] as const;

const STEP_LABELS: Record<Step, string> = {
  shipping: 'Envío',
  payment: 'Pago',
  confirm: 'Confirmación',
};

/**
 * Lista ordenada de pasos: el actual lleva aria-current="step" y los
 * completados lo dicen en texto oculto (no solo con color). En móvil las
 * etiquetas visibles se ocultan, pero siguen disponibles para lectores.
 */
export default function CheckoutStepper({ step }: { step: Step }) {
  const currentIndex = STEPS.indexOf(step);

  return (
    <ol className="mb-8 flex items-center gap-3" aria-label="Progreso de la compra">
      {STEPS.map((s, i) => {
        const isCurrent = i === currentIndex;
        const isDone = i < currentIndex;
        return (
          <li key={s} className="flex items-center gap-3" aria-current={isCurrent ? 'step' : undefined}>
            <span
              aria-hidden="true"
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                isCurrent
                  ? 'bg-primary text-on-primary'
                  : isDone
                  ? 'bg-primary-container text-on-primary-container'
                  : 'bg-surface-container text-on-surface-variant'
              }`}
            >
              {i + 1}
            </span>
            <span
              className={`sr-only font-body text-sm sm:not-sr-only ${
                isCurrent ? 'font-medium text-on-surface' : 'text-on-surface-variant'
              }`}
            >
              {STEP_LABELS[s]}
              {isDone && <span className="sr-only"> (completado)</span>}
            </span>
            {i < STEPS.length - 1 && (
              <span aria-hidden="true" className="hidden h-px w-8 bg-outline-variant sm:block" />
            )}
          </li>
        );
      })}
    </ol>
  );
}
