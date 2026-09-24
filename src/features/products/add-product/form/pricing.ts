import type { VatRate } from '@/features/products/domain/product';

export type PriceBasis = 'net' | 'gross';

export type PriceEdit = PriceBasis | 'vat';

export type PriceAmounts = {
  netPrice: string;
  grossPrice: string;
  vatRate: VatRate;
};

export type PriceUpdate = {
  field: 'netPrice' | 'grossPrice';
  value: string;
};

export type PriceRecalculation = {
  basis: PriceBasis;
  update?: PriceUpdate;
};

/**
 * At most two decimals: the arithmetic runs on whole grosze, which is exact for every such
 * amount — a third decimal would reintroduce unrepresentable ties.
 */
export const AMOUNT_PATTERN = /^\d+(\.\d{1,2})?$/;

export const MAX_PRICE = 999_999_999.99;

const PARTIAL_AMOUNT_PATTERN = /^\d{1,12}(\.\d{0,2})?$/;

const WHITESPACE = /\s/g;

const TRAILING_SEPARATOR = /\.$/;

export function normaliseAmount(value: string) {
  return value.replace(WHITESPACE, '').replaceAll(',', '.').replace(TRAILING_SEPARATOR, '');
}

const toGrosze = (amount: number) => Math.round(amount * 100);

export function grossFromNet(net: number, vatRate: VatRate) {
  return Math.round((toGrosze(net) * (100 + vatRate)) / 100) / 100;
}

export function netFromGross(gross: number, vatRate: VatRate) {
  return Math.round((toGrosze(gross) * 100) / (100 + vatRate)) / 100;
}

export function parseAmount(value: string): number | undefined {
  const normalised = normaliseAmount(value);
  if (!PARTIAL_AMOUNT_PATTERN.test(normalised)) {
    return undefined;
  }
  return Number(normalised);
}

export function formatAmount(amount: number, separator: '.' | ',' = '.') {
  return amount.toFixed(2).replace('.', separator);
}

export function recalculatePrices({
  edited,
  basis,
  amounts,
}: {
  edited: PriceEdit;
  basis: PriceBasis;
  amounts: PriceAmounts;
}): PriceRecalculation {
  const authored = edited === 'vat' ? basis : edited;
  const source = authored === 'net' ? amounts.netPrice : amounts.grossPrice;
  const field = authored === 'net' ? 'grossPrice' : 'netPrice';

  if (source.trim() === '') {
    return { basis: authored, update: { field, value: '' } };
  }

  const amount = parseAmount(source);

  // Mid-edit garbage is transient: leave the sibling alone rather than blanking a good value.
  if (amount === undefined) {
    return { basis: authored };
  }

  const derived =
    authored === 'net'
      ? grossFromNet(amount, amounts.vatRate)
      : netFromGross(amount, amounts.vatRate);

  return {
    basis: authored,
    update: { field, value: formatAmount(derived, source.includes(',') ? ',' : '.') },
  };
}
