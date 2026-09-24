import { CURRENCY_OPTIONS, VAT_RATE_OPTIONS } from '@/features/products/domain/product';

import { SelectField } from '../fields/select-field';
import { TextField } from '../fields/text-field';
import type { PriceEdit } from '../form/pricing';
import type { ProductFormApi } from '../form/use-product-form';

export function PricingStep({
  form,
  onPriceEdit,
}: {
  form: ProductFormApi;
  onPriceEdit: (edited: PriceEdit) => void;
}) {
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <form.Field name="pricing.netPrice" listeners={{ onChange: () => onPriceEdit('net') }}>
          {(field) => (
            <TextField field={field} label="Cena netto" placeholder="0.00" inputMode="decimal" />
          )}
        </form.Field>
        <form.Field name="pricing.grossPrice" listeners={{ onChange: () => onPriceEdit('gross') }}>
          {(field) => (
            <TextField field={field} label="Cena brutto" placeholder="0.00" inputMode="decimal" />
          )}
        </form.Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <form.Field name="pricing.vatRate" listeners={{ onChange: () => onPriceEdit('vat') }}>
          {(field) => (
            <SelectField
              field={field}
              label="Stawka VAT"
              placeholder="Wybierz stawkę VAT"
              options={VAT_RATE_OPTIONS}
            />
          )}
        </form.Field>
        <form.Field name="pricing.currency">
          {(field) => (
            <SelectField
              field={field}
              label="Waluta"
              placeholder="Wybierz walutę"
              options={CURRENCY_OPTIONS}
            />
          )}
        </form.Field>
      </div>
    </>
  );
}
