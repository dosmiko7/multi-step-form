import { describe, expect, it } from 'vitest';

import { availabilitySchema, pricingSchema } from './product-form-schema';

const TOO_LARGE = 'Podaj liczbę nie większą niż 999 999 999';

const PRICE_TOO_LARGE = 'Cena nie może przekraczać 999\u00A0999\u00A0999,99';

const AMOUNT_FORMAT = 'Podaj kwotę w formacie 1234.56 — najwyżej dwa miejsca po przecinku';

function priceMessages(input: string) {
  const result = pricingSchema.shape.netPrice.safeParse(input);
  return result.success ? [] : result.error.issues.map((issue) => issue.message);
}

function pricing(netPrice: string, grossPrice: string, vatRate = '23') {
  return pricingSchema.safeParse({ netPrice, grossPrice, vatRate, currency: 'PLN' });
}

function pricingMessages(result: ReturnType<typeof pricing>, field: string) {
  if (result.success) {
    return [];
  }
  return result.error.issues
    .filter((issue) => issue.path.join('.') === field)
    .map((issue) => issue.message);
}

function availability(fields: Partial<Record<'stockQuantity' | 'minCartQuantity', string>>) {
  return availabilitySchema.safeParse({
    isAvailable: true,
    isLimited: true,
    stockQuantity: '1',
    minCartQuantity: '',
    maxCartQuantity: '',
    ...fields,
  });
}

function messagesAt(result: ReturnType<typeof availability>, field: string) {
  if (result.success) {
    return [];
  }
  return result.error.issues
    .filter((issue) => issue.path.join('.') === field)
    .map((issue) => issue.message);
}

describe('numeric fields', () => {
  it.each(['0xd124', '0b101', '0o17', '1e3', 'Infinity', 'NaN', '-5', '+5', '١٢', '１２'])(
    'rejects %s, which Number() alone would read or half-read',
    (input) => {
      expect(pricingSchema.shape.netPrice.safeParse(input).success).toBe(false);
      expect(availability({ stockQuantity: input }).success).toBe(false);
      expect(availability({ minCartQuantity: input }).success).toBe(false);
    },
  );

  it.each(['abc', '-5', '1e3'])('gives %s one message in a cart limit, not two', (input) => {
    expect(messagesAt(availability({ minCartQuantity: input }), 'minCartQuantity')).toEqual([
      'Podaj nieujemną liczbę całkowitą',
    ]);
  });

  it.each(['stockQuantity', 'minCartQuantity'] as const)(
    'accepts 999 999 999 as %s and refuses one more',
    (field) => {
      expect(availability({ [field]: '999999999' }).success).toBe(true);
      expect(messagesAt(availability({ [field]: '1000000000' }), field)).toEqual([TOO_LARGE]);
    },
  );

  it('refuses a number past 2^53 instead of saving a different one', () => {
    const result = availability({ stockQuantity: '99999999999999999999' });

    expect(messagesAt(result, 'stockQuantity')).toEqual([TOO_LARGE]);
  });

  it('accepts both prices at the ceiling', () => {
    expect(pricing('999999999.99', '999999999.99').success).toBe(true);
  });

  it('refuses a grosz more on each price', () => {
    const result = pricing('1000000000', '1000000000');

    expect(pricingMessages(result, 'netPrice')).toEqual([PRICE_TOO_LARGE]);
    expect(pricingMessages(result, 'grossPrice')).toEqual([PRICE_TOO_LARGE]);
  });

  it('calls a thirteen-digit net price too large, whatever gross it was left with', () => {
    const result = pricing('9999999999999', '123');

    expect(pricingMessages(result, 'netPrice')).toEqual([PRICE_TOO_LARGE]);
  });

  it.each(['12.345', '999999999.999'])('calls %s badly formatted, not too large', (input) => {
    expect(priceMessages(input)).toEqual([AMOUNT_FORMAT]);
  });

  it('still reads leading zeros as the number they spell', () => {
    const result = availability({ stockQuantity: '0012' });

    expect(result.success && result.data.isLimited && result.data.stockQuantity).toBe(12);
  });
});
