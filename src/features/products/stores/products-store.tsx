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

const getServerSnapshot = () => undefined;

export function ProductsProvider({
  initialProducts,
  children,
}: {
  initialProducts: Product[];
  children: ReactNode;
}) {
  const [addedProductsStorage] = useState(createAddedProductsStorage);
  const addedProducts = useSyncExternalStore(
    addedProductsStorage.subscribe,
    addedProductsStorage.getSnapshot,
    getServerSnapshot,
  );

  const value = useMemo<ProductsContextValue>(
    () => ({
      products: addedProducts ? [...addedProducts, ...initialProducts] : initialProducts,
      isRestored: addedProducts !== undefined,
      addProduct: addedProductsStorage.add,
    }),
    [addedProducts, initialProducts, addedProductsStorage],
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
