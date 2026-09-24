import { render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ProductPagination } from './product-pagination';

/** The phone bar renders first, the wide one second; CSS shows one at a time. */
function renderBars(page: number, pageCount: number) {
  render(<ProductPagination page={page} pageCount={pageCount} onPageChange={vi.fn()} />);

  const [phone, wide] = screen.getAllByRole('navigation');
  return { phone, wide };
}

function pageButtons(bar: HTMLElement) {
  return within(bar)
    .getAllByRole('button')
    .slice(1, -1)
    .map((button) => button.textContent);
}

describe('ProductPagination', () => {
  it('renders nothing while the catalogue fits on one page', () => {
    const { container } = render(
      <ProductPagination page={1} pageCount={1} onPageChange={vi.fn()} />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('offers every page once there is more than one, with Wstecz off on the first', () => {
    const { wide } = renderBars(1, 2);

    const bar = within(wide);
    expect(bar.getByRole('button', { name: 'Przejdź do strony 1' })).toBeInTheDocument();
    expect(bar.getByRole('button', { name: 'Przejdź do strony 2' })).toBeInTheDocument();
    expect(bar.getByRole('button', { name: 'Przejdź do poprzedniej strony' })).toBeDisabled();
    expect(bar.getByRole('button', { name: 'Przejdź do następnej strony' })).toBeEnabled();
  });

  it('keeps the neighbours of the current page out of the phone bar', () => {
    const { phone, wide } = renderBars(6, 60);

    expect(pageButtons(phone)).toEqual(['1', '6', '60']);
    expect(pageButtons(wide)).toEqual(['1', '5', '6', '7', '60']);
  });
});
