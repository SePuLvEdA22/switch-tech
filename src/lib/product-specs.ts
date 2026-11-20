/**
 * Chips de especificación para la tarjeta de producto: lo que el cliente
 * compara (potencia, conector, capacidad, volumen, material). Se extraen del
 * nombre del producto, así no dependen de que el admin cargue tags.
 */
const MATERIALS: [RegExp, string][] = [
  [/\binal[aá]mbric[oa]\b/i, 'Inalámbrico'],
  [/\btrenzad[oa]\b/i, 'Trenzado'],
  [/\bsilicona\b/i, 'Silicona'],
  [/\b(piel|cuero)\b/i, 'Piel'],
  [/\bm[aá]rmol\b/i, 'Mármol'],
  [/\bacero\b/i, 'Acero'],
  [/\bvidrio\b/i, 'Vidrio'],
  [/\bpersonalizad[oa]\b/i, 'Tu diseño'],
];

function formatThousands(digits: string): string {
  return Number(digits.replace(/\D/g, '')).toLocaleString('es-CO');
}

export function productSpecs(name: string, max = 2): string[] {
  const specs: string[] = [];

  const watts = name.match(/(\d+)\s?W\b/i);
  if (watts) specs.push(`${watts[1]}W`);

  if (/\bUSB-?C\b/i.test(name)) specs.push('USB-C');
  if (/\blightning\b/i.test(name)) specs.push('Lightning');

  const mah = name.match(/([\d.]+)\s?mAh\b/i);
  if (mah) specs.push(`${formatThousands(mah[1])} mAh`);

  const ml = name.match(/(\d+)\s?ml\b/i);
  if (ml) specs.push(`${ml[1]} ml`);

  for (const [re, label] of MATERIALS) {
    if (specs.length >= max) break;
    if (re.test(name)) specs.push(label);
  }

  return specs.slice(0, max);
}
