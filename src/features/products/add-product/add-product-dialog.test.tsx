import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { UserEvent } from '@testing-library/user-event';
import { NuqsTestingAdapter } from 'nuqs/adapters/testing';
import type { OnUrlUpdateFunction } from 'nuqs/adapters/testing';
import { describe, expect, it, vi } from 'vitest';

import { getProducts } from '@/features/products/api/get-products';
import { useProducts, ProductsProvider } from '@/features/products/stores/products-store';
import type { Product } from '@/features/products/domain/product';
import { AddProductDialog } from './add-product-dialog';

function SavedProductsList() {
  const { products } = useProducts();

  return (
    <ul data-testid="saved-products">
      {products.map((product) => (
        <li key={product.id}>
          {[
            product.name,
            product.sku,
            product.description ?? 'bez opisu',
            product.features.join('+'),
            `${product.netPrice}/${product.grossPrice} ${product.currency} @${product.vatRate}`,
            product.isAvailable ? 'dostępny' : 'niedostępny',
            product.isLimited ? `magazyn ${product.stockQuantity}` : 'bez limitu',
          ].join(' · ')}
        </li>
      ))}
    </ul>
  );
}

function setup({
  initialProducts = [],
  searchParams = '',
  onUrlUpdate,
}: {
  initialProducts?: Product[];
  searchParams?: string;
  onUrlUpdate?: OnUrlUpdateFunction;
} = {}) {
  render(
    <NuqsTestingAdapter searchParams={searchParams} onUrlUpdate={onUrlUpdate}>
      <ProductsProvider initialProducts={initialProducts}>
        <AddProductDialog />
        <SavedProductsList />
      </ProductsProvider>
    </NuqsTestingAdapter>,
  );

  return userEvent.setup();
}

async function chooseOption(user: UserEvent, comboboxName: string, optionName: string) {
  await user.click(screen.getByRole('combobox', { name: comboboxName }));
  await user.click(await screen.findByRole('option', { name: optionName }));
}

async function openDialog(user: UserEvent) {
  await user.click(screen.getByRole('button', { name: 'Dodaj produkt' }));
  await screen.findByLabelText('Nazwa produktu');
}

async function fillBasics(user: UserEvent) {
  await user.type(screen.getByLabelText('Nazwa produktu'), 'MacBook Pro 14');
  await user.type(screen.getByLabelText('SKU produktu'), 'MBP14M3PRO');
  await chooseOption(user, 'Producent', 'Apple');
  await chooseOption(user, 'Kategoria', 'Komputery');
  await user.click(screen.getByRole('button', { name: 'Bluetooth' }));
}

async function fillPricing(user: UserEvent) {
  await user.type(screen.getByLabelText('Cena netto'), '100');
}

const savedProducts = () => screen.getByTestId('saved-products');

const next = (user: UserEvent) => user.click(screen.getByRole('button', { name: 'Dalej' }));
const back = (user: UserEvent) => user.click(screen.getByRole('button', { name: 'Wstecz' }));

async function goToAvailabilityStep(user: UserEvent) {
  await openDialog(user);
  await fillBasics(user);
  await next(user);
  await fillPricing(user);
  await next(user);
}

const save = (user: UserEvent) =>
  user.click(screen.getByRole('button', { name: 'Zapisz produkt' }));

