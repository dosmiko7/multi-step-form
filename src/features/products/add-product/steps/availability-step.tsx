import { FieldLegend, FieldSet } from '@/components/ui/field';
import { Separator } from '@/components/ui/separator';

import { TextField } from '../fields/text-field';
import { CheckboxField, SwitchField } from '../fields/boolean-fields';
import type { ProductFormApi } from '../form/use-product-form';

const STOCK_REGION_ID = 'stock-quantity-region';

export function AvailabilityStep({ form }: { form: ProductFormApi }) {
  return (
    <>
      <form.Field name="availability.isAvailable">
        {(field) => <SwitchField field={field} label="Produkt jest dostępny" />}
      </form.Field>

      <Separator />

      <div id={STOCK_REGION_ID} aria-live="polite" className="flex flex-col gap-4">
        <form.Field
          name="availability.isLimited"
          listeners={{
            onChange: ({ value }) => {
              if (!value) {
                form.resetField('availability.stockQuantity');
              }
            },
          }}
        >
          {(field) => (
            <CheckboxField field={field} label="Produkt limitowany" controls={STOCK_REGION_ID} />
          )}
        </form.Field>

        <form.Subscribe selector={(state) => state.values.availability.isLimited}>
          {(isLimited) =>
            isLimited ? (
              <form.Field name="availability.stockQuantity">
                {(field) => (
                  <TextField
                    field={field}
                    label="Ilość na magazynie"
                    placeholder="0"
                    inputMode="numeric"
                    className="sm:max-w-[336px]"
                  />
                )}
              </form.Field>
            ) : null
          }
        </form.Subscribe>
      </div>

      <Separator />

      <FieldSet>
        <FieldLegend>Limity koszyka</FieldLegend>
        <div className="grid gap-4 sm:grid-cols-2">
          <form.Field name="availability.minCartQuantity">
            {(field) => (
              <TextField
                field={field}
                label="Minimalna ilość"
                placeholder="1"
                inputMode="numeric"
              />
            )}
          </form.Field>
          <form.Field name="availability.maxCartQuantity">
            {(field) => (
              <TextField
                field={field}
                label="Maksymalna ilość"
                placeholder="10"
                inputMode="numeric"
              />
            )}
          </form.Field>
        </div>
      </FieldSet>
    </>
  );
}
