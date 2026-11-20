import { notFound } from 'next/navigation';
import type { Category } from '@/lib/models';
import { getProductById, getProductsByCategory } from '@/lib/products';

export const dynamic = 'force-dynamic';
import type { Product } from '@/types';
import ProductGallery from '@/components/ProductGallery';
import ProductCard from '@/components/ProductCard';
import PriceTag from '@/components/PriceTag';
import Breadcrumbs from '@/components/Breadcrumbs';
import ProductJsonLd from '@/components/ProductJsonLd';
import ProductPurchasePanel from '@/components/ProductPurchasePanel';

function catLabel(cat: string) {
  return cat === 'fundas' ? 'Fundas' : cat === 'cargadores' ? 'Cargadores' : cat === 'termos' ? 'Termos' : 'Personalizados';
}

type Props = {
  params: Promise<{ id: string }>;
};

/**
 * Página de producto (Server Component): el HTML servido incluye nombre,
 * precio, descripción y JSON-LD — crítico para SEO. Solo el selector de
 * color/cantidad y el carrito son una isla de cliente.
 *
 * El título y la URL canónica los genera `generateMetadata` en layout.tsx.
 */
export default async function ProductDetailPage({ params }: Props) {
  const { id } = await params;
  const product: Product | undefined = await getProductById(id);

  if (!product) notFound();

  const related = (await getProductsByCategory(product.category as Category))
    .filter((p) => p.id !== product.id)
    .slice(0, 4);

  return (
    <div className="container-store py-12">
      <ProductJsonLd product={product} />

      <Breadcrumbs items={[
        { label: catLabel(product.category), href: `/${product.category}` },
        { label: product.name },
      ]} />

      <div className="grid gap-12 lg:grid-cols-2">
        <ProductGallery product={product} />

        <div className="flex flex-col justify-center">
          <h1 className="font-heading text-4xl font-bold text-on-surface md:text-5xl">
            {product.name}
          </h1>
          <PriceTag
            product={product}
            className="mt-6 font-heading text-3xl font-bold"
            priceClassName="text-primary"
          />
          <p className="mt-6 font-body text-base leading-relaxed text-on-surface-variant">
            {product.description}
          </p>

          <ProductPurchasePanel product={product} />
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-20">
          <h2 className="mb-8 font-heading text-2xl font-bold text-on-surface">
            Productos relacionados
          </h2>
          <div className="product-grid">
            {related.map((rel) => (
              <ProductCard key={rel.id} product={rel} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
