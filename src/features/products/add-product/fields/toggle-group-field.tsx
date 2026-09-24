import { FieldError, FieldLegend, FieldSet } from '@/components/ui/field';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import type { Option } from '@/features/products/domain/product';

import { useFieldControl, type FieldLike } from './use-field-control';

export function ToggleGroupField<TValue extends string>({
  field,
  label,
  options,
}: {
  field: FieldLike<TValue[]>;
  label: string;
  options: readonly Option<TValue>[];
}) {
  const { errorId, errors, isInvalid } = useFieldControl(field);
  const describedBy = isInvalid ? errorId : undefined;

  return (
    <FieldSet data-invalid={isInvalid || undefined} aria-describedby={describedBy}>
      <FieldLegend variant="label">{label}</FieldLegend>
      <ToggleGroup
        multiple
        variant="chip"
        size="xs"
        className="flex-wrap"
        value={field.state.value}
        onValueChange={(pressed) =>
          field.handleChange(
            options
              .filter((option) => pressed.includes(option.value))
              .map((option) => option.value),
          )
        }
      >
        {options.map((option, index) => (
          <ToggleGroupItem
            key={option.value}
            value={option.value}
            // Only the first item carries the field name: `form/step-fields` finds a control by
            // name, and every item sharing it would be as many matches.
            name={index === 0 ? field.name : undefined}
            aria-describedby={describedBy}
            onBlur={field.handleBlur}
          >
            {option.label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
      <FieldError id={errorId} errors={errors} />
    </FieldSet>
  );
}
