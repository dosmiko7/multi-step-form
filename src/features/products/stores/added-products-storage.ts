import { CATEGORY_VALUES, CURRENCY_VALUES, type Product } from '@/features/products/domain/product';

export const ADDED_PRODUCTS_KEY = 'multi-step-form:added-products:v1';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isOneOf(values: readonly string[], value: unknown) {
  return typeof value === 'string' && values.includes(value);
}

/** Checks only what the list reads; the rest of a stored product is trusted. */
function isReadableProduct(value: unknown): value is Product {
  if (!isRecord(value)) {
    return false;
  }

  const hasStockLevel = value.isLimited === false || typeof value.stockQuantity === 'number';

  return (
    typeof value.id === 'string' &&
    typeof value.name === 'string' &&
    typeof value.sku === 'string' &&
    typeof value.grossPrice === 'number' &&
    typeof value.isAvailable === 'boolean' &&
    typeof value.isLimited === 'boolean' &&
    hasStockLevel &&
    isOneOf(CATEGORY_VALUES, value.category) &&
    isOneOf(CURRENCY_VALUES, value.currency)
  );
}

function readAddedProducts(): Product[] {
  try {
    const stored: unknown = JSON.parse(localStorage.getItem(ADDED_PRODUCTS_KEY) ?? '[]');
    return Array.isArray(stored) ? stored.filter(isReadableProduct) : [];
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
