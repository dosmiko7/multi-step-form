import {
  CATEGORY_OPTIONS,
  FEATURE_OPTIONS,
  MANUFACTURER_OPTIONS,
} from '@/features/products/domain/product';

import { SelectField } from '../fields/select-field';
import { TextField } from '../fields/text-field';
import { TextareaField } from '../fields/textarea-field';
import { ToggleGroupField } from '../fields/toggle-group-field';
import type { ProductFormApi } from '../form/use-product-form';

export function BasicsStep({ form }: { form: ProductFormApi }) {
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <form.Field name="basics.name">
          {(field) => (
            <TextField field={field} label="Nazwa produktu" placeholder="np. MacBook Pro 14" />
          )}
        </form.Field>
        <form.Field name="basics.sku">
          {(field) => (
            <TextField
              field={field}
              label="SKU produktu"
              placeholder="np. MBP14M3PRO"
              autoComplete="off"
              spellCheck={false}
            />
          )}
        </form.Field>
      </div>

      <form.Field name="basics.description">
        {(field) => <TextareaField field={field} label="Opis" placeholder="Krótki opis produktu" />}
      </form.Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <form.Field name="basics.manufacturer">
          {(field) => (
            <SelectField
              field={field}
              label="Producent"
              placeholder="Wybierz producenta"
              options={MANUFACTURER_OPTIONS}
            />
          )}
        </form.Field>
        <form.Field name="basics.category">
          {(field) => (
            <SelectField
              field={field}
              label="Kategoria"
              placeholder="Wybierz kategorię"
              options={CATEGORY_OPTIONS}
            />
          )}
        </form.Field>
      </div>

      <form.Field name="basics.features">
        {(field) => (
          <ToggleGroupField field={field} label="Cechy produktu" options={FEATURE_OPTIONS} />
        )}
      </form.Field>
    </>
  );
}
