import { describe, expect, it } from 'vitest';

import { formatPrice, formatProductCount } from './format';

/** `Intl` joins the amount and the code with a no-break space, so a price never wraps. */
const NBSP = '\u00A0';

describe('formatPrice', () => {
  it.each([
    [9999, 'PLN', `9999,00${NBSP}PLN`],
    [179, 'PLN', `179,00${NBSP}PLN`],
    [1599.5, 'EUR', `1599,50${NBSP}EUR`],
    [0, 'USD', `0,00${NBSP}USD`],
  ] as const)('formats %s %s', (amount, currency, expected) => {
    expect(formatPrice(amount, currency)).toBe(expected);
  });

  it('omits the thousands separator, as the design does', () => {
    expect(formatPrice(9999, 'PLN')).not.toContain('9 999');
  });
});

describe('formatProductCount', () => {
  it.each([
    [0, '0 produktów'],
    [1, '1 produkt'],
    [2, '2 produkty'],
    [4, '4 produkty'],
    [5, '5 produktów'],
    [12, '12 produktów'],
    [22, '22 produkty'],
    [25, '25 produktów'],
    [112, '112 produktów'],
    [122, '122 produkty'],
  ])('declines %i', (count, expected) => {
    expect(formatProductCount(count)).toBe(expected);
  });
});
