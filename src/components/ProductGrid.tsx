import { type Product } from '@/types';
import ProductCard from './ProductCard';

interface ProductGridProps {
  products: Product[];
  title?: string;
}

export default function ProductGrid({ products, title }: ProductGridProps) {
  return (
    <section className="section-gap">
      {title && (
        <h2 className="mb-8 font-heading text-3xl font-bold text-on-surface md:text-4xl">
          {title}
        </h2>
      )}
      <div className="product-grid animate-stagger">
        {products.map((product) => (
          <div key={product.id}>
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </section>
  );
}
