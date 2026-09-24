'use client';

import { useRef } from 'react';

import { toVatRate } from '@/features/products/domain/product';

import { recalculatePrices, type PriceBasis, type PriceEdit } from './pricing';
import type { ProductFormApi } from './use-product-form';

/**
 * Lives above the pricing step: the step unmounts on navigation, and a ref inside it would
 * forget which side of the price was authored.
 */
export function usePriceRecalculation(form: ProductFormApi) {
  const basisRef = useRef<PriceBasis>('net');

  return (edited: PriceEdit) => {
    const { netPrice, grossPrice, vatRate } = form.state.values.pricing;
    // Narrowing only: the select offers nothing else and the default is a valid rate.
    const rate = toVatRate(vatRate);

    if (rate === undefined) {
      return;
    }

    const { basis, update } = recalculatePrices({
      edited,
      basis: basisRef.current,
      amounts: { netPrice, grossPrice, vatRate: rate },
    });

    basisRef.current = basis;

    if (!update) {
      return;
    }

    // Written without listeners (the sibling's own listener would fire back) and without
    // touching meta; the validation that follows the user's edit already sees this value.
    form.setFieldValue(`pricing.${update.field}`, update.value, {
      dontRunListeners: true,
      dontUpdateMeta: true,
    });
  };
}
