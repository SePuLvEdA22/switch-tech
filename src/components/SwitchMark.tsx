/**
 * Marca de Switch&Tech: un interruptor (pista petróleo, perilla ámbar).
 * Decorativa: el nombre de la marca va siempre en texto al lado.
 */
export default function SwitchMark({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 24" className={className} aria-hidden="true">
      <rect x="0" y="0" width="40" height="24" rx="12" className="fill-primary" />
      <circle cx="28" cy="12" r="8" className="fill-accent" />
    </svg>
  );
}
