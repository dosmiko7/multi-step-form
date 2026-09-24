import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import type { Option } from '@/features/products/domain/product';
import { FieldShell } from './field-shell';
import type { FieldLike } from './use-field-control';

export function SelectField({
  field,
  label,
  placeholder,
  options,
}: {
  field: FieldLike<string>;
  label: string;
  placeholder: string;
  options: readonly Option<string>[];
}) {
  return (
    <FieldShell field={field} label={label}>
      {(control) => (
        <Select
          items={options}
          value={field.state.value === '' ? null : field.state.value}
          onValueChange={(value) => field.handleChange(String(value))}
          onOpenChangeComplete={(open) => {
            if (!open) {
              field.handleBlur();
            }
          }}
        >
          <SelectTrigger {...control} name={field.name}>
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </FieldShell>
  );
}
