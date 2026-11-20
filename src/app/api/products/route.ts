import { NextResponse } from 'next/server';
import { getProductRepo } from '@/lib/repositories';

const MAX_IDS = 100;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const search = searchParams.get('search');
  // ?ids=a,b,c → solo esos productos (favoritos). Tope para acotar la consulta.
  const ids = searchParams.get('ids')?.split(',').map(s => s.trim()).filter(Boolean).slice(0, MAX_IDS);
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const limit = ids
    ? MAX_IDS
    : Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '12', 10)));

  let result = (await getProductRepo().findAll()).filter(p => p.active !== false);

  if (ids) {
    const wanted = new Set(ids);
    result = result.filter(p => wanted.has(p.id));
  }

  if (category && (category === 'fundas' || category === 'cargadores' || category === 'termos' || category === 'personalizados')) {
    result = result.filter(p => p.category === category);
  }

  if (search) {
    const q = search.toLowerCase();
    result = result.filter(
      p =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        (p.tags ?? []).some(t => t.toLowerCase().includes(q))
    );
  }

  const total = result.length;
  const totalPages = Math.ceil(total / limit);
  const start = (page - 1) * limit;
  const paginated = result.slice(start, start + limit);

  return NextResponse.json({
    products: paginated,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  });
}