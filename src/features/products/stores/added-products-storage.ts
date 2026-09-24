import {
  CATEGORY_VALUES,
  CURRENCY_VALUES,
  FEATURE_VALUES,
  MANUFACTURER_VALUES,
  VAT_RATES,
  type Product,
} from '@/features/products/domain/product';

/** Versioned: a change to the product's shape bumps it, and whatever the old key holds is ignored. */
export const ADDED_PRODUCTS_KEY = 'multi-step-form:added-products:v1';

type Check = (value: unknown) => boolean;

const isString: Check = (value) => typeof value === 'string';
const isNumber: Check = (value) => typeof value === 'number' && Number.isFinite(value);
const isBoolean: Check = (value) => typeof value === 'boolean';
const isOneOf =
  (values: readonly unknown[]): Check =>
  (value) =>
    values.includes(value);
const isOptional =
  (check: Check): Check =>
  (value) =>
    value === undefined || check(value);
const isListOf =
  (check: Check): Check =>
  (value) =>
    Array.isArray(value) && value.every(check);

const PRODUCT_FIELD_CHECKS = {
  id: isString,
  name: isString,
  sku: isString,
  description: isOptional(isString),
  manufacturer: isOneOf(MANUFACTURER_VALUES),
  category: isOneOf(CATEGORY_VALUES),
  features: isListOf(isOneOf(FEATURE_VALUES)),
  netPrice: isNumber,
  grossPrice: isNumber,
  vatRate: isOneOf(VAT_RATES),
  currency: isOneOf(CURRENCY_VALUES),
  isAvailable: isBoolean,
  isLimited: isBoolean,
  minCartQuantity: isOptional(isNumber),
  maxCartQuantity: isOptional(isNumber),
} satisfies Record<keyof Product, Check>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** Storage is outside the app's control, and a malformed entry would crash the list mid-render. */
function isProduct(value: unknown): value is Product {
  if (!isRecord(value)) {
    return false;
  }

  const hasEveryField = Object.entries(PRODUCT_FIELD_CHECKS).every(([field, check]) =>
    check(value[field]),
  );

  return hasEveryField && (value.isLimited === false || isNumber(value.stockQuantity));
}

/** Blocked storage and broken JSON read as nothing added yet; an unreadable entry is skipped. */
function readAddedProducts(): Product[] {
  try {
    const stored: unknown = JSON.parse(localStorage.getItem(ADDED_PRODUCTS_KEY) ?? '[]');
    return Array.isArray(stored) ? stored.filter(isProduct) : [];
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

export type AddedProductsStorage = {
  subscribe: (onChange: () => void) => () => void;
  getSnapshot: () => Product[];
  add: (product: Product) => void;
};

/**
 * The products added in this browser, newest first, shaped for `useSyncExternalStore`. Storage is
 * read once and then held in memory, so the snapshot stays referentially stable between renders;
 * a save in another tab drops the copy and the next snapshot reads storage again.
 */
export function createAddedProductsStorage(): AddedProductsStorage {
  let products: Product[] | undefined;
  const listeners = new Set<() => void>();

  const getSnapshot = () => {
    products ??= readAddedProducts();
    return products;
  };

  return {
    getSnapshot,
    subscribe(onChange) {
      const onStorage = (event: StorageEvent) => {
        if (event.key !== ADDED_PRODUCTS_KEY) {
          return;
        }
        products = undefined;
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
      products = [product, ...getSnapshot()];
      writeAddedProducts(products);
      listeners.forEach((listener) => listener());
    },
  };
}
