import Image from 'next/image';
import Link from 'next/link';
import HomeSwitch, { type SwitchCategory } from '@/components/home/HomeSwitch';
import ProductCard from '@/components/ProductCard';
import NewsletterSection from '@/components/NewsletterSection';
import { getFeaturedProducts, getProductsByCategory } from '@/lib/products';
import { getSettingsRepo } from '@/lib/repositories';
import { formatPrice } from '@/lib/format-price';
import type { Category } from '@/lib/models';

// Tienda dinámica: los productos se crean en runtime (Neon), no en build.
// Sin esto Next prerenderiza con DB vacía y Vercel sirve CDN stale.
export const dynamic = 'force-dynamic';

const CATEGORY_META: { id: Category; label: string; allLabel: string }[] = [
  { id: 'cargadores', label: 'Cargadores y cables', allLabel: 'Ver todos los cargadores y cables' },
  { id: 'fundas', label: 'Fundas', allLabel: 'Ver todas las fundas' },
  { id: 'termos', label: 'Termos', allLabel: 'Ver todos los termos' },
  { id: 'personalizados', label: 'Personalizados', allLabel: 'Ver todos los personalizados' },
];

function shippingBenefit(cost: number, threshold: number): { title: string; detail: string } {
  if (cost === 0) return { title: 'Envío gratis', detail: 'A toda Colombia, de 1 a 7 días hábiles.' };
  if (threshold > 0) {
    return { title: `Envío gratis desde ${formatPrice(threshold)}`, detail: 'A toda Colombia, de 1 a 7 días hábiles.' };
  }
  return { title: 'Envíos a toda Colombia', detail: 'De 1 a 7 días hábiles.' };
}

export default async function HomePage() {
  const [byCategory, featured, settings] = await Promise.all([
    Promise.all(CATEGORY_META.map((c) => getProductsByCategory(c.id))),
    getFeaturedProducts(),
    getSettingsRepo().get(),
  ]);

  const categories: SwitchCategory[] = CATEGORY_META.map((meta, i) => ({
    ...meta,
    href: `/${meta.id}`,
    total: byCategory[i].length,
    products: byCategory[i],
  })).filter((c) => c.total > 0);

  const custom = byCategory[CATEGORY_META.findIndex((c) => c.id === 'personalizados')];
  // Primera foto real (no el placeholder) de un producto personalizado.
  const customImage = custom
    .flatMap((p) => [p.image, ...(p.images ?? [])])
    .find((src): src is string => !!src && !src.endsWith('placeholder.svg'));
  const shipping = shippingBenefit(settings.shippingCost, settings.freeShippingThreshold);

  const benefits = [
    {
      ...shipping,
      icon: (
        <>
          <rect x="1" y="3" width="15" height="13" />
          <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
          <circle cx="5.5" cy="18.5" r="2.5" />
          <circle cx="18.5" cy="18.5" r="2.5" />
        </>
      ),
    },
    {
      title: '30 días para devolver',
      detail: 'Te enviamos la guía de devolución prepagada.',
      icon: (
        <>
          <polyline points="1 4 1 10 7 10" />
          <path d="M3.51 15a9 9 0 102.13-9.36L1 10" />
        </>
      ),
    },
    {
      title: 'Paga con PSE o tarjeta',
      detail: 'Pagos procesados por Mercado Pago.',
      icon: (
        <>
          <rect x="3" y="11" width="18" height="11" rx="2" />
          <path d="M7 11V7a5 5 0 0110 0v4" />
        </>
      ),
    },
  ];

  return (
    <div className="container-store">
      <section aria-labelledby="home-title" className="flex flex-col gap-6 pb-12 pt-6 md:gap-8 md:pb-14 md:pt-10">
        <div className="flex max-w-5xl flex-col gap-3 md:gap-4">
          <h1
            id="home-title"
            className="font-heading text-5xl font-bold leading-[0.96] tracking-[-0.03em] text-on-surface md:text-[84px]"
          >
            Carga, protege y lleva tu café.
          </h1>
          <p className="max-w-xl font-body text-[17px] leading-relaxed text-on-surface-variant md:text-[19px]">
            Cargadores, cables, fundas y termos con envío a toda Colombia. Paga con PSE o tarjeta.
          </p>
        </div>
        <HomeSwitch categories={categories} />
      </section>

      <section
        aria-label="Compra con tranquilidad"
        className="grid border-y border-outline-variant md:grid-cols-3"
      >
        {benefits.map((b, i) => (
          <div
            key={b.title}
            className={`flex gap-3.5 py-5 md:px-6 md:py-7 ${i > 0 ? 'border-t border-outline-variant md:border-l md:border-t-0' : ''} ${i === 0 ? 'md:pl-0' : ''}`}
          >
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 text-primary" aria-hidden="true">
              {b.icon}
            </svg>
            <div>
              <p className="font-body text-base font-semibold text-on-surface">{b.title}</p>
              <p className="mt-1 font-body text-[15px] text-on-surface-variant">{b.detail}</p>
            </div>
          </div>
        ))}
      </section>

      {featured.length > 0 && (
        <section aria-labelledby="top-title" className="flex flex-col gap-6 pb-6 pt-14 md:pt-[72px]">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <h2 id="top-title" className="font-heading text-[32px] font-bold text-on-surface md:text-[44px]">
              Destacados
            </h2>
            <Link href="/buscar" className="font-body text-[15px] font-semibold text-primary hover:underline">
              Buscar en todo el catálogo
            </Link>
          </div>
          <div className="product-grid">
            {featured.slice(0, 8).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      <section
        aria-labelledby="custom-title"
        className="my-14 flex flex-col overflow-hidden rounded-[28px] bg-primary text-on-primary md:my-16 md:flex-row"
      >
        <div className="flex flex-1 flex-col justify-center gap-4 p-6 md:gap-5 md:p-14">
          <h2 id="custom-title" className="font-heading text-[32px] font-bold leading-[1.02] md:text-[52px]">
            Tu foto o tu nombre en una funda o un termo.
          </h2>
          <p className="max-w-md font-body text-base leading-relaxed opacity-85 md:text-lg">
            Cuéntanos tu idea y adjunta la imagen que quieres usar.
          </p>
          <Link
            href="/personalizados"
            className="inline-flex h-12 items-center self-start rounded-full bg-on-primary px-6 font-body text-base font-semibold text-primary transition-opacity hover:opacity-90"
          >
            Diseñar el mío
          </Link>
        </div>
        {customImage && (
          <div className="relative min-h-[240px] flex-1 md:min-h-[400px]">
            <Image
              src={customImage}
              alt=""
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
        )}
      </section>

      <NewsletterSection />
    </div>
  );
}
