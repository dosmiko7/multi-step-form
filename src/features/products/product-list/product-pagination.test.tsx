import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ProductPagination } from './product-pagination';

describe('ProductPagination', () => {
  it('renders nothing while the catalogue fits on one page', () => {
    const { container } = render(
      <ProductPagination page={1} pageCount={1} onPageChange={vi.fn()} />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('offers every page once there is more than one, with Wstecz off on the first', () => {
    render(<ProductPagination page={1} pageCount={2} onPageChange={vi.fn()} />);

    expect(screen.getByRole('button', { name: 'Przejdź do strony 1' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Przejdź do strony 2' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Przejdź do poprzedniej strony' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Przejdź do następnej strony' })).toBeEnabled();
  });
});
