import type { Product } from '@/features/products/domain/product';

export const ADDED_PRODUCTS_KEY = 'multi-step-form:added-products:v1';

function readAddedProducts(): Product[] {
  try {
    const stored: unknown = JSON.parse(localStorage.getItem(ADDED_PRODUCTS_KEY) ?? '[]');
    return Array.isArray(stored) ? (stored as Product[]) : [];
  } catch {
    return [];
  }
}

function writeAddedProducts(products: Product[]) {
  try {
    localStorage.setItem(ADDED_PRODUCTS_KEY, JSON.stringify(products));
  } catch {}
}

export type AddedProductsSnapshot = {
  hasReadStorage: boolean;
  products: Product[];
};

const BEFORE_READ: AddedProductsSnapshot = { hasReadStorage: false, products: [] };

export type AddedProductsStore = {
  subscribe: (onChange: () => void) => () => void;
  getSnapshot: () => AddedProductsSnapshot;
  getServerSnapshot: () => AddedProductsSnapshot;
  add: (product: Product) => void;
};

export function createAddedProductsStore(): AddedProductsStore {
  let snapshot = BEFORE_READ;
  const listeners = new Set<() => void>();

  const getSnapshot = () => {
    if (snapshot === BEFORE_READ) {
      snapshot = { hasReadStorage: true, products: readAddedProducts() };
    }
    return snapshot;
  };

  return {
    getSnapshot,
    getServerSnapshot: () => BEFORE_READ,
    subscribe(onChange) {
      const onStorage = (event: StorageEvent) => {
        if (event.key !== ADDED_PRODUCTS_KEY) {
          return;
        }
        snapshot = BEFORE_READ;
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
      snapshot = { hasReadStorage: true, products: [product, ...getSnapshot().products] };
      writeAddedProducts(snapshot.products);
      listeners.forEach((listener) => listener());
    },
  };
}
