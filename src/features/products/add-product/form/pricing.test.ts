import { describe, expect, it } from 'vitest';

import { VAT_RATES, type VatRate } from '@/features/products/domain/product';

import {
  formatAmount,
  grossFromNet,
  netFromGross,
  parseAmount,
  recalculatePrices,
  type PriceBasis,
  type PriceEdit,
} from './pricing';

describe('grossFromNet', () => {
  it.each<[number, VatRate, number]>([
    [100, 23, 123],
    [8129.27, 23, 9999],
    [1300, 23, 1599],
    [145.53, 23, 179],
    [100, 0, 100],
    [100, 8, 108],
    [0, 23, 0],
    [0.5, 23, 0.62],
    [0.1, 5, 0.11],
    [0.29, 23, 0.36],
    [1.15, 8, 1.24],
    [2.3, 5, 2.42],
    [4.1, 5, 4.31],
    [32.3, 5, 33.92],
  ])('net %s at %s%% is %s gross', (net, vatRate, expected) => {
    expect(grossFromNet(net, vatRate)).toBe(expected);
  });
});

describe('netFromGross', () => {
  it.each<[number, VatRate, number]>([
    [123, 23, 100],
    [9999, 23, 8129.27],
    [1599, 23, 1300],
    [179, 23, 145.53],
    [100, 0, 100],
    [108, 8, 100],
    [100.03, 23, 81.33],
    [2.42, 5, 2.3],
    [0.29, 8, 0.27],
  ])('gross %s at %s%% is %s net', (gross, vatRate, expected) => {
    expect(netFromGross(gross, vatRate)).toBe(expected);
  });
});

describe('net and gross round-trip', () => {
  it.each(VAT_RATES)('net survives a round trip at %s%%', (vatRate) => {
    const drifted = [];
    for (let grosze = 0; grosze <= 200_000; grosze += 1) {
      const net = grosze / 100;
      if (netFromGross(grossFromNet(net, vatRate), vatRate) !== net) {
        drifted.push(net);
      }
    }
    expect(drifted).toEqual([]);
  });
});

describe('formatAmount', () => {
  it.each([
    [123, '123.00'],
    [0, '0.00'],
    [8129.27, '8129.27'],
    [0.5, '0.50'],
  ])('renders %s as %s', (amount, expected) => {
    expect(formatAmount(amount)).toBe(expected);
  });

  it('can answer with a decimal comma', () => {
    expect(formatAmount(8129.27, ',')).toBe('8129,27');
  });
});

describe('parseAmount', () => {
  it.each([
    ['12.34', 12.34],
    ['12,34', 12.34],
    [' 12.34 ', 12.34],
    ['0', 0],
    ['12.', 12],
    ['1 234,56', 1234.56],
    ['1\u00A0234,56', 1234.56],
  ])('parses %s', (value, expected) => {
    expect(parseAmount(value)).toBe(expected);
  });

  it.each([
    '',
    '   ',
    'abc',
    '1,234.56',
    '-5',
    '-0',
    '+12.34',
    '0x10',
    '0b101',
    '1e3',
    '1e-7',
    'Infinity',
    '12.345',
    '.5',
    '9999999999999',
  ])('rejects %s', (value) => {
    expect(parseAmount(value)).toBeUndefined();
  });
});

describe('recalculatePrices', () => {
  const amounts = { netPrice: '100.00', grossPrice: '123.00', vatRate: 23 } as const;

  it('derives gross when net is edited', () => {
    expect(
      recalculatePrices({ edited: 'net', basis: 'net', amounts: { ...amounts, netPrice: '200' } }),
    ).toEqual({ basis: 'net', update: { field: 'grossPrice', value: '246.00' } });
  });

  it('derives net when gross is edited', () => {
    expect(
      recalculatePrices({
        edited: 'gross',
        basis: 'gross',
        amounts: { ...amounts, grossPrice: '246' },
      }),
    ).toEqual({ basis: 'gross', update: { field: 'netPrice', value: '200.00' } });
  });

  it('follows the edited field, not the stored basis, and hands back the new basis', () => {
    expect(
      recalculatePrices({
        edited: 'net',
        basis: 'gross',
        amounts: { ...amounts, netPrice: '200' },
      }),
    ).toEqual({ basis: 'net', update: { field: 'grossPrice', value: '246.00' } });

    expect(
      recalculatePrices({
        edited: 'gross',
        basis: 'net',
        amounts: { ...amounts, grossPrice: '246' },
      }),
    ).toEqual({ basis: 'gross', update: { field: 'netPrice', value: '200.00' } });
  });

  it('moves gross when VAT changes and net was authored', () => {
    expect(
      recalculatePrices({ edited: 'vat', basis: 'net', amounts: { ...amounts, vatRate: 8 } }),
    ).toEqual({ basis: 'net', update: { field: 'grossPrice', value: '108.00' } });
  });

  it('moves net when VAT changes and gross was authored', () => {
    expect(
      recalculatePrices({ edited: 'vat', basis: 'gross', amounts: { ...amounts, vatRate: 8 } }),
    ).toEqual({ basis: 'gross', update: { field: 'netPrice', value: '113.89' } });
  });

  it('leaves a gross-authored price untouched across a VAT round trip', () => {
    const authored = '100.03';
    const at8 = recalculatePrices({
      edited: 'vat',
      basis: 'gross',
      amounts: { netPrice: '81.33', grossPrice: authored, vatRate: 8 },
    });

    expect(at8.update).toEqual({ field: 'netPrice', value: '92.62' });

    const backTo23 = recalculatePrices({
      edited: 'vat',
      basis: at8.basis,
      amounts: { netPrice: at8.update?.value ?? '', grossPrice: authored, vatRate: 23 },
    });

    expect(backTo23.update).toEqual({ field: 'netPrice', value: '81.33' });
  });

  it('leaves the sibling alone while the source is only half typed', () => {
    expect(
      recalculatePrices({
        edited: 'gross',
        basis: 'gross',
        amounts: { netPrice: '200.00', grossPrice: '246.009', vatRate: 23 },
      }),
    ).toEqual({ basis: 'gross' });
  });

  it('answers in the separator the user typed', () => {
    expect(
      recalculatePrices({
        edited: 'net',
        basis: 'net',
        amounts: { netPrice: '1 234,56', grossPrice: '', vatRate: 23 },
      }).update,
    ).toEqual({ field: 'grossPrice', value: '1518,51' });
  });

  it.each<[PriceEdit, PriceBasis, 'netPrice' | 'grossPrice']>([
    ['net', 'net', 'grossPrice'],
    ['gross', 'gross', 'netPrice'],
    ['vat', 'net', 'grossPrice'],
    ['vat', 'gross', 'netPrice'],
  ])('clears the derived side when the source is empty (%s/%s)', (edited, basis, field) => {
    expect(
      recalculatePrices({
        edited,
        basis,
        amounts: { netPrice: '', grossPrice: '', vatRate: 23 },
      }).update,
    ).toEqual({ field, value: '' });
  });

  it('clears a stale sibling rather than leaving the old derived value', () => {
    expect(
      recalculatePrices({
        edited: 'net',
        basis: 'net',
        amounts: { netPrice: '', grossPrice: '123.00', vatRate: 23 },
      }).update,
    ).toEqual({ field: 'grossPrice', value: '' });
  });
});
