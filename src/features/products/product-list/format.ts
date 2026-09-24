import type { CurrencyValue } from '@/features/products/domain/product';

function priceFormatter(currency: CurrencyValue) {
  return new Intl.NumberFormat('pl-PL', {
    style: 'currency',
    currency,
    currencyDisplay: 'code',
    useGrouping: false,
  });
}

const PRICE_FORMATTERS = {
  PLN: priceFormatter('PLN'),
  EUR: priceFormatter('EUR'),
  USD: priceFormatter('USD'),
} satisfies Record<CurrencyValue, Intl.NumberFormat>;

export function formatPrice(amount: number, currency: CurrencyValue) {
  return PRICE_FORMATTERS[currency].format(amount);
}

const PRODUCT_FORMS: Record<Intl.LDMLPluralRule, string> = {
  zero: 'produktów',
  one: 'produkt',
  two: 'produkty',
  few: 'produkty',
  many: 'produktów',
  other: 'produktów',
};

const polishPlurals = new Intl.PluralRules('pl-PL');

export function formatProductCount(count: number): string {
  return `${count} ${PRODUCT_FORMS[polishPlurals.select(count)]}`;
}
