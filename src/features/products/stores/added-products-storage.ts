import type { Product } from '@/features/products/domain/product';

/** Versioned: a change to the product's shape bumps it, and whatever the old key holds is ignored. */
export const ADDED_PRODUCTS_KEY = 'multi-step-form:added-products:v1';

/** Blocked storage and broken JSON read as nothing added yet. */
function readAddedProducts(): Product[] {
  try {
    const stored: unknown = JSON.parse(localStorage.getItem(ADDED_PRODUCTS_KEY) ?? '[]');
    return Array.isArray(stored) ? stored : [];
  } catch {
    return [];
  }
}

/** Blocked or full storage keeps the product for this visit only; the save itself succeeded. */
function writeAddedProducts(products: Product[]) {
  try {
    localStorage.setItem(ADDED_PRODUCTS_KEY, JSON.stringify(products));
  } catch {}
}

export type AddedProductsStore = {
  subscribe: (onChange: () => void) => () => void;
  getSnapshot: () => Product[];
  add: (product: Product) => void;
};

/**
 * The products added in this browser, newest first, shaped for `useSyncExternalStore`. A save in
 * another tab drops the cached copy, and the next snapshot reads storage again.
 */
export function createAddedProductsStore(): AddedProductsStore {
  let cachedProducts: Product[] | undefined;
  const listeners = new Set<() => void>();

  const getSnapshot = () => {
    cachedProducts ??= readAddedProducts();
    return cachedProducts;
  };

  return {
    getSnapshot,
    subscribe(onChange) {
      const onStorage = (event: StorageEvent) => {
        if (event.key !== ADDED_PRODUCTS_KEY) {
          return;
        }
        cachedProducts = undefined;
        onChange();
      };

      listeners.add(onChange);
      window.addEventListener('storage', onStorage);

      return () => {
        listeners.delete(onChange);
        window.removeEventListener('storage', onStorage);
      };
    },
    add(product) {
      cachedProducts = [product, ...getSnapshot()];
      writeAddedProducts(cachedProducts);
      listeners.forEach((listener) => listener());
    },
  };
}
