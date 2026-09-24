import { render, screen, within } from '@testing-library/react';
import { NuqsTestingAdapter } from 'nuqs/adapters/testing';
import { describe, expect, it } from 'vitest';

import { getProducts } from '@/features/products/api/get-products';
import { ProductsProvider } from '@/features/products/stores/products-store';

import { ProductList } from './product-list';
import { ProductTableSkeleton } from './product-table';

const COLUMN_LABELS = ['Nazwa', 'SKU', 'Kategoria', 'Cena Brutto', 'Status', 'Magazyn'];

/** Prices come out of `Intl` with a no-break space before the currency code. */
const NBSP = '\u00A0';

function renderList() {
  render(
    <NuqsTestingAdapter>
      <ProductsProvider initialProducts={getProducts()}>
        <ProductList />
      </ProductsProvider>
    </NuqsTestingAdapter>,
  );
}

function rowOf(table: HTMLElement, name: string) {
  const row = within(table).getByRole('cell', { name }).closest('tr');
  if (!row) {
    throw new Error(`no row for ${name}`);
  }
  return within(row);
}

describe('ProductList', () => {
  it('shows the catalogue size in the header', async () => {
    renderList();

    expect(await screen.findByRole('heading', { name: 'Produkty' })).toBeInTheDocument();
    expect(screen.getByText('5 produktów w katalogu')).toBeInTheDocument();
  });

  it('renders every product both as a table row and as a card', async () => {
    renderList();

    const table = await screen.findByRole('table');
    const cards = screen.getByRole('list');

    for (const product of getProducts()) {
      expect(within(table).getByRole('cell', { name: product.name })).toBeInTheDocument();
      expect(within(cards).getByText(product.name)).toBeInTheDocument();
    }
  });

  it('formats a row the way the catalogue describes the product', async () => {
    renderList();

    const table = await screen.findByRole('table');

    const inStock = rowOf(table, 'Galaxy S24 Ultra');
    expect(inStock.getByRole('cell', { name: `6299,00${NBSP}PLN` })).toBeInTheDocument();
    expect(inStock.getByText('Dostępny')).toBeInTheDocument();
    expect(inStock.getByRole('cell', { name: '45' })).toBeInTheDocument();

    const unlimited = rowOf(table, 'MacBook Pro 14"');
    expect(unlimited.getByRole('cell', { name: '—' })).toBeInTheDocument();

    const soldOut = rowOf(table, 'Bosch Serie 6 WAU28P40');
    expect(soldOut.getByText('Niedostępny')).toBeInTheDocument();
    expect(soldOut.getByRole('cell', { name: '0' })).toBeInTheDocument();
  });

  it('shows the page summary but no pager while everything fits on one page', async () => {
    renderList();

    await screen.findByRole('table');

    expect(screen.getAllByText('Strona 1 z 1 · 5 produktów')).toHaveLength(2);
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
  });
});

describe('ProductTableSkeleton', () => {
  it('is the real table: the same columns and one page of placeholder rows', () => {
    const { container } = render(<ProductTableSkeleton />);

    expect(screen.getAllByRole('columnheader').map((cell) => cell.textContent)).toEqual(
      COLUMN_LABELS,
    );
    expect(container.querySelectorAll('tbody tr')).toHaveLength(5);
    expect(container.querySelectorAll('tbody td [data-slot="skeleton"]')).toHaveLength(30);
  });
});
