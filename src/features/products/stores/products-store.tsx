'use client';

import { createContext, use, useMemo, useState, useSyncExternalStore, type ReactNode } from 'react';

import type { Product } from '@/features/products/domain/product';
import { createAddedProductsStore } from '@/features/products/stores/added-products-storage';

type ProductsContextValue = {
  products: Product[];
  hasReadStorage: boolean;
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
  const [addedProductsStore] = useState(createAddedProductsStore);
  const { products: addedProducts, hasReadStorage } = useSyncExternalStore(
    addedProductsStore.subscribe,
    addedProductsStore.getSnapshot,
    addedProductsStore.getServerSnapshot,
  );

  const value = useMemo<ProductsContextValue>(
    () => ({
      products: [...addedProducts, ...initialProducts],
      hasReadStorage,
      addProduct: addedProductsStore.add,
    }),
    [addedProducts, hasReadStorage, initialProducts, addedProductsStore],
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
