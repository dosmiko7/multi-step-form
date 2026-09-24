import { CATEGORY_LABELS, type Product } from '@/features/products/domain/product';

import { formatPrice } from './format';

export type ProductRowView = {
  id: string;
  name: string;
  sku: string;
  category: string;
  grossPrice: string;
  isAvailable: boolean;
  stock: string;
};

export function toProductRowView(product: Product): ProductRowView {
  return {
    id: product.id,
    name: product.name,
    sku: product.sku,
    category: CATEGORY_LABELS[product.category],
    grossPrice: formatPrice(product.grossPrice, product.currency),
    isAvailable: product.isAvailable,
    stock: product.isLimited ? String(product.stockQuantity) : '—',
  };
}
