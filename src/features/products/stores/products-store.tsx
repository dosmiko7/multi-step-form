'use client';

import { createContext, use, useMemo, useState, useSyncExternalStore, type ReactNode } from 'react';

import type { Product } from '@/features/products/domain/product';

import { createAddedProductsStore } from './added-products-storage';

type ProductsContextValue = {
  products: Product[];
  hasReadStorage: boolean;
  addProduct: (product: Product) => void;
};

const ProductsContext = createContext<ProductsContextValue | undefined>(undefined);

const getServerSnapshot = () => undefined;

export function ProductsProvider({
  initialProducts,
  children,
}: {
  initialProducts: Product[];
  children: ReactNode;
}) {
  const [addedProductsStore] = useState(createAddedProductsStore);
  const addedProducts = useSyncExternalStore(
    addedProductsStore.subscribe,
    addedProductsStore.getSnapshot,
    getServerSnapshot,
  );

  const value = useMemo<ProductsContextValue>(
    () => ({
      products: addedProducts ? [...addedProducts, ...initialProducts] : initialProducts,
      hasReadStorage: addedProducts !== undefined,
      addProduct: addedProductsStore.add,
    }),
    [addedProducts, initialProducts, addedProductsStore],
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
