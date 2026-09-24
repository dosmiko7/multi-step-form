import { renderHook, waitFor } from '@testing-library/react';
import { NuqsTestingAdapter } from 'nuqs/adapters/testing';
import type { OnUrlUpdateFunction } from 'nuqs/adapters/testing';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { getProducts } from '@/features/products/api/get-products';
import { PRODUCTS_PER_PAGE, useProductsPage } from '@/features/products/hooks/use-products-page';
import { settleUrl } from '@/testing/settle-url';

const products = [...getProducts(), ...getProducts()];

const LAST_PAGE = Math.ceil(products.length / PRODUCTS_PER_PAGE);

function renderPage(searchParams: string) {
  const onUrlUpdate: OnUrlUpdateFunction = vi.fn();

  const { result } = renderHook(() => useProductsPage(products), {
    wrapper: ({ children }: { children: ReactNode }) => (
      <NuqsTestingAdapter searchParams={searchParams} onUrlUpdate={onUrlUpdate}>
        {children}
      </NuqsTestingAdapter>
    ),
  });

  return { result, onUrlUpdate };
}

const correctedTo = (queryString: string) =>
  expect.objectContaining({
    queryString,
    options: expect.objectContaining({ history: 'replace' }),
  });

describe('useProductsPage', () => {
  it('splits the catalogue into pages of the documented size', async () => {
    const { result, onUrlUpdate } = renderPage('');

    expect(result.current.page).toBe(1);
    expect(result.current.pageCount).toBe(LAST_PAGE);
    expect(result.current.visibleProducts).toHaveLength(PRODUCTS_PER_PAGE);

    await settleUrl();
    expect(onUrlUpdate).not.toHaveBeenCalled();
  });

  it('leaves a page that is in range alone', async () => {
    const { result, onUrlUpdate } = renderPage('?page=2');

    expect(result.current.page).toBe(2);

    await settleUrl();
    expect(onUrlUpdate).not.toHaveBeenCalled();
  });

  it('clamps a page past the end and corrects the URL', async () => {
    const { result, onUrlUpdate } = renderPage('?page=99');

    expect(result.current.page).toBe(LAST_PAGE);
    await waitFor(() =>
      expect(onUrlUpdate).toHaveBeenCalledWith(correctedTo(`?page=${LAST_PAGE}`)),
    );
  });

  it.each(['?page=abc', '?page=2abc', '?page=-1', '?page=0'])(
    'clears %s out of the URL instead of leaving it there',
    async (searchParams) => {
      const { result, onUrlUpdate } = renderPage(searchParams);

      expect(result.current.page).toBe(1);
      await waitFor(() => expect(onUrlUpdate).toHaveBeenCalledWith(correctedTo('')));
    },
  );
});
