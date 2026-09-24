import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { renderToString } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { getProducts } from '@/features/products/api/get-products';
import { createProduct, type Product } from '@/features/products/domain/product';

import { ADDED_PRODUCTS_KEY } from './added-products-storage';
import { ProductsProvider, useProducts } from './products-store';

const SEED = getProducts();

const SEED_NAMES = SEED.map((product) => product.name);

function newProduct(name: string): Product {
  return createProduct({
    name,
    sku: 'NEW1',
    manufacturer: 'dell',
    category: 'komputery',
    features: ['wifi'],
    netPrice: 100,
    grossPrice: 123,
    vatRate: 23,
    currency: 'PLN',
    isAvailable: true,
    isLimited: true,
    stockQuantity: 3,
  });
}

function Catalogue({ children }: { children: ReactNode }) {
  return <ProductsProvider initialProducts={SEED}>{children}</ProductsProvider>;
}

function renderCatalogue() {
  const { result, unmount } = renderHook(useProducts, { wrapper: Catalogue });

  return {
    unmount,
    add: (name: string) => act(() => result.current.addProduct(newProduct(name))),
    isRestored: () => result.current.isRestored,
    names: () => result.current.products.map((product) => product.name),
  };
}

function CatalogueSummary() {
  const { products, isRestored } = useProducts();

  return `restored: ${isRestored}, products: ${products.length}`;
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

    expect(secondVisit.isRestored()).toBe(true);
    expect(secondVisit.names()).toEqual(['Dell XPS 15', 'Dell XPS 13', ...SEED_NAMES]);
  });

  it('serves only the seed from the server, where there is no storage to read', () => {
    localStorage.setItem(ADDED_PRODUCTS_KEY, JSON.stringify([newProduct('Dell XPS 13')]));

    const html = renderToString(
      <Catalogue>
        <CatalogueSummary />
      </Catalogue>,
    );

    expect(html).toBe(`restored: false, products: ${SEED.length}`);
  });

  it.each([
    ['broken JSON', '[{'],
    ['something other than a list', JSON.stringify({ products: [] })],
  ])('treats %s in storage as nothing added', (_, stored) => {
    localStorage.setItem(ADDED_PRODUCTS_KEY, stored);

    const catalogue = renderCatalogue();

    expect(catalogue.isRestored()).toBe(true);
    expect(catalogue.names()).toEqual(SEED_NAMES);
  });

  it.each([
    ['a missing field', { sku: undefined }],
    ['a currency the app cannot format', { currency: 'GBP' }],
    ['a VAT rate outside the list', { vatRate: 7 }],
    ['a feature outside the list', { features: ['wifi', 'nfc'] }],
    ['a price that is not a number', { grossPrice: '123' }],
    ['a limited product with no stock level', { stockQuantity: undefined }],
  ])('skips an entry with %s and keeps the rest', (_, corruption) => {
    const readable = newProduct('Dell XPS 13');
    const corrupted = { ...newProduct('Dell XPS 15'), ...corruption };
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
    const stored = JSON.stringify([newProduct('Dell XPS 13')]);

    act(() => {
      localStorage.setItem(ADDED_PRODUCTS_KEY, stored);
      window.dispatchEvent(
        new StorageEvent('storage', { key: ADDED_PRODUCTS_KEY, newValue: stored }),
      );
    });

    expect(catalogue.names()).toEqual(['Dell XPS 13', ...SEED_NAMES]);
  });
});
