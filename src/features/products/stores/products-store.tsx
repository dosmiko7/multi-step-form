'use client';

import { createContext, use, useCallback, useMemo, useState, type ReactNode } from 'react';

import type { Product } from '@/features/products/domain/product';

type ProductsContextValue = {
  products: Product[];
  addProduct: (product: Product) => void;
};

const ProductsContext = createContext<ProductsContextValue | undefined>(undefined);

export function ProductsProvider({
  initialProducts,
  children,
}: {
  initialProducts: Product[];
  children: ReactNode;
}) {
  const [products, setProducts] = useState(initialProducts);

  const addProduct = useCallback(
    (product: Product) => setProducts((current) => [product, ...current]),
    [],
  );

  const value = useMemo<ProductsContextValue>(
    () => ({ products, addProduct }),
    [products, addProduct],
  );

  return <ProductsContext value={value}>{children}</ProductsContext>;
}

export function useProducts() {
  const context = use(ProductsContext);

  if (!context) {
    throw new Error('useProducts must be used inside a ProductsProvider');
  }

  return context;
}
