'use client';

import { createContext, use, useMemo, useState, useSyncExternalStore, type ReactNode } from 'react';

import type { Product } from '@/features/products/domain/product';

import { createAddedProductsStorage } from './added-products-storage';

type ProductsContextValue = {
  products: Product[];
  isRestored: boolean;
  addProduct: (product: Product) => void;
};

const ProductsContext = createContext<ProductsContextValue | undefined>(undefined);

const NOTHING_READ_ON_SERVER = () => undefined;

export function ProductsProvider({
  initialProducts,
  children,
}: {
  initialProducts: Product[];
  children: ReactNode;
}) {
  const [addedProducts] = useState(createAddedProductsStorage);
  const added = useSyncExternalStore(
    addedProducts.subscribe,
    addedProducts.getSnapshot,
    NOTHING_READ_ON_SERVER,
  );

  const value = useMemo<ProductsContextValue>(
    () => ({
      products: added ? [...added, ...initialProducts] : initialProducts,
      isRestored: added !== undefined,
      addProduct: addedProducts.add,
    }),
    [added, initialProducts, addedProducts],
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
