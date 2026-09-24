'use client';

import { createParser, useQueryState } from 'nuqs';
import { useEffect } from 'react';

import type { Product } from '@/features/products/domain/product';

export const PRODUCTS_PER_PAGE = 5;

const PAGE_PARAM = 'page';

const PAGE_PATTERN = /^\d+$/;

/**
 * Junk parses to 0 — out of range like `?page=99` — so the effect below corrects the URL
 * instead of leaving `?page=abc` sitting in the address bar.
 */
const pageParser = createParser({
  parse: (value: string) => (PAGE_PATTERN.test(value) ? Number(value) : 0),
  serialize: String,
}).withDefault(1);

export function useGoToFirstPage() {
  const [, setPage] = useQueryState(PAGE_PARAM, pageParser);

  return () => void setPage(1, { history: 'replace' });
}

export function useProductsPage(products: Product[]) {
  const [requestedPage, setPage] = useQueryState(PAGE_PARAM, pageParser);

  const pageCount = Math.max(1, Math.ceil(products.length / PRODUCTS_PER_PAGE));
  const page = Math.min(Math.max(requestedPage, 1), pageCount);

  useEffect(() => {
    if (requestedPage !== page) {
      void setPage(page, { history: 'replace' });
    }
  }, [page, requestedPage, setPage]);

  const start = (page - 1) * PRODUCTS_PER_PAGE;

  return {
    page,
    pageCount,
    goToPage: (nextPage: number) => void setPage(nextPage, { history: 'push' }),
    visibleProducts: products.slice(start, start + PRODUCTS_PER_PAGE),
  };
}
