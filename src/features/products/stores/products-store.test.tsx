import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { getProducts } from '@/features/products/api/get-products';
import { ADDED_PRODUCTS_KEY } from '@/features/products/stores/added-products-storage';
import { ProductsProvider, useProducts } from '@/features/products/stores/products-store';
import { renderHydrated } from '@/testing/hydrate';
import { createTestProduct } from '@/testing/products';

const SEED = getProducts();

const SEED_NAMES = SEED.map((product) => product.name);

function Catalogue({ children }: { children: ReactNode }) {
  return <ProductsProvider initialProducts={SEED}>{children}</ProductsProvider>;
}

function renderCatalogue() {
  const { result, unmount } = renderHook(useProducts, { wrapper: Catalogue });

  return {
    unmount,
    add: (name: string) => act(() => result.current.addProduct(createTestProduct(name))),
    hasReadStorage: () => result.current.hasReadStorage,
    names: () => result.current.products.map((product) => product.name),
  };
}

function CatalogueSummary() {
  const { products, hasReadStorage } = useProducts();

  return `read storage: ${hasReadStorage}, products: ${products.length}`;
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('ProductsProvider', () => {
  it('keeps added products, newest first, when the page is loaded again', () => {
    const firstVisit = renderCatalogue();
    firstVisit.add('Dell XPS 13');
    firstVisit.add('Dell XPS 15');
    firstVisit.unmount();

    const secondVisit = renderCatalogue();

    expect(secondVisit.hasReadStorage()).toBe(true);
    expect(secondVisit.names()).toEqual(['Dell XPS 15', 'Dell XPS 13', ...SEED_NAMES]);
  });

  it('serves only the seed from the server, where there is no storage to read', () => {
    localStorage.setItem(ADDED_PRODUCTS_KEY, JSON.stringify([createTestProduct('Dell XPS 13')]));

    const { serverHtml } = renderHydrated(
      <Catalogue>
        <CatalogueSummary />
      </Catalogue>,
    );

    expect(serverHtml).toBe(`read storage: false, products: ${SEED.length}`);
  });

  it.each([
    ['broken JSON', '[{'],
    ['something other than a list', JSON.stringify({ products: [] })],
  ])('treats %s in storage as nothing added', (_, stored) => {
    localStorage.setItem(ADDED_PRODUCTS_KEY, stored);

    const catalogue = renderCatalogue();

    expect(catalogue.hasReadStorage()).toBe(true);
    expect(catalogue.names()).toEqual(SEED_NAMES);
  });

  it.each([
    ['is not an object', null],
    ['has no SKU', { ...createTestProduct('Dell XPS 15'), sku: undefined }],
    [
      'has a price that is not a number',
      { ...createTestProduct('Dell XPS 15'), grossPrice: '123' },
    ],
    ['has a category outside the list', { ...createTestProduct('Dell XPS 15'), category: 'meble' }],
    [
      'has a currency the app cannot format',
      { ...createTestProduct('Dell XPS 15'), currency: 'GBP' },
    ],
    [
      'is limited with no stock level',
      { ...createTestProduct('Dell XPS 15'), stockQuantity: undefined },
    ],
  ])('drops a stored entry that %s and keeps the rest', (_, corrupted) => {
    const readable = createTestProduct('Dell XPS 13');
    localStorage.setItem(ADDED_PRODUCTS_KEY, JSON.stringify([corrupted, readable]));

    const catalogue = renderCatalogue();

    expect(catalogue.names()).toEqual(['Dell XPS 13', ...SEED_NAMES]);
  });

  it('keeps an added product for the visit when storage refuses to write', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('Quota exceeded', 'QuotaExceededError');
    });
    const catalogue = renderCatalogue();

    catalogue.add('Dell XPS 13');

    expect(catalogue.names()).toEqual(['Dell XPS 13', ...SEED_NAMES]);
  });

  it('shows a product added in another tab', () => {
    const catalogue = renderCatalogue();
    const stored = JSON.stringify([createTestProduct('Dell XPS 13')]);

    act(() => {
      localStorage.setItem(ADDED_PRODUCTS_KEY, stored);
      window.dispatchEvent(
        new StorageEvent('storage', { key: ADDED_PRODUCTS_KEY, newValue: stored }),
      );
    });

    expect(catalogue.names()).toEqual(['Dell XPS 13', ...SEED_NAMES]);
  });
});
