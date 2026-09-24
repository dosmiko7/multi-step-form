import { z } from 'zod';

import {
  CATEGORY_VALUES,
  CURRENCY_VALUES,
  FEATURE_VALUES,
  MANUFACTURER_VALUES,
  VAT_RATES,
  toVatRate,
} from '@/features/products/domain/product';

import { AMOUNT_PATTERN, MAX_PRICE, normaliseAmount } from './pricing';

const INTEGER_PATTERN = /^\d+$/;

/** Far below 2^53, past which a typed number is silently stored as a different one. */
const MAX_QUANTITY = 999_999_999;

const quantityCeiling = z
  .number()
  .max(MAX_QUANTITY, { error: 'Podaj liczbę nie większą niż 999 999 999' })
  .optional();

const PRICE_LIMIT = new Intl.NumberFormat('pl-PL', { minimumFractionDigits: 2 });

/** Piped rather than chained so one mistake reports one message — sibling checks all run. */
function amountField(label: string) {
  return z
    .string()
    .trim()
    .min(1, { error: `Podaj ${label}` })
    .transform(normaliseAmount)
    .pipe(
      z.string().regex(AMOUNT_PATTERN, {
        error: 'Podaj kwotę w formacie 1234.56 — najwyżej dwa miejsca po przecinku',
      }),
    )
    .transform(Number)
    .pipe(
      z.number().max(MAX_PRICE, {
        error: `Cena nie może przekraczać ${PRICE_LIMIT.format(MAX_PRICE)}`,
      }),
    );
}

function cartQuantityField() {
  return z
    .string()
    .trim()
    .refine((value) => value === '' || INTEGER_PATTERN.test(value), {
      error: 'Podaj nieujemną liczbę całkowitą',
    })
    .transform((value) => (value === '' ? undefined : Number(value)))
    .pipe(quantityCeiling);
}

function stockQuantityField() {
  return z
    .string()
    .trim()
    .transform((value) => (INTEGER_PATTERN.test(value) ? Number(value) : undefined))
    .pipe(quantityCeiling);
}

/** An unmade choice is '', so any string is accepted and piped into the enum for one clear error. */
function selectField<TValue extends string>(values: readonly [TValue, ...TValue[]], error: string) {
  return z.string().pipe(z.enum(values, { error }));
}

export const basicsSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, { error: 'Nazwa musi mieć co najmniej 3 znaki' })
    .max(100, { error: 'Nazwa może mieć maksymalnie 100 znaków' }),
  sku: z
    .string()
    .trim()
    .min(1, { error: 'Podaj SKU produktu' })
    .pipe(
      z
        .string()
        .max(24, { error: 'SKU może mieć maksymalnie 24 znaki' })
        .regex(/^[A-Za-z0-9]+$/, { error: 'SKU może zawierać tylko litery i cyfry' }),
    ),
  description: z.string().trim(),
  manufacturer: selectField(MANUFACTURER_VALUES, 'Wybierz producenta'),
  category: selectField(CATEGORY_VALUES, 'Wybierz kategorię'),
  features: z.array(z.enum(FEATURE_VALUES)).min(1, { error: 'Wybierz co najmniej jedną cechę' }),
});

export const pricingSchema = z.object({
  netPrice: amountField('cenę netto'),
  grossPrice: amountField('cenę brutto'),
  vatRate: z
    .string()
    .transform(toVatRate)
    .pipe(z.literal(VAT_RATES, { error: 'Wybierz stawkę VAT' })),
  currency: selectField(CURRENCY_VALUES, 'Wybierz walutę'),
});

const availabilityFields = z.object({
  isAvailable: z.boolean(),
  isLimited: z.boolean(),
  stockQuantity: stockQuantityField(),
  minCartQuantity: cartQuantityField(),
  maxCartQuantity: cartQuantityField(),
});

const CART_RANGE_MESSAGES: {
  field: keyof z.output<typeof availabilityFields>;
  message: string;
}[] = [
  { field: 'minCartQuantity', message: 'Minimalna ilość nie może być większa niż maksymalna' },
  { field: 'maxCartQuantity', message: 'Maksymalna ilość nie może być mniejsza niż minimalna' },
];

/** Both rows carry the rule, so whichever the user just edited shows it, phrased from its side. */
function addCartRangeIssues(
  { minCartQuantity, maxCartQuantity }: { minCartQuantity?: unknown; maxCartQuantity?: unknown },
  ctx: z.RefinementCtx,
) {
  if (typeof minCartQuantity !== 'number' || typeof maxCartQuantity !== 'number') {
    return;
  }

  if (minCartQuantity <= maxCartQuantity) {
    return;
  }

  for (const { field, message } of CART_RANGE_MESSAGES) {
    ctx.addIssue({ code: 'custom', path: [field], message });
  }
}

/** Expresses in the type what the refine just guaranteed: stock exists only on limited products. */
function toStockVariant({
  stockQuantity,
  isLimited,
  ...values
}: z.output<typeof availabilityFields>) {
  if (!isLimited || stockQuantity === undefined) {
    return { ...values, isLimited: false as const };
  }

  return { ...values, isLimited: true as const, stockQuantity };
}

export const availabilitySchema = availabilityFields
  .superRefine((values, ctx) => {
    if (values.isLimited && values.stockQuantity === undefined) {
      ctx.addIssue({
        code: 'custom',
        path: ['stockQuantity'],
        message: 'Podaj stan magazynowy (nieujemna liczba całkowita)',
      });
    }

    addCartRangeIssues(values, ctx);
  })
  .transform(toStockVariant);

export const productFormSchema = z.object({
  basics: basicsSchema,
  pricing: pricingSchema,
  availability: availabilitySchema,
});

export type ProductFormValues = z.input<typeof productFormSchema>;

export type ProductFormOutput = z.output<typeof productFormSchema>;

export const PRODUCT_FORM_DEFAULTS: ProductFormValues = {
  basics: {
    name: '',
    sku: '',
    description: '',
    manufacturer: '',
    category: '',
    features: [],
  },
  pricing: {
    netPrice: '',
    grossPrice: '',
    vatRate: '23',
    currency: 'PLN',
  },
  availability: {
    isAvailable: true,
    isLimited: false,
    stockQuantity: '',
    minCartQuantity: '1',
    maxCartQuantity: '10',
  },
};
