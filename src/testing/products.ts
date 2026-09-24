import { createProduct, type Product } from '@/features/products/domain/product';

export function createTestProduct(name: string): Product {
  return createProduct({
    name,
    sku: 'TEST1',
    manufacturer: 'dell',
    category: 'komputery',
    features: ['wifi'],
    netPrice: 100,
    grossPrice: 123,
    vatRate: 23,
    currency: 'PLN',
    isAvailable: true,
    isLimited: true,
    stockQuantity: 3,
  });
}
