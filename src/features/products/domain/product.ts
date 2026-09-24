export type Option<TValue extends string> = {
  value: TValue;
  label: string;
};

function toOptions<TValue extends string>(
  values: readonly TValue[],
  labels: Record<TValue, string>,
): Option<TValue>[] {
  return values.map((value) => ({ value, label: labels[value] }));
}

export const MANUFACTURER_VALUES = [
  'apple',
  'samsung',
  'sony',
  'bosch',
  'xiaomi',
  'lg',
  'philips',
  'dell',
] as const;

export type ManufacturerValue = (typeof MANUFACTURER_VALUES)[number];

const MANUFACTURER_LABELS: Record<ManufacturerValue, string> = {
  apple: 'Apple',
  samsung: 'Samsung',
  sony: 'Sony',
  bosch: 'Bosch',
  xiaomi: 'Xiaomi',
  lg: 'LG',
  philips: 'Philips',
  dell: 'Dell',
};

export const MANUFACTURER_OPTIONS = toOptions(MANUFACTURER_VALUES, MANUFACTURER_LABELS);

export const CATEGORY_VALUES = ['komputery', 'telefony', 'rtv', 'agd', 'akcesoria'] as const;

export type CategoryValue = (typeof CATEGORY_VALUES)[number];

export const CATEGORY_LABELS: Record<CategoryValue, string> = {
  komputery: 'Komputery',
  telefony: 'Telefony',
  rtv: 'RTV',
  agd: 'AGD',
  akcesoria: 'Akcesoria',
};

export const CATEGORY_OPTIONS = toOptions(CATEGORY_VALUES, CATEGORY_LABELS);

export const FEATURE_VALUES = [
  'bluetooth',
  'wifi',
  'usb-c',
  'wodoodporny',
  'bezprzewodowy',
  'ekologiczny',
  'premium',
] as const;

export type FeatureValue = (typeof FEATURE_VALUES)[number];

const FEATURE_LABELS: Record<FeatureValue, string> = {
  bluetooth: 'Bluetooth',
  wifi: 'WiFi',
  'usb-c': 'USB-C',
  wodoodporny: 'Wodoodporny',
  bezprzewodowy: 'Bezprzewodowy',
  ekologiczny: 'Ekologiczny',
  premium: 'Premium',
};

export const FEATURE_OPTIONS = toOptions(FEATURE_VALUES, FEATURE_LABELS);

/**
 * The rates are the single source of truth: the select options and the string-to-rate
 * conversion at the schema boundary both derive from them, typed down to the literal.
 */
export const VAT_RATES = [23, 8, 5, 0] as const;

export type VatRate = (typeof VAT_RATES)[number];

export const VAT_RATE_OPTIONS = VAT_RATES.map((rate) => ({
  value: String(rate),
  label: `${rate}%`,
}));

export function toVatRate(value: string): VatRate | undefined {
  return VAT_RATES.find((rate) => String(rate) === value);
}

export const CURRENCY_VALUES = ['PLN', 'EUR', 'USD'] as const;

export type CurrencyValue = (typeof CURRENCY_VALUES)[number];

export const CURRENCY_OPTIONS = CURRENCY_VALUES.map((value) => ({ value, label: value }));

type ProductFields = {
  name: string;
  sku: string;
  description?: string;
  manufacturer: ManufacturerValue;
  category: CategoryValue;
  features: FeatureValue[];
  netPrice: number;
  grossPrice: number;
  vatRate: VatRate;
  currency: CurrencyValue;
  isAvailable: boolean;
  minCartQuantity?: number;
  maxCartQuantity?: number;
};

/**
 * A stock level only exists for limited products, so the two travel as one variant instead of
 * an optional number the renderer has to second-guess.
 */
export type ProductInput =
  | (ProductFields & { isLimited: false })
  | (ProductFields & { isLimited: true; stockQuantity: number });

export type Product = ProductInput & { id: string };

/** `crypto.randomUUID` is missing outside a secure context (a demo opened over a LAN address). */
function createId() {
  return crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function createProduct(input: ProductInput): Product {
  return { ...input, id: createId() };
}