describe('AddProductDialog', () => {
  it('refuses to advance while the step is invalid and reports each problem', async () => {
    const user = setup();
    await openDialog(user);
    await next(user);

    expect(screen.getAllByRole('alert').map((alert) => alert.textContent)).toEqual([
      'Nazwa musi mieć co najmniej 3 znaki',
      'Podaj SKU produktu',
      'Wybierz producenta',
      'Wybierz kategorię',
      'Wybierz co najmniej jedną cechę',
    ]);
    expect(screen.getByLabelText('Nazwa produktu')).toHaveFocus();
  });

  it('reports only the field the user just left', async () => {
    const user = setup();
    await openDialog(user);

    await user.click(screen.getByLabelText('Nazwa produktu'));
    await user.click(screen.getByLabelText('SKU produktu'));

    expect(screen.getAllByRole('alert').map((alert) => alert.textContent)).toEqual([
      'Nazwa musi mieć co najmniej 3 znaki',
    ]);
    expect(screen.getByLabelText('SKU produktu')).not.toHaveAttribute('aria-invalid');
    expect(screen.getByRole('combobox', { name: 'Producent' })).not.toHaveAttribute('aria-invalid');
    expect(screen.getByRole('combobox', { name: 'Kategoria' })).not.toHaveAttribute('aria-invalid');
  });

  it('says nothing while the user is still typing into a field for the first time', async () => {
    const user = setup();
    await openDialog(user);

    await user.type(screen.getByLabelText('Nazwa produktu'), 'Ma');

    expect(screen.queryAllByRole('alert')).toHaveLength(0);
  });

  it('takes a showing error back mid-typing, without waiting for another blur', async () => {
    const user = setup();
    await openDialog(user);

    const name = screen.getByLabelText('Nazwa produktu');

    await user.click(name);
    await user.tab();

    expect(screen.getByText('Nazwa musi mieć co najmniej 3 znaki')).toBeInTheDocument();

    await user.type(name, 'MacBook');

    expect(screen.queryByText('Nazwa musi mieć co najmniej 3 znaki')).not.toBeInTheDocument();
    expect(name).toHaveFocus();
  });

  it('leaves the other errors up while one of them is being fixed', async () => {
    const user = setup();
    await openDialog(user);
    await next(user);

    await user.type(screen.getByLabelText('Nazwa produktu'), 'MacBook Pro 14');

    expect(screen.getAllByRole('alert').map((alert) => alert.textContent)).toEqual([
      'Podaj SKU produktu',
      'Wybierz producenta',
      'Wybierz kategorię',
      'Wybierz co najmniej jedną cechę',
    ]);
  });

  it('arrives at step 2 with no errors showing', async () => {
    const user = setup();
    await openDialog(user);
    await fillBasics(user);
    await next(user);

    expect(screen.getByLabelText('Cena netto')).toBeInTheDocument();
    expect(screen.queryAllByRole('alert')).toHaveLength(0);
  });

  it('moves focus into each new step instead of dropping it on the document', async () => {
    const user = setup();
    await openDialog(user);
    await fillBasics(user);
    await next(user);

    expect(screen.getByLabelText('Cena netto')).toHaveFocus();

    await back(user);

    expect(screen.getByLabelText('Nazwa produktu')).toHaveFocus();
  });

  it('keeps every value when stepping back', async () => {
    const user = setup();
    await openDialog(user);
    await fillBasics(user);
    await next(user);

    expect(screen.getByLabelText('Cena netto')).toBeInTheDocument();

    await back(user);

    expect(screen.getByLabelText('Nazwa produktu')).toHaveValue('MacBook Pro 14');
    expect(screen.getByLabelText('SKU produktu')).toHaveValue('MBP14M3PRO');
    expect(screen.getByRole('button', { name: 'Bluetooth' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  it('derives gross from net, and moves the derived side when VAT changes', async () => {
    const user = setup();
    await openDialog(user);
    await fillBasics(user);
    await next(user);

    await user.type(screen.getByLabelText('Cena netto'), '100');
    expect(screen.getByLabelText('Cena brutto')).toHaveValue('123.00');

    await chooseOption(user, 'Stawka VAT', '8%');
    expect(screen.getByLabelText('Cena netto')).toHaveValue('100');
    expect(screen.getByLabelText('Cena brutto')).toHaveValue('108.00');
  });

  it('derives net from gross, and protects the gross the user typed', async () => {
    const user = setup();
    await openDialog(user);
    await fillBasics(user);
    await next(user);

    await user.type(screen.getByLabelText('Cena brutto'), '246');
    expect(screen.getByLabelText('Cena netto')).toHaveValue('200.00');

    await chooseOption(user, 'Stawka VAT', '8%');
    expect(screen.getByLabelText('Cena brutto')).toHaveValue('246');
    expect(screen.getByLabelText('Cena netto')).toHaveValue('227.78');
  });

  it('reveals the stock field only while the product is limited, and clears it again', async () => {
    const user = setup();
    await goToAvailabilityStep(user);

    expect(screen.queryByLabelText('Ilość na magazynie')).not.toBeInTheDocument();

    const limited = screen.getByRole('checkbox', { name: 'Produkt limitowany' });

    await user.click(limited);
    await user.type(await screen.findByLabelText('Ilość na magazynie'), '50');
    await user.click(limited);
    await user.click(limited);

    expect(await screen.findByLabelText('Ilość na magazynie')).toHaveValue('');
  });

  it('brings the stock field back neutral, not red, once it is limited again', async () => {
    const user = setup();
    await goToAvailabilityStep(user);

    const limited = screen.getByRole('checkbox', { name: 'Produkt limitowany' });

    await user.click(limited);
    await user.type(await screen.findByLabelText('Ilość na magazynie'), '50');
    await user.click(limited);
    await user.click(limited);

    expect(await screen.findByLabelText('Ilość na magazynie')).not.toHaveAttribute('aria-invalid');
    expect(screen.queryAllByRole('alert')).toHaveLength(0);
  });

  it('reports a cart range that is the wrong way round on the field just edited', async () => {
    const user = setup();
    await goToAvailabilityStep(user);

    await user.clear(screen.getByLabelText('Minimalna ilość'));
    await user.type(screen.getByLabelText('Minimalna ilość'), '20');
    await save(user);

    expect(screen.getByLabelText('Minimalna ilość')).toHaveAttribute('aria-invalid', 'true');
    expect(
      screen.getByText('Minimalna ilość nie może być większa niż maksymalna'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Maksymalna ilość nie może być mniejsza niż minimalna'),
    ).toBeInTheDocument();
    expect(within(savedProducts()).queryAllByRole('listitem')).toHaveLength(0);
  });

  it('saves with the cart limits cleared — the spec never made them required', async () => {
    const user = setup();
    await goToAvailabilityStep(user);

    await user.clear(screen.getByLabelText('Minimalna ilość'));
    await user.clear(screen.getByLabelText('Maksymalna ilość'));
    await save(user);

    expect(await screen.findByText(/^MacBook Pro 14/)).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('saves the product and closes', async () => {
    const user = setup();
    await goToAvailabilityStep(user);
    await save(user);

    expect(
      await screen.findByText(
        'MacBook Pro 14 · MBP14M3PRO · bez opisu · bluetooth · 100/123 PLN @23 · dostępny · bez limitu',
      ),
    ).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('puts a newly saved product at the front of the catalogue', async () => {
    const user = setup({ initialProducts: getProducts().slice(1, 2) });
    await goToAvailabilityStep(user);
    await save(user);

    expect(await screen.findByText(/^MacBook Pro 14 · MBP14M3PRO/)).toBeInTheDocument();

    const [first] = within(savedProducts()).getAllByRole('listitem');

    expect(first).toHaveTextContent(/^MacBook Pro 14 · MBP14M3PRO/);
  });

  it('returns the catalogue to the first page after saving', async () => {
    const onUrlUpdate = vi.fn();
    const user = setup({ searchParams: '?page=2', onUrlUpdate });
    await goToAvailabilityStep(user);
    await save(user);

    expect(onUrlUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        queryString: '',
        options: expect.objectContaining({ history: 'replace' }),
      }),
    );
  });

  it('requires at least one feature, as the brief does', async () => {
    const user = setup();
    await openDialog(user);
    await fillBasics(user);
    await user.click(screen.getByRole('button', { name: 'Bluetooth', pressed: true }));
    await next(user);

    expect(screen.getAllByRole('alert').map((alert) => alert.textContent)).toEqual([
      'Wybierz co najmniej jedną cechę',
    ]);
    expect(screen.getByRole('button', { name: 'Bluetooth' })).toHaveFocus();
    expect(screen.queryByLabelText('Cena netto')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'WiFi' }));

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('reports the ceiling on a too-large price and recovers once it is lowered', async () => {
    const user = setup();
    await openDialog(user);
    await fillBasics(user);
    await next(user);
    await user.type(screen.getByLabelText('Cena netto'), '999999999.99');

    expect(screen.getByLabelText('Cena brutto')).toHaveValue('1229999999.99');

    await next(user);

    expect(screen.getAllByRole('alert').map((alert) => alert.textContent)).toEqual([
      'Cena nie może przekraczać 999\u00A0999\u00A0999,99',
    ]);
    expect(screen.getByLabelText('Cena brutto')).toHaveFocus();

    await user.clear(screen.getByLabelText('Cena netto'));
    await user.type(screen.getByLabelText('Cena netto'), '100');

    expect(screen.getByLabelText('Cena brutto')).toHaveValue('123.00');
    expect(screen.queryAllByRole('alert')).toHaveLength(0);
  });

  it('saves the stock level of a limited product', async () => {
    const user = setup();
    await goToAvailabilityStep(user);
    await user.click(screen.getByRole('checkbox', { name: 'Produkt limitowany' }));
    await user.type(await screen.findByLabelText('Ilość na magazynie'), '50');
    await save(user);

    expect(await screen.findByText(/magazyn 50$/)).toBeInTheDocument();
  });

  it('will not save a limited product with no stock level', async () => {
    const user = setup();
    await goToAvailabilityStep(user);
    await user.click(screen.getByRole('checkbox', { name: 'Produkt limitowany' }));
    await save(user);

    expect(
      screen.getByText('Podaj stan magazynowy (nieujemna liczba całkowita)'),
    ).toBeInTheDocument();
    expect(within(savedProducts()).queryAllByRole('listitem')).toHaveLength(0);
  });

  it('refuses to leave step 2 without a price', async () => {
    const user = setup();
    await openDialog(user);
    await fillBasics(user);
    await next(user);
    await next(user);

    expect(screen.getAllByRole('alert').map((alert) => alert.textContent)).toEqual([
      'Podaj cenę netto',
      'Podaj cenę brutto',
    ]);
    expect(screen.getByLabelText('Cena netto')).toBeInTheDocument();
  });

  it.each([
    ['MBP 14', 'SKU może zawierać tylko litery i cyfry'],
    ['MBP14M3PROMBP14M3PROMBP14', 'SKU może mieć maksymalnie 24 znaki'],
  ])('rejects the SKU %s', async (sku, message) => {
    const user = setup();
    await openDialog(user);
    await user.type(screen.getByLabelText('SKU produktu'), sku);
    await next(user);

    expect(screen.getByText(message)).toBeInTheDocument();
  });

  it('rejects a name longer than 100 characters', async () => {
    const user = setup();
    await openDialog(user);
    await user.click(screen.getByLabelText('Nazwa produktu'));
    await user.paste('M'.repeat(101));
    await next(user);

    expect(screen.getByText('Nazwa może mieć maksymalnie 100 znaków')).toBeInTheDocument();
  });

  it('clears the cart-range error once the other field is fixed', async () => {
    const user = setup();
    await goToAvailabilityStep(user);

    await user.clear(screen.getByLabelText('Minimalna ilość'));
    await user.type(screen.getByLabelText('Minimalna ilość'), '20');
    await save(user);

    expect(
      screen.getByText('Minimalna ilość nie może być większa niż maksymalna'),
    ).toBeInTheDocument();

    await user.clear(screen.getByLabelText('Minimalna ilość'));
    await user.type(screen.getByLabelText('Minimalna ilość'), '5');

    expect(
      screen.queryByText('Minimalna ilość nie może być większa niż maksymalna'),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText('Maksymalna ilość nie może być mniejsza niż minimalna'),
    ).not.toBeInTheDocument();
  });

  it('starts again from step 1 with empty fields after being closed', async () => {
    const user = setup();
    await openDialog(user);
    await fillBasics(user);
    await next(user);
    await user.keyboard('{Escape}');

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    await openDialog(user);

    expect(screen.getByLabelText('Nazwa produktu')).toHaveValue('');
    expect(screen.queryByLabelText('Cena netto')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Bluetooth' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  });
});
